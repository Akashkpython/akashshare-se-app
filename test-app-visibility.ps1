# Test script to verify Akash Share app visibility
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Akash Share - Visibility Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing processes
Write-Host "Step 1: Killing any existing Akash Share processes..." -ForegroundColor Yellow
Get-Process -Name "Akash Share" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "✓ Done" -ForegroundColor Green

# Launch the app
Write-Host "Step 2: Launching Akash Share..." -ForegroundColor Yellow
Set-Location -Path "D:\5th sem\project\akashshare-se\dist-new\win-unpacked"
Start-Process -FilePath "Akash Share.exe"

# Wait a moment for the app to start
Write-Host "Step 3: Waiting for app to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if the app is running
$appProcess = Get-Process -Name "Akash Share" -ErrorAction SilentlyContinue

if ($appProcess) {
    Write-Host "✓ App is running successfully!" -ForegroundColor Green
    Write-Host "  Process ID: $($appProcess.Id)" -ForegroundColor Gray
    Write-Host "  Memory Usage: $([math]::Round($appProcess.WorkingSet / 1MB, 2)) MB" -ForegroundColor Gray
    
    # Check if window is visible
    $visibleWindows = Get-Process -Name "Akash Share" | Where-Object { $_.MainWindowHandle -ne 0 }
    if ($visibleWindows) {
        Write-Host "✓ App window is visible!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ App is running but window may not be visible" -ForegroundColor Yellow
        Write-Host "  Try these steps:" -ForegroundColor Yellow
        Write-Host "  1. Check the taskbar for the app icon" -ForegroundColor White
        Write-Host "  2. Press Alt+Tab to cycle through windows" -ForegroundColor White
        Write-Host "  3. Check if the app is minimized" -ForegroundColor White
        Write-Host "  4. Look in the system tray (bottom-right corner)" -ForegroundColor White
    }
} else {
    Write-Host "❌ App failed to start properly" -ForegroundColor Red
    Write-Host "  Check the logs at: C:\Users\$env:USERNAME\AppData\Roaming\akash-share\logs\" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan