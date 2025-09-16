# Akash Share Installer Script
# This script installs Akash Share to the Program Files directory

# Define variables
$AppName = "Akash Share"
$InstallDir = "$env:ProgramFiles\$AppName"
$SourceDir = "dist-final\Akash Share-win32-x64"
$DesktopShortcut = "$env:USERPROFILE\Desktop\$AppName.lnk"
$StartMenuShortcut = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\$AppName.lnk"

Write-Host "Installing $AppName..." -ForegroundColor Green
Write-Host ""

# Create installation directory
Write-Host "Creating installation directory..." -ForegroundColor Yellow
if (!(Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir | Out-Null
}

# Copy files
Write-Host "Copying files to $InstallDir..." -ForegroundColor Yellow
Copy-Item "$SourceDir\*" -Destination $InstallDir -Recurse -Force

# Create desktop shortcut
Write-Host "Creating desktop shortcut..." -ForegroundColor Yellow
$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($DesktopShortcut)
$Shortcut.TargetPath = "$InstallDir\$AppName.exe"
$Shortcut.Save()

# Create Start Menu shortcut
Write-Host "Creating Start Menu shortcut..." -ForegroundColor Yellow
if (!(Test-Path "$env:APPDATA\Microsoft\Windows\Start Menu\Programs")) {
    New-Item -ItemType Directory -Path "$env:APPDATA\Microsoft\Windows\Start Menu\Programs" | Out-Null
}
$Shortcut = $WshShell.CreateShortcut($StartMenuShortcut)
$Shortcut.TargetPath = "$InstallDir\$AppName.exe"
$Shortcut.Save()

Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host "You can now launch $AppName from the desktop shortcut or Start Menu." -ForegroundColor Green

# Ask user if they want to launch the application
$launch = Read-Host "Do you want to launch $AppName now? (Y/N)"
if ($launch -eq "Y" -or $launch -eq "y") {
    Start-Process "$InstallDir\$AppName.exe"
}

Write-Host "Press any key to exit..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")