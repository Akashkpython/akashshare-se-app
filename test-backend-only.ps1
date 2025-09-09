# Backend-only test script for AkAsH Share
Write-Host "🔧 Testing AkAsH Share Backend Only..." -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan

# Test 1: Check if port 5002 is free
Write-Host "Test 1: Checking port 5002 availability..." -ForegroundColor Yellow
$portInUse = netstat -ano | findstr ":5002"
if ($portInUse) {
    Write-Host "❌ Port 5002 is in use. Killing processes..." -ForegroundColor Red
    & ".\kill-port-5002.ps1"
    Start-Sleep 3
} else {
    Write-Host "✅ Port 5002 is free" -ForegroundColor Green
}

# Test 2: Start backend server
Write-Host "Test 2: Starting backend server..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "node" -ArgumentList "backend/server.js" -NoNewWindow -PassThru
Start-Sleep 8

# Check if backend started successfully
$backendRunning = Get-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue
if ($backendRunning) {
    Write-Host "✅ Backend server started (PID: $($backendProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ Backend server failed to start" -ForegroundColor Red
    exit 1
}

# Test 3: Test backend health endpoint
Write-Host "Test 3: Testing backend health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:5002/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend health check passed (IPv4)" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend health check failed (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Backend health check failed (IPv4): $($_.Exception.Message)" -ForegroundColor Red
    # Try localhost instead
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5002/health" -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend health check passed (localhost)" -ForegroundColor Green
        } else {
            Write-Host "❌ Backend health check failed (localhost): Status $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Backend health check failed (localhost): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Test WebSocket connection
Write-Host "Test 4: Testing WebSocket connection..." -ForegroundColor Yellow
try {
    $wsTest = Start-Process -FilePath "node" -ArgumentList "test-websocket-connection.js" -NoNewWindow -Wait -PassThru
    if ($wsTest.ExitCode -eq 0) {
        Write-Host "✅ WebSocket connection test passed" -ForegroundColor Green
    } else {
        Write-Host "❌ WebSocket connection test failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ WebSocket test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Check what ports are actually listening
Write-Host "Test 5: Checking what ports are listening..." -ForegroundColor Yellow
$listeningPorts = netstat -ano | findstr ":5002"
if ($listeningPorts) {
    Write-Host "📋 Ports listening on 5002:" -ForegroundColor Cyan
    $listeningPorts | ForEach-Object {
        Write-Host "   $_" -ForegroundColor White
    }
} else {
    Write-Host "❌ No ports listening on 5002" -ForegroundColor Red
}

# Cleanup
Write-Host "Test 6: Cleaning up..." -ForegroundColor Yellow
Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🎉 Backend test completed!" -ForegroundColor Green
Write-Host "" -ForegroundColor White
Write-Host "If backend tests passed, the server binding issue is fixed." -ForegroundColor Green
Write-Host "You can now run the frontend separately or use the fixed startup script." -ForegroundColor Cyan
