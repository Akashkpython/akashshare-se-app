@echo off
echo Starting Akash Share Application...
echo.

cd /d "%~dp0"

REM Kill any existing processes
echo Cleaning up existing processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM electron.exe 2>nul

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start backend first
echo Starting backend server...
cd backend
start "Akash Share Backend" /min node file-upload-backend.js

REM Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Go back to root directory
cd ..

REM Start Electron app
echo Starting Electron application...
set NODE_ENV=production
start "Akash Share" electron .

echo.
echo ✅ Akash Share application started!
echo 🌐 Backend: http://127.0.0.1:5005
echo 📱 Frontend: Electron App
echo.
echo The application should open automatically.
echo Press any key to exit this window...
pause >nul
