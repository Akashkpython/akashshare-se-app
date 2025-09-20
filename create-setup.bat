@echo off
title Creating Akash Share Setup.exe
color 0B

echo.
echo ========================================
echo    CREATING AKASH SHARE SETUP.EXE
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [2/4] Building React application...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build React application
    pause
    exit /b 1
)

echo [3/4] Copying backend files to build directory...
if not exist "build\backend" mkdir "build\backend"
xcopy /E /I /Y "backend\*" "build\backend\"
if %errorlevel% neq 0 (
    echo ERROR: Failed to copy backend files
    pause
    exit /b 1
)

echo [4/4] Creating Electron setup.exe...
call npm run build:win:custom
if %errorlevel% neq 0 (
    echo ERROR: Failed to create setup.exe
    pause
    exit /b 1
)

echo.
echo ========================================
echo    SETUP.EXE CREATED SUCCESSFULLY!
echo ========================================
echo.
echo Setup file location: dist\AkashShare-1.0.5-Setup.exe
echo.
echo The setup.exe will:
echo - Install Akash Share application
echo - Auto-start backend server and WebSocket
echo - Create desktop shortcut
echo - Add to Start Menu
echo.
echo You can now distribute this setup.exe file!
echo.
pause

