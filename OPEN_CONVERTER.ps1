# Open ICO Converter for Akash Share
# This script opens the online PNG to ICO converter in your default browser

Write-Host "Opening PNG to ICO Converter..." -ForegroundColor Green
Write-Host "Please follow these steps:" -ForegroundColor Yellow
Write-Host "1. Click 'Choose File' and select: build-resources\icon-round.png" -ForegroundColor White
Write-Host "2. Make sure these sizes are selected: 16, 32, 48, 64, 128, 256" -ForegroundColor White
Write-Host "3. Click 'Convert'" -ForegroundColor White
Write-Host "4. Once conversion is complete, click 'Download'" -ForegroundColor White
Write-Host "5. Save the file as: build-resources\icon.ico" -ForegroundColor White
Write-Host ""

# Open the converter website in the default browser
Start-Process "https://convertio.co/png-ico/"

Write-Host "Converter opened in your browser!" -ForegroundColor Green
Write-Host "After downloading, save the ICO file as: build-resources\icon.ico" -ForegroundColor Yellow