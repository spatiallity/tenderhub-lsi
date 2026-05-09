"""Province / instansi -> branch routing rules used by seed scripts.

Pusat = SBU LSI handles all K/L (Kementerian / Lembaga / BUMN pusat).
Cabang = nearest regional office for Pemprov / Pemkab / Pemkot.
"""
from typing import Optional

# Province -> nearest branch (city). Add new mappings here as needed.
PROVINCE_TO_BRANCH = {
    # Sumatera (Wilayah Barat)
    "Aceh": "Medan",
    "Sumatera Utara": "Medan",
    "Sumatera Barat": "Padang",
    "Riau": "Pekanbaru",
    "Kepulauan Riau": "Batam",
    "Jambi": "Jambi",
    "Sumatera Selatan": "Palembang",
    "Kepulauan Bangka Belitung": "Palembang",
    "Bengkulu": "Bengkulu",
    "Lampung": "Bandar Lampung",
    # Jawa + Bali (Wilayah Barat)
    "DKI Jakarta": "Jakarta",
    "Banten": "Cilegon",
    "Jawa Barat": "Bandung",
    "Jawa Tengah": "Semarang",
    "DI Yogyakarta": "Semarang",
    "Jawa Timur": "Surabaya",
    # Bali / NT (Wilayah Timur)
    "Bali": "Denpasar",
    "NTB": "Denpasar",
    "NTT": "Denpasar",
    # Kalimantan (Wilayah Timur)
    "Kalimantan Barat": "Pontianak",
    "Kalimantan Tengah": "Banjarmasin",
    "Kalimantan Selatan": "Banjarmasin",
    "Kalimantan Timur": "Balikpapan",
    "Kalimantan Utara": "Tarakan",
    # Sulawesi (Wilayah Timur)
    "Sulawesi Utara": "Makassar",
    "Gorontalo": "Makassar",
    "Sulawesi Tengah": "Makassar",
    "Sulawesi Barat": "Makassar",
    "Sulawesi Selatan": "Makassar",
    "Sulawesi Tenggara": "Kendari",
    # Maluku / Papua (Wilayah Timur)
    "Maluku": "Makassar",
    "Maluku Utara": "Makassar",
    "Papua": "Timika",
    "Papua Barat": "Timika",
    "Papua Barat Daya": "Timika",
    "Papua Tengah": "Timika",
    "Papua Pegunungan": "Timika",
    "Papua Selatan": "Timika",
}

PUSAT = "SBU LSI"


def is_kl_instansi(instansi: str, jenis_klpd: str = "", level: str = "") -> bool:
    """Heuristic: is the procuring entity a central government K/L?"""
    if not instansi:
        return False
    s = instansi.lower()
    if level == "K/L":
        return True
    if jenis_klpd in ("KEMENTERIAN", "LEMBAGA"):
        return True
    if any(kw in s for kw in ("kementerian", "kemen ", "kemen.", "badan ", "bappenas", "bapenas")):
        return True
    if any(kw in s for kw in (" pln", "pertamina", "telkom", "bumn")):
        return True
    return False


def branch_for(provinsi: Optional[str], instansi: str, jenis_klpd: str = "", level: str = "") -> Optional[str]:
    """Return branch name (cabang or 'SBU LSI') for a tender/RUP.

    Returns None when no province match found AND not classified as K/L.
    """
    if is_kl_instansi(instansi or "", jenis_klpd or "", level or ""):
        return PUSAT
    if not provinsi:
        return None
    return PROVINCE_TO_BRANCH.get(provinsi)
