from app.core.database import Base
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime


class Expert(Base):
    __tablename__ = "experts"

    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String(200), nullable=False)
    no_hp = Column(String(50), nullable=True)
    instansi = Column(String(200), nullable=True)
    jenis_instansi = Column(String(50), default="eksternal")  # internal / eksternal
    keahlian = Column(JSON, default=list)          # ["Survei Topografi", ...]
    subporto = Column(JSON, default=list)          # ["SDA", "FLP", ...]
    main_keahlian = Column(String(100), nullable=True)
    availability = Column(String(50), default="Tersedia")  # Tersedia / Sedang Bertugas / Tidak Tersedia
    rating_avg = Column(Float, default=0.0)
    jumlah_proyek = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    projects = relationship("ExpertProject", back_populates="expert", cascade="all, delete-orphan")
    reviews = relationship("ExpertReview", back_populates="expert", cascade="all, delete-orphan")


class ExpertProject(Base):
    __tablename__ = "expert_projects"

    id = Column(Integer, primary_key=True, index=True)
    expert_id = Column(Integer, ForeignKey("experts.id", ondelete="CASCADE"), nullable=False)
    nama_proyek = Column(String(300), nullable=False)
    pemberi_kerja = Column(String(200), nullable=True)
    tahun = Column(Integer, nullable=True)
    nilai_proyek = Column(Float, nullable=True)
    peran = Column(String(100), nullable=True)
    bersama = Column(String(50), nullable=True)  # Sucofindo / Lain
    nama_perusahaan_lain = Column(String(200), nullable=True)
    status_proyek = Column(String(50), default="Selesai")
    created_at = Column(DateTime, default=datetime.utcnow)

    expert = relationship("Expert", back_populates="projects")


class ExpertReview(Base):
    __tablename__ = "expert_reviews"

    id = Column(Integer, primary_key=True, index=True)
    expert_id = Column(Integer, ForeignKey("experts.id", ondelete="CASCADE"), nullable=False)
    reviewer_nama = Column(String(100), nullable=False)
    rating = Column(Integer, nullable=False)       # 1-5
    komentar = Column(Text, nullable=True)
    nama_proyek_ref = Column(String(300), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    expert = relationship("Expert", back_populates="reviews")
