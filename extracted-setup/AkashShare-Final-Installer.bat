@echo off
color 0A
echo.
echo ===============================================
echo    AKASH SHARE - PROFESSIONAL INSTALLER
echo ===============================================
echo.
echo Installing AkAsH Share Application...
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: For best results, run as Administrator
    echo.
)

REM Set installation directory
set "INSTALL_DIR=%LOCALAPPDATA%\Programs\AkashShare"
echo Installation Directory: %INSTALL_DIR%
echo.

REM Create installation directory
if not exist "%INSTALL_DIR%" (
    echo Creating installation directory...
    mkdir "%INSTALL_DIR%"
)

REM Copy application files
echo Copying application files...
if exist "AkashShare-Portable" (
    xcopy "AkashShare-Portable\*" "%INSTALL_DIR%\" /E /I /Y /Q
    echo ✅ Application files copied successfully
) else (
    echo ❌ ERROR: AkashShare-Portable folder not found!
    echo Please ensure this installer is in the same directory as AkashShare-Portable
    pause
    exit /b 1
)

REM Create desktop shortcut
echo Creating desktop shortcut...
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\AkAsH Share.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\Start-AkashShare.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Description = 'AkAsH Share - Professional File Sharing Application'; $Shortcut.Save()" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Desktop shortcut created
) else (
    echo ⚠️ Could not create desktop shortcut
)

REM Create start menu shortcut
echo Creating start menu shortcut...
set "STARTMENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs"
if not exist "%STARTMENU%\AkAsH Share" mkdir "%STARTMENU%\AkAsH Share"
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTMENU%\AkAsH Share\AkAsH Share.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\Start-AkashShare.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Description = 'AkAsH Share - Professional File Sharing Application'; $Shortcut.Save()" 2>nul
if %errorlevel% equ 0 (
    echo ✅ Start menu shortcut created
) else (
    echo ⚠️ Could not create start menu shortcut
)

REM Create uninstaller
echo Creating uninstaller...
(
echo @echo off
echo echo.
echo echo ===============================================
echo echo    AKASH SHARE - UNINSTALLER
echo echo ===============================================
echo echo.
echo echo Removing AkAsH Share from your computer...
echo echo.
echo rmdir /s /q "%INSTALL_DIR%"
echo del "%USERPROFILE%\Desktop\AkAsH Share.lnk" 2^>nul
echo rmdir /s /q "%STARTMENU%\AkAsH Share" 2^>nul
echo echo.
echo echo ✅ AkAsH Share has been successfully uninstalled.
echo echo.
echo pause
) > "%INSTALL_DIR%\Uninstall-AkashShare.bat"
echo ✅ Uninstaller created

REM Create installation info file
(
echo AkAsH Share Installation Information
echo ===================================
echo.
echo Installed on: %DATE% at %TIME%
echo Installation Directory: %INSTALL_DIR%
echo Version: 1.0.5
echo.
echo To uninstall, run: Uninstall-AkashShare.bat
) > "%INSTALL_DIR%\Installation-Info.txt"

echo.
echo ===============================================
echo    INSTALLATION COMPLETED SUCCESSFULLY!
echo ===============================================
echo.
echo AkAsH Share has been installed to:
echo %INSTALL_DIR%
echo.
echo You can now start the application by:
echo ✅ Double-clicking the desktop shortcut "AkAsH Share"
echo ✅ Using the Start Menu → AkAsH Share → AkAsH Share
echo ✅ Running Start-AkashShare.bat from the installation folder
echo.
echo IMPORTANT NOTES:
echo 📌 Make sure Node.js is installed on your system
echo 📌 The application requires an internet connection
echo 📌 Windows Defender may ask for permission - allow it
echo.
echo To uninstall: Run "Uninstall-AkashShare.bat" from the installation folder
echo.
echo Thank you for installing AkAsH Share!
echo.
pause
