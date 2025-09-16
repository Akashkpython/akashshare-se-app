@echo off
echo ====================================================
echo    Akash Share - Verification of Round Icon
echo ====================================================
echo.

echo 1. Checking if build was successful...
if exist "build\index.html" (
    echo ✅ Build directory exists
) else (
    echo ❌ Build directory missing
    exit /b 1
)

echo.
echo 2. Checking if required files were copied...
if exist "build\icon.ico" (
    echo ✅ icon.ico copied to build directory
) else (
    echo ❌ icon.ico missing from build directory
)

if exist "build\Akashshareicon.png" (
    echo ✅ Akashshareicon.png copied to build directory
) else (
    echo ❌ Akashshareicon.png missing from build directory
)

echo.
echo 3. Verifying ICO file format...
if exist "build-resources\icon.ico" (
    powershell -Command "$bytes = [System.IO.File]::ReadAllBytes('build-resources\icon.ico')[0..3]; $header = ($bytes | ForEach-Object { '{0:X2}' -f $_ }) -join ' '; if ($header -eq '00 00 01 00') { Write-Output 'PROPER' } else { Write-Output 'IMPROPER' }" > temp_result.txt
    set /p ICO_RESULT=<temp_result.txt
    del temp_result.txt
    
    if "%ICO_RESULT%"=="PROPER" (
        echo ✅ ICO file is in proper format
    ) else (
        echo ⚠️  ICO file is NOT in proper format (likely a renamed PNG)
        echo    To fix: Use https://convertio.co/png-ico/ to convert icon.png to proper ICO
    )
) else (
    echo ❌ icon.ico not found in build-resources
)

echo.
echo 4. Checking for round icon...
if exist "build-resources\icon-round.png" (
    echo ✅ Round icon found: build-resources\icon-round.png
) else (
    echo ⚠️  Round icon not found. You may want to create one.
    echo    Run CREATE_ROUND_ICON_MANUAL.bat for instructions.
)

echo.
echo 5. Checking for source icon...
if exist "public\9000_new.png" (
    echo ✅ Source icon found: public\9000_new.png
) else (
    echo ⚠️  Source icon not found. Looking for public\9000.png...
    if exist "public\9000.png" (
        echo ✅ Alternative source icon found: public\9000.png
    ) else (
        echo ❌ Source icon not found. Please ensure public\9000_new.png exists.
    )
)

echo.
echo 6. Creating ICO file from round icon (if needed)...
if exist "build-resources\icon-round.png" (
    if not exist "build-resources\icon.ico" (
        echo ⚠️  ICO file missing. You need to convert icon-round.png to ICO format.
        echo    Instructions:
        echo      1. Go to https://convertio.co/png-ico/
        echo      2. Upload build-resources\icon-round.png
        echo      3. Select sizes: 16, 32, 48, 64, 128, 256
        echo      4. Click "Convert"
        echo      5. Download the ICO file
        echo      6. Save as: build-resources\icon.ico
    ) else (
        echo ✅ ICO file already exists
    )
) else (
    echo ⚠️  Cannot create ICO file - round icon not found
)

echo.
echo 7. Checking configuration files...
if exist "electron-builder.config.js" (
    findstr /C:"icon: \"build-resources/icon.ico\"" "electron-builder.config.js" >nul
    if %errorlevel% == 0 (
        echo ✅ Windows icon properly configured in electron-builder.config.js
    ) else (
        echo ⚠️  Windows icon not properly configured in electron-builder.config.js
    )
) else (
    echo ❌ electron-builder.config.js not found
)

echo.
echo ====================================================
echo    Verification Complete
echo ====================================================
echo.
echo Next steps:
echo 1. If you want a round icon, run CREATE_ROUND_ICON_MANUAL.bat
echo 2. If ICO file is not proper, convert icon.png to proper ICO format
echo 3. Run: npm run build:win
echo 4. Check the dist folder for the installer
echo 5. Test the installer - desktop shortcut should show proper icon
echo.