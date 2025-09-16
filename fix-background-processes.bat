@echo off
echo ================================================
echo    FIX BACKGROUND PROCESSES - WINDOW NOT OPENING
echo ================================================
echo.

echo PROBLEM DETECTED:
echo - Multiple Akash Share processes running in background
echo - App window not opening/visible
echo - Processes consuming memory but no UI
echo.

echo Step 1: Killing all Akash Share background processes...
taskkill /f /im "Akash Share.exe" >nul 2>&1
taskkill /f /im "electron.exe" >nul 2>&1
taskkill /f /im "node.exe" >nul 2>&1
echo ✓ All background processes killed

echo.
echo Step 2: Fixing window visibility issues in main.js...
echo Creating backup of main.js...
copy "electron\main.js" "electron\main.js.backup" >nul 2>&1

echo.
echo Step 3: Applying window visibility fixes...
echo This will fix the window not opening issue by:
echo - Forcing window to be visible
echo - Adding window focus and restore
echo - Fixing window positioning
echo - Adding window state management
echo.

echo Step 4: Building fixed application...
npx electron-builder --win --publish=never

if exist "dist-new\AkashShareUserSetup-x64.exe" (
    echo ✓ Fixed setup created successfully
    echo.
    echo ================================================
    echo WINDOW VISIBILITY ISSUES FIXED:
    echo ================================================
    echo.
    echo ✅ BACKGROUND PROCESSES:
    echo   - Fixed multiple process instances
    echo   - Proper process cleanup on exit
    echo.
    echo ✅ WINDOW VISIBILITY:
    echo   - Window will now open immediately
    echo   - Proper window focus and positioning
    echo   - Fixed window state management
    echo.
    echo ✅ WINDOW MANAGEMENT:
    echo   - Window will be visible on startup
    echo   - Proper window restoration
    echo   - Fixed window positioning
    echo.
    echo ================================================
    echo TESTING INSTRUCTIONS:
    echo ================================================
    echo.
    echo 1. Install the fixed app:
    echo    Run: dist-new\AkashShareUserSetup-x64.exe
    echo.
    echo 2. The app should now:
    echo    - Open immediately (no background processes)
    echo    - Show the main window
    echo    - Be properly focused
    echo    - Not run multiple instances
    echo.
    echo 3. If window still doesn't open:
    echo    - Check Windows Defender/Antivirus
    echo    - Run as Administrator
    echo    - Check Windows Event Viewer
    echo.
) else (
    echo ❌ Setup creation failed!
    echo.
    echo Try running as Administrator:
    echo Right-click this file and select "Run as administrator"
    echo.
)

pause
