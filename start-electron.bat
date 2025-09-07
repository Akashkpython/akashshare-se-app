@echo off
echo ===============================================
echo          AkashShare Electron Launcher
echo ===============================================
echo.

REM Check Node.js installation
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is required but not installed!
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version: 
node --version

REM Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting AkashShare Electron App...
echo - Backend auto-starts on localhost:5002
echo - MongoDB Atlas cloud database
echo - WebSocket chat available
echo - Window controls enabled
echo.

npm run electron

echo.
echo Application closed.
pause
