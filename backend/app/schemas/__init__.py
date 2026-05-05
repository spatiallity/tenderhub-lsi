from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


# ─── Expert Schemas ────────────────────────────────────────────────────────────

class ExpertProjectBase(BaseModel):
    nama_proyek: str
    pemberi_kerja: Optional[str] = None
    tahun: Optional[int] = None
    nilai_proyek: Optional[float] = None
    peran: Optional[str] = None
    bersama: Optional[str] = None
    nama_perusahaan_lain: Optional[str] = None
    status_proyek: str = "Selesai"


class ExpertProjectCreate(ExpertProjectBase):
    pass


class ExpertProjectOut(ExpertProjectBase):
    id: int
    expert_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ExpertReviewBase(BaseModel):
    reviewer_nama: str
    rating: int
    komentar: Optional[str] = None
    nama_proyek_ref: Optional[str] = None


class ExpertReviewCreate(ExpertReviewBase):
    pass


class ExpertReviewOut(ExpertReviewBase):
    id: int
    expert_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ExpertBase(BaseModel):
    nama: str
    no_hp: Optional[str] = None
    instansi: Optional[str] = None
    jenis_instansi: str = "eksternal"
    keahlian: List[str] = []
    subporto: List[str] = []
    main_keahlian: Optional[str] = None
    availability: str = "Tersedia"


class ExpertCreate(ExpertBase):
    projects: Optional[List[ExpertProjectCreate]] = []


class ExpertUpdate(BaseModel):
    nama: Optional[str] = None
    no_hp: Optional[str] = None
    instansi: Optional[str] = None
    jenis_instansi: Optional[str] = None
    keahlian: Optional[List[str]] = None
    subporto: Optional[List[str]] = None
    main_keahlian: Optional[str] = None
    availability: Optional[str] = None


class ExpertOut(ExpertBase):
    id: int
    rating_avg: float
    jumlah_proyek: int
    created_at: datetime
    updated_at: datetime
    projects: List[ExpertProjectOut] = []
    reviews: List[ExpertReviewOut] = []

    class Config:
        from_attributes = True


class ExpertListOut(ExpertBase):
    id: int
    rating_avg: float
    jumlah_proyek: int

    class Config:
        from_attributes = True


# ─── Keyword Schemas ───────────────────────────────────────────────────────────

class KeywordBase(BaseModel):
    keyword_text: str
    subporto: str
    is_active: bool = True


class KeywordCreate(KeywordBase):
    pass


class KeywordUpdate(BaseModel):
    keyword_text: Optional[str] = None
    subporto: Optional[str] = None
    is_active: Optional[bool] = None


class KeywordOut(KeywordBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Watchlist Schemas ─────────────────────────────────────────────────────────

class WatchlistBase(BaseModel):
    kd_tender: int
    nama_paket: Optional[str] = None
    nama_klpd: Optional[str] = None
    hps: Optional[float] = None
    status_internal: str = "Dipantau"
    catatan_internal: Optional[str] = None
    assigned_pic: Optional[str] = None
    assigned_expert_ids: List[int] = []
    subporto_rekomendasi: Optional[str] = None
    relevance_score: Optional[float] = None


class WatchlistCreate(WatchlistBase):
    pass


class WatchlistUpdate(BaseModel):
    status_internal: Optional[str] = None
    catatan_internal: Optional[str] = None
    assigned_pic: Optional[str] = None
    assigned_expert_ids: Optional[List[int]] = None
    subporto_rekomendasi: Optional[str] = None
    relevance_score: Optional[float] = None


class WatchlistOut(WatchlistBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ─── Tender Schemas (from INAPROC / dummy) ────────────────────────────────────

class TenderOut(BaseModel):
    id: Optional[int] = None
    kd_tender: Optional[int] = None
    nama: str
    instansi: str
    level: Optional[str] = None
    lpse: Optional[str] = None
    hps: Optional[float] = None
    pagu: Optional[float] = None
    metode: Optional[str] = None
    currentStage: Optional[int] = None
    deadlineStage: Optional[str] = None
    currentStageDeadline: Optional[str] = None
    deadlineCurrentStage: Optional[str] = None
    tgl_akhir_tahap_berjalan: Optional[str] = None
    submitDeadlineStage: Optional[str] = None
    deadlineSubmitStage: Optional[str] = None
    deadlineSubmitGate: Optional[str] = None
    tgl_akhir_submit: Optional[str] = None
    stageDeadlines: Optional[Any] = None
    stage_deadlines: Optional[Any] = None
    jadwalTahapan: Optional[Any] = None
    jadwal_tahapan: Optional[Any] = None
    tahapan: Optional[Any] = None
    provinsi: Optional[str] = None
    portofolio: Optional[str] = None
    status: Optional[str] = None
    internalStatus: Optional[str] = None
    catatan_internal: Optional[str] = None
    assigned_pic: Optional[str] = None
    assigned_expert_ids: List[int] = []
    followed: bool = False
    won: bool = False
    nama_satker: Optional[str] = None
    jenis_pengadaan: Optional[str] = None
    jenis_klpd: Optional[str] = None
    mtd_pemilihan: Optional[str] = None
    mtd_evaluasi: Optional[str] = None
    mtd_kualifikasi: Optional[str] = None
    kualifikasi_paket: Optional[str] = None
    sumber_dana: Optional[str] = None
    kontrak_pembayaran: Optional[str] = None
    kd_rup: Optional[str] = None
    tahun_anggaran: Optional[int] = None
    tgl_pengumuman: Optional[str] = None
    lokasi_pekerjaan: Optional[str] = None
    nama_ppk: Optional[str] = None
    nama_pokja: Optional[str] = None
    # Enriched fields
    relevance_score: Optional[float] = None
    matched_keywords: List[str] = []
    recommended_subporto: Optional[str] = None

    class Config:
        from_attributes = True


class RupOut(BaseModel):
    id: Optional[int] = None
    kd_rup: Optional[str] = None
    nama_paket: str
    nama_klpd: str
    jenis_klpd: Optional[str] = None
    nama_satker: Optional[str] = None
    pagu: Optional[float] = None
    metode_pengadaan: Optional[str] = None
    jenis_pengadaan: Optional[str] = None
    volume_pekerjaan: Optional[str] = None
    uraian_pekerjaan: Optional[str] = None
    spesifikasi_pekerjaan: Optional[str] = None
    tgl_awal_pemilihan: Optional[str] = None
    tgl_akhir_pemilihan: Optional[str] = None
    tgl_awal_kontrak: Optional[str] = None
    tgl_akhir_kontrak: Optional[str] = None
    provinsi: Optional[str] = None
    kabupaten: Optional[str] = None
    portofolio: Optional[str] = None
    tahun_anggaran: Optional[str] = None
    status_umumkan_rup: Optional[str] = None
    # Enriched
    matched_keywords: List[str] = []
    recommended_subporto: Optional[str] = None
    readiness: Optional[int] = None
    days_until_selection: Optional[int] = None

    class Config:
        from_attributes = True
