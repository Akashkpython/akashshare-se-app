@echo off
title Akash Share - Fixed Version

echo ========================================
echo   Akash Share - Fixed Version Launcher
echo ========================================
echo.

REM Check if the packaged application exists
if exist "dist-final\win-unpacked\Akash Share.exe" (
    echo Launching Akash Share...
    echo.
    start "" "dist-final\win-unpacked\Akash Share.exe"
    echo Application launched successfully!
    echo.
    echo The application window should now appear.
    echo If you don't see it, check your taskbar or press Alt+Tab.
    echo.
) else (
    echo ERROR: Packaged application not found!
    echo.
    echo Please ensure you have built the application using:
    echo npm run electron-build -- --win
    echo.
    echo Or check that the dist-final\win-unpacked directory exists.
    echo.
)

echo Press any key to close this window...
pause >nul