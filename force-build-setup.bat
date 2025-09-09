@echo off
cd /d "%~dp0"
echo ========================================
echo    AKASH SHARE - FORCE BUILD SETUP.EXE
echo ========================================
echo.

echo 🚀 Force creating Windows Setup.exe for Akash Share...
echo.

echo Step 1: Force killing ALL related processes...
taskkill /f /im "electron.exe" >nul 2>&1
taskkill /f /im "Akash Share.exe" >nul 2>&1
taskkill /f /im "node.exe" >nul 2>&1
taskkill /f /im "app-builder.exe" >nul 2>&1
taskkill /f /im "npm.exe" >nul 2>&1

echo Step 2: Waiting for all processes to close...
timeout /t 5 /nobreak >nul

echo Step 3: Force removing ALL build directories...
if exist "dist" (
    echo 🗑️ Force removing dist directory...
    rmdir /s /q "dist" >nul 2>&1
)

if exist "build" (
    echo 🗑️ Force removing build directory...
    rmdir /s /q "build" >nul 2>&1
)

echo Step 4: Waiting for file system to clear...
timeout /t 3 /nobreak >nul

echo Step 5: Building React app...
echo 🔨 Building React app for production...
call npm run build
if errorlevel 1 (
    echo ❌ React build failed!
    pause
    exit /b 1
)

if not exist "build\index.html" (
    echo ❌ React build failed! No index.html found.
    pause
    exit /b 1
)

echo ✅ React build completed successfully!

echo.
echo Step 6: Copying Electron files...
echo 📋 Copying required files for packaging...
call npm run electron:copy
if errorlevel 1 (
    echo ❌ electron:copy failed!
    pause
    exit /b 1
)

echo.
echo Step 7: Creating Windows Setup.exe with force flag...
echo 🏗️ Building Windows installer with electron-builder...
echo.

REM Set environment variables for build
set NODE_ENV=production
set GENERATE_SOURCEMAP=false
set CSC_IDENTITY_AUTO_DISCOVERY=false

REM Try to build with electron-builder using force flag
echo Attempting to create setup.exe with force flag...
call npx electron-builder --win --publish=never
if errorlevel 1 (
    echo ❌ electron-builder failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo    🎉 BUILD COMPLETE!
echo ========================================
echo.

if exist "dist\*.exe" (
    echo ✅ Setup.exe created successfully!
    echo.
    echo 📁 Output files in dist/ directory:
    for %%f in (dist\*.exe) do (
        echo    - %%~nxf
    )
    echo.
    echo 🚀 Your Akash Share setup.exe is ready for distribution!
    echo.
    echo 📋 Installation includes:
    echo    - Desktop shortcut
    echo    - Start menu shortcut
    echo    - Automatic backend server startup
    echo    - WebSocket chat functionality
    echo    - File sharing capabilities
    echo.
    echo 💡 To install: Run the setup.exe file
    echo 💡 To distribute: Share the setup.exe file
) else (
    echo ❌ Setup.exe creation failed!
    echo.
    echo 🔧 Manual approach:
    echo    1. Close all applications
    echo    2. Restart your computer
    echo    3. Run this script again
    echo.
    echo 🔧 Alternative: Use electron-packager instead
    echo    npx electron-packager . "Akash Share" --platform=win32 --arch=x64 --out=dist
)

echo.
echo Press any key to continue...
pause
