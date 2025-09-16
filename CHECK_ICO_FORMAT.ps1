# Check ICO File Format for Akash Share
# This script verifies if the ICO file is properly formatted

Write-Host "Checking ICO file format..." -ForegroundColor Green

# Check if the ICO file exists
$icoPath = "build-resources\icon.ico"
if (-not (Test-Path $icoPath)) {
    Write-Host "❌ ICO file not found: $icoPath" -ForegroundColor Red
    Write-Host "Please create the ICO file first using the online converter." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ ICO file found: $icoPath" -ForegroundColor Green

# Read the first 4 bytes of the file to check the header
try {
    $bytes = [System.IO.File]::ReadAllBytes($icoPath)
    $header = $bytes[0..3] | ForEach-Object { "{0:X2}" -f $_ }
    $headerString = $header -join " "
    
    Write-Host "File header: $headerString" -ForegroundColor Cyan
    
    # Check if it's a proper ICO file (should start with 00 00 01 00)
    if ($headerString -eq "00 00 01 00") {
        Write-Host "✅ ICO file is in proper format" -ForegroundColor Green
        Write-Host "This is a valid Windows icon file" -ForegroundColor White
    } else {
        Write-Host "❌ ICO file is NOT in proper format" -ForegroundColor Red
        Write-Host "Current header: $headerString" -ForegroundColor White
        Write-Host "Expected header: 00 00 01 00 (ICO signature)" -ForegroundColor White
        Write-Host "This is likely a PNG file renamed to ICO" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To fix this issue:" -ForegroundColor Cyan
        Write-Host "1. Go to https://convertio.co/png-ico/" -ForegroundColor White
        Write-Host "2. Upload build-resources\icon-round.png" -ForegroundColor White
        Write-Host "3. Select sizes: 16, 32, 48, 64, 128, 256" -ForegroundColor White
        Write-Host "4. Download and save as build-resources\icon.ico" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error reading ICO file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Verification complete!" -ForegroundColor Green