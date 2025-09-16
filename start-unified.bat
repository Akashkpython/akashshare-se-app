@echo off
echo ================================================
echo    Akash Share - Unified Startup
echo ================================================
echo.
echo This will start both frontend and backend together
echo with proper timing to avoid connection issues.
echo.

REM Kill any existing processes
echo [Step 1] Cleaning up existing processes...
taskkill /f /im node.exe >nul 2>&1
timeout /t 3 /nobreak > nul

REM Start React dev server
echo [Step 2] Starting React development server...
start "React Dev Server" cmd /k "npm start"

REM Wait for React server to be ready
echo [Step 3] Waiting for React server to be ready...
:wait_react
timeout /t 5 /nobreak > nul
curl -s http://localhost:5004 >nul 2>&1
if errorlevel 1 (
    echo Still waiting for React server...
    goto wait_react
)
echo React server is ready!

REM Start backend server
echo [Step 4] Starting backend server...
start "Backend Server" cmd /k "cd backend && node server.js"

REM Wait for backend server to be ready
echo [Step 5] Waiting for backend server to be ready...
:wait_backend
timeout /t 5 /nobreak > nul
curl -s http://localhost:5004/health >nul 2>&1
if errorlevel 1 (
    echo Still waiting for backend server...
    goto wait_backend
)
echo Backend server is ready!

REM Start Electron app
echo [Step 6] Starting Electron application...
npm run electron

echo.
echo ================================================
echo    All services started successfully!
echo ================================================
echo.
echo Services running:
echo - React Dev Server: http://localhost:5004
echo - Backend Server: http://localhost:5004
echo - Electron App: Running
echo.
pause
