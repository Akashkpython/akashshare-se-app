@echo off
echo ==================================================
echo Akash Share - Launch Packaged Application
echo ==================================================
echo.

echo [1/3] Checking if packaged application exists...
if not exist "dist\Akash Share Setup.exe" (
    echo ❌ Packaged application not found
    echo 🛠️  Please run 'build-complete-app.bat' first
    pause
    exit /b 1
)
echo ✅ Packaged application found

echo [2/3] Installing application...
dist\Akash Share Setup.exe
if %errorlevel% neq 0 (
    echo ❌ Application installation failed
    pause
    exit /b %errorlevel%
)
echo ✅ Application installed successfully

echo [3/3] Launching application...
echo 🚀 Starting Akash Share...
echo.
echo ==================================================
echo Application should now be running!
echo If it doesn't start, please check:
echo 1. Windows Defender or antivirus settings
echo 2. Windows Firewall settings
echo 3. Port 5002 availability
echo ==================================================
pause