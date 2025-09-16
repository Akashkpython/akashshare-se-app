@echo off
echo ========================================
echo   Akash Share - Manual Launch Test
echo ========================================
echo.

echo Step 1: Killing any existing processes...
taskkill /f /im "Akash Share.exe" >nul 2>&1
echo Done.

echo.
echo Step 2: Launching Akash Share...
cd /d "D:\5th sem\project\akashshare-se\dist-new\win-unpacked"
start "" "Akash Share.exe"

echo.
echo Step 3: Waiting for app to initialize...
timeout /t 10 /nobreak >nul

echo.
echo Step 4: Checking if app is running...
tasklist | findstr "Akash Share" >nul
if %errorlevel% equ 0 (
    echo ✅ App is running in the background
    echo.
    echo Please check:
    echo 1. The taskbar for the app icon
    echo 2. Press Alt+Tab to cycle through windows
    echo 3. Check if the app is minimized
    echo 4. Look in the system tray (bottom-right corner)
    echo.
    echo The app should now be visible. If not, try these steps:
    echo - Press Windows key + Tab to see all open windows
    echo - Check if the window is minimized in the taskbar
    echo - Right-click the taskbar icon and select "Restore"
) else (
    echo ❌ App failed to start
    echo.
    echo Check the logs at:
    echo C:\Users\%USERNAME%\AppData\Roaming\akash-share\logs\
)

echo.
echo ========================================
echo   Test Complete
echo ========================================
pause