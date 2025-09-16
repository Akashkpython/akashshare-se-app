# Create Proper ICO File for Akash Share
# This script uses an online service to convert the PNG to a proper ICO file

Write-Host "Creating Proper ICO File for Akash Share..." -ForegroundColor Green

# Check if icon.png exists
$iconPngPath = "build-resources\icon.png"
if (-not (Test-Path $iconPngPath)) {
    Write-Host "❌ icon.png not found in build-resources directory!" -ForegroundColor Red
    Write-Host "Please copy your icon PNG file to build-resources/icon.png first" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found icon.png" -ForegroundColor Green

# Instructions for manual conversion (since automated conversion is complex)
Write-Host ""
Write-Host "📝 To create a proper ICO file, please follow these steps:" -ForegroundColor Yellow
Write-Host "   1. Go to https://convertio.co/png-ico/" -ForegroundColor White
Write-Host "   2. Upload the file: build-resources\icon.png" -ForegroundColor White
Write-Host "   3. Select the following sizes: 16, 32, 48, 64, 128, 256" -ForegroundColor White
Write-Host "   4. Click 'Convert' and download the resulting ICO file" -ForegroundColor White
Write-Host "   5. Save it as: build-resources\icon.ico (replace existing file)" -ForegroundColor White
Write-Host ""

# Alternative method using ImageMagick (if available)
Write-Host "🔧 Alternative method using ImageMagick (if installed):" -ForegroundColor Cyan
Write-Host "   magick convert build-resources\icon.png -define icon:auto-resize=256,128,64,48,32,16 build-resources\icon.ico" -ForegroundColor White
Write-Host ""

# Verify current ICO file
Write-Host "🔍 Current ICO file verification:" -ForegroundColor Cyan
if (Test-Path "build-resources\icon.ico") {
    $icoBytes = Get-Content "build-resources\icon.ico" -Encoding Byte -TotalCount 4
    $icoHeader = [System.String]::Join(" ", ($icoBytes | ForEach-Object { "{0:X2}" -f $_ }))
    
    if ($icoHeader -eq "00 00 01 00") {
        Write-Host "✅ Current ICO file is in proper format" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Current ICO file is NOT in proper format" -ForegroundColor Yellow
        Write-Host "   Current header: $icoHeader" -ForegroundColor White
        Write-Host "   Expected header: 00 00 01 00 (ICO signature)" -ForegroundColor White
        Write-Host "   This is likely a PNG file renamed to ICO" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ icon.ico not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "📁 Files in build-resources:" -ForegroundColor Cyan
Get-ChildItem "build-resources" | Select-Object Name, Length | Format-Table -AutoSize

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Green
Write-Host "   1. Create a proper ICO file using the instructions above" -ForegroundColor White
Write-Host "   2. Replace build-resources\icon.ico with the proper ICO file" -ForegroundColor White
Write-Host "   3. Run 'npm run build:win' to create the installer" -ForegroundColor White
Write-Host "   4. The installer should now create proper desktop shortcuts" -ForegroundColor White