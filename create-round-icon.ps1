# Create Round Desktop Icon for Akash Share

Write-Host "Creating Round Desktop Icon for Akash Share..." -ForegroundColor Green

# Check if 9000_new.png exists in public directory
$sourceIconPath = "public\9000_new.png"
if (-not (Test-Path $sourceIconPath)) {
    Write-Host "Error: 9000_new.png not found in public directory!"
    exit 1
}

Write-Host "Found 9000_new.png in public directory"

# Check if ImageMagick is installed
$magickExists = Get-Command magick -ErrorAction SilentlyContinue
if ($null -eq $magickExists) {
    Write-Host "Error: ImageMagick not found."
    exit 1
}

# Create round icon using ImageMagick
Write-Host "Creating round icon from 9000_new.png..."

# Create a circular mask
$roundIconPath = "build-resources\icon-round.png"

# Convert to round shape
magick convert "$sourceIconPath" -gravity center -crop 1:1 -resize 256x256^ -extent 256x256 -fill white -draw "circle 128,128 128,1" -alpha copy -channel a -evaluate multiply 1.0 "$roundIconPath"

Write-Host "Round icon created: build-resources\icon-round.png"

# Create ICO file with multiple resolutions
Write-Host "Converting round icon to ICO format..."
$icoPath = "build-resources\icon.ico"
magick convert "$roundIconPath" -define icon:auto-resize=256,128,64,48,32,16 "$icoPath"

Write-Host "ICO file created: build-resources\icon.ico"

# Verify the ICO file
Write-Host "Verifying ICO file..."
$icoBytes = Get-Content "$icoPath" -Encoding Byte -TotalCount 4
$icoHeader = [System.String]::Join(" ", ($icoBytes | ForEach-Object { "{0:X2}" -f $_ }))

if ($icoHeader -eq "00 00 01 00") {
    Write-Host "ICO file verified - proper format detected"
} else {
    Write-Host "ICO file may not be in proper format."
}

Write-Host "Round desktop icon creation complete!"