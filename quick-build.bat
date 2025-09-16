@echo off
REM Quick Build Script for Akash Share
REM Creates a streamlined installer

echo ================================
echo Akash Share Quick Build
echo ================================
echo.

REM Create dist directory
echo [1/4] Creating directories...
mkdir "dist" 2>nul

REM Clean up backend node_modules to reduce size
echo [2/4] Optimizing backend...
if exist "build\backend\node_modules" rmdir /s /q "build\backend\node_modules"
if exist "build\backend\uploads" rmdir /s /q "build\backend\uploads"
mkdir "build\backend\uploads"

REM Build with electron-builder using professional config
echo [3/4] Building installer...
npx electron-builder --config professional-builder.config.js
if errorlevel 1 (
    echo Error: Failed to create installer
    exit /b 1
)

REM Show result
echo [4/4] Finalizing...
if exist "dist\AkashShareUserSetup-x64.exe" (
    echo.
    echo ================================
    echo Build completed successfully!
    echo ================================
    echo.
    echo Installer created: dist\AkashShareUserSetup-x64.exe
    echo.
    echo Features:
    echo  - No admin rights required
    echo  - Installs to user directory
    echo  - Creates desktop and start menu shortcuts
    echo  - Professional uninstaller included
    echo.
) else (
    echo.
    echo Error: Installer was not created
    echo.
)