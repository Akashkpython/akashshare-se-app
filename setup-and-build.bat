@echo off
REM Build and Setup Script for Akash Share
REM Ensures proper backend configuration before building

echo ================================
echo Akash Share Build and Setup
echo ================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo Error: package.json not found
    echo Please run this script from the project root directory
    exit /b 1
)

REM Step 1: Verify backend .env file
echo [1/6] Verifying backend environment configuration...
if exist "backend\.env" (
    echo ✅ Backend .env file found
    echo    Checking for required variables...
    
    REM Check for MONGO_URI
    findstr /C:"MONGO_URI=" "backend\.env" >nul
    if errorlevel 1 (
        echo ❌ MONGO_URI not found in .env file
        exit /b 1
    ) else (
        echo ✅ MONGO_URI found
    )
    
    REM Check for JWT_SECRET
    findstr /C:"JWT_SECRET=" "backend\.env" >nul
    if errorlevel 1 (
        echo ❌ JWT_SECRET not found in .env file
        exit /b 1
    ) else (
        echo ✅ JWT_SECRET found
    )
) else (
    echo ❌ Backend .env file not found
    echo Please create a .env file in the backend directory with MONGO_URI and JWT_SECRET
    exit /b 1
)

REM Step 2: Install backend dependencies
echo [2/6] Installing backend dependencies...
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    npm install
    if errorlevel 1 (
        echo Error: Failed to install backend dependencies
        cd ..
        exit /b 1
    )
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend dependencies already installed
)
cd ..

REM Step 3: Build React app
echo [3/6] Building React application...
npm run build
if errorlevel 1 (
    echo Error: React build failed
    exit /b 1
)
echo ✅ React application built successfully

REM Step 4: Copy Electron files
echo [4/6] Copying Electron files...
npm run electron:copy
if errorlevel 1 (
    echo Error: Failed to copy Electron files
    exit /b 1
)
echo ✅ Electron files copied successfully

REM Step 5: Clean up unnecessary files to reduce installer size
echo [5/6] Optimizing build...
if exist "build\backend\node_modules" (
    rmdir /s /q "build\backend\node_modules"
    echo ✅ Removed backend node_modules from build
)
if exist "build\backend\uploads" (
    rmdir /s /q "build\backend\uploads"
    mkdir "build\backend\uploads"
    echo ✅ Cleaned backend uploads directory
)

REM Step 6: Create installer
echo [6/6] Creating professional installer...
npx electron-builder --config professional-builder.config.js
if errorlevel 1 (
    echo Error: Failed to create installer
    exit /b 1
)

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
echo To install, simply run dist\AkashShareUserSetup-x64.exe
echo.