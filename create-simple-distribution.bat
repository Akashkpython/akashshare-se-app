@echo off
:: Create a simple distribution package for Akash Share
:: This script creates a portable version that can be distributed to friends

echo ==================================================
echo      Akash Share Simple Distribution Creator
echo ==================================================
echo.

:: Check if required directories exist
if not exist "dist\win-unpacked" (
    echo Error: dist\win-unpacked directory not found.
    echo Please run 'npm run dist' to build the application first.
    echo.
    pause
    exit /b 1
)

echo [INFO] Found application files in dist\win-unpacked
echo.

:: Create distribution directory
set "dist_dir=AkashShare-Portable"
echo [INFO] Creating distribution directory: %dist_dir%

if exist "%dist_dir%" (
    echo [INFO] Removing existing distribution directory...
    rd /s /q "%dist_dir%" >nul 2>&1
)

md "%dist_dir%"

:: Copy application files
echo [INFO] Copying application files...
xcopy "dist\win-unpacked" "%dist_dir%\AkashShareApp\" /E /I /H /Y >nul 2>&1

:: Copy documentation
echo [INFO] Copying documentation...
copy "README.md" "%dist_dir%\" >nul 2>&1
copy "LICENSE" "%dist_dir%\" >nul 2>&1

:: Create a simple launcher script
echo [INFO] Creating launcher script...
echo @echo off > "%dist_dir%\Launch-AkashShare.bat"
echo cd /d "%%~dp0\AkashShareApp" >> "%dist_dir%\Launch-AkashShare.bat"
echo start "" "Akash Share.exe" >> "%dist_dir%\Launch-AkashShare.bat"

:: Create installation instructions
echo [INFO] Creating installation instructions...
echo # Akash Share - Portable Version > "%dist_dir%\INSTALLATION-INSTRUCTIONS.txt"
echo. >> "%dist_dir%\INSTALLATION-INSTRUCTIONS.txt"
echo ## How to use this portable version >> "%dist_dir%\INSTALLATION-INSTRUCTIONS.txt"
echo. >> "%dist_dir%\INSTALLATION-INSTRUCTIONS.txt"
echo 1. Extract this folder to any location on your computer >> "%dist_dir%\INSTALLATION-INSTRUCTIONS.txt"
echo 2. Double-click "Launch-AkashShare.bat" to start the application >> "%dist_dir%\INSTALLATION-INSTRUCTIONS.txt"
echo 3. The application will run directly without installation >> "%dist_dir%\INSTALLATION-INSTRUCTIONS.txt"
echo. >> "%dist_dir%\INSTALLATION-INSTRUCTIONS.txt"
echo ## Notes >> "%dist_dir%\INSTALLATION-INSTRUCTIONS.txt"
echo - This is a portable version that does not require installation >> "%dist_dir%\INSTALLATION-INSTRUCTIONS.txt"
echo - All application data will be stored in the application folder >> "%dist_dir%\INSTALLATION-INSTRUCTIONS.txt"
echo - To uninstall, simply delete the folder >> "%dist_dir%\INSTALLATION-INSTRUCTIONS.txt"

echo.
echo [SUCCESS] Portable distribution package created successfully!
echo Distribution files are located in: %dist_dir%
echo.
echo Package contents:
echo  - AkashShareApp\           (Main application files)
echo  - Launch-AkashShare.bat    (Application launcher)
echo  - INSTALLATION-INSTRUCTIONS.txt (Setup instructions)
echo  - README.md                (Project information)
echo  - LICENSE                  (License information)
echo.
echo To distribute to your friends:
echo 1. Compress the %dist_dir% folder into a ZIP file
echo 2. Share the ZIP file with your friends
echo 3. Your friends can extract and run Launch-AkashShare.bat to use the app
echo.
pause