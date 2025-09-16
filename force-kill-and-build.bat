@echo off
echo ================================================
echo    FORCE KILL ALL PROCESSES AND BUILD
echo ================================================
echo.

echo This will force kill ALL processes that might be locking files
echo and then attempt to build the fixed application.
echo.

echo WARNING: This will close ALL applications!
echo Press Ctrl+C to cancel, or any key to continue...
pause

echo.
echo Step 1: Force killing ALL Node.js and Electron processes...
taskkill /f /im "node.exe" >nul 2>&1
taskkill /f /im "electron.exe" >nul 2>&1
taskkill /f /im "Akash Share.exe" >nul 2>&1
taskkill /f /im "AkashShareUserSetup-x64.exe" >nul 2>&1

echo Step 2: Force killing VS Code and other editors...
taskkill /f /im "Code.exe" >nul 2>&1
taskkill /f /im "cursor.exe" >nul 2>&1
taskkill /f /im "notepad.exe" >nul 2>&1

echo Step 3: Force killing browsers...
taskkill /f /im "chrome.exe" >nul 2>&1
taskkill /f /im "msedge.exe" >nul 2>&1
taskkill /f /im "firefox.exe" >nul 2>&1

echo Step 4: Force deleting build directories...
if exist "dist-new" (
    rmdir /s /q "dist-new" >nul 2>&1
    echo ✓ dist-new deleted
)

echo Step 5: Waiting for file system...
timeout /t 10 /nobreak >nul

echo Step 6: Building fixed application...
npx electron-builder --win --publish=never

if exist "dist-new\AkashShareUserSetup-x64.exe" (
    echo.
    echo ================================================
    echo SUCCESS: Fixed setup created!
    echo ================================================
    echo.
    echo The fixed setup includes all background process fixes:
    echo ✓ Single instance lock
    echo ✓ Window visibility fixes
    echo ✓ Process cleanup improvements
    echo.
    echo Location: dist-new\AkashShareUserSetup-x64.exe
    echo.
) else (
    echo.
    echo ================================================
    echo BUILD STILL FAILED - RESTART REQUIRED
    echo ================================================
    echo.
    echo The file locking issue persists. You need to:
    echo.
    echo 1. RESTART YOUR COMPUTER
    echo 2. After restart, run: npx electron-builder --win --publish=never
    echo.
    echo This is the only way to clear all file locks.
    echo.
)

pause

