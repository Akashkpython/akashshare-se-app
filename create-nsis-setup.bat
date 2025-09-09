@echo off
cd /d "%~dp0"
echo ========================================
echo    AKASH SHARE - NSIS INSTALLER BUILDER
echo ========================================
echo.

echo 🚀 Creating Professional Windows Installer with NSIS...
echo.

echo Step 1: Checking prerequisites...
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found

REM Check if npm is installed
where npm >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed or not in PATH!
    echo Please install npm (comes with Node.js)
    pause
    exit /b 1
)
echo ✅ npm found

REM Check if NSIS is installed
set "NSIS_PATH=%~dp0NSIS\makensis.exe"
if exist "%NSIS_PATH%" (
    echo ✅ NSIS found in project directory
    set "NSIS_AVAILABLE=1"
) else (
    where makensis >nul 2>&1
    if errorlevel 1 (
        echo ❌ NSIS is not installed or not in PATH!
        echo Please install NSIS from https://nsis.sourceforge.io/Download
        echo Or place NSIS in the project's NSIS folder
        pause
        exit /b 1
    )
    echo ✅ NSIS found in system PATH
    set "NSIS_AVAILABLE=1"
)

REM Check if electron-builder is installed
npm list electron-builder >nul 2>&1
if errorlevel 1 (
    echo ❌ electron-builder is not installed!
    echo Installing electron-builder...
    npm install electron-builder --save-dev
    if errorlevel 1 (
        echo ❌ Failed to install electron-builder!
        pause
        exit /b 1
    )
)
echo ✅ electron-builder found

echo.
echo Step 2: Checking icon setup...
if not exist "build-resources\icon.ico" (
    echo ⚠️  Warning: build-resources\icon.ico not found!
    echo.
    echo 📝 To create the ICO file:
    echo    1. Go to https://convertio.co/png-ico/
    echo    2. Upload build-resources\icon.png
    echo    3. Select sizes: 16, 32, 48, 64, 128, 256
    echo    4. Download and save as build-resources\icon.ico
    echo.
    echo 🔄 Using PNG icon as fallback...
) else (
    echo ✅ Icon file found
)

echo.
echo Step 3: Building the installer...
echo 📦 This will:
echo    - Build the React app
echo    - Package the Electron app
echo    - Create NSIS installer
echo    - Generate "Akash Share Setup.exe"
echo.

echo 🚀 Starting build process...
echo.

REM Run the build command
call npm run build:win

if errorlevel 1 (
    echo.
    echo ❌ Build failed! Check the error messages above.
    echo.
    echo 🔧 Common solutions:
    echo    1. Make sure all dependencies are installed: npm install
    echo    2. Check that the React app builds: npm run build
    echo    3. Verify electron-builder configuration
    echo    4. Ensure NSIS is properly installed
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    🎉 INSTALLER BUILD COMPLETE!
echo ========================================
echo.

REM Check if the installer was created
REM Verify installer artifact exists
dir /b "dist\*.exe" | findstr /i "Akash Share Setup" >nul 2>&1
if not errorlevel 1 (
    echo ✅ Professional installer created successfully!
    echo.
    echo 📁 Installer location: dist\
    echo 📊 Installer files:
    dir "dist\Akash Share Setup*.exe" /b
    echo.
    echo 🚀 Your professional Akash Share installer is ready!
    echo.
    echo 📋 Features included:
    echo    - Professional NSIS installer
    echo    - Desktop shortcut
    echo    - Start Menu shortcut
    echo    - Add/Remove Programs integration
    echo    - Custom installation directory
    echo    - Uninstaller support
    echo    - Professional branding
    echo.
    echo 💡 To test the installer:
    echo    1. Run the Setup.exe file
    echo    2. Follow the installation wizard
    echo    3. Check that shortcuts are created
    echo    4. Verify it appears in Add/Remove Programs
    echo.
    echo 🎯 Professional naming: "Akash Share Setup 1.0.5.exe"
    echo    (Like VS Code, Discord, and other professional apps)
) else (
    echo ❌ Installer not found in dist\ directory!
    echo.
    echo 🔧 Troubleshooting:
    echo    1. Check the build output above for errors
    echo    2. Verify electron-builder configuration
    echo    3. Ensure all dependencies are installed
    echo    4. Check that the React app builds successfully
)

echo.
echo Press any key to continue...
pause