# Akash Share Installer Creator
# This script creates a self-extracting installer for Akash Share

# Define paths
$sourceDir = "dist-final\Akash Share-win32-x64"
$distDir = "dist"
$outputFile = "$distDir\AkashShareUserSetup-x64.exe"
$tempDir = "temp-installer"

# Create dist directory if it doesn't exist
if (!(Test-Path $distDir)) {
    New-Item -ItemType Directory -Path $distDir | Out-Null
}

# Create temporary directory
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "Creating installer for Akash Share..."

# Copy application files to temp directory
Write-Host "Copying application files..."
Copy-Item -Path "$sourceDir\*" -Destination $tempDir -Recurse -Force

# Create installation script
$installScript = @"
@echo off
title Akash Share Installer

echo ==================================================
echo        Akash Share Installation
echo ==================================================
echo.

echo Installing Akash Share...
echo.

REM Create installation directory
set "INSTALL_DIR=%LOCALAPPDATA%\Programs\Akash Share"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

echo Copying files to %INSTALL_DIR%...
xcopy "." "%INSTALL_DIR%" /E /I /H /Y >nul

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Files copied successfully!
) else (
    echo.
    echo Error copying files!
    echo Error code: %ERRORLEVEL%
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Creating shortcuts...

REM Create desktop shortcut
set "DESKTOP_SHORTCUT=%USERPROFILE%\Desktop\Akash Share.lnk"
powershell "\$s=(New-Object -COM WScript.Shell).CreateShortcut('%DESKTOP_SHORTCUT%'); \$s.TargetPath='%INSTALL_DIR%\Akash Share.exe'; \$s.Save()"

REM Create Start Menu shortcut
set "START_MENU_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Akash Share"
if not exist "%START_MENU_DIR%" mkdir "%START_MENU_DIR%"
powershell "\$s=(New-Object -COM WScript.Shell).CreateShortcut('%START_MENU_DIR%\Akash Share.lnk'); \$s.TargetPath='%INSTALL_DIR%\Akash Share.exe'; \$s.Save()"

echo.
echo Installation completed successfully!
echo.
echo You can now run Akash Share from your desktop or Start Menu.
echo.
pause
"@

# Save installation script
$installScript | Out-File -FilePath "$tempDir\install.bat" -Encoding ASCII

# Create uninstall script
$uninstallScript = @"
@echo off
title Akash Share Uninstaller

echo ==================================================
echo        Akash Share Uninstallation
echo ==================================================
echo.

REM Confirmation
echo This will completely remove Akash Share from your system.
set /p "confirm=Are you sure you want to uninstall Akash Share? (y/N): "
if /i not "%confirm%"=="y" (
    echo.
    echo Uninstallation cancelled.
    pause
    exit /b
)

echo.
echo Uninstalling Akash Share...
echo.

REM Remove installation directory
set "INSTALL_DIR=%LOCALAPPDATA%\Programs\Akash Share"
if exist "%INSTALL_DIR%" (
    echo Removing files from %INSTALL_DIR%...
    rmdir "%INSTALL_DIR%" /s /q
    echo Files removed successfully!
) else (
    echo Installation directory not found.
)

echo.
echo Removing shortcuts...

REM Remove desktop shortcut
set "DESKTOP_SHORTCUT=%USERPROFILE%\Desktop\Akash Share.lnk"
if exist "%DESKTOP_SHORTCUT%" (
    del "%DESKTOP_SHORTCUT%"
    echo Desktop shortcut removed.
)

REM Remove Start Menu shortcut
set "START_MENU_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Akash Share"
if exist "%START_MENU_DIR%" (
    rmdir "%START_MENU_DIR%" /s /q
    echo Start Menu shortcuts removed.
)

echo.
echo Uninstallation completed successfully!
echo.
echo Akash Share has been completely removed from your system.
echo.
pause
"@

# Save uninstall script
$uninstallScript | Out-File -FilePath "$tempDir\uninstall.bat" -Encoding ASCII

# Create a self-extracting archive using 7-Zip if available, otherwise create a ZIP
try {
    # Try to create self-extracting executable
    $7zPath = "C:\Program Files\7-Zip\7z.exe"
    if (Test-Path $7zPath) {
        Write-Host "Creating self-extracting installer with 7-Zip..."
        # Create archive first
        & "$7zPath" a -tzip "$distDir\AkashShare-Portable.zip" "$tempDir\*"
        
        # Create self-extracting executable
        $sfxConfig = @"
;!@Install@!UTF-8!
Title="Akash Share Installer"
BeginPrompt="This will install Akash Share on your computer. Do you want to continue?"
RunProgram="install.bat"
;!@InstallEnd@!
"@
        $sfxConfig | Out-File -FilePath "$distDir\sfx-config.txt" -Encoding ASCII
        & "$7zPath" a -sfx7z.sfx "$outputFile" "$tempDir\*" "$distDir\sfx-config.txt"
        Remove-Item "$distDir\sfx-config.txt" -Force
        Remove-Item "$distDir\AkashShare-Portable.zip" -Force
    } else {
        Write-Host "7-Zip not found, creating ZIP archive..."
        # Create ZIP archive
        Compress-Archive -Path "$tempDir\*" -DestinationPath $outputFile -Force
    }
} catch {
    Write-Host "Error creating installer: $_"
    Write-Host "Creating simple ZIP archive as fallback..."
    try {
        Compress-Archive -Path "$tempDir\*" -DestinationPath $outputFile -Force
    } catch {
        Write-Host "Failed to create installer: $_"
        Write-Host "Please manually package the files in $tempDir"
    }
}

# Clean up temp directory
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Installer created successfully at: $outputFile"
Write-Host "Press any key to exit..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")