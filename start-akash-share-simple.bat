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

REM Start backend server in a new window
echo [1/2] Starting Backend Server...
start "Akash Share Backend" /min cmd /c "cd /d \"%SCRIPT_DIR%\" && start-backend-fixed.bat"

REM Wait longer for backend to start
echo Waiting for backend to initialize (10 seconds)...
timeout /t 10 /nobreak >nul

REM Simple backend check
echo Checking if backend is running...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:5005/health' -UseBasicParsing | Out-Null; Write-Host 'SUCCESS: Backend is running!' } catch { Write-Host 'WARNING: Backend may not be ready yet, but continuing...' }"

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
