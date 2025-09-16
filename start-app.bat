@echo off
echo ================================================
echo    Akash Share - Auto Start Application
echo ================================================
echo.
echo Starting Akash Share with synchronized startup...
echo.

REM Kill any existing processes first
echo [0/3] Cleaning up existing processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak > nul

REM Start React dev server in background
echo [1/3] Starting React development server...
start "React Dev Server" cmd /k "npm start"

REM Wait for React server to be ready
echo [2/3] Waiting for React server to be ready...
:wait_react
timeout /t 3 /nobreak > nul
curl -s http://localhost:5004 >nul 2>&1
if errorlevel 1 (
    echo Still waiting for React server...
    goto wait_react
)
echo React server is ready!

REM Start Electron app (which will auto-start backend)
echo [3/3] Starting Electron application with auto-backend...
npm run electron

echo.
echo ================================================
echo    Application started successfully!
echo ================================================
echo.
echo Features:
echo - Backend auto-starts with Electron
echo - File sharing ready
echo - Group chat ready
echo - No manual backend startup needed
echo.
pause
