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

REM Start backend server in a new window
echo [1/2] Starting Backend Server...
start "Akash Share Backend" /min cmd /c "start-backend.bat"

REM Wait a moment for backend to start
echo Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

REM Start Electron app
echo [2/2] Starting Electron Application...
start "Akash Share App" cmd /c "start-electron.bat"

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

