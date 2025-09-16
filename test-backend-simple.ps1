# Backend test script for AkAsH Share
Write-Host "Testing AkAsH Share Backend..." -ForegroundColor Green
Write-Host "============================" -ForegroundColor Cyan

# Check if port 5004 is free
Write-Host "Checking port 5004..." -ForegroundColor Yellow
$portInUse = netstat -ano | findstr ":5004"
if ($portInUse) {
    Write-Host "Port 5004 in use, killing processes..." -ForegroundColor Red
    & ".\kill-port-5002.ps1"
    Start-Sleep 3
} else {
    Write-Host "Port 5004 is free" -ForegroundColor Green
}

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "node" -ArgumentList "backend/server.js" -NoNewWindow -PassThru
Start-Sleep 8

# Check if backend started
$backendRunning = Get-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue
if ($backendRunning) {
    Write-Host "Backend server started (PID: $($backendProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "Backend server failed to start" -ForegroundColor Red
    exit 1
}

# Test health endpoint
Write-Host "Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:5004/health" -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "Health check passed (IPv4)" -ForegroundColor Green
    } else {
        Write-Host "Health check failed (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "Health check failed (IPv4): $($_.Exception.Message)" -ForegroundColor Red
    # Try localhost
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5004/health" -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "Health check passed (localhost)" -ForegroundColor Green
        } else {
            Write-Host "Health check failed (localhost): Status $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "Health check failed (localhost): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test WebSocket
Write-Host "Testing WebSocket connection..." -ForegroundColor Yellow
try {
    $wsTest = Start-Process -FilePath "node" -ArgumentList "test-websocket-connection.js" -NoNewWindow -Wait -PassThru
    if ($wsTest.ExitCode -eq 0) {
        Write-Host "WebSocket test passed" -ForegroundColor Green
    } else {
        Write-Host "WebSocket test failed" -ForegroundColor Red
    }
} catch {
    Write-Host "WebSocket test error: $($_.Exception.Message)" -ForegroundColor Red
}

# Check listening ports
Write-Host "Checking listening ports..." -ForegroundColor Yellow
$listeningPorts = netstat -ano | findstr ":5004"
if ($listeningPorts) {
    Write-Host "Ports listening on 5004:" -ForegroundColor Cyan
    foreach ($line in $listeningPorts) {
        Write-Host "   $line" -ForegroundColor White
    }
} else {
    Write-Host "No ports listening on 5004" -ForegroundColor Red
}

# Cleanup
Write-Host "Cleaning up..." -ForegroundColor Yellow
Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue

Write-Host "============================" -ForegroundColor Cyan
Write-Host "Backend test completed!" -ForegroundColor Green
