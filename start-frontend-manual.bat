@echo off
echo ===========================================
echo    AkashShare Frontend Manual Startup
echo ===========================================
echo.

echo Changing to project root directory...
cd /d "%~dp0"
if errorlevel 1 (
    echo ERROR: Could not change to project directory
    pause
    exit /b 1
)

echo Current directory: %CD%
echo.

echo Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo Starting frontend development server...
echo Frontend will be available at: http://localhost:3000
echo Make sure backend is running on: http://localhost:5002
echo.

call npm start

echo.
echo Frontend server stopped
pause
