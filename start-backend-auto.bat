@echo off
echo Starting Akash Share Backend Server...
echo.

cd /d "%~dp0"

REM Kill any existing backend processes
echo Cleaning up existing processes...
taskkill /F /IM node.exe 2>nul

REM Wait a moment
timeout /t 2 /nobreak >nul

REM Start the backend server
echo Starting backend server on port 5005...
cd backend
start "Akash Share Backend" /min echo Backend is now integrated into the Electron app

REM Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Test backend health
echo Testing backend health...
curl -s http://127.0.0.1:5005/health >nul
if %errorlevel% equ 0 (
    echo ✅ Backend server started successfully!
    echo 🌐 Backend running on: http://127.0.0.1:5005
    echo 📤 Upload endpoint: http://127.0.0.1:5005/upload
    echo 💬 WebSocket chat: ws://127.0.0.1:5005/chat
) else (
    echo ❌ Backend server failed to start
    echo Please check the backend logs
)

echo.
echo Press any key to continue...
pause >nul
