@echo off
setlocal enabledelayedexpansion
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

REM Wait for backend to start with multiple checks
echo Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

REM Check backend status multiple times
echo Checking backend status...
for /L %%i in (1,1,5) do (
    echo Attempt %%i of 5...
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5005/health' -UseBasicParsing; Write-Host 'SUCCESS: Backend is running!' } catch { Write-Host 'Attempt %%i failed, retrying...' }" 2>nul
    if !errorlevel! equ 0 (
        echo Backend is ready!
        goto :backend_ready
    )
    timeout /t 2 /nobreak >nul
)

:backend_ready
echo Backend startup check complete.

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
