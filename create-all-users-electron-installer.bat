@echo off
echo ========================================
echo    AKASH SHARE - ALL USERS INSTALLER
echo    (Using Electron-Builder)
echo ========================================
echo.

echo 🚀 Creating All-Users Windows Installer for Akash Share...
echo.

echo Step 1: Building React app...
echo 🔨 Building React app for production...
npm run build

if not exist "build\index.html" (
    echo ❌ React build failed! No index.html found.
    pause
    exit /b 1
)

echo ✅ React build completed successfully!

echo.
echo Step 2: Copying Electron files...
echo 📋 Copying required files for packaging...
npm run electron:copy

echo.
echo Step 3: Creating All-Users Setup.exe...
echo 🏗️ Building Windows installer with electron-builder...
echo.

REM Set environment variables for all-users installation
set NODE_ENV=production
set GENERATE_SOURCEMAP=false

REM Try to build with electron-builder for all users
echo Attempting to create all-users setup.exe...
npx electron-builder --publish=never --config.win.target=nsis --config.nsis.perMachine=true

echo.
echo ========================================
echo    🎉 ALL-USERS INSTALLER CREATED!
echo ========================================
echo.

if exist "dist\*.exe" (
    echo ✅ All-Users Setup.exe created successfully!
    echo.
    echo 📁 Output files in dist/ directory:
    for %%f in (dist\*.exe) do (
        echo    - %%~nxf
    )
    echo.
    echo 🚀 Your All-Users Akash Share installer is ready!
    echo.
    echo 📋 ALL-USERS INSTALLATION FEATURES:
    echo    ✅ Installs to Program Files (system-wide)
    echo    ✅ Desktop shortcut for all users
    echo    ✅ Start Menu shortcut for all users
    echo    ✅ Add/Remove Programs entry
    echo    ✅ Administrator privileges required
    echo    ✅ Per-machine installation
    echo    ✅ Proper Windows integration
    echo.
    echo 💡 TO INSTALL FOR ALL USERS:
    echo    1. Right-click the setup.exe file
    echo    2. Select "Run as administrator"
    echo    3. Follow the installation wizard
    echo    4. The app will be available to ALL users
    echo.
    echo 🔧 SYSTEM REQUIREMENTS:
    echo    - Windows 10/11 (64-bit)
    echo    - Administrator privileges
    echo    - 500MB free disk space
    echo    - Internet connection (for MongoDB Atlas)
    echo.
    echo 🎯 PERFECT FOR:
    echo    - Corporate environments
    echo    - Shared computers
    echo    - Multi-user systems
    echo    - System administrators
) else (
    echo ❌ All-Users Setup.exe creation failed!
    echo.
    echo 🔧 Troubleshooting:
    echo    1. Ensure all dependencies are installed
    echo    2. Check that React build completed successfully
    echo    3. Verify electron-builder is properly configured
    echo    4. Try running: npm run dist
    echo.
    echo 🔧 Alternative: Use the portable app instead
    echo    Location: dist\Akash Share-win32-x64\
)

echo.
echo Press any key to continue...
pause
