from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.config import settings
from app.core.unit_kerja import get_region
from app.models.watchlist import TenderWatchlist
from app.schemas import WatchlistOut, WatchlistCreate, WatchlistUpdate

router = APIRouter()


async def _caller_unit_kerja_role(user: dict) -> tuple[Optional[str], str]:
    """Return (caller_unit_kerja, caller_role) — looks up profile via Supabase REST.

    SKIP_AUTH bypass: returns (None, 'admin') so dev can do everything.
    """
    if settings.SKIP_AUTH:
        return None, "admin"
    user_id = user.get("sub")
    if not user_id or not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        return None, "user"
    import httpx
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                f"{settings.SUPABASE_URL}/rest/v1/profiles",
                params={"id": f"eq.{user_id}", "select": "role,unit_kerja"},
                headers={
                    "apikey": settings.SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
                },
            )
        if resp.status_code == 200 and resp.json():
            row = resp.json()[0]
            return row.get("unit_kerja"), row.get("role", "user")
    except Exception:
        pass
    return None, "user"


def _ownership_check(item: TenderWatchlist, caller_unit: Optional[str], caller_role: str):
    """Reject writes when caller doesn't own the claim. Admin bypasses."""
    if caller_role == "admin":
        return
    if item.unit_kerja and item.unit_kerja != caller_unit:
        raise HTTPException(
            status_code=403,
            detail=f"Tender ini di-claim oleh {item.unit_kerja}; hanya pemilik atau admin yang bisa mengubah.",
        )


@router.get("/", response_model=List[WatchlistOut])
async def get_watchlist(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(TenderWatchlist))
        return result.scalars().all()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")


@router.post("/", response_model=WatchlistOut)
async def add_to_watchlist(
    item_in: WatchlistCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    caller_unit, caller_role = await _caller_unit_kerja_role(user)

    payload = item_in.model_dump()
    # Default unit_kerja to caller's branch if not provided.
    if not payload.get("unit_kerja") and caller_unit:
        payload["unit_kerja"] = caller_unit
    if payload.get("unit_kerja"):
        payload["unit_kerja_region"] = get_region(payload["unit_kerja"])

    # Reject claim attempt for someone else's branch (non-admin).
    if caller_role != "admin" and payload.get("unit_kerja") and payload["unit_kerja"] != caller_unit:
        raise HTTPException(status_code=403, detail="Tidak bisa claim untuk cabang lain.")

    result = await db.execute(select(TenderWatchlist).where(TenderWatchlist.kd_tender == item_in.kd_tender))
    existing = result.scalars().first()
    if existing:
        _ownership_check(existing, caller_unit, caller_role)
        update_data = item_in.model_dump(exclude_unset=True)
        if update_data.get("unit_kerja"):
            update_data["unit_kerja_region"] = get_region(update_data["unit_kerja"])
        for key, value in update_data.items():
            setattr(existing, key, value)
        # Mark claimed_by/at if newly claiming.
        if existing.unit_kerja and not existing.claimed_at:
            existing.claimed_at = datetime.utcnow()
            existing.claimed_by = user.get("sub")
        await db.commit()
        await db.refresh(existing)
        return existing

    if payload.get("unit_kerja"):
        payload["claimed_by"] = user.get("sub")
        payload["claimed_at"] = datetime.utcnow()
    item = TenderWatchlist(**payload)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.put("/{item_id}", response_model=WatchlistOut)
async def update_watchlist(
    item_id: int,
    item_in: WatchlistUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    item = await db.get(TenderWatchlist, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")

    caller_unit, caller_role = await _caller_unit_kerja_role(user)
    _ownership_check(item, caller_unit, caller_role)

    update_data = item_in.model_dump(exclude_unset=True)
    if update_data.get("unit_kerja"):
        update_data["unit_kerja_region"] = get_region(update_data["unit_kerja"])
    for key, value in update_data.items():
        setattr(item, key, value)
    if item.unit_kerja and not item.claimed_at:
        item.claimed_at = datetime.utcnow()
        item.claimed_by = user.get("sub")

    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{kd_tender}", response_model=WatchlistOut)
async def patch_watchlist_by_tender(
    kd_tender: int,
    item_in: WatchlistUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Update watchlist entry by kd_tender (tender ID from INAPROC)"""
    result = await db.execute(select(TenderWatchlist).where(TenderWatchlist.kd_tender == kd_tender))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")

    caller_unit, caller_role = await _caller_unit_kerja_role(user)
    _ownership_check(item, caller_unit, caller_role)

    update_data = item_in.model_dump(exclude_unset=True)
    if update_data.get("unit_kerja"):
        update_data["unit_kerja_region"] = get_region(update_data["unit_kerja"])
    for key, value in update_data.items():
        setattr(item, key, value)
    if item.unit_kerja and not item.claimed_at:
        item.claimed_at = datetime.utcnow()
        item.claimed_by = user.get("sub")

    await db.commit()
    await db.refresh(item)
    return item


@router.post("/{kd_tender}/release")
async def release_claim(
    kd_tender: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Admin-only: clear unit_kerja so tender becomes available again."""
    _, caller_role = await _caller_unit_kerja_role(user)
    if caller_role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    result = await db.execute(select(TenderWatchlist).where(TenderWatchlist.kd_tender == kd_tender))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Tender not found")
    item.unit_kerja = None
    item.unit_kerja_region = None
    item.claimed_by = None
    item.claimed_at = None
    await db.commit()
    return {"message": "Claim released"}


@router.post("/{kd_tender}/reassign")
async def reassign_claim(
    kd_tender: int,
    new_unit_kerja: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    """Admin-only: reassign tender to a different unit_kerja."""
    _, caller_role = await _caller_unit_kerja_role(user)
    if caller_role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    result = await db.execute(select(TenderWatchlist).where(TenderWatchlist.kd_tender == kd_tender))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Tender not found")
    item.unit_kerja = new_unit_kerja
    item.unit_kerja_region = get_region(new_unit_kerja)
    item.claimed_at = datetime.utcnow()
    item.claimed_by = user.get("sub")
    await db.commit()
    await db.refresh(item)
    return {"message": "Reassigned", "unit_kerja": new_unit_kerja}


@router.delete("/{item_id}")
async def remove_from_watchlist(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    item = await db.get(TenderWatchlist, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")
    caller_unit, caller_role = await _caller_unit_kerja_role(user)
    _ownership_check(item, caller_unit, caller_role)
    await db.delete(item)
    await db.commit()
    return {"message": "Deleted successfully"}
