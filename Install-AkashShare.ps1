# Akash Share Installer
# This script installs Akash Share to the Program Files directory

# Check for administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "This installer requires administrator privileges."
    Write-Host "Please right-click on this file and select 'Run as administrator'."
    Write-Host ""
    Write-Host "Press any key to exit..."
    $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

Write-Host "=================================================="
Write-Host "           Akash Share Installer"
Write-Host "=================================================="
Write-Host ""

Write-Host "Installing Akash Share..."
Write-Host ""

# Define variables
$appName = "Akash Share"
$installDir = "$env:ProgramFiles\$appName"
$sourceDir = "dist-final\$appName-win32-x64"

Write-Host "Installing to: $installDir"
Write-Host ""

# Create installation directory
Write-Host "Creating installation directory..."
if (Test-Path $installDir) {
    Write-Host "Removing existing installation..."
    Remove-Item $installDir -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Path $installDir -Force | Out-Null

# Copy files
Write-Host "Copying application files..."
try {
    Copy-Item "$sourceDir\*" -Destination $installDir -Recurse -Force
    Write-Host "Files copied successfully."
} catch {
    Write-Host "Error: Failed to copy application files."
    Write-Host "Please make sure the application files are in the correct location."
    Write-Host ""
    Write-Host "Press any key to exit..."
    $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# Create desktop shortcut
Write-Host "Creating desktop shortcut..."
try {
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\$appName.lnk")
    $Shortcut.TargetPath = "$installDir\$appName.exe"
    $Shortcut.Save()
    Write-Host "Desktop shortcut created."
} catch {
    Write-Host "Warning: Could not create desktop shortcut."
}

# Create Start Menu shortcut
Write-Host "Creating Start Menu shortcut..."
try {
    $startMenuDir = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\$appName"
    if (-not (Test-Path $startMenuDir)) {
        New-Item -ItemType Directory -Path $startMenuDir -Force | Out-Null
    }
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("$startMenuDir\$appName.lnk")
    $Shortcut.TargetPath = "$installDir\$appName.exe"
    $Shortcut.Save()
    Write-Host "Start Menu shortcut created."
} catch {
    Write-Host "Warning: Could not create Start Menu shortcut."
}

Write-Host ""
Write-Host "Installation completed successfully!"
Write-Host ""
Write-Host "You can now launch $appName from the desktop shortcut or Start Menu."
Write-Host ""

# Ask user if they want to launch the application
Write-Host "Do you want to launch $appName now? (Y/N)"
$launch = Read-Host
if ($launch -eq "Y" -or $launch -eq "y") {
    Write-Host "Launching $appName..."
    Start-Process "$installDir\$appName.exe"
}

Write-Host ""
Write-Host "Press any key to exit..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")