from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from app.core.database import get_db
from app.models.expert import Expert, ExpertProject, ExpertReview
from app.schemas import ExpertOut, ExpertCreate, ExpertUpdate, ExpertProjectCreate, ExpertReviewCreate

router = APIRouter()

@router.get("", response_model=List[ExpertOut])
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
    data = expert_in.model_dump()
    projects_data = data.pop("projects", [])
    
    expert = Expert(**data)
    db.add(expert)
    await db.flush()  # Get expert ID
    
    for p_data in projects_data:
        project = ExpertProject(expert_id=expert.id, **p_data)
        db.add(project)
        expert.jumlah_proyek += 1
    
    await db.commit()
    
    # Re-fetch with relationships loaded
    result = await db.execute(
        select(Expert)
        .options(selectinload(Expert.projects), selectinload(Expert.reviews))
        .where(Expert.id == expert.id)
    )
    return result.scalars().first()

@router.patch("/{expert_id}", response_model=ExpertOut)
async def update_expert(expert_id: int, expert_in: ExpertUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Expert)
        .options(selectinload(Expert.projects), selectinload(Expert.reviews))
        .where(Expert.id == expert_id)
    )
    expert = result.scalars().first()
    if not expert:
        raise HTTPException(status_code=404, detail="Expert not found")
    
    update_data = expert_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(expert, key, value)
    
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
    await db.refresh(project)
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
    await db.refresh(review)
    return review

@router.delete("/{expert_id}")
async def delete_expert(expert_id: int, db: AsyncSession = Depends(get_db)):
    # Load with relationships to ensure cascade delete-orphan works smoothly in SQLAlchemy session
    result = await db.execute(
        select(Expert)
        .options(selectinload(Expert.projects), selectinload(Expert.reviews))
        .where(Expert.id == expert_id)
    )
    expert = result.scalars().first()
    if not expert:
        raise HTTPException(status_code=404, detail="Expert not found")
    
    await db.delete(expert)
    await db.commit()
    return {"message": "Expert deleted successfully"}

@router.delete("/{expert_id}/projects/{project_id}")
async def delete_project(expert_id: int, project_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExpertProject).where(ExpertProject.id == project_id, ExpertProject.expert_id == expert_id))
    project = result.scalars().first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    await db.delete(project)
    
    # Update expert project count
    expert = await db.get(Expert, expert_id)
    if expert and expert.jumlah_proyek > 0:
        expert.jumlah_proyek -= 1
        
    await db.commit()
    return {"message": "Project deleted successfully"}
