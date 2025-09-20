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

REM Try multiple possible backend locations
echo Looking for backend files...
set "BACKEND_FOUND=0"

if exist "%SCRIPT_DIR%backend\working-backend.js" (
    set "BACKEND_DIR=%SCRIPT_DIR%backend"
    set "BACKEND_FOUND=1"
    echo Found backend in: %SCRIPT_DIR%backend
) else if exist "%SCRIPT_DIR%..\backend\working-backend.js" (
    set "BACKEND_DIR=%SCRIPT_DIR%..\backend"
    set "BACKEND_FOUND=1"
    echo Found backend in: %SCRIPT_DIR%..\backend
) else if exist "%SCRIPT_DIR%resources\backend\working-backend.js" (
    set "BACKEND_DIR=%SCRIPT_DIR%resources\backend"
    set "BACKEND_FOUND=1"
    echo Found backend in: %SCRIPT_DIR%resources\backend
) else (
    echo ERROR: Backend files not found!
    echo Looking in: %SCRIPT_DIR%
    echo Please ensure backend files are installed correctly.
    pause
    exit /b 1
)

REM Start backend server
echo [1/2] Starting Backend Server...
cd /d "%BACKEND_DIR%"
start "Akash Share Backend" /min cmd /c "cd /d \"%BACKEND_DIR%\" && node working-backend.js"

REM Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 8 /nobreak >nul

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
cd /d "%SCRIPT_DIR%"
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
