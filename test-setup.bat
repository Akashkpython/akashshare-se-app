@echo off
title Testing Akash Share Setup
color 0E

echo.
echo ========================================
echo    TESTING AKASH SHARE SETUP
echo ========================================
echo.

REM Check if dist folder exists
if not exist "dist" (
    echo ERROR: dist folder not found
    echo Please run create-setup.bat first
    pause
    exit /b 1
)

REM Check if setup.exe exists
if not exist "dist\AkashShare-1.0.5-Setup.exe" (
    echo ERROR: Setup.exe not found in dist folder
    echo Please run create-setup.bat first
    pause
    exit /b 1
)

echo Setup.exe found: dist\AkashShare-1.0.5-Setup.exe
echo.
echo Testing the setup file...
echo.

REM Run the setup file
start "" "dist\AkashShare-1.0.5-Setup.exe"

echo.
echo Setup.exe launched!
echo.
echo The installer should open and guide you through:
echo 1. Installing Akash Share
echo 2. Creating desktop shortcut
echo 3. Adding to Start Menu
echo 4. Auto-starting backend server and WebSocket
echo.
echo After installation, you can find the app in:
echo - Desktop shortcut
echo - Start Menu > Akash Share
echo - Program Files > Akash Share
echo.
pause

