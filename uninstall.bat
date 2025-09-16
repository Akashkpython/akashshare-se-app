@echo off
echo Uninstalling Akash Share...
echo.

REM Close Akash Share if running
taskkill /f /im "Akash Share.exe" 2>nul

REM Remove installation directory
set INSTALL_DIR=%PROGRAMFILES%\Akash Share
echo Removing %INSTALL_DIR%...
rmdir "%INSTALL_DIR%" /s /q 2>nul

REM Remove shortcuts
echo Removing shortcuts...
del "%USERPROFILE%\Desktop\Akash Share.lnk" 2>nul
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Akash Share.lnk" 2>nul

echo.
echo Uninstallation complete!

pause