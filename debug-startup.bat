@echo off
echo ===========================================
echo    AkashShare Debug Startup Script
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
echo Step 3: Starting Backend Server...
echo Setting environment variables...
set MONGO_URI=mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/?retryWrites=true^&w=majority^&appName=akashshare
set JWT_SECRET=f8e7d6c5b4a39281706f5e4d3c2b1a0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba09
set NODE_ENV=development
set PORT=5002
set HOST=localhost

echo Starting backend in new window...
start "Backend Server" cmd /k "cd /d \"%~dp0backend\" && echo Backend starting... && node server.js"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Step 4: Starting Frontend Server...
echo Starting frontend in new window...
start "Frontend Server" cmd /k "cd /d \"%~dp0\" && echo Frontend starting... && npm start"

echo.
echo Both servers are starting in separate windows
echo Backend: http://localhost:5002
echo Frontend: http://localhost:3000
echo.
echo Check the separate windows for any errors
pause
