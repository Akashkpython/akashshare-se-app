# AkAsH Share - Simple Server Starter
# This script starts both backend and frontend servers

Write-Host "Starting AkAsH Share Application..." -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan

# Kill any existing Node processes to free up ports
Write-Host "Stopping any existing servers..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep 2
} catch {
    # No existing processes to kill
}

# Start Backend Server in background
Write-Host "Starting Backend Server (Port 5002)..." -ForegroundColor Green
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd 'D:\5th sem\project\akashshare-se\backend'; Write-Host 'BACKEND SERVER STARTING...' -ForegroundColor Green; node server.js"

# Wait for backend to start
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep 5

# Start Frontend Server in background
Write-Host "Starting Frontend Server (Port 3000)..." -ForegroundColor Green  
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd 'D:\5th sem\project\akashshare-se'; Write-Host 'FRONTEND SERVER STARTING...' -ForegroundColor Blue; npm start"

# Wait for frontend to compile
Write-Host "Waiting for frontend to compile..." -ForegroundColor Yellow
Start-Sleep 8

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "APPLICATION STARTED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: http://localhost:5002" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:5002" -ForegroundColor Cyan
Write-Host ""
Write-Host "INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Open your browser to http://localhost:5002"
Write-Host "2. Start sharing files with 4-digit codes!"
Write-Host "3. Use Group Chat for real-time messaging"
Write-Host ""
Write-Host "To stop: Close the two server windows that opened" -ForegroundColor Red
Write-Host ""
Write-Host "Press Enter to close this launcher..." -ForegroundColor Gray
Read-Host
