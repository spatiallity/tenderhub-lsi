from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from app.core.database import get_db
from app.models.expert import Expert, ExpertProject, ExpertReview
from app.schemas import ExpertOut, ExpertCreate, ExpertUpdate, ExpertProjectCreate, ExpertProjectUpdate, ExpertReviewCreate

router = APIRouter()

@router.get("/", response_model=List[ExpertOut])
async def list_experts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Expert).options(selectinload(Expert.projects), selectinload(Expert.reviews))
    )
    return result.scalars().all()

@router.get("/{expert_id}", response_model=ExpertOut)
async def get_expert(expert_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Expert)
        .options(selectinload(Expert.projects), selectinload(Expert.reviews))
        .where(Expert.id == expert_id)
    )
    expert = result.scalars().first()
    if not expert:
        raise HTTPException(status_code=404, detail="Expert not found")
    return expert

@router.post("/", response_model=ExpertOut)
async def create_expert(expert_in: ExpertCreate, db: AsyncSession = Depends(get_db)):
    expert = Expert(**expert_in.model_dump())
    db.add(expert)
    await db.commit()
    await db.refresh(expert)
    return expert

@router.post("/{expert_id}/projects")
async def add_project(expert_id: int, project_in: ExpertProjectCreate, db: AsyncSession = Depends(get_db)):
    project = ExpertProject(expert_id=expert_id, **project_in.model_dump())
    db.add(project)
    
    expert = await db.get(Expert, expert_id)
    if expert:
        expert.jumlah_proyek += 1
        
    await db.commit()
    return project

@router.post("/{expert_id}/reviews")
async def add_review(expert_id: int, review_in: ExpertReviewCreate, db: AsyncSession = Depends(get_db)):
    review = ExpertReview(expert_id=expert_id, **review_in.model_dump())
    db.add(review)
    
    # Recalculate rating
    result = await db.execute(select(ExpertReview).where(ExpertReview.expert_id == expert_id))
    reviews = result.scalars().all()
    
    expert = await db.get(Expert, expert_id)
    if expert:
        total_rating = sum([r.rating for r in reviews]) + review.rating
        count = len(reviews) + 1
        expert.rating_avg = round(total_rating / count, 1)
        
    await db.commit()
    return review

@router.delete("/{expert_id}")
async def delete_expert(expert_id: int, db: AsyncSession = Depends(get_db)):
    expert = await db.get(Expert, expert_id)
    if not expert:
        raise HTTPException(status_code=404, detail="Expert not found")
    await db.delete(expert)
    await db.commit()
    return {"ok": True}


@router.patch("/projects/{project_id}")
async def update_project(project_id: int, project_update: ExpertProjectUpdate, db: AsyncSession = Depends(get_db)):
    """Update project CV fields"""
    project = await db.get(ExpertProject, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    await db.commit()
    await db.refresh(project)
    return project


@router.delete("/projects/{project_id}")
async def delete_project(project_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a project and decrement expert's jumlah_proyek"""
    project = await db.get(ExpertProject, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    expert_id = project.expert_id
    await db.delete(project)

    expert = await db.get(Expert, expert_id)
    if expert and expert.jumlah_proyek > 0:
        expert.jumlah_proyek -= 1

    await db.commit()
    return {"ok": True}


@router.patch("/{expert_id}", response_model=ExpertOut)
async def update_expert(expert_id: int, expert_update: ExpertUpdate, db: AsyncSession = Depends(get_db)):
    """
    Update expert data including CV template fields
    """
    result = await db.execute(
        select(Expert)
        .options(selectinload(Expert.projects), selectinload(Expert.reviews))
        .where(Expert.id == expert_id)
    )
    expert = result.scalars().first()
    
    if not expert:
        raise HTTPException(status_code=404, detail="Expert not found")
    
    # Update fields that are provided
    update_data = expert_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(expert, field, value)
    
    await db.commit()
    await db.refresh(expert)
    return expert
