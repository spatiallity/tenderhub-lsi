"""
Simple script to add experts via HTTP requests
No need for async or complex dependencies
"""
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

experts_data = [
    {
        "expert": {
            "nama": "Dr. Ir. Budi Santoso, M.T.",
            "no_hp": "081234567890",
            "instansi": "SUCOFINDO",
            "keahlian": ["Geologi", "Pertambangan", "Eksplorasi Mineral"],
            "availability": "Tersedia",
            "subporto": ["SDA"],
            "rating_avg": 4.8,
            "jumlah_proyek": 0
        },
        "projects": [
            {
                "nama_proyek": "Survei Geologi dan Pemetaan Potensi Tambang Nikel Sulawesi",
                "pemberi_kerja": "PT Aneka Tambang Tbk",
                "tahun": 2024,
                "nilai_proyek": 4500000000,
                "peran": "Ahli Geologi Utama",
                "bersama": "Sucofindo",
                "status_proyek": "Selesai",
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
                "lokasi_proyek": "Papua",
                "pengguna_jasa": "PT Freeport Indonesia",
                "uraian_tugas": "Eksplorasi mineral emas, analisis geokimia, pemetaan struktur geologi, estimasi cadangan, dan penyusunan laporan teknis",
                "waktu_mulai": "2022-05-10",
                "waktu_selesai": "2022-12-20",
                "posisi_penugasan": "Senior Geologist",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Ada"
            }
        ]
    },
    {
        "expert": {
            "nama": "Prof. Dr. Siti Rahayu, S.T., M.Sc.",
            "no_hp": "081298765432",
            "instansi": "SUCOFINDO",
            "keahlian": ["Teknik Lingkungan", "AMDAL", "Pengelolaan Limbah"],
            "availability": "Tersedia",
            "subporto": ["SDA"],
            "rating_avg": 4.9,
            "jumlah_proyek": 0
        },
        "projects": [
            {
                "nama_proyek": "Penyusunan Dokumen AMDAL Kawasan Industri Batang",
                "pemberi_kerja": "Kementerian Perindustrian",
                "tahun": 2025,
                "nilai_proyek": 2800000000,
                "peran": "Ketua Tim AMDAL",
                "bersama": "Sucofindo",
                "status_proyek": "Selesai",
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
                "lokasi_proyek": "Cilegon, Banten",
                "pengguna_jasa": "PT Chandra Asri Petrochemical Tbk",
                "uraian_tugas": "Audit pengelolaan limbah B3, evaluasi sistem pengolahan, rekomendasi perbaikan, dan penyusunan SOP pengelolaan limbah",
                "waktu_mulai": "2024-04-01",
                "waktu_selesai": "2024-09-15",
                "posisi_penugasan": "Ahli Lingkungan",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Ada"
            }
        ]
    },
    {
        "expert": {
            "nama": "Ir. Andi Wijaya, M.M.",
            "no_hp": "081345678901",
            "instansi": "SUCOFINDO",
            "keahlian": ["Manajemen Proyek", "Feasibility Study", "Analisis Investasi"],
            "availability": "Tersedia",
            "subporto": ["FITI"],
            "rating_avg": 4.7,
            "jumlah_proyek": 0
        },
        "projects": [
            {
                "nama_proyek": "Studi Kelayakan Kawasan Ekonomi Khusus Mandalika",
                "pemberi_kerja": "Kementerian Investasi/BKPM",
                "tahun": 2025,
                "nilai_proyek": 6500000000,
                "peran": "Project Manager",
                "bersama": "Sucofindo",
                "status_proyek": "Sedang Berjalan",
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
                "lokasi_proyek": "Kalimantan Utara",
                "pengguna_jasa": "Pemerintah Provinsi Kalimantan Utara",
                "uraian_tugas": "Analisis kelayakan teknis dan ekonomis, kajian pasar, proyeksi investasi, analisis SWOT, dan rekomendasi pengembangan",
                "waktu_mulai": "2024-01-15",
                "waktu_selesai": "2024-10-30",
                "posisi_penugasan": "Lead Consultant",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Ada"
            }
        ]
    },
    {
        "expert": {
            "nama": "Dr. Hendra Kusuma, S.Si., M.T.",
            "no_hp": "081456789012",
            "instansi": "SUCOFINDO",
            "keahlian": ["Hidrologi", "Sumber Daya Air", "Irigasi"],
            "availability": "Tersedia",
            "subporto": ["SDA"],
            "rating_avg": 4.6,
            "jumlah_proyek": 0
        },
        "projects": [
            {
                "nama_proyek": "Kajian Hidrologi DAS Citanduy",
                "pemberi_kerja": "BPDAS Citanduy Cimanuk",
                "tahun": 2024,
                "nilai_proyek": 1500000000,
                "peran": "Ahli Hidrologi",
                "bersama": "Sucofindo",
                "status_proyek": "Selesai",
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
                "lokasi_proyek": "Jawa Timur",
                "pengguna_jasa": "Pemerintah Provinsi Jawa Timur",
                "uraian_tugas": "Desain teknis sistem irigasi tetes, perhitungan kebutuhan air, analisis efisiensi, dan supervisi implementasi",
                "waktu_mulai": "2023-05-10",
                "waktu_selesai": "2023-12-20",
                "posisi_penugasan": "Konsultan Irigasi",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Ada"
            }
        ]
    },
    {
        "expert": {
            "nama": "Dra. Maya Sari, M.Si.",
            "no_hp": "081567890123",
            "instansi": "SUCOFINDO",
            "keahlian": ["Statistik", "Survei Sosial", "Analisis Data"],
            "availability": "Tersedia",
            "subporto": ["FLP"],
            "rating_avg": 4.8,
            "jumlah_proyek": 0
        },
        "projects": [
            {
                "nama_proyek": "Survei dan Evaluasi Program Bantuan Pangan Nasional",
                "pemberi_kerja": "Badan Pangan Nasional",
                "tahun": 2025,
                "nilai_proyek": 1800000000,
                "peran": "Ketua Tim Survei",
                "bersama": "Sucofindo",
                "status_proyek": "Sedang Berjalan",
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
                "lokasi_proyek": "DKI Jakarta dan sekitarnya",
                "pengguna_jasa": "Kementerian Kesehatan RI",
                "uraian_tugas": "Sampling dan pengumpulan data, verifikasi data penerima, analisis statistik deskriptif, dan penyusunan database",
                "waktu_mulai": "2024-02-01",
                "waktu_selesai": "2024-09-30",
                "posisi_penugasan": "Ahli Statistik",
                "status_kepegawaian": "Tetap",
                "surat_referensi": "Ada"
            }
        ]
    }
]

def add_experts():
    print("=" * 60)
    print("POPULATING EXPERT DATABASE VIA API")
    print("=" * 60)
    print()
    
    for data in experts_data:
        expert_info = data["expert"]
        projects = data["projects"]
        
        print(f"Adding expert: {expert_info['nama']}")
        
        try:
            # Create expert
            response = requests.post(
                f"{BASE_URL}/experts",
                json=expert_info,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            expert_id = response.json()["id"]
            print(f"  ✓ Expert created with ID: {expert_id}")
            
            # Add projects
            for project in projects:
                try:
                    proj_response = requests.post(
                        f"{BASE_URL}/experts/{expert_id}/projects",
                        json=project,
                        headers={"Content-Type": "application/json"}
                    )
                    proj_response.raise_for_status()
                    print(f"    ✓ Added project: {project['nama_proyek'][:50]}...")
                except Exception as e:
                    print(f"    ✗ Failed to add project: {e}")
            
        except Exception as e:
            print(f"  ✗ Failed to create expert: {e}")
        
        print()
    
    print("=" * 60)
    print("DONE!")
    print("=" * 60)

if __name__ == "__main__":
    add_experts()
