"""
Script to populate expert database with complete CV data including work experience
Run this script to add comprehensive expert data to the database
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.models.expert import Expert, ExpertProject, ExpertReview

# Complete expert data with CV template fields
EXPERTS_DATA = [
    {
        "nama": "Dr. Ir. Budi Santoso, M.T.",
        "no_hp": "081234567890",
        "instansi": "SUCOFINDO",
        "keahlian": ["Geologi", "Pertambangan", "Eksplorasi Mineral"],
        "availability": "Tersedia",
        "subporto": ["SDA"],
        "rating_avg": 4.8,
        "projects": [
            {
                "nama_proyek": "Survei Geologi dan Pemetaan Potensi Tambang Nikel Sulawesi",
                "pemberi_kerja": "PT Aneka Tambang Tbk",
                "tahun": 2024,
                "nilai_proyek": 4500000000,
                "peran": "Ahli Geologi Utama",
                "bersama": "Sucofindo",
                "status_proyek": "Selesai",
                "nama_perusahaan_lain": None,
                "lokasi_proyek": "Sulawesi Tenggara",
                "pengguna_jasa": "PT Aneka Tambang Tbk",
                "uraian_tugas": "Melakukan survei geologi, analisis sampel batuan, pemetaan potensi cadangan nikel, dan penyusunan laporan kelayakan teknis pertambangan",
                "waktu_mulai": "2024-01-15",
                "waktu_selesai": "2024-08-30",
                "posisi_penugasan": "Team Leader",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Ada"
            },
            {
                "nama_proyek": "Kajian AMDAL Tambang Batubara Kalimantan Timur",
                "pemberi_kerja": "PT Bukit Asam Tbk",
                "tahun": 2023,
                "nilai_proyek": 3200000000,
                "peran": "Konsultan Geologi",
                "bersama": "Sucofindo",
                "status_proyek": "Selesai",
                "nama_perusahaan_lain": None,
                "lokasi_proyek": "Kalimantan Timur",
                "pengguna_jasa": "PT Bukit Asam Tbk",
                "uraian_tugas": "Analisis dampak lingkungan pertambangan, kajian geologi regional, pemetaan zona rawan longsor, dan rekomendasi mitigasi",
                "waktu_mulai": "2023-03-01",
                "waktu_selesai": "2023-11-15",
                "posisi_penugasan": "Ahli Geologi",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Ada"
            },
            {
                "nama_proyek": "Eksplorasi dan Pemetaan Potensi Emas Papua",
                "pemberi_kerja": "PT Freeport Indonesia",
                "tahun": 2022,
                "nilai_proyek": 5800000000,
                "peran": "Senior Geologist",
                "bersama": "Sucofindo",
                "status_proyek": "Selesai",
                "nama_perusahaan_lain": None,
                "lokasi_proyek": "Papua",
                "pengguna_jasa": "PT Freeport Indonesia",
                "uraian_tugas": "Eksplorasi mineral emas, analisis geokimia, pemetaan struktur geologi, estimasi cadangan, dan penyusunan laporan teknis",
                "waktu_mulai": "2022-05-10",
                "waktu_selesai": "2022-12-20",
                "posisi_penugasan": "Senior Geologist",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Ada"
            }
        ],
        "reviews": [
            {
                "reviewer_nama": "Ir. Ahmad Fauzan, M.T.",
                "rating": 5,
                "komentar": "Sangat profesional dan detail dalam analisis geologi. Laporan yang dihasilkan sangat komprehensif."
            }
        ]
    },
    {
        "nama": "Prof. Dr. Siti Rahayu, S.T., M.Sc.",
        "no_hp": "081298765432",
        "instansi": "SUCOFINDO",
        "keahlian": ["Teknik Lingkungan", "AMDAL", "Pengelolaan Limbah"],
        "availability": "Tersedia",
        "subporto": ["SDA"],
        "rating_avg": 4.9,
        "projects": [
            {
                "nama_proyek": "Penyusunan Dokumen AMDAL Kawasan Industri Batang",
                "pemberi_kerja": "Kementerian Perindustrian",
                "tahun": 2025,
                "nilai_proyek": 2800000000,
                "peran": "Ketua Tim AMDAL",
                "bersama": "Sucofindo",
                "status_proyek": "Selesai",
                "nama_perusahaan_lain": None,
                "lokasi_proyek": "Batang, Jawa Tengah",
                "pengguna_jasa": "Kementerian Perindustrian RI",
                "uraian_tugas": "Koordinasi tim penyusun AMDAL, analisis dampak lingkungan, penyusunan RKL-RPL, konsultasi publik, dan finalisasi dokumen",
                "waktu_mulai": "2025-01-10",
                "waktu_selesai": "2025-06-30",
                "posisi_penugasan": "Ketua Tim",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Ada"
            },
            {
                "nama_proyek": "Kajian Pengelolaan Limbah B3 Industri Kimia",
                "pemberi_kerja": "PT Chandra Asri Petrochemical",
                "tahun": 2024,
                "nilai_proyek": 1900000000,
                "peran": "Ahli Lingkungan",
                "bersama": "Sucofindo",
                "status_proyek": "Selesai",
                "nama_perusahaan_lain": None,
                "lokasi_proyek": "Cilegon, Banten",
                "pengguna_jasa": "PT Chandra Asri Petrochemical Tbk",
                "uraian_tugas": "Audit pengelolaan limbah B3, evaluasi sistem pengolahan, rekomendasi perbaikan, dan penyusunan SOP pengelolaan limbah",
                "waktu_mulai": "2024-04-01",
                "waktu_selesai": "2024-09-15",
                "posisi_penugasan": "Ahli Lingkungan",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Ada"
            }
        ],
        "reviews": [
            {
                "reviewer_nama": "Bambang Hermanto, S.T., M.Eng.",
                "rating": 5,
                "komentar": "Expertise di bidang AMDAL sangat mendalam. Dokumen yang dihasilkan selalu lolos verifikasi dengan baik."
            }
        ]
    },
    {
        "nama": "Ir. Andi Wijaya, M.M.",
        "no_hp": "081345678901",
        "instansi": "SUCOFINDO",
        "keahlian": ["Manajemen Proyek", "Feasibility Study", "Analisis Investasi"],
        "availability": "Tersedia",
        "subporto": ["FITI"],
        "rating_avg": 4.7,
        "projects": [
            {
                "nama_proyek": "Studi Kelayakan Kawasan Ekonomi Khusus Mandalika",
                "pemberi_kerja": "Kementerian Investasi/BKPM",
                "tahun": 2025,
                "nilai_proyek": 6500000000,
                "peran": "Project Manager",
                "bersama": "Sucofindo",
                "status_proyek": "Sedang Berjalan",
                "nama_perusahaan_lain": None,
                "lokasi_proyek": "Lombok, NTB",
                "pengguna_jasa": "Kementerian Investasi/BKPM",
                "uraian_tugas": "Koordinasi tim studi kelayakan, analisis pasar dan demand, proyeksi finansial, analisis risiko, dan penyusunan business plan",
                "waktu_mulai": "2025-02-01",
                "waktu_selesai": "2025-12-31",
                "posisi_penugasan": "Project Manager",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Belum Ada"
            },
            {
                "nama_proyek": "Feasibility Study Kawasan Industri Hijau Kaltara",
                "pemberi_kerja": "DPMPTSP Provinsi Kalimantan Utara",
                "tahun": 2024,
                "nilai_proyek": 3400000000,
                "peran": "Lead Consultant",
                "bersama": "Sucofindo",
                "status_proyek": "Selesai",
                "nama_perusahaan_lain": None,
                "lokasi_proyek": "Kalimantan Utara",
                "pengguna_jasa": "Pemerintah Provinsi Kalimantan Utara",
                "uraian_tugas": "Analisis kelayakan teknis dan ekonomis, kajian pasar, proyeksi investasi, analisis SWOT, dan rekomendasi pengembangan",
                "waktu_mulai": "2024-01-15",
                "waktu_selesai": "2024-10-30",
                "posisi_penugasan": "Lead Consultant",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Ada"
            }
        ],
        "reviews": [
            {
                "reviewer_nama": "Dra. Rina Agustina, M.M.",
                "rating": 5,
                "komentar": "Manajemen proyek sangat baik, timeline selalu terjaga, dan deliverables berkualitas tinggi."
            }
        ]
    },
    {
        "nama": "Dr. Hendra Kusuma, S.Si., M.T.",
        "no_hp": "081456789012",
        "instansi": "SUCOFINDO",
        "keahlian": ["Hidrologi", "Sumber Daya Air", "Irigasi"],
        "availability": "Tersedia",
        "subporto": ["SDA"],
        "rating_avg": 4.6,
        "projects": [
            {
                "nama_proyek": "Kajian Hidrologi DAS Citanduy",
                "pemberi_kerja": "BPDAS Citanduy Cimanuk",
                "tahun": 2024,
                "nilai_proyek": 1500000000,
                "peran": "Ahli Hidrologi",
                "bersama": "Sucofindo",
                "status_proyek": "Selesai",
                "nama_perusahaan_lain": None,
                "lokasi_proyek": "Jawa Barat",
                "pengguna_jasa": "Kementerian LHK",
                "uraian_tugas": "Analisis debit sungai, kajian neraca air, pemetaan daerah tangkapan air, dan rekomendasi konservasi DAS",
                "waktu_mulai": "2024-03-01",
                "waktu_selesai": "2024-11-30",
                "posisi_penugasan": "Ahli Hidrologi",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Ada"
            },
            {
                "nama_proyek": "Desain Sistem Irigasi Pertanian Modern Jawa Timur",
                "pemberi_kerja": "Dinas Pertanian Provinsi Jawa Timur",
                "tahun": 2023,
                "nilai_proyek": 2100000000,
                "peran": "Konsultan Irigasi",
                "bersama": "Sucofindo",
                "status_proyek": "Selesai",
                "nama_perusahaan_lain": None,
                "lokasi_proyek": "Jawa Timur",
                "pengguna_jasa": "Pemerintah Provinsi Jawa Timur",
                "uraian_tugas": "Desain teknis sistem irigasi tetes, perhitungan kebutuhan air, analisis efisiensi, dan supervisi implementasi",
                "waktu_mulai": "2023-05-10",
                "waktu_selesai": "2023-12-20",
                "posisi_penugasan": "Konsultan Irigasi",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Ada"
            }
        ],
        "reviews": []
    },
    {
        "nama": "Dra. Maya Sari, M.Si.",
        "no_hp": "081567890123",
        "instansi": "SUCOFINDO",
        "keahlian": ["Statistik", "Survei Sosial", "Analisis Data"],
        "availability": "Tersedia",
        "subporto": ["FLP"],
        "rating_avg": 4.8,
        "projects": [
            {
                "nama_proyek": "Survei dan Evaluasi Program Bantuan Pangan Nasional",
                "pemberi_kerja": "Badan Pangan Nasional",
                "tahun": 2025,
                "nilai_proyek": 1800000000,
                "peran": "Ketua Tim Survei",
                "bersama": "Sucofindo",
                "status_proyek": "Sedang Berjalan",
                "nama_perusahaan_lain": None,
                "lokasi_proyek": "Nasional (34 Provinsi)",
                "pengguna_jasa": "Badan Pangan Nasional",
                "uraian_tugas": "Desain instrumen survei, koordinasi pengumpulan data lapangan, analisis statistik, dan penyusunan laporan evaluasi program",
                "waktu_mulai": "2025-01-05",
                "waktu_selesai": "2025-08-31",
                "posisi_penugasan": "Ketua Tim",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Belum Ada"
            },
            {
                "nama_proyek": "Pendataan dan Verifikasi Penerima Program Gizi",
                "pemberi_kerja": "Kementerian Kesehatan",
                "tahun": 2024,
                "nilai_proyek": 2200000000,
                "peran": "Ahli Statistik",
                "bersama": "Sucofindo",
                "status_proyek": "Selesai",
                "nama_perusahaan_lain": None,
                "lokasi_proyek": "DKI Jakarta dan sekitarnya",
                "pengguna_jasa": "Kementerian Kesehatan RI",
                "uraian_tugas": "Sampling dan pengumpulan data, verifikasi data penerima, analisis statistik deskriptif, dan penyusunan database",
                "waktu_mulai": "2024-02-01",
                "waktu_selesai": "2024-09-30",
                "posisi_penugasan": "Ahli Statistik",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Ada"
            }
        ],
        "reviews": [
            {
                "reviewer_nama": "Wahyu Setiawan, S.E., M.Ak.",
                "rating": 5,
                "komentar": "Metodologi survei sangat solid dan hasil analisis data sangat akurat. Sangat direkomendasikan."
            }
        ]
    },
    {
        "nama": "Ir. Rudi Hartono, M.T.",
        "no_hp": "081678901234",
        "instansi": "SUCOFINDO",
        "keahlian": ["Teknik Sipil", "Infrastruktur", "Jalan dan Jembatan"],
        "availability": "Tersedia",
        "subporto": ["SDA"],
        "rating_avg": 4.5,
        "projects": [
            {
                "nama_proyek": "Supervisi Pembangunan Jalan Tol Trans Sumatera",
                "pemberi_kerja": "PT Hutama Karya",
                "tahun": 2024,
                "nilai_proyek": 8500000000,
                "peran": "Supervisor Teknik",
                "bersama": "Sucofindo",
                "status_proyek": "Selesai",
                "nama_perusahaan_lain": None,
                "lokasi_proyek": "Sumatera Selatan",
                "pengguna_jasa": "PT Hutama Karya (Persero)",
                "uraian_tugas": "Supervisi pelaksanaan konstruksi, quality control, review shop drawing, monitoring progress, dan pelaporan",
                "waktu_mulai": "2024-01-10",
                "waktu_selesai": "2024-12-15",
                "posisi_penugasan": "Supervisor Teknik",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Ada"
            },
            {
                "nama_proyek": "DED Jembatan Penghubung Antar Pulau Kalimantan",
                "pemberi_kerja": "Kementerian PUPR",
                "tahun": 2023,
                "nilai_proyek": 4200000000,
                "peran": "Ahli Struktur",
                "bersama": "Sucofindo",
                "status_proyek": "Selesai",
                "nama_perusahaan_lain": None,
                "lokasi_proyek": "Kalimantan Timur",
                "pengguna_jasa": "Kementerian PUPR",
                "uraian_tugas": "Analisis struktur jembatan, perhitungan beban, desain detail engineering, dan penyusunan RAB",
                "waktu_mulai": "2023-04-01",
                "waktu_selesai": "2023-11-30",
                "posisi_penugasan": "Ahli Struktur",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Ada"
            }
        ],
        "reviews": []
    },
    {
        "nama": "Dr. Fitri Handayani, S.E., M.M.",
        "no_hp": "081789012345",
        "instansi": "SUCOFINDO",
        "keahlian": ["Ekonomi", "Analisis Kebijakan", "Investasi"],
        "availability": "Tersedia",
        "subporto": ["FITI"],
        "rating_avg": 4.9,
        "projects": [
            {
                "nama_proyek": "Penyusunan Roadmap Investasi Hilirisasi Nikel",
                "pemberi_kerja": "Kementerian ESDM",
                "tahun": 2025,
                "nilai_proyek": 5200000000,
                "peran": "Ekonom Senior",
                "bersama": "Sucofindo",
                "status_proyek": "Sedang Berjalan",
                "nama_perusahaan_lain": None,
                "lokasi_proyek": "Sulawesi Tenggara",
                "pengguna_jasa": "Kementerian ESDM",
                "uraian_tugas": "Analisis value chain nikel, kajian ekonomi hilirisasi, proyeksi investasi, analisis dampak ekonomi, dan penyusunan roadmap",
                "waktu_mulai": "2025-01-15",
                "waktu_selesai": "2025-10-31",
                "posisi_penugasan": "Ekonom Senior",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Belum Ada"
            },
            {
                "nama_proyek": "Kajian Investasi Hilirisasi Kelapa Sawit Riau",
                "pemberi_kerja": "Bappeda Provinsi Riau",
                "tahun": 2024,
                "nilai_proyek": 2800000000,
                "peran": "Lead Economist",
                "bersama": "Sucofindo",
                "status_proyek": "Selesai",
                "nama_perusahaan_lain": None,
                "lokasi_proyek": "Riau",
                "pengguna_jasa": "Pemerintah Provinsi Riau",
                "uraian_tugas": "Analisis potensi investasi, kajian pasar produk hilir, proyeksi ekonomi, dan rekomendasi kebijakan",
                "waktu_mulai": "2024-03-01",
                "waktu_selesai": "2024-10-15",
                "posisi_penugasan": "Lead Economist",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Ada"
            }
        ],
        "reviews": [
            {
                "reviewer_nama": "Ir. Ahmad Fauzan, M.T.",
                "rating": 5,
                "komentar": "Analisis ekonomi sangat mendalam dan rekomendasi kebijakan sangat applicable. Excellent work!"
            }
        ]
    },
    {
        "nama": "Ir. Agus Setiawan, M.Sc.",
        "no_hp": "081890123456",
        "instansi": "SUCOFINDO",
        "keahlian": ["Transportasi", "Logistik", "Pelabuhan"],
        "availability": "Tersedia",
        "subporto": ["FLP"],
        "rating_avg": 4.7,
        "projects": [
            {
                "nama_proyek": "Feasibility Study Terminal Peti Kemas Bitung",
                "pemberi_kerja": "Kementerian Perhubungan",
                "tahun": 2025,
                "nilai_proyek": 3900000000,
                "peran": "Ahli Transportasi",
                "bersama": "Sucofindo",
                "status_proyek": "Sedang Berjalan",
                "nama_perusahaan_lain": None,
                "lokasi_proyek": "Bitung, Sulawesi Utara",
                "pengguna_jasa": "Kementerian Perhubungan RI",
                "uraian_tugas": "Analisis demand pelabuhan, kajian teknis terminal, proyeksi throughput, analisis finansial, dan rekomendasi pengembangan",
                "waktu_mulai": "2025-02-01",
                "waktu_selesai": "2025-09-30",
                "posisi_penugasan": "Ahli Transportasi",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Belum Ada"
            },
            {
                "nama_proyek": "Kajian Pengembangan Bandara Kertajati",
                "pemberi_kerja": "Dinas Perhubungan Prov. Jawa Barat",
                "tahun": 2024,
                "nilai_proyek": 2600000000,
                "peran": "Konsultan Transportasi",
                "bersama": "Sucofindo",
                "status_proyek": "Selesai",
                "nama_perusahaan_lain": None,
                "lokasi_proyek": "Majalengka, Jawa Barat",
                "pengguna_jasa": "Pemerintah Provinsi Jawa Barat",
                "uraian_tugas": "Analisis demand penerbangan, kajian aksesibilitas, proyeksi penumpang, dan rekomendasi pengembangan fasilitas",
                "waktu_mulai": "2024-04-01",
                "waktu_selesai": "2024-11-30",
                "posisi_penugasan": "Konsultan Transportasi",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Ada"
            }
        ],
        "reviews": []
    }
]


async def populate_experts():
    """Populate expert database with complete data"""
    # Create async engine
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    # Create async session
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        try:
            print("Starting to populate expert data...")
            
            for expert_data in EXPERTS_DATA:
                # Extract projects and reviews
                projects_data = expert_data.pop("projects", [])
                reviews_data = expert_data.pop("reviews", [])
                
                # Create expert
                expert = Expert(**expert_data)
                session.add(expert)
                await session.flush()  # Get expert ID
                
                print(f"Added expert: {expert.nama}")
                
                # Add projects
                for project_data in projects_data:
                    project = ExpertProject(
                        expert_id=expert.id,
                        **project_data
                    )
                    session.add(project)
                    print(f"  - Added project: {project.nama_proyek}")
                
                # Add reviews
                for review_data in reviews_data:
                    review = ExpertReview(
                        expert_id=expert.id,
                        **review_data
                    )
                    session.add(review)
                    print(f"  - Added review from: {review.reviewer_nama}")
            
            # Commit all changes
            await session.commit()
            print("\n✅ Successfully populated expert database!")
            print(f"Total experts added: {len(EXPERTS_DATA)}")
            
        except Exception as e:
            await session.rollback()
            print(f"\n❌ Error populating database: {e}")
            raise
        finally:
            await engine.dispose()


if __name__ == "__main__":
    print("=" * 60)
    print("EXPERT DATABASE POPULATION SCRIPT")
    print("=" * 60)
    asyncio.run(populate_experts())
