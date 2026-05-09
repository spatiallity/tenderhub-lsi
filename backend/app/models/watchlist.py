from app.core.database import Base
from sqlalchemy import Column, Integer, String, Float, Text, JSON, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime


class TenderWatchlist(Base):
    __tablename__ = "tender_watchlist"

    id = Column(Integer, primary_key=True, index=True)
    kd_tender = Column(Integer, nullable=False, index=True)
    nama_paket = Column(String(400), nullable=True)
    nama_klpd = Column(String(300), nullable=True)
    hps = Column(Float, nullable=True)
    status_internal = Column(String(50), default="Dipantau")
    # Dipantau / Akan Diikuti / Sudah Diikuti / Menang / Kalah / Tidak Relevan
    catatan_internal = Column(Text, nullable=True)
    assigned_pic = Column(String(100), nullable=True)
    assigned_expert_ids = Column(JSON, default=list)
    subporto_rekomendasi = Column(String(10), nullable=True)
    relevance_score = Column(Float, nullable=True)
    # Branch claim — one tender = one unit_kerja.
    unit_kerja = Column(String(100), nullable=True, index=True)
    unit_kerja_region = Column(String(20), nullable=True)
    claimed_by = Column(UUID(as_uuid=False), nullable=True)
    claimed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RupWatchlist(Base):
    __tablename__ = "rup_watchlist"

    id = Column(Integer, primary_key=True, index=True)
    kd_rup = Column(String(100), nullable=False, unique=True, index=True)
    nama_paket = Column(String(400), nullable=True)
    nama_klpd = Column(String(300), nullable=True)
    pagu = Column(Float, nullable=True)
    status_internal = Column(String(50), default="Dipantau")
    catatan_internal = Column(Text, nullable=True)
    unit_kerja = Column(String(100), nullable=True, index=True)
    unit_kerja_region = Column(String(20), nullable=True)
    claimed_by = Column(UUID(as_uuid=False), nullable=True)
    claimed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class TenderCache(Base):
    __tablename__ = "tender_cache"

    id = Column(Integer, primary_key=True, index=True)
    kd_tender = Column(Integer, nullable=False, unique=True, index=True)
    raw_data = Column(JSON, nullable=True)
    tahapan_data = Column(JSON, nullable=True)
    last_fetched_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
