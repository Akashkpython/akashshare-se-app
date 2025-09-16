@echo off
echo ================================================
echo    AKASH SHARE APP LAUNCHER (DEBUG MODE)
echo ================================================
echo.

echo This script will help launch the Akash Share app
echo and show any error messages.
echo.

REM Check if app is installed
if exist "%LOCALAPPDATA%\Programs\Akash Share\Akash Share.exe" (
    set "APP_PATH=%LOCALAPPDATA%\Programs\Akash Share\Akash Share.exe"
    set "APP_DIR=%LOCALAPPDATA%\Programs\Akash Share"
    echo ✓ App found at: %LOCALAPPDATA%\Programs\Akash Share\
) else if exist "%PROGRAMFILES%\Akash Share\Akash Share.exe" (
    set "APP_PATH=%PROGRAMFILES%\Akash Share\Akash Share.exe"
    set "APP_DIR=%PROGRAMFILES%\Akash Share"
    echo ✓ App found at: %PROGRAMFILES%\Akash Share\
) else if exist "%PROGRAMFILES(X86)%\Akash Share\Akash Share.exe" (
    set "APP_PATH=%PROGRAMFILES(X86)%\Akash Share\Akash Share.exe"
    set "APP_DIR=%PROGRAMFILES(X86)%\Akash Share"
    echo ✓ App found at: %PROGRAMFILES(X86)%\Akash Share\
) else (
    echo ❌ Akash Share app not found!
    echo Please install the app first using: dist\Akash Share Setup 1.0.5.exe
    pause
    exit /b 1
)

echo.
echo ================================================
echo CHECKING BACKEND CONFIGURATION
echo ================================================

if exist "%APP_DIR%\resources\backend\.env" (
    echo ✓ Backend .env file exists
) else (
    echo ❌ Backend .env file missing - this is likely the problem!
    echo Creating backend .env file...
    
    echo # Akash Share Backend Environment Configuration > "%APP_DIR%\resources\backend\.env"
    echo NODE_ENV=production >> "%APP_DIR%\resources\backend\.env"
    echo HOST=0.0.0.0 >> "%APP_DIR%\resources\backend\.env"
    echo PORT=5004 >> "%APP_DIR%\resources\backend\.env"
    echo MONGO_URI=mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/?retryWrites=true^&w=majority^&appName=akashshare >> "%APP_DIR%\resources\backend\.env"
    echo JWT_SECRET=f8e7d6c5b4a39281706f5e4d3c2b1a0987654321fedcba0987654321fedcba0987654321fedcba09 >> "%APP_DIR%\resources\backend\.env"
    echo START_SERVER=true >> "%APP_DIR%\resources\backend\.env"
    
    echo ✓ Backend .env file created
)

echo.
echo ================================================
echo LAUNCHING APPLICATION
echo ================================================

echo Starting Akash Share application...
echo Path: %APP_PATH%
echo.

REM Launch the app and capture any errors
"%APP_PATH%" 2>&1

echo.
echo ================================================
echo APPLICATION LAUNCH COMPLETE
echo ================================================
echo.

echo If the app didn't open, check:
echo 1. Is the backend server running on port 5004?
echo 2. Are there any error messages above?
echo 3. Try running as administrator
echo.

pause
