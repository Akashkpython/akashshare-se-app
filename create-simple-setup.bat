@echo off
echo =====================================
echo   AKASH SHARE - SIMPLE SETUP CREATOR
echo =====================================

echo Creating a simple portable setup...

REM Create output directory
if exist "AkashShare-Portable" rmdir /s /q "AkashShare-Portable"
mkdir "AkashShare-Portable"

echo Copying application files...

REM Copy essential files
if exist "build" (
    echo Copying build folder...
    xcopy "build" "AkashShare-Portable\build" /E /I /Y
) else (
    echo ERROR: Build folder not found. Run npm run build first.
    pause
    exit /b 1
)

REM Copy backend
if exist "backend" (
    echo Copying backend folder...
    xcopy "backend" "AkashShare-Portable\backend" /E /I /Y
)

REM Copy electron files
if exist "electron" (
    echo Copying electron folder...
    xcopy "electron" "AkashShare-Portable\electron" /E /I /Y
)

REM Copy essential config files
if exist "package.json" copy "package.json" "AkashShare-Portable\"
if exist "electron-builder.config.js" copy "electron-builder.config.js" "AkashShare-Portable\"

REM Create a launcher script
echo @echo off > "AkashShare-Portable\Start-AkashShare.bat"
echo echo Starting Akash Share... >> "AkashShare-Portable\Start-AkashShare.bat"
echo cd /d "%%~dp0" >> "AkashShare-Portable\Start-AkashShare.bat"
echo npm start >> "AkashShare-Portable\Start-AkashShare.bat"

REM Create README
echo AkAsH Share Portable Installation > "AkashShare-Portable\README.txt"
echo ================================= >> "AkashShare-Portable\README.txt"
echo. >> "AkashShare-Portable\README.txt"
echo 1. Install Node.js if not already installed >> "AkashShare-Portable\README.txt"
echo 2. Double-click Start-AkashShare.bat to run the application >> "AkashShare-Portable\README.txt"
echo 3. The application will start automatically >> "AkashShare-Portable\README.txt"

echo.
echo ✅ Portable package created in: AkashShare-Portable
echo.
echo To distribute:
echo 1. Zip the AkashShare-Portable folder
echo 2. Send the zip file to your other PC
echo 3. Extract and run Start-AkashShare.bat
echo.
pause