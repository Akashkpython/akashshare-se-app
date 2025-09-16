# Quick Server Status Check Script

Write-Host "Checking AkAsH Share Servers..." -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Cyan

# Check Frontend (Port 5004)
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:5004" -Method HEAD -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Frontend Server: RUNNING (Port 5004)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend Server: NOT RUNNING (Port 5004)" -ForegroundColor Red
}

# Check Backend (Port 5004)
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:5004/health" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Backend Server: RUNNING (Port 5004)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend Server: NOT RUNNING (Port 5004)" -ForegroundColor Red
}

# Check WebSocket (Port 5004/chat)
$wsStatus = "Unknown"
try {
    $wsTest = Test-NetConnection -ComputerName "localhost" -Port 5004 -InformationLevel Quiet
    if ($wsTest) {
        Write-Host "✅ WebSocket Server: AVAILABLE (Port 5004/chat)" -ForegroundColor Green
    } else {
        Write-Host "❌ WebSocket Server: NOT AVAILABLE" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ WebSocket Server: NOT AVAILABLE" -ForegroundColor Red
}

Write-Host ""
Write-Host "If both servers are running:" -ForegroundColor Yellow
Write-Host "→ Open http://localhost:5004 in your browser" -ForegroundColor Cyan
Write-Host ""
Write-Host "If servers are not running, use:" -ForegroundColor Yellow
Write-Host "→ .\start-servers-simple.ps1" -ForegroundColor Cyan
