"""Fill empty ``uraian_tugas`` on expert_projects with contextual multi-line
bullet text composed from (role, nama_proyek-topic). Idempotent: rows that
already have non-trivial uraian_tugas are left alone (the placeholder
'Belum diisi' is also treated as empty).

Usage:
    python -m scripts.backfill_uraian_tugas           # dry-run (print plan)
    python -m scripts.backfill_uraian_tugas --apply   # commit changes
"""
from __future__ import annotations

import argparse
import asyncio
import re
from typing import Iterable, List, Sequence

from sqlalchemy import text

from app.core.database import engine


# ── Role-anchored leadership / seniority bullets ──────────────────────────────
ROLE_BULLETS: dict[str, list[str]] = {
    "team leader": [
        "Memimpin keseluruhan pelaksanaan proyek dari inception hingga final deliverable, termasuk koordinasi dengan klien, tim internal, dan pemangku kepentingan eksternal.",
        "Menyusun work plan, jadwal penugasan tenaga ahli, dan anggaran proyek, serta memastikan mutu deliverable selaras dengan KAK dan standar profesional.",
    ],
    "koordinator lapangan": [
        "Mengelola tim lapangan harian, memastikan kepatuhan SOP K3, dan mengkoordinasikan logistik mobilisasi alat serta personel ke lokasi survei.",
        "Melakukan quality control data lapangan secara on-the-spot dan menyusun laporan progres mingguan untuk Team Leader.",
    ],
    "ahli madya": [
        "Mendampingi Tenaga Ahli Utama dalam analisis teknis, penyusunan laporan interim/final, dan penyiapan presentasi untuk pemberi kerja.",
        "Mengkompilasi data sekunder, melakukan literature review, dan menyiapkan base map serta database proyek.",
    ],
    "tenaga ahli utama": [
        "Memberikan arahan teknis strategis pada setiap tahap analisis, merumuskan metodologi, dan melakukan peer review terhadap hasil kerja tim junior.",
        "Menjadi penanggung jawab keakuratan dan kelengkapan output teknis sesuai KAK serta membahas hasil dengan pihak pemberi kerja.",
    ],
    "ahli gis": [
        "Menjadi penanggung jawab teknis seluruh pekerjaan GIS proyek, termasuk desain skema basis data spasial dan standar metadata.",
        "Melakukan pemodelan, analisis spasial lanjut, dan menyiapkan peta akhir berkualitas produksi untuk laporan resmi.",
    ],
    "data lead": [
        "Mendesain pipeline pengolahan data end-to-end dari ingestion, cleaning, hingga penyajian dashboard.",
        "Melakukan validasi kualitas data dan memastikan konsistensi antara sumber lapangan dan sistem pelaporan.",
    ],
    "lead developer": [
        "Memimpin tim pengembangan sistem, mengelola arsitektur aplikasi, dan menetapkan standar kode serta review pull request.",
        "Bertanggung jawab atas kelayakan teknis solusi, integrasi API, dan delivery tepat jadwal.",
    ],
    "principal consultant": [
        "Memberikan arahan strategis kepada tim dan klien, termasuk framing masalah, skenario solusi, dan risk assessment.",
        "Menjadi eskalasi utama untuk isu substansi teknis dan stakeholder C-level.",
    ],
    "geotechnical engineer": [
        "Menyusun program investigasi tanah (bor dalam, sondir, SPT) dan menginterpretasi hasil uji laboratorium.",
        "Menganalisis daya dukung pondasi, stabilitas lereng, dan rekomendasi perbaikan tanah.",
    ],
    "investment lead": [
        "Menyusun thesis investasi, financial model multi-skenario, dan deal structuring untuk proyek strategis.",
        "Memfasilitasi diskusi dengan calon investor dan otoritas perizinan (BKPM, OSS, pemda).",
    ],
    "structural engineer": [
        "Melakukan pemodelan struktur dengan SAP2000/ETABS dan verifikasi terhadap SNI pembebanan.",
        "Menghasilkan detail drawing struktur (balok, kolom, pondasi) dan volume pekerjaan.",
    ],
    "project control": [
        "Menyusun baseline schedule (S-curve), cost loading, dan earned value reporting bulanan.",
        "Melakukan analisis varians dan menyiapkan rekomendasi mitigasi untuk slippage jadwal/biaya.",
    ],
    "ahli hidrologi": [
        "Menyusun analisis frekuensi hujan, debit banjir rancangan, dan neraca air lahan basah proyek.",
        "Memverifikasi model hidrologi/hidraulik terhadap data historis dan kondisi lapangan.",
    ],
    "financial analyst": [
        "Menyiapkan model finansial (arus kas, IRR, NPV, payback, sensitivity, Monte Carlo).",
        "Menyusun asumsi makroekonomi, projection pendapatan, dan struktur pembiayaan proyek.",
    ],
    "survey methodologist": [
        "Merancang desain sampling probabilistik, kuesioner, dan protokol lapangan.",
        "Melakukan uji coba instrumen, weighting, dan perhitungan margin of error.",
    ],
    "ahli transportasi": [
        "Menyusun analisis demand transportasi, modal split, dan proyeksi pergerakan.",
        "Mengevaluasi kinerja jaringan dan skenario integrasi antar moda.",
    ],
    "policy lead": [
        "Memimpin kajian kebijakan, menyusun policy brief, dan memfasilitasi konsultasi publik.",
        "Merumuskan rekomendasi regulasi berbasis bukti (evidence-based) untuk pembuat keputusan.",
    ],
    "urban planner": [
        "Menyusun skema penataan ruang, peruntukan kawasan, dan integrasi infrastruktur perkotaan.",
        "Mengintegrasikan aspek sosial, lingkungan, dan ekonomi dalam rencana pengembangan kawasan.",
    ],
}

