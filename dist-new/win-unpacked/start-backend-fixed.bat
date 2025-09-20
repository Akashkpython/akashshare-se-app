@echo off
echo Starting Akash Share Backend Server...
echo.

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Navigate to backend directory (try multiple possible locations)
if exist "%SCRIPT_DIR%backend\working-backend.js" (
    cd /d "%SCRIPT_DIR%backend"
) else if exist "%SCRIPT_DIR%..\backend\working-backend.js" (
    cd /d "%SCRIPT_DIR%..\backend"
) else if exist "%SCRIPT_DIR%resources\backend\working-backend.js" (
    cd /d "%SCRIPT_DIR%resources\backend"
) else (
    echo ERROR: Backend files not found
    echo Looking in: %SCRIPT_DIR%
    echo Please ensure backend files are in the correct location
    pause
    exit /b 1
)

REM Check if backend files exist
if not exist "working-backend.js" (
    echo ERROR: working-backend.js not found
    echo Current directory: %CD%
    echo Please ensure backend files are in the correct location
    pause
    exit /b 1
)

REM Kill any existing Node.js processes on port 5005
echo Checking for existing processes on port 5005...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5005') do (
    echo Killing process %%a
    taskkill /F /PID %%a >nul 2>&1
)

REM Start the backend server
echo Starting backend server on port 5005...
echo Backend URL: http://localhost:5005
echo WebSocket URL: ws://localhost:5005/chat
echo.
echo Press Ctrl+C to stop the server
echo.

node file-upload-backend.js

echo.
echo Backend server stopped.
pause
