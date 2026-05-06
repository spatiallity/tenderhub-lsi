from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
import asyncio
from app.core.database import get_db
from app.schemas import TenderOut
from app.services.inaproc import inaproc_service
from app.services.relevance import calculate_relevance
from app.models.keyword import Keyword
from sqlalchemy import select

router = APIRouter()

@router.get("/search", response_model=List[TenderOut])
async def search_tenders(
    limit: int = 100,
    portfolio: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    # Fetch keywords for relevance
    result = await db.execute(select(Keyword))
    keywords = [{"id": k.id, "text": k.keyword_text, "subporto": k.subporto, "is_active": k.is_active} for k in result.scalars().all()]
    
    # Fallback to dummy keywords if none in DB yet
    if not keywords:
        keywords = [
            {"id": 1, "text": "survei topografi", "subporto": "SDA", "is_active": True},
            {"id": 2, "text": "pengadaan tanah", "subporto": "SDA", "is_active": True},
            {"id": 3, "text": "survei", "subporto": "FLP", "is_active": True},
            {"id": 4, "text": "pendataan", "subporto": "FLP", "is_active": True},
            {"id": 5, "text": "masterplan kawasan", "subporto": "FITI", "is_active": True},
            {"id": 6, "text": "studi kelayakan", "subporto": "FITI", "is_active": True},
        ]

    # Get from INAPROC with error handling
    try:
        tenders = await inaproc_service.get_tenders({"limit": limit})
    except Exception as e:
        print(f"⚠️ INAPROC API error: {e}")
        # Return empty list if API fails
        return []

    # Fetch watchlist to overlay internal statuses
    from app.models.watchlist import TenderWatchlist
    wl_result = await db.execute(select(TenderWatchlist))
    watchlist_map = {str(item.kd_tender): item for item in wl_result.scalars().all()}

    async def enrich_one(t):
        nama = t.get("nama") or t.get("nama_paket") or ""
        rel = calculate_relevance(nama, keywords)
        t_enriched = {**t, **rel}

        kd_tender = str(t_enriched.get("kd_tender") or t_enriched.get("id"))
        
        # Overlay internal status and notes from DB
        if kd_tender in watchlist_map:
            wl_item = watchlist_map[kd_tender]
            t_enriched["internalStatus"] = wl_item.status_internal
            t_enriched["catatan_internal"] = wl_item.catatan_internal
            t_enriched["assigned_expert_ids"] = wl_item.assigned_expert_ids
            t_enriched["watchlist_id"] = wl_item.id

        if kd_tender and not t_enriched.get("jadwalTahapan"):
            try:
                jadwal = await inaproc_service.get_tender_jadwal(int(kd_tender))
                if jadwal:
                    t_enriched["jadwalTahapan"] = jadwal
            except Exception:
                pass
        
        if portfolio and portfolio != "Semua" and t_enriched.get("portofolio") != portfolio and t_enriched.get("recommended_subporto") != portfolio:
            return None
            
        return t_enriched

    enriched = [t for t in await asyncio.gather(*(enrich_one(t) for t in tenders)) if t]

    return enriched

@router.get("/{kd_tender}")
async def get_tender_detail(kd_tender: int):
    tenders = await inaproc_service.get_tenders({})
    tender = next((t for t in tenders if t.get("kd_tender") == kd_tender or t.get("id") == kd_tender), None)
    return tender

@router.get("/{kd_tender}/kompetitor")
async def get_tender_kompetitor(kd_tender: int):
    return await inaproc_service.get_tender_selesai({"kd_tender": kd_tender})