ROLE_BULLETS_FALLBACK = [
    "Menjalankan tugas sesuai scope of work yang disepakati dalam KAK dan arahan Team Leader.",
    "Berkoordinasi dengan tim internal dan pemberi kerja untuk memastikan output sesuai standar.",
]


# ── Topic bullets triggered by keywords in nama_proyek ────────────────────────
# Order matters: first match wins; put specific topics before generic ones.
TOPIC_PATTERNS: list[tuple[re.Pattern[str], list[str]]] = [
    (re.compile(r"\btopograf|pengukuran|bench ?mark", re.I), [
        "Melaksanakan pengukuran kerangka kontrol horizontal/vertikal dengan GNSS RTK dan waterpass orde 2.",
        "Mengolah data pengukuran menggunakan AutoCAD Civil 3D dan menghasilkan peta topografi skala 1:1000 beserta profil memanjang/melintang.",
        "Menyusun laporan hasil survei topografi lengkap dengan sketsa bench mark dan koordinat titik kontrol.",
        "Menjalin koordinasi dengan perangkat desa/kecamatan terkait akses lahan survei.",
    ]),
    (re.compile(r"gis|pemetaan|spasial|peta", re.I), [
        "Melakukan digitasi, overlay, dan analisis spasial menggunakan ArcGIS/QGIS.",
        "Menyusun peta tematik final sesuai metadata standar Badan Informasi Geospasial (BIG).",
        "Mengintegrasikan data raster dan vektor untuk analisis kerawanan/risiko kawasan.",
        "Menyiapkan basis data geospasial beserta dokumentasi teknis untuk serah-terima ke pemberi kerja.",
    ]),
    (re.compile(r"hidrologi|bendungan|embung|irigasi|waduk|das|banjir", re.I), [
        "Menganalisis data curah hujan, debit andalan, dan debit banjir rancangan dengan HEC-HMS/HEC-RAS.",
        "Menyusun neraca air dan skenario operasi waduk/embung untuk kebutuhan irigasi dan air baku.",
        "Menghasilkan rekomendasi dimensi hidraulik struktur (spillway, outlet, saluran).",
        "Menyiapkan laporan hidrologi dan presentasi kepada tim design engineering.",
    ]),
    (re.compile(r"bush clearing|row|right ?of ?way|sutt|sutet|transmisi", re.I), [
        "Melaksanakan inventarisasi tanaman, bangunan, dan tutupan lahan di dalam koridor.",
        "Menyusun database kompensasi lengkap dengan koordinat titik dan taksiran nilai.",
        "Koordinasi dengan BPN, pemerintah daerah, dan pemilik lahan terkait pelaksanaan pembebasan.",
        "Menyiapkan laporan bush clearing dan rekomendasi mitigasi sosial.",
    ]),
    (re.compile(r"\bded\b|detail engineering|engineering design", re.I), [
        "Menyusun gambar DED (layout, detail struktur, mekanikal, elektrikal).",
        "Menghasilkan BOQ dan RAB sesuai harga satuan setempat dan SNI pembebanan.",
        "Menyiapkan spesifikasi teknis dan dokumen lelang siap tender.",
        "Koordinasi dengan konsultan supervisi dan pemberi tugas pada tahap tender.",
    ]),
    (re.compile(r"investasi|ipro|masterplan|kek|kawasan ekonomi|profil investasi|peluang investasi", re.I), [
        "Melakukan analisis pasar, demand-supply, dan proyeksi finansial (IRR, NPV, payback, sensitivity).",
        "Menyusun masterplan kawasan dan roadmap pentahapan investasi jangka menengah-panjang.",
        "Menyiapkan profil peluang investasi (Investment Project Ready) dan materi promosi untuk calon investor.",
        "Memfasilitasi konsultasi dengan BKPM, pemda, dan otoritas perizinan terkait.",
    ]),
    (re.compile(r"kelayakan|feasibility|fs", re.I), [
        "Menyusun analisis teknis, pasar, finansial, legal, dan risiko dalam kerangka kelayakan menyeluruh.",
        "Menyiapkan proyeksi arus kas dan IRR/NPV multi-skenario.",
        "Menyusun matriks risiko dan rekomendasi mitigasi untuk pemegang proyek.",
        "Memfasilitasi diskusi dengan stakeholder kunci (pemda, investor, lembaga pembiayaan).",
    ]),
    (re.compile(r"jalan|tol|jalur|pipa", re.I), [
        "Melaksanakan survey alignment koridor dan inventarisasi aset eksisting (utilitas silang, struktur melintang).",
        "Menyusun rekomendasi trase optimum berdasarkan kriteria teknis, lingkungan, dan sosial.",
        "Melakukan pemetaan utilitas silang dan identifikasi potensi konflik penggunaan lahan.",
        "Menyiapkan laporan trase dan presentasi kepada owner project.",
    ]),
    (re.compile(r"bandara|pelabuhan|transportasi|angkutan", re.I), [
        "Menganalisis demand-supply transportasi dan proyeksi pergerakan orang/barang.",
        "Menyiapkan studi teknis sisi darat/udara/laut dan skema integrasi antar-moda.",
        "Menyusun skema pentahapan pembangunan infrastruktur transportasi jangka panjang.",
        "Menyajikan hasil kajian kepada Kementerian Perhubungan / otoritas pelabuhan/bandara.",
    ]),
    (re.compile(r"gizi|kesehatan|persepsi|kepuasan|layanan publik", re.I), [
        "Menyusun instrumen kuesioner dan metodologi sampling probabilistik sesuai scope studi.",
        "Menjalankan enumerator training dan pilot survey untuk kalibrasi instrumen.",
        "Melakukan analisis statistik (uji reliabilitas, chi-square, regresi logistik) atas data primer.",
        "Menyusun laporan hasil survei lengkap dengan rekomendasi kebijakan / peningkatan layanan.",
    ]),
    (re.compile(r"umkm|pangan|pendataan|pemberdayaan|sensus", re.I), [
        "Menyusun instrumen pendataan dan protokol enumerator untuk cakupan lapangan.",
        "Mengolah data hasil sensus/pendataan dengan SPSS/R dan membangun tabel agregasi.",
        "Menyusun profil sosio-ekonomi dan rekomendasi intervensi program.",
        "Menyiapkan dashboard hasil pendataan untuk monitoring lintas unit kerja.",
    ]),
    (re.compile(r"kebijakan|regulasi|rancangan perda|peraturan", re.I), [
        "Melakukan review literatur kebijakan dan benchmark praktik terbaik nasional/internasional.",
        "Memfasilitasi FGD dan konsultasi publik dengan stakeholder kunci.",
        "Menyusun naskah akademik dan draft rancangan regulasi beserta penjelasan pasal.",
        "Menyiapkan policy brief ringkas untuk pengambil kebijakan.",
    ]),
    (re.compile(r"aset|inventar", re.I), [
        "Melaksanakan inventarisasi aset fisik lengkap dengan fotodokumentasi, koordinat, dan kondisi.",
        "Menyusun basis data aset terstandar dan memfasilitasi integrasi dengan SIMAK/BMN.",
        "Melakukan penilaian kondisi aset dan rekomendasi perawatan.",
        "Menyiapkan laporan inventarisasi dan berita acara serah-terima.",
    ]),
    (re.compile(r"geoteknik|sondir|spt|tanah", re.I), [
        "Menyusun program investigasi tanah (bor dalam, sondir, SPT) sesuai SNI 4153.",
        "Melakukan interpretasi data lapangan dan hasil uji laboratorium mekanika tanah.",
        "Menganalisis daya dukung pondasi, stabilitas lereng, dan rekomendasi perbaikan tanah.",
        "Menyusun laporan geoteknik siap sebagai basis desain struktur.",
    ]),
    (re.compile(r"kadaster|pertanahan|bpn|pembebasan", re.I), [
        "Melaksanakan pengukuran kadaster dengan alat sesuai ketelitian BPN.",
        "Mengecek kesesuaian data lapangan dengan buku tanah dan peta bidang BPN.",
        "Menyusun daftar nominatif pemilik dan nilai ganti rugi hasil appraisal.",
        "Memfasilitasi mediasi sosial dan penyerahan berkas ke BPN/P2T.",
    ]),
    (re.compile(r"rehabilitasi|konservasi|lingkungan", re.I), [
        "Menyusun desain teknis rehabilitasi lengkap dengan volume pekerjaan.",
        "Menganalisis kondisi eksisting dan merumuskan prioritas intervensi.",
        "Koordinasi dengan Kementerian/dinas terkait dan masyarakat setempat.",
        "Menyusun dokumen lingkungan pendukung (UKL-UPL/AMDAL) sesuai skala proyek.",
    ]),
]

