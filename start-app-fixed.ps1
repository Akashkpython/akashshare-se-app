# Akash Share - Fixed Startup Script (PowerShell version)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔧 Akash Share - Fixed Startup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Function to kill processes on a specific port
function Kill-PortProcesses($port) {
    Write-Host "🔍 Checking for processes on port $port..." -ForegroundColor Yellow
    $processes = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Where-Object {$_.State -eq "Listen"}
    
    foreach ($process in $processes) {
        $pid = $process.OwningProcess
        $processName = (Get-Process -Id $pid -ErrorAction SilentlyContinue).ProcessName
        Write-Host "🔧 Killing process $pid ($processName) on port $port" -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
    
    if ($processes.Count -eq 0) {
        Write-Host "✅ Port $port is already free." -ForegroundColor Green
    } else {
        Write-Host "✅ Killed $($processes.Count) process(es) using port $port" -ForegroundColor Green
    }
}

# Kill any existing processes on port 5004 (backend)
Kill-PortProcesses 5004

# Kill any existing processes on port 3000 (frontend)
Kill-PortProcesses 3000

# Kill any existing Electron processes
Write-Host "🔍 Checking for existing Electron processes..." -ForegroundColor Yellow
Get-Process electron -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "✅ Electron processes terminated" -ForegroundColor Green

Write-Host "🔧 Waiting for ports to be freed..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start backend server with proper IPv4 binding
Write-Host "🔧 Starting backend server with IPv4 binding..." -ForegroundColor Yellow
Set-Location -Path "backend"
$env:HOST = "0.0.0.0"
$env:PORT = "5004"

# Start the backend process in the background
$backendJob = Start-Job -ScriptBlock {
    Set-Location -Path $using:PSScriptRoot/backend
    node server.js
}

Set-Location -Path ".."

# Wait for backend to start
Write-Host "🔧 Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Check if backend is running
Write-Host "🔧 Verifying backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5004/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend server is running successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend failed to start. Please check the logs." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Backend failed to start. Please check the logs." -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Start Electron app
Write-Host "🔧 Starting Electron application..." -ForegroundColor Yellow
npm run electron

Write-Host "🎉 Akash Share started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 If you encounter any issues:" -ForegroundColor Yellow
Write-Host "   - Check that MongoDB is running"
Write-Host "   - Verify your .env file in the backend directory"
Write-Host "   - Ensure all dependencies are installed (npm install)"
Write-Host "   - Try running the fixed-start-app.bat script instead"
Write-Host ""
