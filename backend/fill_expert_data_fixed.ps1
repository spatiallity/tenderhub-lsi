# Fill expert data - FIXED version with better error handling
$BASE_URL = "http://localhost:8000/api/v1"

Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host "FILLING EXPERT DATA - FIXED VERSION" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan
Write-Host ""

# Get all experts
Write-Host "Fetching experts..." -ForegroundColor Yellow
try {
    $experts = Invoke-RestMethod -Uri "$BASE_URL/experts" -Method Get -TimeoutSec 30
    Write-Host "Found $($experts.Count) experts`n" -ForegroundColor Green
} catch {
    Write-Host "Failed to fetch experts: $_" -ForegroundColor Red
    exit 1
}

$successCount = 0
$projectCount = 0
$errorCount = 0

# Process first 10 experts only for testing
$expertsToProcess = $experts | Select-Object -First 10

foreach ($expert in $expertsToProcess) {
    Write-Host "`nProcessing Expert ID $($expert.id): $($expert.nama)" -ForegroundColor Cyan
    
    # Prepare update data as JSON string directly
    $jsonBody = @"
{
    "tempat_lahir": "Bandung",
    "tanggal_lahir": "15 Maret 1975",
    "posisi_diusulkan": "Team Leader",
    "pendidikan_formal": [
        "S2 Teknik Sipil, Institut Teknologi Bandung (2005)",
        "S1 Teknik Sipil, Universitas Gadjah Mada (2000)"
    ],
    "pendidikan_non_formal": [
        "Project Management Professional (PMP), PMI (2010)",
        "ISO 9001:2015 Lead Auditor, BSI (2012)",
        "K3 Umum Certification, Kemnaker (2015)"
    ],
    "penguasaan_bahasa": [
        "Bahasa Indonesia: Sangat Baik",
        "Bahasa Inggris: Baik"
    ]
}
"@
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/experts/$($expert.id)" `
            -Method Patch `
            -Body $jsonBody `
            -ContentType "application/json" `
            -TimeoutSec 30
        
        Write-Host "  Profile updated" -ForegroundColor Green
        $successCount++
        
        # Update projects if any
        if ($expert.projects -and $expert.projects.Count -gt 0) {
            Write-Host "  Updating $($expert.projects.Count) projects..." -ForegroundColor Yellow
            
            foreach ($project in $expert.projects | Select-Object -First 5) {
                $projectJson = @"
{
    "lokasi_proyek": "Jakarta",
    "pengguna_jasa": "Kementerian PUPR",
    "uraian_tugas": "Melakukan survei lapangan, analisis data, penyusunan laporan teknis, koordinasi dengan stakeholder, dan presentasi hasil kajian",
    "waktu_mulai": "Januari 2023",
    "waktu_selesai": "Desember 2023",
    "posisi_penugasan": "Team Leader",
    "status_kepegawaian": "Tetap",
    "surat_referensi": "REF/123/SCF/2023"
}
"@
                
                try {
                    $null = Invoke-RestMethod -Uri "$BASE_URL/experts/projects/$($project.id)" `
                        -Method Patch `
                        -Body $projectJson `
                        -ContentType "application/json" `
                        -TimeoutSec 30
                    
                    $projectCount++
                } catch {
                    Write-Host "    Failed to update project: $_" -ForegroundColor Red
                }
            }
        }
        
        Start-Sleep -Milliseconds 500  # Small delay between requests
        
    } catch {
        Write-Host "  Failed: $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host "`n$('='*80)" -ForegroundColor Cyan
Write-Host "COMPLETED!" -ForegroundColor Green
Write-Host "$('='*80)" -ForegroundColor Cyan
Write-Host "`nSummary:"
Write-Host "  - Experts processed: $($expertsToProcess.Count)"
Write-Host "  - Successfully updated: $successCount" -ForegroundColor Green
Write-Host "  - Failed: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
Write-Host "  - Projects updated: $projectCount" -ForegroundColor Green
Write-Host "`nNext: Generate CV to verify!" -ForegroundColor Cyan
