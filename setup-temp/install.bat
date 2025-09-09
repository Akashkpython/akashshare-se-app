@echo off 
echo ======================================== 
echo    AKASH SHARE - PROFESSIONAL INSTALLER 
echo    Version: 1.0.5 - Architecture: x64 
echo ======================================== 
echo. 
echo 🚀 Installing Akash Share Professional Edition... 
echo. 
 
REM Check for administrator privileges 
net session >nul 2>&1 
if errorlevel 1 ( 
    echo ❌ This installer requires administrator privileges! 
    echo Please right-click and select "Run as administrator" 
    pause 
    exit /b 1 
) 
 
echo ✅ Administrator privileges confirmed! 
echo. 
 
REM Create installation directory 
set "INSTALL_DIR=%PROGRAMFILES%\Akash Share" 
echo 📁 Installing to: %INSTALL_DIR% 
 
REM Create directory 
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%" 
 
REM Copy files 
echo 📦 Copying application files... 
xcopy "Akash Share\*" "%INSTALL_DIR%\" /E /I /Y 
 
REM Create desktop shortcut 
echo 🔗 Creating desktop shortcut... 
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%PUBLIC%\Desktop\Akash Share.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\Akash Share.exe'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Description = 'Akash Share - Professional File Sharing Application'; $Shortcut.Save()" 
 
REM Create Start Menu shortcut 
echo 🔗 Creating Start Menu shortcut... 
if not exist "%PROGRAMDATA%\Microsoft\Windows\Start Menu\Programs\Akash Share" mkdir "%PROGRAMDATA%\Microsoft\Windows\Start Menu\Programs\Akash Share" 
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%PROGRAMDATA%\Microsoft\Windows\Start Menu\Programs\Akash Share\Akash Share.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\Akash Share.exe'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.Description = 'Akash Share - Professional File Sharing Application'; $Shortcut.Save()" 
 
REM Create uninstaller 
echo 🔧 Creating uninstaller... 
echo @echo off 
echo echo Uninstalling Akash Share... 
echo del /q "%INSTALL_DIR%\*" /s 
echo rmdir /s /q "%INSTALL_DIR%" 
echo del "%PUBLIC%\Desktop\Akash Share.lnk" 
echo rmdir /s /q "%PROGRAMDATA%\Microsoft\Windows\Start Menu\Programs\Akash Share" 
echo echo Akash Share has been uninstalled. 
echo pause 
 
REM Add to Add/Remove Programs 
echo 📋 Adding to Add/Remove Programs... 
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" /v "DisplayName" /t REG_SZ /d "Akash Share Professional" /f 
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" /v "DisplayVersion" /t REG_SZ /d "1.0.5" /f 
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" /v "Publisher" /t REG_SZ /d "Akash Share Team" /f 
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" /v "InstallLocation" /t REG_SZ /d "%INSTALL_DIR%" /f 
reg add "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" /v "UninstallString" /t REG_SZ /d "%INSTALL_DIR%\uninstall.bat" /f 
 
echo. 
echo ======================================== 
echo    🎉 INSTALLATION COMPLETE! 
echo ======================================== 
echo. 
echo ✅ Akash Share Professional has been installed successfully! 
echo. 
echo 📍 Installation location: %INSTALL_DIR% 
echo 🔗 Desktop shortcut created 
echo 🔗 Start Menu shortcut created 
echo 📋 Added to Add/Remove Programs 
echo. 
echo 🚀 You can now launch Akash Share from: 
echo    - Desktop shortcut 
echo    - Start Menu 
echo    - Program Files directory 
echo. 
echo 💡 To uninstall: Use Add/Remove Programs or run uninstall.bat 
echo. 
pause 
