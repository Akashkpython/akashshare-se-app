@echo off
echo ===============================================
echo          Akash Share Application
echo          Student PC Quick Start
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
echo Starting Akash Share servers...
echo.

REM Start backend server
echo [1/2] Starting Backend Server on port 5002...
cd backend
start "Akash Share Backend" cmd /k "echo Backend Server Starting... && node server.js"
cd ..

REM Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

REM Start frontend server
echo [2/2] Starting Frontend Server on port 3000...
start "Akash Share Frontend" cmd /k "echo Frontend Server Starting... && npm start"

echo.
echo ===============================================
echo    Application is starting up...
echo ===============================================
echo.
echo Backend API: http://localhost:5002
echo Frontend UI: http://localhost:3000
echo.
echo INSTRUCTIONS:
echo 1. Wait for both server windows to show "running" status
echo 2. Open your web browser 
echo 3. Go to: http://localhost:3000
echo 4. Start sharing files with 4-digit codes!
echo.
echo Features:
echo - Upload files up to 10MB
echo - Share with 4-digit codes
echo - Real-time group chat
echo - Automatic file cleanup (24 hours)
echo.
echo To stop the application: Close both server windows
echo.
pause
