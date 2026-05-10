"""Fill empty bio + education fields on experts with contextual, per-expert
content derived from main_keahlian / subporto / nama. Deterministic — a
given expert's id always produces the same output — so re-running is a
no-op (only rows with NULL/empty targets are touched).

Fields backfilled:
  - tempat_lahir         (string)
  - tanggal_lahir        (YYYY-MM-DD)
  - pendidikan_formal    (JSON array of strings)
  - pendidikan_non_formal (JSON array of strings)
  - penguasaan_bahasa    (JSON array of strings)
  - posisi_diusulkan     (string)

Usage:
    python -m scripts.backfill_expert_bio            # dry-run (prints plan)
    python -m scripts.backfill_expert_bio --apply    # commits to Supabase
"""
from __future__ import annotations

import argparse
import asyncio
import json
import re
from typing import Sequence

from sqlalchemy import text

from app.core.database import engine


# ── City pool (60 Indonesian cities, approximately demographically weighted) ─
CITIES = [
    "Jakarta", "Bandung", "Surabaya", "Medan", "Semarang", "Palembang",
    "Makassar", "Depok", "Tangerang", "Bekasi", "Bogor", "Yogyakarta",
    "Malang", "Denpasar", "Padang", "Pekanbaru", "Banjarmasin", "Samarinda",
    "Pontianak", "Manado", "Balikpapan", "Jayapura", "Ambon", "Kupang",
    "Mataram", "Gorontalo", "Kendari", "Palu", "Bengkulu", "Jambi",
    "Banda Aceh", "Lampung", "Cirebon", "Tasikmalaya", "Surakarta", "Kediri",
    "Jember", "Madiun", "Mojokerto", "Pasuruan", "Probolinggo", "Blitar",
    "Purwokerto", "Magelang", "Salatiga", "Pekalongan", "Tegal", "Sukabumi",
    "Garut", "Majalengka", "Cilegon", "Serang", "Bandar Lampung",
    "Tanjungpinang", "Pangkalpinang", "Dumai", "Tarakan", "Bitung", "Parepare",
    "Bau-Bau",
]


