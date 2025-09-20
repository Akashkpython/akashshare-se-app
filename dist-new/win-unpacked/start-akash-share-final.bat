@echo off
title Akash Share - Starting Application
color 0A

echo.
echo ========================================
echo    AKASH SHARE - FILE SHARING APP
echo ========================================
echo.
echo Starting backend server and Electron app...
echo.

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"

REM Kill any existing Node.js processes
echo Cleaning up any existing processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start backend server in a new window
echo [1/2] Starting Backend Server...
start "Akash Share Backend" /min cmd /c "cd /d \"%SCRIPT_DIR%\" && start-backend-fixed.bat"

REM Wait for backend to start with multiple checks
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Check if backend is running
echo Checking backend status...
:check_backend
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5005/health' -UseBasicParsing; Write-Host 'SUCCESS: Backend is running!' } catch { Write-Host 'Backend not ready yet, waiting...' }" 2>nul
if %errorlevel% neq 0 (
    echo Backend not ready, waiting 3 more seconds...
    timeout /t 3 /nobreak >nul
    goto check_backend
)

echo Backend is ready!

REM Start Electron app
echo [2/2] Starting Electron Application...
start "Akash Share App" cmd /c "cd /d \"%SCRIPT_DIR%\" && start-electron.bat"

echo.
echo ========================================
echo    AKASH SHARE STARTED
echo ========================================
echo.
echo Backend Server: http://localhost:5005
echo WebSocket: ws://localhost:5005/chat
echo.
echo The application windows should open automatically.
echo Close this window when done.
echo.
pause
