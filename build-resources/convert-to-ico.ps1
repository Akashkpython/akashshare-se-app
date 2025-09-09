# Convert PNG to ICO for Windows installer
# This script creates a basic ICO file from the PNG icon

Write-Host "Converting PNG to ICO for Windows installer..." -ForegroundColor Green

# Check if the PNG file exists
if (-not (Test-Path "icon.png")) {
    Write-Host "❌ icon.png not found in build-resources directory!" -ForegroundColor Red
    Write-Host "Please copy your icon PNG file to build-resources/icon.png first" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found icon.png" -ForegroundColor Green

# For now, we'll create a simple copy
# In a real scenario, you'd want to use a proper ICO converter
Write-Host "📝 Note: For best results, convert PNG to ICO using an online converter:" -ForegroundColor Yellow
Write-Host "   1. Go to https://convertio.co/png-ico/" -ForegroundColor White
Write-Host "   2. Upload build-resources/icon.png" -ForegroundColor White
Write-Host "   3. Select sizes: 16, 32, 48, 64, 128, 256" -ForegroundColor White
Write-Host "   4. Download and save as build-resources/icon.ico" -ForegroundColor White
Write-Host ""

# Create a placeholder ICO file (this won't work properly, but shows the process)
Write-Host "⚠️  Creating placeholder ICO file..." -ForegroundColor Yellow
Write-Host "   For a working installer, please convert PNG to ICO manually" -ForegroundColor Yellow

# Copy PNG as ICO (this is just a placeholder - won't work properly)
Copy-Item "icon.png" "icon.ico" -Force

Write-Host ""
Write-Host "📁 Files in build-resources:" -ForegroundColor Cyan
Get-ChildItem "build-resources" | Select-Object Name, Length | Format-Table -AutoSize

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Green
Write-Host "   1. Convert icon.png to icon.ico using an online converter" -ForegroundColor White
Write-Host "   2. Replace the placeholder icon.ico with the real ICO file" -ForegroundColor White
Write-Host "   3. Run 'npm run build:win' to create the installer" -ForegroundColor White
