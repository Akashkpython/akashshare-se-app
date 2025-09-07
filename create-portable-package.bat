@echo off
:: Create a portable package for Akash Share
:: This creates a ZIP file that your friends can download and run directly

echo ==================================================
echo      Akash Share Portable Package Creator
echo ==================================================
echo.

:: Clean up any existing package
if exist "AkashShare-Portable.zip" (
    echo [INFO] Removing existing portable package...
    del "AkashShare-Portable.zip" >nul 2>&1
)

:: Create a temporary directory for packaging
set "temp_dir=TempAkashSharePackage"
if exist "%temp_dir%" (
    echo [INFO] Cleaning up temporary directory...
    rd /s /q "%temp_dir%" >nul 2>&1
)
md "%temp_dir%"

:: Copy build files
echo [INFO] Copying build files...
if not exist "build" (
    echo Error: Build directory not found. Please run 'npm run build' first.
    echo.
    pause
    exit /b 1
)

xcopy "build" "%temp_dir%\build" /E /I /H /Y >nul 2>&1

:: Copy Electron files
echo [INFO] Copying Electron files...
xcopy "electron" "%temp_dir%\electron" /E /I /H /Y >nul 2>&1

:: Copy backend files
echo [INFO] Copying backend files...
xcopy "backend" "%temp_dir%\backend" /E /I /H /Y >nul 2>&1

:: Copy package files
echo [INFO] Copying package files...
copy "package.json" "%temp_dir%\" >nul 2>&1
copy "package-lock.json" "%temp_dir%\" >nul 2>&1

:: Copy documentation
echo [INFO] Copying documentation...
copy "README.md" "%temp_dir%\" >nul 2>&1
copy "LICENSE" "%temp_dir%\" >nul 2>&1

:: Create launcher script
echo [INFO] Creating launcher script...
echo @echo off > "%temp_dir%\AkashShare.bat"
echo cd /d "%%~dp0" >> "%temp_dir%\AkashShare.bat"
echo npm start >> "%temp_dir%\AkashShare.bat"

:: Create installation instructions
echo [INFO] Creating installation instructions...
echo # Akash Share - Portable Package > "%temp_dir%\README-PORTABLE.txt"
echo. >> "%temp_dir%\README-PORTABLE.txt"
echo ## How to use this portable package >> "%temp_dir%\README-PORTABLE.txt"
echo. >> "%temp_dir%\README-PORTABLE.txt"
echo 1. Extract this ZIP file to any location on your computer >> "%temp_dir%\README-PORTABLE.txt"
echo 2. Install Node.js if not already installed (https://nodejs.org/) >> "%temp_dir%\README-PORTABLE.txt"
echo 3. Double-click "AkashShare.bat" to start the application >> "%temp_dir%\README-PORTABLE.txt"
echo. >> "%temp_dir%\README-PORTABLE.txt"
echo ## Notes >> "%temp_dir%\README-PORTABLE.txt"
echo - This is a development version that requires Node.js to run >> "%temp_dir%\README-PORTABLE.txt"
echo - For best performance, use the installed version when available >> "%temp_dir%\README-PORTABLE.txt"

echo.
echo [INFO] Creating ZIP package...
powershell -command "Compress-Archive -Path '%temp_dir%\*' -DestinationPath 'AkashShare-Portable.zip' -Force"

:: Clean up temporary directory
echo [INFO] Cleaning up temporary files...
rd /s /q "%temp_dir%" >nul 2>&1

echo.
echo [SUCCESS] Portable package created successfully!
echo Package file: AkashShare-Portable.zip
echo.
echo To distribute to your friends:
echo 1. Share the AkashShare-Portable.zip file with your friends
echo 2. Your friends need to:
echo    a. Install Node.js from https://nodejs.org/
echo    b. Extract the ZIP file
echo    c. Double-click AkashShare.bat to run the application
echo.
pause