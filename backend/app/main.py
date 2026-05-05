from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import create_tables, AsyncSessionLocal
from app.models.expert import Expert, ExpertProject, ExpertReview
from app.models.keyword import Keyword
from sqlalchemy import select, func

from app.api.v1 import tender, rup, expert, keyword, watchlist, users

async def seed_data():
    async with AsyncSessionLocal() as db:
        # Seed/top-up experts up to 100 rows when using dummy data
        try:
            from app.services.dummy_data import EXPERTS_RAW
            existing_count = (await db.execute(select(func.count()).select_from(Expert))).scalar_one()
            if existing_count < 100:
                needed = 100 - existing_count
                for e_raw in EXPERTS_RAW[:needed]:
                    expert_db = Expert(
                        nama=e_raw.get("nama"),
                        no_hp=e_raw.get("noHp"),
                        instansi=e_raw.get("instansi"),
                        keahlian=e_raw.get("keahlian", []),
                        subporto=e_raw.get("portofolio", []),
                        main_keahlian=e_raw.get("main"),
                        availability=e_raw.get("availability"),
                        rating_avg=e_raw.get("rating", 0.0),
                        jumlah_proyek=e_raw.get("proyek", 0)
                    )
                    db.add(expert_db)
                    await db.flush()

                    for p in e_raw.get("history", []):
                        db.add(ExpertProject(
                            expert_id=expert_db.id,
                            nama_proyek=p.get("proyek"),
                            pemberi_kerja=p.get("klien"),
                            tahun=p.get("tahun"),
                            nilai_proyek=p.get("nilai"),
                            peran=p.get("peran"),
                            bersama=p.get("bersama"),
                            status_proyek=p.get("status")
                        ))

                    for r in e_raw.get("reviews", []):
                        db.add(ExpertReview(
                            expert_id=expert_db.id,
                            reviewer_nama=r.get("reviewer"),
                            rating=r.get("rating"),
                            komentar=r.get("komentar")
                        ))
                await db.commit()
        except ImportError:
            pass
        
        # Seed keywords
        res = await db.execute(select(Keyword).limit(1))
        if not res.scalars().first():
            initial_keywords = [
                # SDA
                ("survei topografi", "SDA"), ("pengadaan tanah", "SDA"), ("ROW SUTT", "SDA"),
                ("bush clearing", "SDA"), ("inventarisasi aset", "SDA"), ("rehabilitasi", "SDA"),
                ("DED", "SDA"), ("feasibility study kawasan", "SDA"),
                # FLP
                ("survei", "FLP"), ("pendataan", "FLP"), ("oversight services", "FLP"),
                ("instrumen survei", "FLP"), ("kajian kebijakan", "FLP"), ("studi bandara", "FLP"),
                # FITI
                ("IPRO", "FITI"), ("investment project ready", "FITI"), ("masterplan kawasan", "FITI"),
                ("roadmap investasi", "FITI"), ("studi kelayakan", "FITI"), ("peta peluang investasi", "FITI"),
                ("konsultan investasi", "FITI")
            ]
            for text, sp in initial_keywords:
                db.add(Keyword(keyword_text=text, subporto=sp, is_active=True))
            await db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await create_tables()
    await seed_data()
    yield
    # Shutdown
    from app.services.inaproc import inaproc_service
    await inaproc_service.close()

app = FastAPI(
    title="LSI Tender Intelligence API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tender.router, prefix="/api/v1/tender", tags=["Tender"])
app.include_router(rup.router, prefix="/api/v1/rup", tags=["RUP"])
app.include_router(expert.router, prefix="/api/v1/experts", tags=["Experts"])
app.include_router(keyword.router, prefix="/api/v1/keywords", tags=["Keywords"])
app.include_router(watchlist.router, prefix="/api/v1/watchlist", tags=["Watchlist"])
app.include_router(users.router, prefix="/api/v1", tags=["Users"])

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "mode": "dummy" if settings.USE_DUMMY_DATA else "production"}
