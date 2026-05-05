from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.keyword import Keyword
from app.schemas import KeywordOut, KeywordCreate, KeywordUpdate

router = APIRouter()


@router.get("", response_model=List[KeywordOut])
async def get_keywords(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Keyword))
    return result.scalars().all()


@router.post("", response_model=KeywordOut)
async def create_keyword(
    keyword_in: KeywordCreate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    keyword = Keyword(**keyword_in.model_dump())
    db.add(keyword)
    await db.commit()
    await db.refresh(keyword)
    return keyword


@router.put("/{keyword_id}", response_model=KeywordOut)
async def update_keyword(
    keyword_id: int,
    keyword_in: KeywordUpdate,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    keyword = await db.get(Keyword, keyword_id)
    if not keyword:
        raise HTTPException(status_code=404, detail="Keyword not found")

    update_data = keyword_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(keyword, key, value)

    await db.commit()
    await db.refresh(keyword)
    return keyword


@router.delete("/{keyword_id}")
async def delete_keyword(
    keyword_id: int,
    db: AsyncSession = Depends(get_db),
    _user: dict = Depends(get_current_user),
):
    keyword = await db.get(Keyword, keyword_id)
    if not keyword:
        raise HTTPException(status_code=404, detail="Keyword not found")

    await db.delete(keyword)
    await db.commit()
    return {"message": "Deleted successfully"}