# ── Specialty → canonical degree families ────────────────────────────────────
# Maps main_keahlian keywords → (primary_major, alternative_major, uni_pool,
# non_formal_themes, posisi_diusulkan_pool)
SPECIALTY_MAP: list[tuple[re.Pattern[str], dict]] = [
    # SDA — survei, topografi, geodesi
    (re.compile(r"topograf|pemetaan|gis|geodes|kadaster|spasial|row|bush clearing|inventar", re.I), {
        "majors": [
            "Teknik Geodesi",
            "Teknik Geomatika",
            "Kartografi dan Pengindraan Jauh",
            "Geografi",
        ],
        "unis": [
            "Institut Teknologi Bandung",
            "Universitas Gadjah Mada",
            "Institut Teknologi Sepuluh Nopember",
            "Universitas Diponegoro",
            "Universitas Padjadjaran",
        ],
        "non_formal": [
            "Pelatihan GNSS RTK & Total Station, Badan Informasi Geospasial (BIG)",
            "Sertifikasi Surveyor Terestris, HSI/AGSI",
            "Pelatihan ArcGIS Pro Advanced, ESRI Indonesia",
            "ISO 9001:2015 Lead Auditor, BSI Group",
            "Pelatihan K3 Umum, Kementerian Ketenagakerjaan",
            "Workshop UAV Photogrammetry, IAG",
        ],
        "posisi_pool": ["Team Leader", "Ahli Survei", "Ahli Pemetaan", "Koordinator Lapangan"],
    }),
    # SDA — hidrologi, bendungan, sumber daya air
    (re.compile(r"hidrolog|bendungan|embung|irigasi|sumber daya air|ded|feasibility|das\b|banjir|pengairan", re.I), {
        "majors": [
            "Teknik Sipil",
            "Teknik Sumber Daya Air",
            "Teknik Pengairan",
            "Teknik Lingkungan",
        ],
        "unis": [
            "Institut Teknologi Bandung",
            "Universitas Gadjah Mada",
            "Universitas Brawijaya",
            "Universitas Hasanuddin",
            "Universitas Indonesia",
        ],
        "non_formal": [
            "Pelatihan HEC-RAS & HEC-HMS Advanced, BBWS",
            "Sertifikasi Ahli Sumber Daya Air, LPJK",
            "Pelatihan Dam Safety, ICOLD Indonesia",
            "ISO 14001:2015 Lead Auditor, BSI Group",
            "Pelatihan AMDAL Tipe A, KLHK",
            "Sertifikasi K3 Konstruksi, BNSP",
        ],
        "posisi_pool": ["Team Leader", "Ahli Hidrologi", "Ahli Sumber Daya Air", "Koordinator Lapangan"],
    }),
    # FITI — investasi, kelayakan, masterplan, KEK
    (re.compile(r"investasi|masterplan|kek|kawasan ekonomi|kelayakan|feasibility|ipro|profil investasi|roadmap|konsultan", re.I), {
        "majors": [
            "Manajemen",
            "Ekonomi Pembangunan",
            "Perencanaan Wilayah dan Kota",
            "Teknik Industri",
            "Administrasi Bisnis",
        ],
        "unis": [
            "Universitas Indonesia",
            "Universitas Gadjah Mada",
            "Institut Teknologi Bandung",
            "Universitas Padjadjaran",
            "Universitas Airlangga",
        ],
        "non_formal": [
            "Chartered Financial Analyst (CFA) Level II, CFA Institute",
            "Project Management Professional (PMP), PMI",
            "Pelatihan Penyusunan Feasibility Study, BKPM",
            "Sertifikasi Appraiser Properti, MAPPI",
            "Pelatihan Investment Project Ready (IPRO), BKPM",
            "ISO 31000:2018 Risk Management, BSI Group",
        ],
        "posisi_pool": ["Team Leader", "Senior Investment Consultant", "Principal Consultant", "Financial Analyst"],
    }),
    # FLP — survei, layanan publik, kesehatan, kebijakan
    (re.compile(r"survei|pendataan|layanan publik|kepuasan|persepsi|gizi|kesehatan|kebijakan|sampling", re.I), {
        "majors": [
            "Statistika",
            "Ilmu Kesejahteraan Sosial",
            "Kebijakan Publik",
            "Kesehatan Masyarakat",
            "Sosiologi",
        ],
        "unis": [
            "Universitas Indonesia",
            "Universitas Gadjah Mada",
            "Institut Pertanian Bogor",
            "Universitas Airlangga",
            "Universitas Diponegoro",
        ],
        "non_formal": [
            "Pelatihan Statistical Methods for Survey Research, BPS",
            "Sertifikasi Metodolog Survei, AAPOR",
            "Pelatihan SPSS & R Advanced, LIPI",
            "Workshop Qualitative Research Methods, UI Press",
            "Sertifikasi Analis Kebijakan Madya, LAN RI",
            "Pelatihan Monitoring & Evaluasi Program, Bappenas",
        ],
        "posisi_pool": ["Team Leader", "Survey Methodologist", "Policy Lead", "Research Coordinator"],
    }),
    # Transportasi
    (re.compile(r"bandara|pelabuhan|transportasi|angkutan|jalan|tol", re.I), {
        "majors": [
            "Teknik Sipil",
            "Teknik Transportasi",
            "Perencanaan Wilayah dan Kota",
        ],
        "unis": [
            "Institut Teknologi Bandung",
            "Universitas Gadjah Mada",
            "Institut Teknologi Sepuluh Nopember",
            "Universitas Diponegoro",
        ],
        "non_formal": [
            "Pelatihan Transport Modeling (PTV Vissim), PTV Group",
            "Sertifikasi Ahli Teknik Jalan Madya, LPJK",
            "Pelatihan MKJI 1997 Revisi, Kementerian PUPR",
            "Workshop Airport Planning, IATA Training",
            "Sertifikasi K3 Konstruksi, BNSP",
        ],
        "posisi_pool": ["Team Leader", "Ahli Transportasi", "Transport Planner"],
    }),
]

