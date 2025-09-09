# Force clean and rebuild script for AkAsH Share
Write-Host "🧹 Force cleaning AkAsH Share build environment..." -ForegroundColor Yellow

# Kill all related processes
Write-Host "🔪 Terminating all related processes..." -ForegroundColor Red
Get-Process | Where-Object { 
    $_.ProcessName -like "*electron*" -or 
    $_.ProcessName -like "*app-builder*" -or 
    $_.ProcessName -like "*node*" -or
    $_.MainWindowTitle -like "*Akash Share*"
} | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait for processes to fully terminate
Write-Host "⏳ Waiting for processes to terminate..." -ForegroundColor Yellow
Start-Sleep 5

# Use handle.exe if available to find what's locking the file
try {
    $handleOutput = & "handle.exe" "app.asar" 2>$null
    if ($handleOutput) {
        Write-Host "Processes holding app.asar:" -ForegroundColor Cyan
        $handleOutput | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
    }
} catch {
    Write-Host "handle.exe not available (install SysInternals for better debugging)" -ForegroundColor Gray
}

# Force remove dist directory with multiple attempts
Write-Host "🗑️ Removing dist directory..." -ForegroundColor Yellow
for ($i = 1; $i -le 5; $i++) {
    try {
        if (Test-Path "dist") {
            Remove-Item -Recurse -Force "dist" -ErrorAction Stop
            Write-Host "✅ Successfully removed dist directory" -ForegroundColor Green
            break
        } else {
            Write-Host "✅ Dist directory already clean" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "⚠️ Attempt $i failed: $($_.Exception.Message)" -ForegroundColor Yellow
        if ($i -lt 5) {
            Write-Host "🔄 Retrying in 3 seconds..." -ForegroundColor Yellow
            Start-Sleep 3
        } else {
            Write-Host "❌ Failed to remove dist directory after 5 attempts" -ForegroundColor Red
            Write-Host "💡 Try restarting your computer or manually delete the dist folder" -ForegroundColor Cyan
        }
    }
}

# Clean node_modules cache
Write-Host "🧹 Cleaning node_modules cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache" -ErrorAction SilentlyContinue
    Write-Host "✅ Cleared node_modules cache" -ForegroundColor Green
}

# Clean build directory
Write-Host "🧹 Cleaning build directory..." -ForegroundColor Yellow
if (Test-Path "build") {
    Remove-Item -Recurse -Force "build" -ErrorAction SilentlyContinue
    Write-Host "✅ Cleared build directory" -ForegroundColor Green
}

Write-Host "Clean process completed!" -ForegroundColor Green
Write-Host "You can now run: npm run build:win" -ForegroundColor Cyan

