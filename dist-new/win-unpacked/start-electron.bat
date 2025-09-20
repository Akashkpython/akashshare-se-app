@echo off
echo Starting Akash Share Electron App...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Navigate to project root
cd /d "%~dp0"

REM Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Please ensure you are in the correct project directory
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start the Electron app
echo Starting Electron application...
echo.

npm run electron

echo.
echo Electron app closed.
pause