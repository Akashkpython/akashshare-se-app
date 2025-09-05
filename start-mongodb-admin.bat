@echo off
echo ==========================================
echo     MongoDB Administrator Startup
echo ==========================================
echo.

echo Requesting administrator privileges...
echo This will start MongoDB service properly.
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Running with administrator privileges
    echo.
    echo Starting MongoDB service...
    net start MongoDB
    if %errorLevel% == 0 (
        echo ✅ MongoDB started successfully!
        echo.
        echo You can now run your application:
        echo   1. Run start-dev-checked.bat
        echo   2. Or manually: cd backend && npm start
    ) else (
        echo ❌ Failed to start MongoDB service
        echo.
        echo Alternative: Manual MongoDB startup
        echo Try running: mongod --dbpath "C:\data\db"
    )
) else (
    echo ❌ This script requires administrator privileges
    echo.
    echo Right-click this file and select "Run as administrator"
    echo OR
    echo Open Command Prompt as Administrator and run: net start MongoDB
)

echo.
pause