TOPIC_BULLETS_FALLBACK = [
    "Melakukan pengumpulan data primer dan sekunder sesuai lingkup KAK.",
    "Menyusun laporan interim dan final serta presentasi hasil kepada pemberi kerja.",
    "Melakukan koordinasi rutin dengan tim internal dan stakeholder lapangan.",
    "Menyiapkan dokumentasi teknis untuk serah-terima pekerjaan.",
]


def normalize_role(role: str | None) -> str:
    return (role or "").strip().lower()


def pick_role_bullets(role: str | None) -> list[str]:
    key = normalize_role(role)
    return ROLE_BULLETS.get(key, ROLE_BULLETS_FALLBACK)


def pick_topic_bullets(nama_proyek: str | None) -> list[str]:
    text_value = (nama_proyek or "").strip()
    for pattern, bullets in TOPIC_PATTERNS:
        if pattern.search(text_value):
            return bullets
    return TOPIC_BULLETS_FALLBACK


def compose_uraian(role: str | None, nama_proyek: str | None) -> str:
    role_bullets = pick_role_bullets(role)[:2]
    topic_bullets = pick_topic_bullets(nama_proyek)[:4]
    combined = [*role_bullets, *topic_bullets]
    return "\n".join(combined)


def _is_empty(value: str | None) -> bool:
    if value is None:
        return True
    s = value.strip().lower()
    return s == "" or s == "belum diisi"


