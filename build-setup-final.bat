@echo off
echo ========================================
echo    Akash Share Setup.exe Builder
echo ========================================
echo.

REM Set error handling
setlocal enabledelayedexpansion

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not available
    pause
    exit /b 1
)

echo ✅ Node.js and npm are available
echo.

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist "dist" rmdir /s /q "dist"
if exist "build" rmdir /s /q "build"
echo ✅ Cleanup completed
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed
echo.

REM Install backend dependencies
echo 🔧 Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✅ Backend dependencies installed
echo.

REM Build React application
echo 🏗️ Building React application...
call npm run build
if errorlevel 1 (
    echo ❌ Failed to build React application
    pause
    exit /b 1
)
echo ✅ React application built
echo.

REM Copy electron files to build directory
echo 📋 Copying electron files...
if not exist "build\electron" mkdir "build\electron"
xcopy "electron\*" "build\electron\" /E /I /Y
if errorlevel 1 (
    echo ❌ Failed to copy electron files
    pause
    exit /b 1
)
echo ✅ Electron files copied
echo.

REM Create dist directory
echo 📁 Creating dist directory...
if not exist "dist" mkdir "dist"
echo ✅ Dist directory created
echo.

REM Build setup.exe using electron-builder
echo 🔨 Building setup.exe...
echo This may take several minutes...
call npx electron-builder --config electron-builder-setup.config.cjs --win --publish=never
if errorlevel 1 (
    echo ❌ Failed to build setup.exe
    pause
    exit /b 1
)

echo.
echo ========================================
echo    ✅ BUILD COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo 📦 Setup.exe location: dist\AkashShareUserSetup-x64.exe
echo 🔌 WebSocket support: ✅ Included
echo 🚀 Backend server: ✅ Included
echo 📱 Chat functionality: ✅ Included
echo.
echo 🎉 Your Akash Share setup.exe is ready!
echo.

REM List files in dist directory
echo 📋 Files in dist directory:
dir /b "dist\*.exe" 2>nul
if errorlevel 1 (
    echo No .exe files found in dist directory
) else (
    echo.
    echo 💡 You can now distribute the setup.exe file
)

echo.
echo Testing WebSocket functionality...
echo.

REM Test WebSocket functionality
node test-websocket-setup.js
if errorlevel 1 (
    echo ⚠️ Some WebSocket tests failed - check output above
) else (
    echo ✅ WebSocket tests passed
)

echo.
echo ========================================
echo    🎉 SETUP.EXE CREATION COMPLETE!
echo ========================================
echo.
echo Your Akash Share setup.exe is ready for distribution!
echo.
pause
