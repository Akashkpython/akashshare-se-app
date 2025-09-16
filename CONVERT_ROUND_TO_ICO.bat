@echo off
echo ====================================================
echo    Akash Share - Convert Round PNG to ICO
echo ====================================================
echo.

echo This script provides instructions to convert your round icon to ICO format.
echo.

echo Step 1: Go to the online converter
echo.
echo Open your web browser and go to:
echo https://convertio.co/png-ico/
echo.

echo Step 2: Upload your round icon
echo.
echo Click "Choose File" and select:
echo build-resources\icon-round.png
echo.

echo Step 3: Select icon sizes
echo.
echo Make sure the following sizes are selected:
echo - 16x16
echo - 32x32
echo - 48x48
echo - 64x64
echo - 128x128
echo - 256x256
echo.

echo Step 4: Convert and download
echo.
echo Click the "Convert" button
echo Once conversion is complete, click "Download"
echo.

echo Step 5: Save as ICO file
echo.
echo Save the downloaded file as:
echo build-resources\icon.ico
echo.

echo Step 6: Verify the conversion
echo.
echo Run this command to verify:
echo VERIFY_ROUND_ICON.bat
echo.

echo ====================================================
echo    Process Complete
echo ====================================================
echo.
echo After saving the ICO file, run:
echo npm run build:win
echo.
pause