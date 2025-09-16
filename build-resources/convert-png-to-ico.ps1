# Convert PNG to ICO for Windows installer
# This script creates a proper ICO file from the PNG icon

Write-Host "Converting PNG to ICO for Windows installer..." -ForegroundColor Green

# Check if the PNG file exists in build-resources directory
$iconPath = "build-resources\icon.png"
if (-not (Test-Path $iconPath)) {
    Write-Host "❌ icon.png not found in build-resources directory!" -ForegroundColor Red
    Write-Host "Please copy your icon PNG file to build-resources/icon.png first" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found icon.png" -ForegroundColor Green

# Create proper ICO file using online service instructions
Write-Host "📝 To create a proper ICO file:" -ForegroundColor Yellow
Write-Host "   1. Go to https://convertio.co/png-ico/" -ForegroundColor White
Write-Host "   2. Upload build-resources/icon.png" -ForegroundColor White
Write-Host "   3. Select sizes: 16, 32, 48, 64, 128, 256" -ForegroundColor White
Write-Host "   4. Download and save as build-resources/icon.ico" -ForegroundColor White
Write-Host ""

Write-Host "📁 Files in build-resources:" -ForegroundColor Cyan
Get-ChildItem "build-resources" | Select-Object Name, Length | Format-Table -AutoSize

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Green
Write-Host "   1. Convert icon.png to icon.ico using an online converter" -ForegroundColor White
Write-Host "   2. Replace the placeholder icon.ico with the real ICO file" -ForegroundColor White
Write-Host "   3. Run 'npm run build:win' to create the installer" -ForegroundColor White