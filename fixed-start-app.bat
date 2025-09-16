@echo off
setlocal enabledelayedexpansion

echo ========================================
echo 🔧 Akash Share - Fixed Startup Script
echo ========================================

REM Kill any existing processes on port 5004 (backend)
echo 🔍 Checking for processes on port 5004...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5004') do (
    echo 🔧 Killing process %%a on port 5004
    taskkill /PID %%a /F >nul 2>&1
)

REM Kill any existing processes on port 3000 (frontend)
echo 🔍 Checking for processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo 🔧 Killing process %%a on port 3000
    taskkill /PID %%a /F >nul 2>&1
)

REM Kill any existing Electron processes
echo 🔍 Checking for existing Electron processes...
taskkill /IM electron.exe /F >nul 2>&1

echo 🔧 Waiting for ports to be freed...
timeout /t 3 /nobreak >nul

REM Start backend server with proper IPv4 binding
echo 🔧 Starting backend server with IPv4 binding...
cd backend
set HOST=0.0.0.0
set PORT=5004
start "Backend Server" /min cmd /c "node server.js"
cd ..

REM Wait for backend to start
echo 🔧 Waiting for backend to initialize...
timeout /t 8 /nobreak >nul

REM Check if backend is running
echo 🔧 Verifying backend health...
powershell -Command "$resp = try { Invoke-WebRequest -Uri 'http://localhost:5004/health' -UseBasicParsing -TimeoutSec 5 } catch { $null }; if ($resp -and $resp.StatusCode -eq 200) { Write-Output 'Backend is running'; exit 0 } else { Write-Output 'Backend failed to start'; exit 1 }"
if %errorlevel% neq 0 (
    echo ❌ Backend failed to start. Please check the logs.
    pause
    exit /b 1
)

echo ✅ Backend server is running successfully!

REM Start Electron app
echo 🔧 Starting Electron application...
npm run electron

echo 🎉 Akash Share started successfully!
echo.
echo 💡 If you encounter any issues:
echo    - Check that MongoDB is running
echo    - Verify your .env file in the backend directory
echo    - Ensure all dependencies are installed (npm install)
echo.
pause