async def run(apply: bool) -> None:
    try:
        async with engine.connect() as conn:
            rows = (await conn.execute(text(
                "SELECT id, expert_id, nama_proyek, peran, posisi_penugasan, uraian_tugas "
                "FROM expert_projects ORDER BY id"
            ))).mappings().all()

        targets: list[tuple[int, str]] = []
        for r in rows:
            if not _is_empty(r["uraian_tugas"]):
                continue
            role = r["posisi_penugasan"] or r["peran"]
            uraian = compose_uraian(role, r["nama_proyek"])
            targets.append((r["id"], uraian))

        print(f"Total projects: {len(rows)}")
        print(f"Needing backfill: {len(targets)}")
        if not targets:
            print("Nothing to do.")
            return

        # Show a 3-row sample
        print("\nSample preview:")
        for pid, uraian in targets[:3]:
            print(f"  id={pid}")
            for line in uraian.split("\n"):
                print(f"    • {line}")
            print()

        if not apply:
            print("Dry-run — use --apply to commit changes.")
            return

        async with engine.begin() as conn:
            for pid, uraian in targets:
                await conn.execute(
                    text("UPDATE expert_projects SET uraian_tugas = :u WHERE id = :id"),
                    {"u": uraian, "id": pid},
                )
        print(f"\n✅ Updated {len(targets)} rows.")
    finally:
        await engine.dispose()


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--apply", action="store_true", help="Commit changes. Omit for dry-run.")
    return p.parse_args(argv)


if __name__ == "__main__":
    args = parse_args()
    asyncio.run(run(apply=args.apply))
