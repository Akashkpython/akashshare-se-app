# Akash Share - App Launch Fix Script (PowerShell)
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "    Akash Share - App Launch Fix Script" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill existing processes
Write-Host "Step 1: Killing any existing stuck processes..." -ForegroundColor Yellow
try {
    Get-Process -Name "Akash Share" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✅ Killed existing Akash Share processes" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ No existing Akash Share processes found" -ForegroundColor Blue
}

try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*Akash Share*" } | Stop-Process -Force
    Write-Host "✅ Killed related Node.js processes" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ No related Node.js processes found" -ForegroundColor Blue
}
Write-Host ""

# Step 2: Check if setup.exe exists
Write-Host "Step 2: Checking if setup.exe exists..." -ForegroundColor Yellow
$setupPath = "dist-new\AkashShareUserSetup-x64.exe"
if (Test-Path $setupPath) {
    $setupSize = (Get-Item $setupPath).Length / 1MB
    Write-Host "✅ Setup.exe found at: $setupPath" -ForegroundColor Green
    Write-Host "   Size: $([math]::Round($setupSize, 2)) MB" -ForegroundColor Gray
} else {
    Write-Host "❌ Setup.exe not found! Please run the build process first." -ForegroundColor Red
    Write-Host "Run: npm run dist" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Step 3: Check if unpacked app exists
Write-Host "Step 3: Checking if unpacked app exists..." -ForegroundColor Yellow
$appPath = "dist-new\win-unpacked\Akash Share.exe"
if (Test-Path $appPath) {
    Write-Host "✅ Unpacked app found at: $appPath" -ForegroundColor Green
} else {
    Write-Host "❌ Unpacked app not found! Please run the build process first." -ForegroundColor Red
    Write-Host "Run: npm run dist" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Step 4: Test direct app launch
Write-Host "Step 4: Testing direct app launch..." -ForegroundColor Yellow
Write-Host "Launching Akash Share directly from unpacked folder..." -ForegroundColor Blue

try {
    Set-Location "dist-new\win-unpacked"
    Start-Process -FilePath "Akash Share.exe" -WindowStyle Normal
    Write-Host "✅ App launch command executed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to launch app: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Step 5: Wait and check if app is running
Write-Host "Step 5: Waiting for app to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Step 6: Checking if app is running..." -ForegroundColor Yellow
$appProcess = Get-Process -Name "Akash Share" -ErrorAction SilentlyContinue

if ($appProcess) {
    Write-Host "✅ App is running successfully!" -ForegroundColor Green
    Write-Host "   Process ID: $($appProcess.Id)" -ForegroundColor Gray
    Write-Host "   Memory Usage: $([math]::Round($appProcess.WorkingSet / 1MB, 2)) MB" -ForegroundColor Gray
    Write-Host ""
    Write-Host "If the app window is not visible:" -ForegroundColor Yellow
    Write-Host "1. Check the taskbar for the app icon" -ForegroundColor White
    Write-Host "2. Press Alt+Tab to cycle through windows" -ForegroundColor White
    Write-Host "3. Check if the app is minimized" -ForegroundColor White
    Write-Host "4. Try right-clicking the taskbar icon and selecting 'Restore'" -ForegroundColor White
} else {
    Write-Host "❌ App failed to start properly" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Check Windows Event Viewer for errors" -ForegroundColor White
    Write-Host "2. Try running as Administrator" -ForegroundColor White
    Write-Host "3. Check antivirus software" -ForegroundColor White
    Write-Host "4. Verify all dependencies are installed" -ForegroundColor White
    Write-Host "5. Check if Node.js is properly installed" -ForegroundColor White
}
Write-Host ""

# Step 7: Alternative launch method
Write-Host "Step 7: Alternative launch method - Using setup.exe..." -ForegroundColor Yellow
Write-Host ""
Write-Host "You can also try installing the app using the setup.exe:" -ForegroundColor Blue
Write-Host "1. Right-click on 'dist-new\AkashShareUserSetup-x64.exe'" -ForegroundColor White
Write-Host "2. Select 'Run as administrator'" -ForegroundColor White
Write-Host "3. Follow the installation wizard" -ForegroundColor White
Write-Host "4. Launch from Start Menu or Desktop shortcut" -ForegroundColor White
Write-Host ""

# Step 8: Additional diagnostics
Write-Host "Step 8: Running additional diagnostics..." -ForegroundColor Yellow

# Check Node.js installation
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js not found or not accessible" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Node.js not found or not accessible" -ForegroundColor Red
}

# Check if port 5004 is in use
try {
    $portCheck = netstat -an | Select-String ":5004"
    if ($portCheck) {
        Write-Host "⚠️ Port 5004 is in use - this might prevent the backend from starting" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Port 5004 is available" -ForegroundColor Green
    }
} catch {
    Write-Host "ℹ️ Could not check port 5004 status" -ForegroundColor Blue
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "    Fix script completed" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If the app still doesn't open:" -ForegroundColor Yellow
Write-Host "1. Check the logs in: $env:APPDATA\akash-share\logs\" -ForegroundColor White
Write-Host "2. Try running: npm run electron-dev (for development mode)" -ForegroundColor White
Write-Host "3. Check if Node.js is properly installed" -ForegroundColor White
Write-Host "4. Try running the setup.exe as Administrator" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
