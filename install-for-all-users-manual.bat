@echo off
echo ========================================
echo    AKASH SHARE - MANUAL ALL-USERS INSTALL
echo ========================================
echo.

echo 🚀 Installing Akash Share for ALL USERS (Manual Method)...
echo.

REM Check for administrator privileges
net session >nul 2>&1
if errorlevel 1 (
    echo ❌ This script requires administrator privileges!
    echo.
    echo 💡 Please right-click this file and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo ✅ Administrator privileges confirmed!

echo.
echo Step 1: Checking if portable app exists...
if not exist "dist\Akash Share-win32-x64\Akash Share.exe" (
    echo ❌ Portable app not found!
    echo.
    echo 🔧 Please run one of these first:
    echo    - .\create-portable-app.bat
    echo    - .\create-all-users-electron-installer.bat
    echo.
    pause
    exit /b 1
)

echo ✅ Portable app found!

echo.
echo Step 2: Creating installation directory...
set "INSTALL_DIR=C:\Program Files\Akash Share"
if exist "%INSTALL_DIR%" (
    echo ⚠️ Installation directory already exists!
    echo.
    set /p choice="Do you want to overwrite the existing installation? (Y/N): "
    if /i not "%choice%"=="Y" (
        echo Installation cancelled.
        pause
        exit /b 1
    )
    echo 🗑️ Removing existing installation...
    rmdir /s /q "%INSTALL_DIR%"
)

echo 📁 Creating installation directory: %INSTALL_DIR%
mkdir "%INSTALL_DIR%" 2>nul

echo.
echo Step 3: Copying application files...
echo 📦 Copying files from portable app...
xcopy "dist\Akash Share-win32-x64\*" "%INSTALL_DIR%\" /E /I /H /Y

if not exist "%INSTALL_DIR%\Akash Share.exe" (
    echo ❌ Failed to copy application files!
    pause
    exit /b 1
)

echo ✅ Application files copied successfully!

echo.
echo Step 4: Creating shortcuts for all users...
echo 🔗 Creating desktop shortcut...
set "DESKTOP_ALL=%PUBLIC%\Desktop"
createShortCut "%DESKTOP_ALL%\Akash Share.lnk" "%INSTALL_DIR%\Akash Share.exe" "" "%INSTALL_DIR%\Akash Share.exe" 0

echo 🔗 Creating start menu shortcut...
set "START_MENU=%ALLUSERSPROFILE%\Microsoft\Windows\Start Menu\Programs"
createShortCut "%START_MENU%\Akash Share.lnk" "%INSTALL_DIR%\Akash Share.exe" "" "%INSTALL_DIR%\Akash Share.exe" 0

echo.
echo Step 5: Creating application data directories...
echo 📁 Creating shared application data directory...
set "APP_DATA=%PROGRAMDATA%\AkashShare"
mkdir "%APP_DATA%" 2>nul
mkdir "%APP_DATA%\logs" 2>nul
mkdir "%APP_DATA%\uploads" 2>nul
mkdir "%APP_DATA%\shared" 2>nul

echo.
echo Step 6: Setting up registry entries...
echo 🔧 Adding to Add/Remove Programs...
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\Akash Share" /v "DisplayName" /t REG_SZ /d "Akash Share" /f
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\Akash Share" /v "UninstallString" /t REG_SZ /d "\"%INSTALL_DIR%\uninstall.bat\"" /f
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\Akash Share" /v "InstallLocation" /t REG_SZ /d "%INSTALL_DIR%" /f
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\Akash Share" /v "DisplayIcon" /t REG_SZ /d "%INSTALL_DIR%\Akash Share.exe" /f
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\Akash Share" /v "Publisher" /t REG_SZ /d "Akash Share Team" /f
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\Akash Share" /v "DisplayVersion" /t REG_SZ /d "1.0.5" /f
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\Akash Share" /v "VersionMajor" /t REG_DWORD /d 1 /f
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\Akash Share" /v "VersionMinor" /t REG_DWORD /d 0 /f
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\Akash Share" /v "NoModify" /t REG_DWORD /d 1 /f
reg add "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\Akash Share" /v "NoRepair" /t REG_DWORD /d 1 /f

echo.
echo Step 7: Creating uninstaller...
echo 📝 Creating uninstall script...
(
echo @echo off
echo echo Uninstalling Akash Share...
echo echo.
echo REM Remove shortcuts
echo del "%DESKTOP_ALL%\Akash Share.lnk" 2^>nul
echo del "%START_MENU%\Akash Share.lnk" 2^>nul
echo.
echo REM Remove registry entries
echo reg delete "HKLM\Software\Microsoft\Windows\CurrentVersion\Uninstall\Akash Share" /f 2^>nul
echo.
echo REM Remove application files
echo rmdir /s /q "%INSTALL_DIR%" 2^>nul
echo.
echo REM Ask about application data
echo set /p choice="Do you want to remove all Akash Share data? (Y/N): "
echo if /i "%%choice%%"=="Y" (
echo     rmdir /s /q "%APP_DATA%" 2^>nul
echo ^)
echo.
echo echo Akash Share has been uninstalled.
echo pause
) > "%INSTALL_DIR%\uninstall.bat"

echo.
echo ========================================
echo    🎉 INSTALLATION COMPLETE!
echo ========================================
echo.

echo ✅ Akash Share has been installed for ALL USERS!
echo.
echo 📁 Installation Details:
echo    - Location: %INSTALL_DIR%
echo    - Desktop Shortcut: Available to all users
echo    - Start Menu: Available to all users
echo    - Add/Remove Programs: Registered
echo    - Application Data: %APP_DATA%
echo.
echo 🚀 The application is now available to ALL users on this system!
echo.
echo 💡 To run: Any user can now launch Akash Share from:
echo    - Desktop shortcut
echo    - Start Menu
echo    - Program Files directory
echo.
echo 🗑️ To uninstall: Run "%INSTALL_DIR%\uninstall.bat" as administrator
echo.

pause
