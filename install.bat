@echo off
echo Installing Akash Share...
echo.

REM Create installation directory
set INSTALL_DIR=%PROGRAMFILES%\Akash Share
mkdir "%INSTALL_DIR%" 2>nul

REM Copy files
echo Copying files to %INSTALL_DIR%...
xcopy "dist-final\Akash Share-win32-x64\*.*" "%INSTALL_DIR%" /E /I /H /Y >nul

REM Create shortcuts
echo Creating shortcuts...
set "SHORTCUT_PATH=%USERPROFILE%\Desktop\Akash Share.lnk"
powershell.exe -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); $Shortcut.TargetPath = '%INSTALL_DIR%\Akash Share.exe'; $Shortcut.Save()"

set "STARTMENU_PATH=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Akash Share.lnk"
powershell.exe -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTMENU_PATH%'); $Shortcut.TargetPath = '%INSTALL_DIR%\Akash Share.exe'; $Shortcut.Save()"

echo.
echo Installation complete!
echo.
echo Launching Akash Share...
"%INSTALL_DIR%\Akash Share.exe"

pause