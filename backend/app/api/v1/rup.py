from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.core.database import get_db
from app.schemas import RupOut
from app.services.inaproc import inaproc_service
from app.services.relevance import calculate_rup_readiness
from app.models.keyword import Keyword
from sqlalchemy import select

router = APIRouter()

@router.get("/search", response_model=List[RupOut])
async def search_rup(
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    # Fetch keywords for relevance
    result = await db.execute(select(Keyword))
    keywords = [{"id": k.id, "text": k.keyword_text, "subporto": k.subporto, "is_active": k.is_active} for k in result.scalars().all()]
    
    if not keywords:
        keywords = [{"id": 1, "text": "survei topografi", "subporto": "SDA", "is_active": True}] # minimal fallback

    try:
        rup_list = await inaproc_service.get_rup_paket({"limit": limit})
    except Exception as e:
        print(f"⚠️ INAPROC RUP API error: {e}")
        # Return empty list if API fails
        return []
    
    enriched = []
    for r in rup_list:
        rel = calculate_rup_readiness(
            nama_paket=r.get("nama_paket", ""),
            uraian=r.get("uraian_pekerjaan", ""),
            spesifikasi=r.get("spesifikasi_pekerjaan", ""),
            metode_pengadaan=r.get("metode_pengadaan", ""),
            tgl_awal_pemilihan=r.get("tgl_awal_pemilihan", "2099-12-31"),
            keywords=keywords
        )
        enriched.append({**r, **rel})

    return enriched
