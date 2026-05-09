"""Unit kerja (cabang + pusat) — single source of truth.

Mirrors frontend/src/utils/unitKerja.js. Update both when adding branches.
"""

UNIT_KERJA = [
    # Wilayah Barat
    {"name": "Bandar Lampung", "region": "Barat"},
    {"name": "Bandung",        "region": "Barat"},
    {"name": "Batam",          "region": "Barat"},
    {"name": "Bekasi",         "region": "Barat"},
    {"name": "Bengkulu",       "region": "Barat"},
    {"name": "Cilacap",        "region": "Barat"},
    {"name": "Cilegon",        "region": "Barat"},
    {"name": "Cirebon",        "region": "Barat"},
    {"name": "Dumai",          "region": "Barat"},
    {"name": "Jakarta",        "region": "Barat"},
    {"name": "Jambi",          "region": "Barat"},
    {"name": "Medan",          "region": "Barat"},
    {"name": "Padang",         "region": "Barat"},
    {"name": "Palembang",      "region": "Barat"},
    {"name": "Pekanbaru",      "region": "Barat"},
    {"name": "Semarang",       "region": "Barat"},
    # Wilayah Timur
    {"name": "Balikpapan",  "region": "Timur"},
    {"name": "Banjarmasin", "region": "Timur"},
    {"name": "Batulicin",   "region": "Timur"},
    {"name": "Bontang",     "region": "Timur"},
    {"name": "Denpasar",    "region": "Timur"},
    {"name": "Kendari",     "region": "Timur"},
    {"name": "Makassar",    "region": "Timur"},
    {"name": "Pontianak",   "region": "Timur"},
    {"name": "Samarinda",   "region": "Timur"},
    {"name": "Sangatta",    "region": "Timur"},
    {"name": "Surabaya",    "region": "Timur"},
    {"name": "Tarakan",     "region": "Timur"},
    {"name": "Timika",      "region": "Timur"},
    # Pusat
    {"name": "SBU LSI", "region": "Pusat"},
]

UNIT_NAMES = [u["name"] for u in UNIT_KERJA]
NAME_TO_REGION = {u["name"]: u["region"] for u in UNIT_KERJA}


def get_region(unit_name: str) -> str | None:
    return NAME_TO_REGION.get(unit_name)


def is_pusat(unit_name: str) -> bool:
    return unit_name == "SBU LSI"


# Email slug used for seed accounts: lowercased, spaces removed.
def email_slug(unit_name: str) -> str:
    return unit_name.lower().replace(" ", "")


VALID_ROLES = {"admin", "pusat", "cabang", "manager", "user", "guest"}
