# Test update single expert
$BASE_URL = "http://localhost:8000/api/v1"

# Get first expert
$experts = Invoke-RestMethod -Uri "$BASE_URL/experts" -Method Get
$expert = $experts[0]

Write-Host "Testing update for: $($expert.nama) (ID: $($expert.id))"
Write-Host ""

# Simple update data
$updateData = @{
    tempat_lahir = "Bandung"
    tanggal_lahir = "15 Maret 1975"
    posisi_diusulkan = "Team Leader"
}

$body = $updateData | ConvertTo-Json
Write-Host "Request body:"
Write-Host $body
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/experts/$($expert.id)" `
        -Method Patch `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "Success!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5)
}
catch {
    Write-Host "Error:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host ""
    Write-Host "Response:"
    Write-Host $_.ErrorDetails.Message
}
