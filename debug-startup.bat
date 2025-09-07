@echo off
echo ===========================================
echo    AkashShare Electron Debug Script
echo ===========================================
echo.

echo Step 1: Checking Node.js version...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js
    pause
    exit /b 1
)

echo.
echo Step 2: Checking npm version...
npm --version
if errorlevel 1 (
    echo ERROR: npm not found
    pause
    exit /b 1
)

echo.
echo Step 3: Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo.
echo Step 4: Starting Electron app with debug info...
echo Backend will auto-start with Electron
echo MongoDB Atlas connection will be established
echo.

npm run electron

echo.
echo Electron app closed. Check console for any errors.
pause
