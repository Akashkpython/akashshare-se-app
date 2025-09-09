# AkAsH Share Self-Extracting Installer Creator
# This PowerShell script creates a self-extracting installer

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   AKASH SHARE - SELF-EXTRACTING INSTALLER" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if the portable package exists
if (-not (Test-Path "AkashShare-Portable")) {
    Write-Host "ERROR: AkashShare-Portable folder not found!" -ForegroundColor Red
    Write-Host "Please run create-simple-setup.bat first." -ForegroundColor Yellow
    exit 1
}

Write-Host "📦 Creating self-extracting installer..." -ForegroundColor Green

# Create installer script content
$installerContent = @'
@echo off
echo ============================================
echo    AKASH SHARE - INSTALLER
echo ============================================
echo.
echo Installing AkAsH Share to your computer...
echo.

REM Create installation directory
set "INSTALL_DIR=%LOCALAPPDATA%\Programs\AkashShare"
echo Creating installation directory: %INSTALL_DIR%
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Extract files (this will be replaced with actual extraction commands)
echo Extracting application files...
xcopy "%~dp0AkashShare-Portable\*" "%INSTALL_DIR%\" /E /I /Y

REM Create desktop shortcut
echo Creating desktop shortcut...
set "SHORTCUT=%USERPROFILE%\Desktop\AkAsH Share.lnk"
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT%'); $Shortcut.TargetPath = '%INSTALL_DIR%\Start-AkashShare.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\build\Akashshareicon.png'; $Shortcut.Description = 'AkAsH Share - Professional File Sharing'; $Shortcut.Save()"

REM Create start menu shortcut
echo Creating start menu shortcut...
set "STARTMENU=%APPDATA%\Microsoft\Windows\Start Menu\Programs"
if not exist "%STARTMENU%\AkAsH Share" mkdir "%STARTMENU%\AkAsH Share"
set "STARTSHORTCUT=%STARTMENU%\AkAsH Share\AkAsH Share.lnk"
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTSHORTCUT%'); $Shortcut.TargetPath = '%INSTALL_DIR%\Start-AkashShare.bat'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\build\Akashshareicon.png'; $Shortcut.Description = 'AkAsH Share - Professional File Sharing'; $Shortcut.Save()"

REM Create uninstaller
echo Creating uninstaller...
(
echo @echo off
echo echo Uninstalling AkAsH Share...
echo rmdir /s /q "%INSTALL_DIR%"
echo del "%USERPROFILE%\Desktop\AkAsH Share.lnk" 2^>nul
echo rmdir /s /q "%STARTMENU%\AkAsH Share" 2^>nul
echo echo AkAsH Share has been uninstalled.
echo pause
) > "%INSTALL_DIR%\Uninstall.bat"

echo.
echo ✅ Installation completed successfully!
echo.
echo AkAsH Share has been installed to: %INSTALL_DIR%
echo.
echo You can now:
echo 1. Use the desktop shortcut to launch AkAsH Share
echo 2. Find it in your Start Menu under "AkAsH Share"
echo 3. Run the uninstaller from the installation directory
echo.
echo Press any key to close this installer...
pause >nul
'@

# Write installer script
$installerContent | Out-File -FilePath "AkashShare-Installer.bat" -Encoding ASCII

Write-Host "✅ Created: AkashShare-Installer.bat" -ForegroundColor Green

# Create a distribution package
Write-Host "📦 Creating distribution package..." -ForegroundColor Green

if (Test-Path "AkashShare-Distribution") {
    Remove-Item "AkashShare-Distribution" -Recurse -Force
}

New-Item -ItemType Directory -Path "AkashShare-Distribution" | Out-Null

# Copy installer and portable files
Copy-Item "AkashShare-Installer.bat" "AkashShare-Distribution\"
Copy-Item "AkashShare-Portable" "AkashShare-Distribution\" -Recurse

# Create README for distribution
$readmeContent = @"
AkAsH Share - Installation Package
==================================

INSTALLATION INSTRUCTIONS:
1. Double-click 'AkashShare-Installer.bat' to install
2. The installer will copy files to your local Programs folder
3. Desktop and Start Menu shortcuts will be created automatically
4. Follow the on-screen instructions

SYSTEM REQUIREMENTS:
- Windows 10 or later
- Node.js (will prompt to install if missing)
- Internet connection for initial setup

MANUAL INSTALLATION:
If the installer doesn't work, you can:
1. Copy the 'AkashShare-Portable' folder to any location
2. Double-click 'Start-AkashShare.bat' inside the folder

UNINSTALLATION:
- Use the 'Uninstall.bat' file in the installation directory
- Or manually delete the installation folder and shortcuts

For support, contact: akashshare.team@email.com
"@

$readmeContent | Out-File -FilePath "AkashShare-Distribution\README.txt" -Encoding UTF8

Write-Host "✅ Created distribution package in: AkashShare-Distribution" -ForegroundColor Green

# Create final ZIP
Write-Host "📦 Creating final distribution ZIP..." -ForegroundColor Green
if (Test-Path "AkashShare-Setup-Final.zip") {
    Remove-Item "AkashShare-Setup-Final.zip" -Force
}

Compress-Archive -Path "AkashShare-Distribution\*" -DestinationPath "AkashShare-Setup-Final.zip" -CompressionLevel Optimal

Write-Host ""
Write-Host "🎉 SUCCESS! Installation package created:" -ForegroundColor Green
Write-Host ""
Write-Host "Files created:" -ForegroundColor Yellow
Write-Host "  📁 AkashShare-Distribution/     - Complete installation package" -ForegroundColor White
Write-Host "  📄 AkashShare-Installer.bat    - Windows installer script" -ForegroundColor White
Write-Host "  📦 AkashShare-Setup-Final.zip  - Distribution ready ZIP file" -ForegroundColor White
Write-Host ""
Write-Host "TO INSTALL ON ANOTHER PC:" -ForegroundColor Cyan
Write-Host "1. Copy 'AkashShare-Setup-Final.zip' to the target computer" -ForegroundColor White
Write-Host "2. Extract the ZIP file" -ForegroundColor White
Write-Host "3. Run 'AkashShare-Installer.bat' as Administrator" -ForegroundColor White
Write-Host "4. Follow the installation prompts" -ForegroundColor White
Write-Host ""
Write-Host "The installer will handle everything automatically!" -ForegroundColor Green
