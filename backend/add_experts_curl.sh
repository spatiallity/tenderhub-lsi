#!/bin/bash

# Script to add experts with complete CV data via API
BASE_URL="http://localhost:8000/api/v1"

echo "============================================"
echo "POPULATING EXPERT DATABASE VIA API"
echo "============================================"
echo ""

# Expert 1: Dr. Ir. Budi Santoso
echo "Adding Expert 1: Dr. Ir. Budi Santoso, M.T."
EXPERT1=$(curl -s -X POST "$BASE_URL/experts" \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Dr. Ir. Budi Santoso, M.T.",
    "no_hp": "081234567890",
    "instansi": "SUCOFINDO",
    "keahlian": ["Geologi", "Pertambangan", "Eksplorasi Mineral"],
    "availability": "Tersedia",
    "subporto": ["SDA"],
    "rating_avg": 4.8,
    "jumlah_proyek": 0
  }')

EXPERT1_ID=$(echo $EXPERT1 | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "  ✓ Expert created with ID: $EXPERT1_ID"

# Add projects for Expert 1
curl -s -X POST "$BASE_URL/experts/$EXPERT1_ID/projects" \
  -H "Content-Type: application/json" \
  -d '{
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
  }' > /dev/null

echo "    ✓ Added project: Survei Geologi Nikel"

curl -s -X POST "$BASE_URL/experts/$EXPERT1_ID/projects" \
  -H "Content-Type: application/json" \
  -d '{
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
  }' > /dev/null

echo "    ✓ Added project: Kajian AMDAL Batubara"
echo ""

echo "============================================"
echo "DONE! Check your database."
echo "============================================"
