@echo off
echo ========================================
echo    AKASH SHARE - NSIS INSTALLER CREATOR
echo ========================================
echo.

echo 🚀 Creating NSIS Windows Installer for Akash Share...
echo.

echo Step 1: Checking if NSIS is installed...
where makensis >nul 2>&1
if errorlevel 1 (
    echo ❌ NSIS is not installed or not in PATH!
    echo.
    echo 📥 Please install NSIS from: https://nsis.sourceforge.io/Download
    echo    After installation, add NSIS to your system PATH
    echo.
    echo 🔧 Alternative: Download portable NSIS and run makensis.exe directly
    echo.
    pause
    exit /b 1
)

echo ✅ NSIS found!

echo.
echo Step 2: Checking if portable app exists...
if not exist "dist\Akash Share-win32-x64\Akash Share.exe" (
    echo ❌ Portable app not found! Creating it first...
    echo.
    echo 🔨 Building React app...
    npm run build
    
    echo 📦 Creating portable app...
    npx electron-packager . "Akash Share" --platform=win32 --arch=x64 --out=dist --overwrite --asar --icon=public/Akashshareicon.png
    
    if not exist "dist\Akash Share-win32-x64\Akash Share.exe" (
        echo ❌ Failed to create portable app!
        pause
        exit /b 1
    )
)

echo ✅ Portable app found!

echo.
echo Step 3: Compiling NSIS installer...
echo 🏗️ Creating Windows installer...
echo.

REM Compile the NSIS script
makensis akash-share-installer.nsi

echo.
echo ========================================
echo    🎉 INSTALLER CREATED!
echo ========================================
echo.

if exist "dist\Akash Share Setup.exe" (
    echo ✅ Setup.exe created successfully!
    echo.
    echo 📁 Output file: dist\Akash Share Setup.exe
    echo.
    echo 📊 File size:
    for %%f in ("dist\Akash Share Setup.exe") do echo    %%~zf bytes
    echo.
    echo 🚀 Your Akash Share installer is ready for distribution!
    echo.
    echo 📋 Installation includes:
    echo    - Desktop shortcut
    echo    - Start menu shortcut
    echo    - Add/Remove Programs entry
    echo    - Application data directory
    echo    - Uninstaller
    echo.
    echo 💡 To install: Run "Akash Share Setup.exe"
    echo 💡 To distribute: Share the setup.exe file
    echo.
    echo 🎯 Features:
    echo    - Administrator installation
    echo    - Proper Windows integration
    echo    - Clean uninstallation
    echo    - Application data management
) else (
    echo ❌ Setup.exe creation failed!
    echo.
    echo 🔧 Troubleshooting:
    echo    1. Ensure NSIS is properly installed
    echo    2. Check that makensis.exe is in PATH
    echo    3. Verify the NSIS script syntax
    echo    4. Check for any error messages above
)

echo.
echo Press any key to continue...
pause
