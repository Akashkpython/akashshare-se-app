@echo off
echo ================================================
echo    EMERGENCY CLEANUP - AKASH SHARE
echo ================================================
echo.

echo This script will clean up all processes and prepare for fixes.
echo.

echo ================================================
echo STEP 1: KILL ALL EXISTING PROCESSES
echo ================================================

echo Killing all Node.js processes...
taskkill /f /im node.exe >nul 2>&1

echo Killing all Electron processes...
taskkill /f /im electron.exe >nul 2>&1

echo Killing Akash Share processes...
taskkill /f /im "Akash Share.exe" >nul 2>&1
taskkill /f /im "Akash Share Setup 1.0.5.exe" >nul 2>&1

echo Killing any remaining processes with "Akash" in name...
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq *Akash*" /fo csv ^| find "Akash"') do (
    taskkill /f /pid %%i >nul 2>&1
)

echo ✓ All processes killed

echo.
echo ================================================
echo STEP 2: CLEAN TEMPORARY FILES
echo ================================================

echo Cleaning temporary files...
if exist "%TEMP%\akash*" rmdir /s /q "%TEMP%\akash*" >nul 2>&1
if exist "%TEMP%\electron*" rmdir /s /q "%TEMP%\electron*" >nul 2>&1

echo ✓ Temporary files cleaned

echo.
echo ================================================
echo STEP 3: RESET NETWORK CONNECTIONS
echo ================================================

echo Resetting network connections...
netstat -an | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo Port 3000 is still in use, waiting...
    timeout /t 3 >nul
)

netstat -an | findstr ":5004" >nul 2>&1
if %errorlevel% equ 0 (
    echo Port 5004 is still in use, waiting...
    timeout /t 3 >nul
)

echo ✓ Network connections reset

echo.
echo ================================================
echo EMERGENCY CLEANUP COMPLETE
echo ================================================
echo.
echo All processes have been terminated and system is clean.
echo You can now run the fix scripts.
echo.
pause
