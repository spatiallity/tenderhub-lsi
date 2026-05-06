# Test CV Generator API
Write-Host "Testing CV Generator API..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if backend is running
Write-Host "Test 1: Checking backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method Get
    Write-Host "[OK] Backend is running!" -ForegroundColor Green
    Write-Host "  Status: $($health.status)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Backend is NOT running!" -ForegroundColor Red
    Write-Host "  Please run: .\restart_backend.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Check if experts exist
Write-Host "Test 2: Checking experts..." -ForegroundColor Yellow
try {
    $experts = Invoke-RestMethod -Uri "http://localhost:8000/api/v1/experts" -Method Get
    Write-Host "[OK] Found $($experts.Count) experts" -ForegroundColor Green
    if ($experts.Count -gt 0) {
        Write-Host "  First expert: $($experts[0].nama) (ID: $($experts[0].id))" -ForegroundColor Gray
    }
} catch {
    Write-Host "[ERROR] Failed to get experts!" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 3: Try to generate CV for first expert
if ($experts.Count -gt 0) {
    $expertId = $experts[0].id
    Write-Host "Test 3: Generating CV for expert ID $expertId..." -ForegroundColor Yellow
    
    try {
        $outputFile = "test_cv_expert_$expertId.docx"
        Invoke-WebRequest -Uri "http://localhost:8000/api/v1/cv/$expertId/cv" -Method Get -OutFile $outputFile
        
        if (Test-Path $outputFile) {
            $fileSize = (Get-Item $outputFile).Length
            Write-Host "[OK] CV generated successfully!" -ForegroundColor Green
            Write-Host "  File: $outputFile" -ForegroundColor Gray
            Write-Host "  Size: $fileSize bytes" -ForegroundColor Gray
            Write-Host ""
            Write-Host "Opening CV file..." -ForegroundColor Cyan
            Start-Process $outputFile
        } else {
            Write-Host "[ERROR] CV file not created!" -ForegroundColor Red
        }
    } catch {
        Write-Host "[ERROR] Failed to generate CV!" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        
        # Try to get more details
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "  Response: $responseBody" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "[DONE] Testing complete!" -ForegroundColor Green
