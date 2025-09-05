# Akash Share - Network Connectivity Test Script
# This script tests if the Akash Share services are accessible from the network

Write-Host "🌐 Testing Akash Share Network Connectivity..." -ForegroundColor Green
Write-Host ""

# Get network IP address
$networkIP = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*" | Where-Object {$_.PrefixOrigin -eq "Dhcp"}).IPAddress
if (-not $networkIP) {
    $networkIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -like "172.*"}).IPAddress | Select-Object -First 1
}

Write-Host "🏠 Detected Network IP: $networkIP" -ForegroundColor Cyan
Write-Host ""

# Test Backend (port 5002)
Write-Host "🔧 Testing Backend Service (port 5002)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://$networkIP`:5002/health" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is accessible from network!" -ForegroundColor Green
        $backendWorking = $true
    }
} catch {
    Write-Host "❌ Backend NOT accessible from network" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $backendWorking = $false
}

Write-Host ""

# Test Frontend (port 3001)
Write-Host "🌐 Testing Frontend Service (port 3001)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://$networkIP`:3001" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible from network!" -ForegroundColor Green
        $frontendWorking = $true
    }
} catch {
    Write-Host "❌ Frontend NOT accessible from network" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $frontendWorking = $false
}

Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor White

if ($backendWorking -and $frontendWorking) {
    Write-Host "🎉 Both services are accessible from mobile devices!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Mobile Access URLs:" -ForegroundColor Yellow
    Write-Host "   👉 Open this on your mobile browser: http://$networkIP`:3001" -ForegroundColor White
    Write-Host "   👉 Navigate to Group Chat and test connectivity" -ForegroundColor White
} elseif (-not $backendWorking -and -not $frontendWorking) {
    Write-Host "🔥 Windows Firewall is likely blocking both services" -ForegroundColor Red
    Write-Host "   👉 Run configure-firewall.ps1 as Administrator" -ForegroundColor Yellow
} elseif (-not $backendWorking) {
    Write-Host "🔥 Backend is blocked - WebSocket chat won't work" -ForegroundColor Red
    Write-Host "   👉 Run configure-firewall.ps1 as Administrator" -ForegroundColor Yellow
} elseif (-not $frontendWorking) {
    Write-Host "🔥 Frontend is blocked - Mobile can't access the app" -ForegroundColor Red
    Write-Host "   👉 Run configure-firewall.ps1 as Administrator" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔍 Troubleshooting:" -ForegroundColor Cyan
Write-Host "1. Make sure both backend and frontend servers are running" -ForegroundColor White
Write-Host "2. Ensure mobile device is on the same WiFi network" -ForegroundColor White
Write-Host "3. Configure Windows Firewall using configure-firewall.ps1" -ForegroundColor White
Write-Host "4. Try disabling Windows Firewall temporarily for testing" -ForegroundColor White

Write-Host ""
Read-Host "Press Enter to exit..."