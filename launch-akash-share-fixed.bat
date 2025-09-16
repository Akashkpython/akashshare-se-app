@echo off
echo ==========================================
echo    Akash Share - Fixed Launcher
echo ==========================================
echo.

echo Step 1: Killing any existing processes...
taskkill /f /im "Akash Share.exe" >nul 2>&1
echo Done.

echo.
echo Step 2: Launching Akash Share...
cd /d "D:\5th sem\project\akashshare-se\dist-new\win-unpacked"
start "" "Akash Share.exe"

echo.
echo ==========================================
echo SUCCESS: Akash Share launched!
echo ==========================================
echo.
echo The application should now be visible on your screen.
echo.
echo If the application window doesn't appear immediately:
echo 1. Check the taskbar for the app icon
echo 2. Press Alt+Tab to cycle through windows
echo 3. Check if the app is minimized
echo 4. Look in the system tray (bottom-right corner)
echo.
echo Application logs can be found at:
echo C:\Users\%USERNAME%\AppData\Roaming\akash-share\logs\
echo.
echo Note: The first launch may take a moment as the backend server starts.
echo If you continue to have issues, try running the setup installer:
echo dist-new\AkashShareUserSetup-x64.exe
echo.
pause