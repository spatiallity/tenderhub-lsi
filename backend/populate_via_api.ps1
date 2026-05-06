# PowerShell script to populate experts via API
$baseUrl = "http://localhost:8000/api/v1"

# Expert data with complete CV information
$experts = @(
    @{
        nama = "Dr. Ir. Budi Santoso, M.T."
        no_hp = "081234567890"
        instansi = "SUCOFINDO"
        keahlian = @("Geologi", "Pertambangan", "Eksplorasi Mineral")
        availability = "Tersedia"
        subporto = @("SDA")
        rating_avg = 4.8
        jumlah_proyek = 0
        projects = @(
            @{
                nama_proyek = "Survei Geologi dan Pemetaan Potensi Tambang Nikel Sulawesi"
                pemberi_kerja = "PT Aneka Tambang Tbk"
                tahun = 2024
                nilai_proyek = 4500000000
                peran = "Ahli Geologi Utama"
                bersama = "Sucofindo"
                status_proyek = "Selesai"
                lokasi_proyek = "Sulawesi Tenggara"
                pengguna_jasa = "PT Aneka Tambang Tbk"
                uraian_tugas = "Melakukan survei geologi, analisis sampel batuan, pemetaan potensi cadangan nikel, dan penyusunan laporan kelayakan teknis pertambangan"
                waktu_mulai = "2024-01-15"
                waktu_selesai = "2024-08-30"
                posisi_penugasan = "Team Leader"
                status_kepegawaian = "Tetap"
                surat_referensi = "Ada"
            },
            @{
                nama_proyek = "Kajian AMDAL Tambang Batubara Kalimantan Timur"
                pemberi_kerja = "PT Bukit Asam Tbk"
                tahun = 2023
                nilai_proyek = 3200000000
                peran = "Konsultan Geologi"
                bersama = "Sucofindo"
                status_proyek = "Selesai"
                lokasi_proyek = "Kalimantan Timur"
                pengguna_jasa = "PT Bukit Asam Tbk"
                uraian_tugas = "Analisis dampak lingkungan pertambangan, kajian geologi regional, pemetaan zona rawan longsor, dan rekomendasi mitigasi"
                waktu_mulai = "2023-03-01"
                waktu_selesai = "2023-11-15"
                posisi_penugasan = "Ahli Geologi"
                status_kepegawaian = "Tetap"
                surat_referensi = "Ada"
            }
        )
    },
    @{
        nama = "Prof. Dr. Siti Rahayu, S.T., M.Sc."
        no_hp = "081298765432"
        instansi = "SUCOFINDO"
        keahlian = @("Teknik Lingkungan", "AMDAL", "Pengelolaan Limbah")
        availability = "Tersedia"
        subporto = @("SDA")
        rating_avg = 4.9
        jumlah_proyek = 0
        projects = @(
            @{
                nama_proyek = "Penyusunan Dokumen AMDAL Kawasan Industri Batang"
                pemberi_kerja = "Kementerian Perindustrian"
                tahun = 2025
                nilai_proyek = 2800000000
                peran = "Ketua Tim AMDAL"
                bersama = "Sucofindo"
                status_proyek = "Selesai"
                lokasi_proyek = "Batang, Jawa Tengah"
                pengguna_jasa = "Kementerian Perindustrian RI"
                uraian_tugas = "Koordinasi tim penyusun AMDAL, analisis dampak lingkungan, penyusunan RKL-RPL, konsultasi publik, dan finalisasi dokumen"
                waktu_mulai = "2025-01-10"
                waktu_selesai = "2025-06-30"
                posisi_penugasan = "Ketua Tim"
                status_kepegawaian = "Tetap"
                surat_referensi = "Ada"
            }
        )
    }
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "POPULATING EXPERT DATABASE VIA API" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

foreach ($expert in $experts) {
    Write-Host "Adding expert: $($expert.nama)" -ForegroundColor Yellow
    
    # Create expert
    $expertBody = @{
        nama = $expert.nama
        no_hp = $expert.no_hp
        instansi = $expert.instansi
        keahlian = $expert.keahlian
        availability = $expert.availability
        subporto = $expert.subporto
        rating_avg = $expert.rating_avg
        jumlah_proyek = $expert.jumlah_proyek
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/experts" -Method Post -Body $expertBody -ContentType "application/json"
        $expertId = $response.id
        Write-Host "  ✓ Expert created with ID: $expertId" -ForegroundColor Green
        
        # Add projects
        foreach ($project in $expert.projects) {
            $projectBody = $project | ConvertTo-Json
            try {
                Invoke-RestMethod -Uri "$baseUrl/experts/$expertId/projects" -Method Post -Body $projectBody -ContentType "application/json"
                Write-Host "    ✓ Added project: $($project.nama_proyek)" -ForegroundColor Green
            }
            catch {
                Write-Host "    ✗ Failed to add project: $_" -ForegroundColor Red
            }
        }
    }
    catch {
        Write-Host "  ✗ Failed to create expert: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "DONE!" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
