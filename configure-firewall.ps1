# Akash Share - Windows Firewall Configuration Script
# This script configures Windows Firewall to allow mobile device access
# Run this script as Administrator

Write-Host "🔥 Configuring Windows Firewall for Akash Share..." -ForegroundColor Green
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "💡 Right-click on PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit..."
    exit 1
}

try {
    # Get local IP address
    $ipAddress = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi" -ErrorAction SilentlyContinue | Where-Object {$_.IPAddress -like "192.168.*"}).IPAddress
    if (-not $ipAddress) {
        $ipAddress = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet" -ErrorAction SilentlyContinue | Where-Object {$_.IPAddress -like "192.168.*"}).IPAddress
    }
    if (-not $ipAddress) {
        $ipAddress = "YOUR_LOCAL_IP"
    }
    
    # Add firewall rule for frontend (React development server)
    Write-Host "🌐 Adding firewall rule for Frontend (port 3001)..." -ForegroundColor Cyan
    netsh advfirewall firewall add rule name="Akash Share Frontend" dir=in action=allow protocol=TCP localport=3001
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend firewall rule added successfully!" -ForegroundColor Green
    } else {
        throw "Failed to add frontend firewall rule"
    }

    # Add firewall rule for backend (WebSocket and API server)
    Write-Host "🔧 Adding firewall rule for Backend (port 5004)..." -ForegroundColor Cyan
    netsh advfirewall firewall add rule name="Akash Share Backend" dir=in action=allow protocol=TCP localport=5004
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend firewall rule added successfully!" -ForegroundColor Green
    } else {
        throw "Failed to add backend firewall rule"
    }

    Write-Host ""
    Write-Host "🎉 Firewall configuration completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 You can now access Akash Share from mobile devices on the same WiFi network:" -ForegroundColor Yellow
    Write-Host "   👉 Frontend: http://$ipAddress`:3001" -ForegroundColor White
    Write-Host "   👉 Backend:  http://$ipAddress`:5004" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 If the IP address above is incorrect, find your local IP by running 'ipconfig' in Command Prompt" -ForegroundColor Yellow
    Write-Host ""
    
    # Verify the rules were created
    Write-Host "🔍 Verifying firewall rules..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Frontend Rule:" -ForegroundColor Yellow
    netsh advfirewall firewall show rule name="Akash Share Frontend"
    Write-Host ""
    Write-Host "Backend Rule:" -ForegroundColor Yellow
    netsh advfirewall firewall show rule name="Akash Share Backend"

} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Manual Steps:" -ForegroundColor Yellow
    Write-Host "1. Open Windows Defender Firewall with Advanced Security" -ForegroundColor White
    Write-Host "2. Click 'Inbound Rules' → 'New Rule...'" -ForegroundColor White
    Write-Host "3. Select 'Port' → TCP → Specific ports: 3001" -ForegroundColor White
    Write-Host "4. Allow the connection → All profiles → Name: 'Akash Share Frontend'" -ForegroundColor White
    Write-Host "5. Repeat for port 5004 with name 'Akash Share Backend'" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit..."