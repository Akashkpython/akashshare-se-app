@echo off
echo ========================================
echo    Akash Share Setup.exe Creator
echo ========================================
echo.

REM Check if PowerShell is available
powershell -Command "Get-Host" >nul 2>&1
if errorlevel 1 (
    echo ❌ PowerShell is not available
    echo Please use build-setup-exe.bat instead
    pause
    exit /b 1
)

echo ✅ PowerShell is available
echo.

REM Run the PowerShell build script
echo 🚀 Starting build process...
powershell -ExecutionPolicy Bypass -File "build-and-test-setup.ps1"

echo.
echo Build process completed.
pause