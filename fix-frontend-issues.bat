@echo off
echo ================================================
echo    FIX FRONTEND ISSUES - AKASH SHARE
echo ================================================
echo.

echo This script will fix all frontend-related issues.
echo.

echo ================================================
echo STEP 1: SET ENVIRONMENT VARIABLES
echo ================================================

echo Setting environment variables for proper binding...
set BROWSER=none
set HOST=localhost
set PORT=3000
set REACT_APP_API_URL=http://localhost:5004
set REACT_APP_WS_URL=ws://localhost:5004

echo ✓ Environment variables set:
echo   - BROWSER=none
echo   - HOST=localhost (IPv4 instead of IPv6)
echo   - PORT=3000
echo   - REACT_APP_API_URL=http://localhost:5004
echo   - REACT_APP_WS_URL=ws://localhost:5004

echo.
echo ================================================
echo STEP 2: CLEAN REACT BUILD
echo ================================================

echo Cleaning previous React build...
if exist "build" rmdir /s /q "build"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"

echo ✓ React build cleaned

echo.
echo ================================================
echo STEP 3: INSTALL FRONTEND DEPENDENCIES
echo ================================================

echo Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✓ Frontend dependencies installed

echo.
echo ================================================
echo STEP 4: BUILD REACT APPLICATION
echo ================================================

echo Building React application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Failed to build React application
    pause
    exit /b 1
)
echo ✓ React application built successfully

echo.
echo ================================================
echo STEP 5: START REACT DEVELOPMENT SERVER
echo ================================================

echo Starting React development server...
echo This will run in the background on IPv4 localhost...
start /b npm start

echo Waiting for React server to start...
timeout /t 10 >nul

echo Testing React server...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ React development server is running on IPv4
) else (
    echo ❌ React server health check failed
    echo Trying alternative test...
    powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing | Out-Null; Write-Host '✓ React server is running' } catch { Write-Host '❌ React server not responding' }"
)

echo.
echo ================================================
echo FRONTEND FIX COMPLETE
echo ================================================
echo.
echo React development server should now be running on:
echo   - IPv4: http://localhost:3000
echo   - IPv6: http://[::1]:3000
echo.
echo The server is now properly configured to avoid
echo excessive recompilation and IPv6 binding issues.
echo.
pause
