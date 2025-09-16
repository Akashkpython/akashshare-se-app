@echo off
title Akash Share Installer

REM Akash Share Installer
REM This script installs Akash Share to the Program Files directory

echo ==================================================
echo           Akash Share Installer
echo ==================================================
echo.

REM Check for administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo This installer requires administrator privileges.
    echo Please right-click on this file and select "Run as administrator".
    echo.
    pause
    exit /b
)

echo Installing Akash Share...
echo.

REM Define variables
set "APP_NAME=Akash Share"
set "INSTALL_DIR=%PROGRAMFILES%\%APP_NAME%"
set "SOURCE_DIR=dist-final\%APP_NAME%-win32-x64"

echo Installing to: %INSTALL_DIR%
echo.

REM Create installation directory
echo Creating installation directory...
if exist "%INSTALL_DIR%" (
    echo Removing existing installation...
    rmdir /s /q "%INSTALL_DIR%" >nul 2>&1
)
mkdir "%INSTALL_DIR%" 2>nul

REM Copy files
echo Copying application files...
xcopy "%SOURCE_DIR%\*" "%INSTALL_DIR%" /E /I /H /Y >nul 2>&1

REM Check if files were copied successfully
if %errorlevel% neq 0 (
    echo Error: Failed to copy application files.
    echo Please make sure the application files are in the correct location.
    echo.
    pause
    exit /b
)

echo Files copied successfully.
echo.

REM Create desktop shortcut
echo Creating desktop shortcut...
powershell.exe -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\Desktop\%APP_NAME%.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\%APP_NAME%.exe'; $Shortcut.Save()" >nul 2>&1

REM Create Start Menu shortcut
echo Creating Start Menu shortcut...
set "STARTMENU_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\%APP_NAME%"
if not exist "%STARTMENU_DIR%" mkdir "%STARTMENU_DIR%" 2>nul
powershell.exe -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTMENU_DIR%\%APP_NAME%.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\%APP_NAME%.exe'; $Shortcut.Save()" >nul 2>&1

echo.
echo Installation completed successfully!
echo.
echo You can now launch %APP_NAME% from the desktop shortcut or Start Menu.
echo.

REM Ask user if they want to launch the application
choice /C YN /M "Do you want to launch %APP_NAME% now"
if %errorlevel% equ 1 (
    echo Launching %APP_NAME%...
    "%INSTALL_DIR%\%APP_NAME%.exe"
)

echo.
pause