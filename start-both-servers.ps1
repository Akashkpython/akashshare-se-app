# AkAsH Share - Start Both Servers Script
# This script properly starts both backend and frontend servers

Write-Host "🚀 Starting AkAsH Share Application..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan

# Kill any existing Node processes
Write-Host "🔧 Stopping any existing servers..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 2

# Start Backend Server
Write-Host "🔧 Starting Backend Server (Port 5002)..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    Set-Location "D:\5th sem\project\akashshare-se\backend"
    node server.js
}

# Wait for backend to initialize
Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep 5

# Start Frontend Server  
Write-Host "🔧 Starting Frontend Server (Port 3000)..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "D:\5th sem\project\akashshare-se"
    npm start
}

# Wait for frontend to compile
Write-Host "⏳ Waiting for frontend to compile..." -ForegroundColor Yellow
Start-Sleep 10

Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "✅ AkAsH Share Application Started!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Frontend: " -NoNewline; Write-Host "http://localhost:5002" -ForegroundColor Cyan
Write-Host "🔧 Backend:  " -NoNewline; Write-Host "http://localhost:5002" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Instructions:" -ForegroundColor Yellow
Write-Host "1. Open your browser to http://localhost:5002"
Write-Host "2. Start sharing files with 4-digit codes!"
Write-Host "3. Use Group Chat for real-time messaging"
Write-Host ""
Write-Host "STOP: Close this window or press Ctrl+C" -ForegroundColor Red
Write-Host ""

# Keep script running to monitor jobs
try {
    while ($true) {
        Start-Sleep 5
        
        # Check if jobs are still running
        if ($backendJob.State -eq "Failed" -or $frontendJob.State -eq "Failed") {
            Write-Host "❌ One of the servers failed. Check the logs above." -ForegroundColor Red
            break
        }
        
        if ($backendJob.State -eq "Completed" -or $frontendJob.State -eq "Completed") {
            Write-Host "⚠️ One of the servers stopped unexpectedly." -ForegroundColor Yellow
            break
        }
    }
} finally {
    # Cleanup jobs when script ends
    Write-Host "🔧 Cleaning up background jobs..." -ForegroundColor Yellow
    $backendJob | Stop-Job -PassThru | Remove-Job -Force
    $frontendJob | Stop-Job -PassThru | Remove-Job -Force
    Write-Host "✅ Cleanup completed." -ForegroundColor Green
}
