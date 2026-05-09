"""RUP watchlist — branch claim parity with tender_watchlist."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.core.auth import get_current_user
from app.core.unit_kerja import get_region
from app.models.watchlist import RupWatchlist
from app.schemas import RupWatchlistOut, RupWatchlistCreate, RupWatchlistUpdate
from app.api.v1.watchlist import _caller_unit_kerja_role, _ownership_check  # reuse

router = APIRouter()


def _rup_ownership_check(item: RupWatchlist, caller_unit, caller_role):
    if caller_role == "admin":
        return
    if item.unit_kerja and item.unit_kerja != caller_unit:
        raise HTTPException(
            status_code=403,
            detail=f"RUP ini di-claim oleh {item.unit_kerja}; hanya pemilik atau admin yang bisa mengubah.",
        )


@router.get("/", response_model=List[RupWatchlistOut])
async def list_rup_watchlist(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(RupWatchlist))
    return result.scalars().all()


@router.post("/", response_model=RupWatchlistOut)
async def add_rup_watchlist(
    item_in: RupWatchlistCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    caller_unit, caller_role = await _caller_unit_kerja_role(user)
    payload = item_in.model_dump()
    if not payload.get("unit_kerja") and caller_unit:
        payload["unit_kerja"] = caller_unit
    if payload.get("unit_kerja"):
        payload["unit_kerja_region"] = get_region(payload["unit_kerja"])
    if caller_role != "admin" and payload.get("unit_kerja") and payload["unit_kerja"] != caller_unit:
        raise HTTPException(status_code=403, detail="Tidak bisa claim untuk cabang lain.")

    result = await db.execute(select(RupWatchlist).where(RupWatchlist.kd_rup == item_in.kd_rup))
    existing = result.scalars().first()
    if existing:
        _rup_ownership_check(existing, caller_unit, caller_role)
        for k, v in item_in.model_dump(exclude_unset=True).items():
            setattr(existing, k, v)
        if existing.unit_kerja and not existing.claimed_at:
            existing.claimed_at = datetime.utcnow()
            existing.claimed_by = user.get("sub")
        await db.commit()
        await db.refresh(existing)
        return existing

    if payload.get("unit_kerja"):
        payload["claimed_by"] = user.get("sub")
        payload["claimed_at"] = datetime.utcnow()
    item = RupWatchlist(**payload)
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{kd_rup}", response_model=RupWatchlistOut)
async def patch_rup_watchlist(
    kd_rup: str,
    item_in: RupWatchlistUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    result = await db.execute(select(RupWatchlist).where(RupWatchlist.kd_rup == kd_rup))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="RUP watchlist not found")

    caller_unit, caller_role = await _caller_unit_kerja_role(user)
    _rup_ownership_check(item, caller_unit, caller_role)

    update_data = item_in.model_dump(exclude_unset=True)
    if update_data.get("unit_kerja"):
        update_data["unit_kerja_region"] = get_region(update_data["unit_kerja"])
    for k, v in update_data.items():
        setattr(item, k, v)
    if item.unit_kerja and not item.claimed_at:
        item.claimed_at = datetime.utcnow()
        item.claimed_by = user.get("sub")

    await db.commit()
    await db.refresh(item)
    return item


@router.post("/{kd_rup}/release")
async def release_rup_claim(
    kd_rup: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    _, caller_role = await _caller_unit_kerja_role(user)
    if caller_role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    result = await db.execute(select(RupWatchlist).where(RupWatchlist.kd_rup == kd_rup))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="RUP not found")
    item.unit_kerja = None
    item.unit_kerja_region = None
    item.claimed_by = None
    item.claimed_at = None
    await db.commit()
    return {"message": "Claim released"}


@router.post("/{kd_rup}/reassign")
async def reassign_rup_claim(
    kd_rup: str,
    new_unit_kerja: str,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    _, caller_role = await _caller_unit_kerja_role(user)
    if caller_role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    result = await db.execute(select(RupWatchlist).where(RupWatchlist.kd_rup == kd_rup))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="RUP not found")
    item.unit_kerja = new_unit_kerja
    item.unit_kerja_region = get_region(new_unit_kerja)
    item.claimed_at = datetime.utcnow()
    item.claimed_by = user.get("sub")
    await db.commit()
    await db.refresh(item)
    return {"message": "Reassigned", "unit_kerja": new_unit_kerja}
