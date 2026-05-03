import httpx
import logging
from typing import Dict, Any, List, Optional
from datetime import date, timedelta
from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.config import settings

logger = logging.getLogger(__name__)

PRAKUAL_STAGE_NAMES = [
    "Pengumuman Prakualifikasi",
    "Download Dokumen Kualifikasi",
    "Penjelasan Dokumen Prakualifikasi",
    "Kirim Persyaratan Kualifikasi",
    "Evaluasi Dokumen Kualifikasi",
    "Pembuktian Kualifikasi",
    "Penetapan Hasil Kualifikasi",
    "Pengumuman Hasil Prakualifikasi",
    "Masa Sanggah Prakualifikasi",
    "Download Dokumen Pemilihan",
    "Pemberian Penjelasan",
    "Upload Dokumen Penawaran",
    "Pembukaan dan Evaluasi Penawaran File I: Administrasi dan Teknis",
    "Pengumuman Hasil Evaluasi Administrasi dan Teknis",
    "Pembukaan dan Evaluasi Penawaran File II: Harga",
    "Penetapan Pemenang",
    "Pengumuman Pemenang",
    "Masa Sanggah",
    "Klarifikasi dan Negosiasi Teknis dan Biaya",
    "Surat Penunjukan Penyedia Barang/Jasa",
    "Penandatanganan Kontrak",
]

PASCAKUAL_STAGE_NAMES = [
    "Pengumuman Pascakualifikasi",
    "Download Dokumen Pemilihan",
    "Pemberian Penjelasan",
    "Upload Dokumen Penawaran",
    "Pembukaan Dokumen Penawaran",
    "Evaluasi Administrasi, Kualifikasi, Teknis, dan Harga",
    "Pembuktian Kualifikasi",
    "Penetapan Pemenang",
    "Pengumuman Pemenang",
    "Masa Sanggah",
    "Surat Penunjukan Penyedia Barang/Jasa",
    "Penandatanganan Kontrak",
]

def _attach_dummy_stage_schedule(tender: Dict[str, Any]) -> Dict[str, Any]:
    stages = PRAKUAL_STAGE_NAMES if tender.get("metode") == "Prakualifikasi" else PASCAKUAL_STAGE_NAMES
    current_stage = max(1, min(int(tender.get("currentStage") or 1), len(stages)))
    today = date.today()

    schedule = []
    for idx, stage_name in enumerate(stages, start=1):
        start = today + timedelta(days=(idx - current_stage) * 3 - 1)
        end = today + timedelta(days=(idx - current_stage) * 3 + 2)
        schedule.append({
            "stageNo": idx,
            "name": stage_name,
            "startDate": start.isoformat(),
            "endDate": end.isoformat(),
        })

    current_deadline = schedule[current_stage - 1]["endDate"]
    return {
        **tender,
        "jadwalTahapan": schedule,
        "currentStageDeadline": current_deadline,
        "deadlineStage": current_deadline,
    }

class InaprocService:
    def __init__(self):
        self.base_url = settings.INAPROC_BASE_URL
        self.api_key = settings.INAPROC_API_KEY
        self.headers = {"Authorization": f"Bearer {self.api_key}"} if self.api_key else {}
        self.client = httpx.AsyncClient(timeout=30.0)

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def _get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> Any:
        try:
            response = await self.client.get(f"{self.base_url}{endpoint}", headers=self.headers, params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error fetching from INAPROC API ({endpoint}): {str(e)}")
            raise

    async def get_tenders(self, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        if settings.USE_DUMMY_DATA:
            from app.services.dummy_data import TENDERS_RAW
            return [_attach_dummy_stage_schedule(tender) for tender in TENDERS_RAW]
        
        # Real implementation
        res = await self._get("/api/v1/tender/pengumuman", params=params)
        return res.get("data", [])

    async def get_tender_jadwal(self, kd_tender: int) -> List[Dict[str, Any]]:
        if settings.USE_DUMMY_DATA:
            return [] # Jadwal dummy di-handle di frontend
        
        res = await self._get("/api/v1/tender/jadwal-tahapan", params={"kd_tender": kd_tender})
        return res.get("data", [])

    async def get_rup_paket(self, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        if settings.USE_DUMMY_DATA:
            from app.services.dummy_data import RUP_RAW
            return RUP_RAW
        
        res = await self._get("/api/v1/rup/paket-penyedia", params=params)
        return res.get("data", [])

    async def get_tender_selesai(self, params: Dict[str, Any]) -> List[Dict[str, Any]]:
        if settings.USE_DUMMY_DATA:
            return []
            
        res = await self._get("/api/v1/tender/tender-selesai-nilai", params=params)
        return res.get("data", [])

    async def close(self):
        await self.client.aclose()

inaproc_service = InaprocService()
