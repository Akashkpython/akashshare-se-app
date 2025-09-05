@echo off
echo ===============================================
echo Akash Share - NSIS Installer Build Test
echo ===============================================
echo.

echo Step 1: Building React application...
call npm run build
if errorlevel 1 (
    echo ERROR: React build failed!
    pause
    exit /b 1
)
echo React build completed successfully!
echo.

echo Step 2: Copying Electron files...
call npm run electron:copy
if errorlevel 1 (
    echo ERROR: Electron copy failed!
    pause
    exit /b 1
)
echo Electron files copied successfully!
echo.

echo Step 3: Building NSIS installer...
echo This will create an installer with:
echo - License agreement (EULA) from license.txt
echo - Password-protected uninstallation (Password: Varsha2005)
echo.

call npx electron-builder --win --publish=never
if errorlevel 1 (
    echo ERROR: NSIS installer build failed!
    pause
    exit /b 1
)

echo.
echo ===============================================
echo SUCCESS: NSIS installer built successfully!
echo ===============================================
echo.
echo The installer will be located in the 'dist' folder.
echo.
echo Features included:
echo ✓ License agreement during installation
echo ✓ Password protection during uninstallation
echo ✓ Desktop and Start Menu shortcuts
echo ✓ Custom branding and icons
echo.
echo To test the installer:
echo 1. Run the .exe file from the dist folder
echo 2. Accept the license agreement to install
echo 3. To uninstall, use Windows Add/Remove Programs
echo 4. Enter password "Varsha2005" when prompted
echo.
pause