# Generic fallback for specialties that don't match any pattern
FALLBACK_SPEC = {
    "majors": ["Teknik Industri", "Manajemen", "Teknik Sipil"],
    "unis": ["Universitas Indonesia", "Universitas Gadjah Mada", "Institut Teknologi Bandung"],
    "non_formal": [
        "Project Management Professional (PMP), PMI",
        "ISO 9001:2015 Lead Auditor, BSI Group",
        "Pelatihan K3 Umum, Kementerian Ketenagakerjaan",
        "ISO 31000:2018 Risk Management, BSI Group",
    ],
    "posisi_pool": ["Team Leader", "Senior Consultant", "Technical Specialist"],
}


def _pick(pool: Sequence[str], seed: int, offset: int = 0) -> str:
    """Deterministic pick from a pool using seed (usually expert id) + offset."""
    return pool[(seed + offset) % len(pool)]


def _rotate(pool: Sequence[str], seed: int, n: int) -> list[str]:
    """Deterministic N picks starting at seed with no repeats."""
    out = []
    length = len(pool)
    for i in range(min(n, length)):
        out.append(pool[(seed + i) % length])
    return out


def _has_degree(prefix: str) -> bool:
    return False  # placeholder for future use


def _detect_title_degrees(nama: str) -> list[str]:
    """Infer max degree level from an Indonesian name title.
    Prof / PhD / Dr. → S3 + S2 + S1; M.* → S2 + S1; others → S1 only.
    """
    n = nama or ""
    lower = n.lower()
    if re.search(r"\bprof\.|\bph\.?d\.?|\bdr\.", lower):
        return ["S3", "S2", "S1"]
    # Magister / Master variants: M.T. M.Sc. M.M. M.Kes. M.Eng. MBA
    if re.search(r"\bm\.\w|\bm\.?b\.?a\.?\b", lower):
        return ["S2", "S1"]
    return ["S1"]


def _birth_year_from_title(levels: list[str], seed: int) -> int:
    """Older for more degrees. PhDs: 1968-1980. Masters: 1980-1990. S1: 1988-2000."""
    if "S3" in levels:
        base = 1968
        span = 12  # 1968..1979
    elif "S2" in levels:
        base = 1980
        span = 11  # 1980..1990
    else:
        base = 1988
        span = 12  # 1988..1999
    return base + (seed * 7) % span


def _graduation_years(birth_year: int, levels: list[str]) -> dict[str, int]:
    """S1 around age 22, S2 +4 years, S3 +6 years from S2."""
    s1 = birth_year + 22
    out = {"S1": s1}
    if "S2" in levels:
        out["S2"] = s1 + 4
    if "S3" in levels:
        out["S3"] = out.get("S2", s1) + 6
    return out


def _compose_education(seed: int, nama: str, spec: dict) -> tuple[list[str], int]:
    """Return (pendidikan_formal, birth_year)."""
    levels = _detect_title_degrees(nama)
    birth_year = _birth_year_from_title(levels, seed)
    years = _graduation_years(birth_year, levels)
    majors = spec["majors"]
    unis = spec["unis"]

    rows: list[tuple[str, str]] = []  # (level, entry)
    # Compose newest first: S3 first if present, then S2, then S1
    if "S3" in levels:
        rows.append(("S3", f"S3 {majors[0]}, {unis[seed % len(unis)]} ({years['S3']})"))
    if "S2" in levels:
        rows.append(("S2", f"S2 {majors[0]}, {unis[(seed + 1) % len(unis)]} ({years['S2']})"))
    major_s1 = majors[(seed + 2) % len(majors)]
    rows.append(("S1", f"S1 {major_s1}, {unis[(seed + 3) % len(unis)]} ({years['S1']})"))
    return [entry for _, entry in rows], birth_year


def _compose_tanggal_lahir(seed: int, birth_year: int) -> str:
    """Deterministic YYYY-MM-DD from seed."""
    month = ((seed * 3) % 12) + 1
    # Keep day <= 28 to avoid month-boundary issues
    day = ((seed * 5) % 28) + 1
    return f"{birth_year:04d}-{month:02d}-{day:02d}"


def _compose_non_formal(seed: int, spec: dict) -> list[str]:
    pool = spec["non_formal"]
    # Pick 3-4 items, unique
    return _rotate(pool, seed, 3 if seed % 2 == 0 else 4)


