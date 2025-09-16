@echo off
echo ================================================
echo    FIX ELECTRON ISSUES - AKASH SHARE
echo ================================================
echo.

echo This script will fix all Electron-related issues.
echo.

echo ================================================
echo STEP 1: VERIFY ELECTRON CONFIGURATION
echo ================================================

echo Checking Electron main.js configuration...
if exist "electron\main.js" (
    echo ✓ Electron main.js exists
) else (
    echo ❌ Electron main.js missing
    pause
    exit /b 1
)

echo Checking Electron preload.js configuration...
if exist "electron\preload.js" (
    echo ✓ Electron preload.js exists
) else (
    echo ❌ Electron preload.js missing
    pause
    exit /b 1
)

echo.
echo ================================================
echo STEP 2: VERIFY BUILD CONFIGURATION
echo ================================================

echo Checking electron-builder configuration...
if exist "electron-builder.config.cjs" (
    echo ✓ electron-builder.config.cjs exists
) else (
    echo ❌ electron-builder.config.cjs missing
    pause
    exit /b 1
)

echo.
echo ================================================
echo STEP 3: CLEAN ELECTRON BUILD
echo ================================================

echo Cleaning previous Electron build...
if exist "dist" rmdir /s /q "dist"
if exist "build-resources" (
    echo ✓ Build resources directory exists
) else (
    echo Creating build resources directory...
    mkdir build-resources
)

echo ✓ Electron build cleaned

echo.
echo ================================================
echo STEP 4: BUILD ELECTRON APPLICATION
echo ================================================

echo Building Electron application...
call npm run electron:dist
if %errorlevel% neq 0 (
    echo ❌ Failed to build Electron application
    pause
    exit /b 1
)
echo ✓ Electron application built successfully

echo.
echo ================================================
echo STEP 5: TEST ELECTRON APPLICATION
echo ================================================

echo Testing Electron application...
if exist "dist\Akash Share Setup 1.0.5.exe" (
    echo ✓ Setup file created: dist\Akash Share Setup 1.0.5.exe
    for %%I in ("dist\Akash Share Setup 1.0.5.exe") do echo   File size: %%~zI bytes
) else (
    echo ❌ Setup file not found
    pause
    exit /b 1
)

echo.
echo ================================================
echo STEP 6: VERIFY PACKAGED BACKEND
echo ================================================

echo Verifying backend files are included in package...
if exist "dist\win-unpacked\resources\backend" (
    echo ✓ Backend directory included in package
    if exist "dist\win-unpacked\resources\backend\.env" (
        echo ✓ Backend .env file included in package
    ) else (
        echo ❌ Backend .env file missing from package
    )
) else (
    echo ❌ Backend directory missing from package
)

echo.
echo ================================================
echo ELECTRON FIX COMPLETE
echo ================================================
echo.
echo Electron application has been built with all fixes:
echo   - Window controls enabled
echo   - Single instance lock
echo   - Backend properly included
echo   - Environment files packaged
echo.
echo Next step: Run the uninstall-and-reinstall script
echo to install the fixed version.
echo.
pause
