# Restart Backend Script
Write-Host "🔄 Restarting Backend Server..." -ForegroundColor Cyan

# Kill existing uvicorn processes
Write-Host "Stopping existing backend processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "uvicorn"} | Stop-Process -Force
Start-Sleep -Seconds 2

# Navigate to backend directory
Set-Location backend

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Green
Write-Host "Backend will run at: http://localhost:8000" -ForegroundColor Cyan
Write-Host "API docs at: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "" 
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

# Start uvicorn
py -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
