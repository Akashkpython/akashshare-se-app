@echo off
cd /d "%~dp0"
echo ===============================================
echo          AkashShare Electron App
echo          Quick Start Launcher
echo ===============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js detected: 
node --version

echo.
echo Starting AkashShare Electron Application...
echo.

REM Start Electron app (auto-starts backend)
echo Starting Electron app with integrated backend...
npm run electron

echo.
echo Application closed.
pause
