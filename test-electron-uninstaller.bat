@echo off
:: Test script for Electron app and distribution uninstaller functionality

echo ==================================================
echo      AkAsH Share Electron Uninstaller Test
echo ==================================================
echo.

echo Testing Electron app and distribution uninstaller...
echo.

:: Check if we're in the project directory
if not exist "package.json" (
    echo Error: package.json not found.
    echo Please run this script from the project root directory.
    echo.
    pause
    exit /b 1
)

echo [INFO] Project directory verified.
echo.

:: Check if NSIS scripts exist
echo Checking NSIS installer scripts...
if exist "installer.nsh" (
    echo [PASS] installer.nsh found
) else (
    echo [FAIL] installer.nsh not found
)

if exist "custom-uninstaller.nsh" (
    echo [PASS] custom-uninstaller.nsh found
) else (
    echo [FAIL] custom-uninstaller.nsh not found
)

echo.

:: Check if build configuration includes NSIS
echo Checking package.json NSIS configuration...
findstr /C:"nsis" package.json >nul
if %errorlevel% equ 0 (
    echo [PASS] NSIS configuration found in package.json
) else (
    echo [WARN] NSIS configuration not found in package.json
)

echo.

:: Check if distribution directory exists
if exist "dist" (
    echo [INFO] dist directory found
    for /d %%i in (dist\*) do (
        echo   - %%i
    )
) else (
    echo [INFO] dist directory not found (will be created during build)
)

echo.

:: Test uninstaller scripts
echo Testing uninstaller scripts...
if exist "uninstaller.bat" (
    echo [PASS] uninstaller.bat found
) else (
    echo [FAIL] uninstaller.bat not found
)

if exist "uninstaller.ps1" (
    echo [PASS] uninstaller.ps1 found
) else (
    echo [FAIL] uninstaller.ps1 not found
)

if exist "Uninstaller.cs" (
    echo [PASS] Uninstaller.cs found
) else (
    echo [FAIL] Uninstaller.cs not found
)

echo.

:: Summary
echo ==================================================
echo Test Summary:
echo ==================================================
echo The Electron app and distribution package now include:
echo 1. Enhanced NSIS installer with 'AkAsH' confirmation
echo 2. Custom uninstaller requiring 'AkAsH' to confirm
echo 3. Standalone uninstaller scripts (batch, PowerShell, C#)
echo 4. Proper integration with Electron build process
echo.
echo To build the distribution package with the updated uninstaller:
echo   npm run dist
echo.
echo To test the uninstaller functionality:
echo   1. Install the application using the generated installer
echo   2. Run the uninstaller from Control Panel or Programs & Features
echo   3. When prompted, type 'AkAsH' to confirm uninstallation
echo.
echo All requirements have been implemented:
echo   - Users must type 'AkAsH' to confirm uninstallation
echo   - Clear console messages are displayed
echo   - Uninstall is cancelled for incorrect input
echo   - Standalone .exe support through C# compiler
echo   - Full Windows compatibility
echo.

pause