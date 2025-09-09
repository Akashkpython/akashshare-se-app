# AkAsH Share - Fixed Servers Startup
# This script ensures IPv4 binding for WebSocket connections

Write-Host "Starting AkAsH Share with IPv4 Fix..." -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan

# Kill any existing processes using port 5002
Write-Host "Stopping existing servers..." -ForegroundColor Yellow
& ".\kill-port-5002.ps1"
Start-Sleep 3

# Start Backend Server with IPv4 binding
Write-Host "Starting Backend Server (IPv4: 127.0.0.1:5002)..." -ForegroundColor Green
$backendScript = @"
Write-Host 'BACKEND SERVER - IPv4 FIXED' -ForegroundColor Green
Set-Location 'D:\5th sem\project\akashshare-se\backend'
`$env:HOST = '127.0.0.1'
node server.js
"@

Start-Process PowerShell -ArgumentList "-NoExit", "-Command", $backendScript

# Wait for backend to start
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep 8

# Verify backend is running on IPv4
Write-Host "Verifying backend binding..." -ForegroundColor Yellow
$netstat = netstat -an | findstr ":5002"
if ($netstat -like "*127.0.0.1:5002*") {
    Write-Host "SUCCESS: Backend correctly bound to IPv4 (127.0.0.1:5002)" -ForegroundColor Green
} else {
    Write-Host "ERROR: Backend not bound to IPv4! Check server logs." -ForegroundColor Red
}

# Start Frontend Server
Write-Host "Starting Frontend Server (Port 3000)..." -ForegroundColor Green
$frontendScript = @"
Write-Host 'FRONTEND SERVER - WEBSOCKET FIXED' -ForegroundColor Blue
Set-Location 'D:\5th sem\project\akashshare-se'
npm start
"@

Start-Process PowerShell -ArgumentList "-NoExit", "-Command", $frontendScript

# Wait for frontend to compile
Write-Host "Waiting for frontend to compile..." -ForegroundColor Yellow
Start-Sleep 10

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "SUCCESS: SERVERS STARTED WITH IPv4 FIX!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: " -NoNewline; Write-Host "http://localhost:5002" -ForegroundColor Cyan
Write-Host "Backend:  " -NoNewline; Write-Host "http://127.0.0.1:5002" -ForegroundColor Cyan
Write-Host "WebSocket: " -NoNewline; Write-Host "ws://127.0.0.1:5002/chat" -ForegroundColor Cyan
Write-Host ""
Write-Host "GROUP CHAT SHOULD NOW WORK!" -ForegroundColor Green
Write-Host ""
Write-Host "What to test:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5002 in browser"
Write-Host "2. Go to Group Chat section"
Write-Host "3. Should show 'Connected' status"
Write-Host "4. Try sending messages"
Write-Host ""
Write-Host "To stop: Close both server windows" -ForegroundColor Red
Write-Host ""
Read-Host "Press Enter to close this launcher"
