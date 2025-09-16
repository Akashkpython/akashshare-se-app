@echo off

echo ==================================================
echo        Killing Electron Processes Only
echo ==================================================
echo.

:: Kill only Electron processes (safe for build process)
echo Killing Electron processes...
taskkill /f /im "Akash Share.exe" >nul 2>&1
taskkill /f /im "electron.exe" >nul 2>&1
taskkill /f /im "AkashShare.exe" >nul 2>&1

:: Kill React dev server processes
echo Killing React dev server processes...
taskkill /f /im "react-scripts.exe" >nul 2>&1

echo.
echo Process cleanup completed.
echo.
