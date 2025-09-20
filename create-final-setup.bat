@echo off
echo ========================================
echo    CREATING FINAL AKASH SHARE SETUP.EXE
echo ========================================

echo 1. Cleaning previous builds...
if exist "dist" rmdir /s /q "dist"
echo ✅ Cleaned previous builds.

echo 2. Building React frontend...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ React build failed.
    exit /b %errorlevel%
)
echo ✅ React frontend built.

echo 3. Copying Electron files...
if not exist "build" mkdir "build"
copy "electron\main.js" "build\main.js"
copy "electron\preload.js" "build\preload.js"
if %errorlevel% neq 0 (
    echo ❌ Electron copy failed.
    exit /b %errorlevel%
)
echo ✅ Electron files copied.

echo 4. Copying backend files to build directory...
if not exist "build\backend" mkdir "build\backend"
copy "backend\working-backend.js" "build\backend\"
copy "backend\package.json" "build\backend\"
if %errorlevel% neq 0 (
    echo ❌ Backend files copy failed.
    exit /b %errorlevel%
)
echo ✅ Backend files copied to build.

echo 5. Creating setup.exe with electron-builder (simplified config)...
call electron-builder --win --config.nsis.perMachine=false --config.nsis.oneClick=false --publish=never
if %errorlevel% neq 0 (
    echo ❌ Electron builder failed.
    exit /b %errorlevel%
)
echo ✅ Setup.exe created successfully!

echo 6. Checking setup.exe size...
for %%A in ("dist\AkashShare-1.0.5-Setup.exe") do echo Setup.exe size: %%~zA bytes

echo ========================================
echo    FINAL SETUP.EXE CREATION COMPLETE
echo ========================================
echo The setup.exe is located in the 'dist' folder.
echo This installer includes:
echo - Complete Electron application
echo - Backend server with WebSocket
echo - Auto-start batch files
echo - All necessary dependencies
echo ========================================
pause
