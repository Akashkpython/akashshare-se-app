@echo off
echo ================================================
echo    FIX BACKEND ISSUES - AKASH SHARE
echo ================================================
echo.

echo This script will fix all backend-related issues.
echo.

echo ================================================
echo STEP 1: VERIFY BACKEND ENVIRONMENT
echo ================================================

echo Checking backend .env file...
if exist "backend\.env" (
    echo ✓ Backend .env file exists
    type backend\.env
) else (
    echo ❌ Backend .env file missing - creating it...
    echo NODE_ENV=production > backend\.env
    echo HOST=0.0.0.0 >> backend\.env
    echo PORT=5004 >> backend\.env
    echo MONGO_URI=mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/?retryWrites=true^&w=majority^&appName=akashshare >> backend\.env
    echo JWT_SECRET=f8e7d6c5b4a39281706f5e4d3c2b1a0987654321fedcba0987654321fedcba0987654321fedcba09 >> backend\.env
    echo START_SERVER=true >> backend\.env
    echo ✓ Backend .env file created
)

echo.
echo ================================================
echo STEP 2: INSTALL BACKEND DEPENDENCIES
echo ================================================

echo Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
echo ✓ Backend dependencies installed

echo.
echo ================================================
echo STEP 3: TEST MONGODB CONNECTION
echo ================================================

echo Testing MongoDB connection...
node test-mongo-atlas.js
if %errorlevel% neq 0 (
    echo ⚠️ MongoDB connection test failed, but continuing...
) else (
    echo ✓ MongoDB connection successful
)

echo.
echo ================================================
echo STEP 4: START BACKEND SERVER
echo ================================================

echo Starting backend server...
echo This will run in the background...
start /b npm start

echo Waiting for server to start...
timeout /t 5 >nul

echo Testing server health...
curl -s http://localhost:5004/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Backend server is running and healthy
) else (
    echo ❌ Backend server health check failed
    echo Trying alternative test...
    powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:5004/health' -UseBasicParsing | Out-Null; Write-Host '✓ Backend server is running' } catch { Write-Host '❌ Backend server not responding' }"
)

cd ..

echo.
echo ================================================
echo BACKEND FIX COMPLETE
echo ================================================
echo.
echo Backend server should now be running on port 5004.
echo Check the backend window for any error messages.
echo.
pause
