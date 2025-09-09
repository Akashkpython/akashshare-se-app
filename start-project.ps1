# AkAsH Share Project Startup Script
Write-Host "🚀 Starting AkAsH Share Project..." -ForegroundColor Green

# Kill any existing node processes
Write-Host "🧹 Cleaning up existing processes..." -ForegroundColor Yellow
try {
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
} catch {
    Write-Host "No existing node processes found" -ForegroundColor Gray
}

Start-Sleep 2

# Start Backend Server
Write-Host "🔧 Starting AI-Enhanced Backend Server..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location "D:\5th sem\project\akashshare-se\backend"
    node server.js
}

# Wait a bit for backend to start
Start-Sleep 5

# Start Frontend Server
Write-Host "⚛️ Starting React Frontend Server..." -ForegroundColor Blue
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "D:\5th sem\project\akashshare-se"
    npm start
}

# Wait for both servers to initialize
Start-Sleep 8

# Check if servers are running
Write-Host "🔍 Checking server status..." -ForegroundColor Magenta

$backendRunning = $false
$frontendRunning = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5002/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        $backendRunning = $true
        Write-Host "✅ Backend Server: RUNNING on http://localhost:5002" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend Server: NOT RESPONDING" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5002" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        $frontendRunning = $true
        Write-Host "✅ Frontend Server: RUNNING on http://localhost:5002" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend Server: NOT RESPONDING" -ForegroundColor Red
}

Write-Host "`n🎯 Project Status:" -ForegroundColor White
if ($backendRunning -and $frontendRunning) {
    Write-Host "🎉 AkAsH Share is READY!" -ForegroundColor Green
    Write-Host "🌐 Open http://localhost:5002 in your browser" -ForegroundColor Cyan
    Write-Host "💬 AI-Enhanced Group Chat available!" -ForegroundColor Magenta
} else {
    Write-Host "⚠️ Some services may not be running properly" -ForegroundColor Yellow
    if (-not $backendRunning) {
        Write-Host "   - Try: cd backend && node server.js" -ForegroundColor Gray
    }
    if (-not $frontendRunning) {
        Write-Host "   - Try: npm start" -ForegroundColor Gray
    }
}

Write-Host "`n📊 Job Status:" -ForegroundColor White
Write-Host "Backend Job State: $($backendJob.State)" -ForegroundColor Gray
Write-Host "Frontend Job State: $($frontendJob.State)" -ForegroundColor Gray

# Keep jobs running
Write-Host "`n⏳ Press Ctrl+C to stop all servers" -ForegroundColor Yellow
try {
    while ($true) {
        Start-Sleep 30
        # Check job status periodically
        if ($backendJob.State -eq "Failed" -or $frontendJob.State -eq "Failed") {
            Write-Host "⚠️ A server job has failed. Check the logs." -ForegroundColor Red
            break
        }
    }
} finally {
    Write-Host "`n🛑 Stopping servers..." -ForegroundColor Red
    Stop-Job $backendJob, $frontendJob -PassThru | Remove-Job
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Write-Host "✅ All servers stopped." -ForegroundColor Green
}
