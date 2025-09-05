# Akash Share Application - Student PC Quick Start
# PowerShell Version

Write-Host "===============================================" -ForegroundColor Green
Write-Host "          Akash Share Application" -ForegroundColor Green  
Write-Host "          Student PC Quick Start" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js detected: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "ERROR: Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Starting Akash Share servers..." -ForegroundColor Yellow
Write-Host ""

# Start backend server
Write-Host "[1/2] Starting Backend Server on port 5002..." -ForegroundColor Green
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "Write-Host 'Akash Share Backend Server' -ForegroundColor Green; cd backend; node server.js"

# Wait for backend to start  
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend server
Write-Host "[2/2] Starting Frontend Server on port 3000..." -ForegroundColor Green  
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "Write-Host 'Akash Share Frontend Server' -ForegroundColor Blue; npm start"

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "    Application is starting up..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API: " -NoNewline; Write-Host "http://localhost:5002" -ForegroundColor Cyan
Write-Host "Frontend UI: " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Wait for both server windows to show 'running' status"
Write-Host "2. Open your web browser"
Write-Host "3. Go to: http://localhost:3000"  
Write-Host "4. Start sharing files with 4-digit codes!"
Write-Host ""
Write-Host "Features:" -ForegroundColor Magenta
Write-Host "- Upload files up to 10MB"
Write-Host "- Share with 4-digit codes"
Write-Host "- Real-time group chat"
Write-Host "- Automatic file cleanup (24 hours)"
Write-Host ""
Write-Host "To stop the application: Close both server windows" -ForegroundColor Red
Write-Host ""
Read-Host "Press Enter to continue"
