@echo off
echo Verifying ICO file format...
echo.

REM Check if icon.ico exists
if not exist "icon.ico" (
    echo ❌ icon.ico not found in current directory
    echo Please run this script from the build-resources directory
    exit /b 1
)

REM Read the first 4 bytes of the file to check the header
powershell -Command "$bytes = [System.IO.File]::ReadAllBytes('icon.ico')[0..3]; $header = ($bytes | ForEach-Object { '{0:X2}' -f $_ }) -join ' '; Write-Output $header" > temp_header.txt
set /p HEADER=<temp_header.txt
del temp_header.txt

echo File header: %HEADER%
echo.

if "%HEADER%"=="00 00 01 00" (
    echo ✅ ICO file is in proper format
    echo This is a valid Windows icon file
) else (
    echo ❌ ICO file is NOT in proper format
    echo Current header: %HEADER%
    echo Expected header: 00 00 01 00 (ICO signature)
    echo This is likely a PNG file renamed to ICO
    echo.
    echo To fix this issue:
    echo 1. Go to https://convertio.co/png-ico/
    echo 2. Upload build-resources\icon.png
    echo 3. Select sizes: 16, 32, 48, 64, 128, 256
    echo 4. Download and save as build-resources\icon.ico
)

echo.
echo Files in current directory:
dir