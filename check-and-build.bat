@echo off
REM Check Build Status and Create Installer for Akash Share

echo ================================
echo Akash Share Build Status Check
echo ================================
echo.

REM Check if build directory exists
if not exist "build" (
    echo ❌ Error: Build directory not found
    echo Please run "npm run build" first
    exit /b 1
)

REM Check if index.html exists in build directory
if not exist "build\index.html" (
    echo ❌ Error: React build not found
    echo Please run "npm run build" first
    exit /b 1
)

echo ✅ React build found

REM Check if backend directory exists in build
if not exist "build\backend" (
    echo ❌ Error: Backend directory not found in build
    echo Running electron:copy script...
    npm run electron:copy
    if errorlevel 1 (
        echo ❌ Error: Failed to copy Electron files
        exit /b 1
    )
)

echo ✅ Backend files found

REM Check if .env file exists in build\backend
if not exist "build\backend\.env" (
    echo ❌ Error: .env file not found in build\backend
    echo Copying .env file...
    if exist "backend\.env" (
        copy "backend\.env" "build\backend\.env"
        echo ✅ .env file copied to build\backend
    ) else (
        echo ❌ Error: .env file not found in backend directory
        exit /b 1
    )
) else (
    echo ✅ .env file found in build\backend
)

REM Clean previous installer
if exist "dist\AkashShareUserSetup-x64.exe" (
    del "dist\AkashShareUserSetup-x64.exe"
    echo ✅ Previous installer removed
)

REM Create dist directory if it doesn't exist
if not exist "dist" mkdir "dist"

REM Build installer with minimal configuration
echo.
echo [1/2] Creating installer with minimal configuration...
npx electron-builder --config minimal-builder.config.js
if errorlevel 1 (
    echo ❌ Error: Failed to create installer
    exit /b 1
)

REM Check if installer was created
if exist "dist\AkashShareUserSetup-x64.exe" (
    echo [2/2] Installer created successfully!
    echo.
    echo ================================
    echo Build completed successfully!
    echo ================================
    echo.
    echo Installer location: dist\AkashShareUserSetup-x64.exe
    echo.
    echo Features:
    echo  - No admin rights required
    echo  - Installs to user directory
    echo  - Creates desktop and start menu shortcuts
    echo  - Professional uninstaller included
    echo  - Includes your updated MongoDB and JWT configuration
    echo.
    echo To install, simply run:
    echo   dist\AkashShareUserSetup-x64.exe
    echo.
) else (
    echo ❌ Error: Installer was not created
    echo Please check the electron-builder output above for errors
    exit /b 1
)