# Comprehensive test script for AkAsH Share
Write-Host "🧪 Testing AkAsH Share Full Setup..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan

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

# Test 2: Check Node.js installation
Write-Host "Test 2: Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Test 3: Check backend dependencies
Write-Host "Test 3: Checking backend dependencies..." -ForegroundColor Yellow
if (Test-Path "backend/package.json") {
    Push-Location backend
    if (Test-Path "node_modules") {
        Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Installing backend dependencies..." -ForegroundColor Yellow
        npm install
    }
    Pop-Location
} else {
    Write-Host "❌ Backend package.json not found" -ForegroundColor Red
}

# Test 4: Check frontend dependencies
Write-Host "Test 4: Checking frontend dependencies..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    if (Test-Path "node_modules") {
        Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Installing frontend dependencies..." -ForegroundColor Yellow
        npm install
    }
} else {
    Write-Host "❌ Frontend package.json not found" -ForegroundColor Red
}

# Test 5: Start backend server
Write-Host "Test 5: Starting backend server..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "node" -ArgumentList "backend/server.js" -NoNewWindow -PassThru
Start-Sleep 5

# Check if backend started successfully
$backendRunning = Get-Process -Id $backendProcess.Id -ErrorAction SilentlyContinue
if ($backendRunning) {
    Write-Host "✅ Backend server started (PID: $($backendProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ Backend server failed to start" -ForegroundColor Red
    exit 1
}

# Test 6: Test backend health endpoint
Write-Host "Test 6: Testing backend health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:5002/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend health check passed" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend health check failed (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Test WebSocket connection
Write-Host "Test 7: Testing WebSocket connection..." -ForegroundColor Yellow
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

# Test 8: Start frontend server
Write-Host "Test 8: Starting frontend server..." -ForegroundColor Yellow
try {
    # Use cmd to run npm start
    $frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm start" -NoNewWindow -PassThru
    Start-Sleep 15

    # Check if frontend started successfully
    $frontendRunning = Get-Process -Name "node" | Where-Object { $_.Id -ne $backendProcess.Id }
    if ($frontendRunning) {
        Write-Host "✅ Frontend server started" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend server failed to start" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Frontend server failed to start: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Test frontend accessibility
Write-Host "Test 9: Testing frontend accessibility..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5002" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible at http://localhost:5002" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend not accessible (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Frontend not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Cleanup
Write-Host "Test 10: Cleaning up..." -ForegroundColor Yellow
Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
if ($frontendProcess) {
    Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
}
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "🎉 Test completed!" -ForegroundColor Green
Write-Host "If all tests passed, your AkAsH Share setup should be working correctly." -ForegroundColor Green
Write-Host "Run .\start-servers-fixed.ps1 to start the application." -ForegroundColor Cyan
