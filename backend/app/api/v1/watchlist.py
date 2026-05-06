from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.models.watchlist import TenderWatchlist
from app.schemas import WatchlistOut, WatchlistCreate, WatchlistUpdate

router = APIRouter()

@router.get("/", response_model=List[WatchlistOut])
async def get_watchlist(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(TenderWatchlist))
        return result.scalars().all()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

@router.post("/", response_model=WatchlistOut)
async def add_to_watchlist(item_in: WatchlistCreate, db: AsyncSession = Depends(get_db)):
    # Check if exists
    result = await db.execute(select(TenderWatchlist).where(TenderWatchlist.kd_tender == item_in.kd_tender))
    existing = result.scalars().first()
    if existing:
        # Update existing entry with new data
        update_data = item_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(existing, key, value)
        await db.commit()
        await db.refresh(existing)
        return existing
        
    item = TenderWatchlist(**item_in.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item

@router.put("/{item_id}", response_model=WatchlistOut)
async def update_watchlist(item_id: int, item_in: WatchlistUpdate, db: AsyncSession = Depends(get_db)):
    item = await db.get(TenderWatchlist, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")
        
    update_data = item_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
        
    await db.commit()
    await db.refresh(item)
    return item

@router.patch("/{kd_tender}", response_model=WatchlistOut)
async def patch_watchlist_by_tender(kd_tender: int, item_in: WatchlistUpdate, db: AsyncSession = Depends(get_db)):
    """Update watchlist entry by kd_tender (tender ID from INAPROC)"""
    result = await db.execute(select(TenderWatchlist).where(TenderWatchlist.kd_tender == kd_tender))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")
        
    update_data = item_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
        
    await db.commit()
    await db.refresh(item)
    return item

@router.delete("/{item_id}")
async def remove_from_watchlist(item_id: int, db: AsyncSession = Depends(get_db)):
    item = await db.get(TenderWatchlist, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Watchlist item not found")
        
    await db.delete(item)
    await db.commit()
    return {"message": "Deleted successfully"}