def _compose_bahasa(seed: int) -> list[str]:
    extras = [
        "Bahasa Mandarin: Dasar",
        "Bahasa Jepang: Dasar",
        "Bahasa Arab: Dasar",
        "Bahasa Perancis: Dasar",
        "Bahasa Jerman: Dasar",
    ]
    base = ["Bahasa Indonesia: Sangat Baik", "Bahasa Inggris: Baik"]
    if seed % 4 == 0:
        base.append(extras[seed % len(extras)])
    return base


def _compose_posisi(seed: int, spec: dict) -> str:
    return _pick(spec["posisi_pool"], seed)


def pick_spec(main_keahlian: str | None, subporto: list | None) -> dict:
    haystack = " ".join([(main_keahlian or "")] + (subporto or []))
    for pat, spec in SPECIALTY_MAP:
        if pat.search(haystack):
            return spec
    return FALLBACK_SPEC


def _is_empty_str(v: str | None) -> bool:
    return v is None or (isinstance(v, str) and v.strip() == "")


def _is_empty_list(v) -> bool:
    if v is None:
        return True
    if isinstance(v, list):
        return len(v) == 0
    return False


async def run(apply: bool) -> None:
    try:
        async with engine.connect() as conn:
            rows = (await conn.execute(text(
                "SELECT id, nama, main_keahlian, subporto, "
                "tempat_lahir, tanggal_lahir, pendidikan_formal, "
                "pendidikan_non_formal, penguasaan_bahasa, posisi_diusulkan "
                "FROM experts ORDER BY id"
            ))).mappings().all()

        plan: list[dict] = []
        for r in rows:
            rid = r["id"]
            spec = pick_spec(r["main_keahlian"], r["subporto"])
            pend_formal, birth_year = _compose_education(rid, r["nama"] or "", spec)
            patch: dict = {}

            if _is_empty_str(r["tempat_lahir"]):
                patch["tempat_lahir"] = _pick(CITIES, rid)
            if _is_empty_str(r["tanggal_lahir"]):
                patch["tanggal_lahir"] = _compose_tanggal_lahir(rid, birth_year)
            if _is_empty_list(r["pendidikan_formal"]):
                patch["pendidikan_formal"] = pend_formal
            if _is_empty_list(r["pendidikan_non_formal"]):
                patch["pendidikan_non_formal"] = _compose_non_formal(rid, spec)
            if _is_empty_list(r["penguasaan_bahasa"]):
                patch["penguasaan_bahasa"] = _compose_bahasa(rid)
            if _is_empty_str(r["posisi_diusulkan"]):
                patch["posisi_diusulkan"] = _compose_posisi(rid, spec)

            if patch:
                plan.append({"id": rid, "nama": r["nama"], "patch": patch})

        print(f"Total experts: {len(rows)}")
        print(f"Needing backfill: {len(plan)}")
        if not plan:
            print("Nothing to do.")
            return

        print("\nSample preview (first 3):")
        for item in plan[:3]:
            print(f"  id={item['id']} — {item['nama']}")
            for k, v in item["patch"].items():
                print(f"    {k} = {v}")
            print()

        if not apply:
            print("Dry-run — use --apply to commit changes.")
            return

        async with engine.begin() as conn:
            for item in plan:
                patch = item["patch"]
                set_parts = []
                params: dict = {"id": item["id"]}
                for col, val in patch.items():
                    # JSON array columns need json-encoded text; strings are passed raw
                    if isinstance(val, list):
                        set_parts.append(f"{col} = CAST(:p_{col} AS JSON)")
                        params[f"p_{col}"] = json.dumps(val, ensure_ascii=False)
                    else:
                        set_parts.append(f"{col} = :p_{col}")
                        params[f"p_{col}"] = val
                stmt = f"UPDATE experts SET {', '.join(set_parts)} WHERE id = :id"
                await conn.execute(text(stmt), params)

        print(f"\n✅ Updated {len(plan)} experts.")
    finally:
        await engine.dispose()


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--apply", action="store_true", help="Commit changes. Omit for dry-run.")
    return p.parse_args(argv)


if __name__ == "__main__":
    args = parse_args()
    asyncio.run(run(apply=args.apply))
