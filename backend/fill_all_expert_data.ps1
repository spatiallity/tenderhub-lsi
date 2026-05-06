# Fill ALL expert data with complete information
$BASE_URL = "http://localhost:8000/api/v1"

# Data arrays
$cities = @("Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang", "Medan", "Palembang", "Makassar", "Denpasar", "Malang")
$positions = @("Team Leader", "Senior Expert", "Technical Specialist", "Project Manager", "Quality Assurance Specialist", "Consultant")
$locations = @("Jakarta", "Bandung, Jawa Barat", "Surabaya, Jawa Timur", "Semarang, Jawa Tengah", "Medan, Sumatera Utara", "Balikpapan, Kalimantan Timur")
$clients = @("Kementerian PUPR", "Kementerian ESDM", "PT PLN (Persero)", "PT Pertamina (Persero)", "PT Jasa Marga (Persero) Tbk", "PT Waskita Karya (Persero) Tbk")
$tasks = @(
    "Melakukan survei lapangan, analisis data, penyusunan laporan teknis, koordinasi dengan stakeholder, dan presentasi hasil kajian kepada klien",
    "Melaksanakan inspeksi teknis, pengujian kualitas material dan sistem, verifikasi dokumen, evaluasi sistem manajemen, dan penyusunan rekomendasi perbaikan",
    "Menyusun dokumen perencanaan teknis, analisis kelayakan, perhitungan struktur, gambar desain detail, dan spesifikasi teknis sesuai standar yang berlaku",
    "Melakukan pengawasan konstruksi, pemeriksaan kualitas material, monitoring progress pekerjaan, review shop drawing, dan koordinasi dengan kontraktor pelaksana",
    "Melaksanakan audit sistem manajemen mutu, verifikasi implementasi prosedur, evaluasi kinerja operasional, identifikasi ketidaksesuaian, dan penyusunan laporan audit lengkap"
)

Write-Host "=" * 80
Write-Host "FILLING ALL EXPERT DATA" -ForegroundColor Cyan
Write-Host "=" * 80
Write-Host ""

# Get all experts
Write-Host "Fetching experts..." -ForegroundColor Yellow
$experts = Invoke-RestMethod -Uri "$BASE_URL/experts" -Method Get
Write-Host "Found $($experts.Count) experts`n" -ForegroundColor Green

$successCount = 0
$projectCount = 0

foreach ($expert in $experts) {
    Write-Host "`n$('='*80)"
    Write-Host "Expert ID $($expert.id): $($expert.nama)" -ForegroundColor Cyan
    Write-Host "$('='*80)"
    
    # Generate personal data
    $tempat_lahir = $cities | Get-Random
    $year = Get-Random -Minimum 1965 -Maximum 1990
    $month = Get-Random -Minimum 1 -Maximum 12
    $day = Get-Random -Minimum 1 -Maximum 28
    $months = @("Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember")
    $tanggal_lahir = "$day $($months[$month-1]) $year"
    $posisi = $positions | Get-Random
    
    # Education
    $pendidikan_formal = @(
        "S2 Teknik Sipil, Institut Teknologi Bandung (2005)",
        "S1 Teknik Sipil, Universitas Gadjah Mada (2000)"
    )
    
    $pendidikan_non_formal = @(
        "Project Management Professional (PMP), PMI (2010)",
        "ISO 9001:2015 Lead Auditor, BSI (2012)",
        "K3 Umum Certification, Kemnaker (2015)"
    )
    
    $bahasa = @(
        "Bahasa Indonesia: Sangat Baik",
        "Bahasa Inggris: Baik"
    )
    
    # Update expert
    $updateData = @{
        tempat_lahir = $tempat_lahir
        tanggal_lahir = $tanggal_lahir
        posisi_diusulkan = $posisi
        pendidikan_formal = $pendidikan_formal
        pendidikan_non_formal = $pendidikan_non_formal
        penguasaan_bahasa = $bahasa
    }
    
    try {
        $body = $updateData | ConvertTo-Json -Depth 10
        $null = Invoke-RestMethod -Uri "$BASE_URL/experts/$($expert.id)" -Method Patch -Body $body -ContentType "application/json"
        
        Write-Host "Profile updated:" -ForegroundColor Green
        Write-Host "  - Tempat/Tanggal Lahir: $tempat_lahir, $tanggal_lahir"
        Write-Host "  - Posisi: $posisi"
        Write-Host "  - Pendidikan: $($pendidikan_formal.Count) formal, $($pendidikan_non_formal.Count) non-formal"
        
        $successCount++
        
        # Update projects
        if ($expert.projects -and $expert.projects.Count -gt 0) {
            Write-Host "`n  Updating $($expert.projects.Count) projects..." -ForegroundColor Yellow
            
            foreach ($project in $expert.projects) {
                $projectUpdate = @{
                    lokasi_proyek = $locations | Get-Random
                    pengguna_jasa = $clients | Get-Random
                    uraian_tugas = $tasks | Get-Random
                    waktu_mulai = "Januari $(Get-Random -Minimum 2020 -Maximum 2025)"
                    waktu_selesai = "Desember $(Get-Random -Minimum 2020 -Maximum 2025)"
                    posisi_penugasan = @("Team Leader", "Senior Engineer", "Consultant", "Coordinator") | Get-Random
                    status_kepegawaian = @("Tetap", "Tidak Tetap") | Get-Random
                    surat_referensi = if ((Get-Random -Minimum 0 -Maximum 2) -eq 1) { "REF/$(Get-Random -Minimum 100 -Maximum 999)/SCF/2024" } else { "-" }
                }
                
                try {
                    $projectBody = $projectUpdate | ConvertTo-Json -Depth 10
                    $null = Invoke-RestMethod -Uri "$BASE_URL/experts/projects/$($project.id)" -Method Patch -Body $projectBody -ContentType "application/json"
                    Write-Host "  Updated: $($project.nama_proyek.Substring(0, [Math]::Min(50, $project.nama_proyek.Length)))..." -ForegroundColor Green
                    $projectCount++
                }
                catch {
                    Write-Host "  Failed to update project $($project.id): $_" -ForegroundColor Red
                }
            }
        }
    }
    catch {
        Write-Host "Failed to update expert: $_" -ForegroundColor Red
    }
}

Write-Host "`n$('='*80)"
Write-Host "COMPLETED!" -ForegroundColor Green
Write-Host "$('='*80)"
Write-Host "`nSummary:"
Write-Host "  - Experts updated: $successCount / $($experts.Count)"
Write-Host "  - Projects updated: $projectCount"
Write-Host "`nNext: Generate CV to see results!" -ForegroundColor Cyan
