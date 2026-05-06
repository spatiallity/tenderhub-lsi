"""
Add projects to existing experts
"""
import requests

BASE_URL = "http://localhost:8000/api/v1"

# Map expert names to their IDs (from the GET response)
experts_to_update = {
    "Dr. Ir. Budi Santoso, M.T.": 730,
    "Prof. Dr. Siti Rahayu, S.T., M.Sc.": 731,
    "Ir. Andi Wijaya, M.M.": 732,
    "Dr. Hendra Kusuma, S.Si., M.T.": 733,
    "Dra. Maya Sari, M.Si.": 734
}

projects_data = {
    730: [  # Dr. Ir. Budi Santoso
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
    ],
    731: [  # Prof. Dr. Siti Rahayu
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
    ],
    732: [  # Ir. Andi Wijaya
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
    ],
    733: [  # Dr. Hendra Kusuma
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
    ],
    734: [  # Dra. Maya Sari
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

print("=" * 60)
print("ADDING PROJECTS TO EXPERTS")
print("=" * 60)
print()

for expert_id, projects in projects_data.items():
    print(f"Adding projects to Expert ID {expert_id}...")
    
    for project in projects:
        try:
            response = requests.post(
                f"{BASE_URL}/experts/{expert_id}/projects",
                json=project,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            print(f"  ✓ Added: {project['nama_proyek'][:60]}...")
        except Exception as e:
            print(f"  ✗ Failed: {project['nama_proyek'][:60]}... - {e}")
    
    print()

print("=" * 60)
print("DONE!")
print("=" * 60)
