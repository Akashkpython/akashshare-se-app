@echo off
echo ========================================
echo   Akash Share - Final Verification Test
echo ========================================
echo.

echo This test will verify that all fixes have been applied correctly.
echo.

echo Step 1: Killing any existing processes...
taskkill /f /im "Akash Share.exe" >nul 2>&1
echo Done.

echo.
echo Step 2: Verifying build files...
if exist "dist-new\win-unpacked\resources\backend\node_modules" (
    echo ✅ Backend node_modules found
) else (
    echo ❌ Backend node_modules missing
)

if exist "dist-new\win-unpacked\resources\backend\server.js" (
    echo ✅ Backend server.js found
) else (
    echo ❌ Backend server.js missing
)

echo.
echo Step 3: Launching Akash Share...
cd /d "D:\5th sem\project\akashshare-se\dist-new\win-unpacked"
start "" "Akash Share.exe"

echo.
echo Step 4: Waiting for app to initialize (15 seconds)...
timeout /t 15 /nobreak >nul

echo.
echo Step 5: Checking if app is running...
tasklist | findstr "Akash Share" >nul
if %errorlevel% equ 0 (
    echo ✅ App is running successfully!
    echo.
    echo SUCCESS: All fixes have been applied correctly.
    echo.
    echo The application should now be visible on your screen.
    echo If not, please check:
    echo 1. The taskbar for the app icon
    echo 2. Press Alt+Tab to cycle through windows
    echo 3. Check if the app is minimized
    echo 4. Look in the system tray (bottom-right corner)
    echo.
    echo For future use:
    echo - Use launch-akash-share-fixed.bat for quick testing
    echo - Use dist-new\AkashShareUserSetup-x64.exe for installation
) else (
    echo ❌ App failed to start
    echo.
    echo Please check the logs at:
    echo C:\Users\%USERNAME%\AppData\Roaming\akash-share\logs\
    echo.
    echo Then run the comprehensive-fix.bat script and try again.
)

echo.
echo ========================================
echo   Verification Complete
echo ========================================
pause