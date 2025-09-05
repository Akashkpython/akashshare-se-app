# AkAsH Share Uninstaller Script
# PowerShell version

# Set console title
$host.UI.RawUI.WindowTitle = "AkAsH Share Uninstaller"

# Clear the screen
Clear-Host

# Display header
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "           AkAsH Share Uninstaller" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Initialize attempt counter
$attempts = 0
$maxAttempts = 3

# Function to get installation paths from registry
function Get-InstallationPaths {
    $paths = @()
    
    # Check registry for installed locations
    $registryPaths = @(
        "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*",
        "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*"
    )
    
    foreach ($regPath in $registryPaths) {
        try {
            $uninstallEntries = Get-ItemProperty -Path $regPath -ErrorAction SilentlyContinue | 
                Where-Object { $_.DisplayName -like "*AkAsH*" -or $_.DisplayName -like "*Akash*" }
            
            foreach ($entry in $uninstallEntries) {
                if ($entry.InstallLocation -and (Test-Path $entry.InstallLocation)) {
                    $paths += $entry.InstallLocation
                }
            }
        }
        catch {
            # Continue silently if registry access fails
        }
    }
    
    # Add common installation paths as fallback
    $commonPaths = @(
        "${env:ProgramFiles}\AkAsH Share",
        "${env:ProgramFiles(x86)}\AkAsH Share",
        "${env:LOCALAPPDATA}\AkAsH Share",
        "${env:APPDATA}\AkAsH Share"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            if ($paths -notcontains $path) {
                $paths += $path
            }
        }
    }
    
    # Also check current directory if it looks like an installation
    $currentDir = Get-Location
    if (Test-Path "$currentDir\resources\app.asar" -or Test-Path "$currentDir\AkAsH Share.exe") {
        if ($paths -notcontains $currentDir) {
            $paths += $currentDir
        }
    }
    
    return $paths
}

# Function to remove files and directories
function Remove-ApplicationFiles {
    param(
        [string[]]$Paths
    )
    
    $removedCount = 0
    
    foreach ($path in $Paths) {
        if (Test-Path $path) {
            Write-Host "Removing application files from $path..."
            try {
                Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
                if (-not (Test-Path $path)) {
                    Write-Host "Successfully removed $path" -ForegroundColor Green
                    $removedCount++
                } else {
                    Write-Host "Warning: Could not remove all files from $path" -ForegroundColor Yellow
                }
            }
            catch {
                Write-Host "Error removing $path: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    
    # Remove start menu shortcuts
    $startMenuDirs = @(
        "${env:APPDATA}\Microsoft\Windows\Start Menu\Programs\AkAsH Share",
        "${env:PROGRAMDATA}\Microsoft\Windows\Start Menu\Programs\AkAsH Share"
    )
    
    foreach ($dir in $startMenuDirs) {
        if (Test-Path $dir) {
            Write-Host "Removing start menu shortcuts..."
            try {
                Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "Successfully removed start menu shortcuts" -ForegroundColor Green
            }
            catch {
                Write-Host "Warning: Could not remove start menu shortcuts" -ForegroundColor Yellow
            }
        }
    }
    
    # Remove desktop shortcut
    $desktopShortcut = "${env:USERPROFILE}\Desktop\AkAsH Share.lnk"
    if (Test-Path $desktopShortcut) {
        Write-Host "Removing desktop shortcut..."
        try {
            Remove-Item -Path $desktopShortcut -Force -ErrorAction SilentlyContinue
            Write-Host "Successfully removed desktop shortcut" -ForegroundColor Green
        }
        catch {
            Write-Host "Warning: Could not remove desktop shortcut" -ForegroundColor Yellow
        }
    }
    
    # Try to find and remove any remaining installation directories
    try {
        $additionalPaths = Get-ChildItem -Path "$env:ProgramFiles*", "$env:LOCALAPPDATA", "$env:APPDATA" -Recurse -Directory -ErrorAction SilentlyContinue | 
            Where-Object { $_.Name -like "*AkAsH*Share*" }
        
        foreach ($path in $additionalPaths) {
            $pathStr = $path.FullName
            if (Test-Path $pathStr) {
                Write-Host "Removing additional installation files from $pathStr..."
                try {
                    Remove-Item -Path $pathStr -Recurse -Force -ErrorAction SilentlyContinue
                    Write-Host "Successfully removed files from $pathStr" -ForegroundColor Green
                    $removedCount++
                }
                catch {
                    Write-Host "Warning: Could not remove files from $pathStr" -ForegroundColor Yellow
                }
            }
        }
    }
    catch {
        # Continue silently if search fails
    }
    
    return $removedCount
}

# Main uninstall loop
do {
    # Check if maximum attempts reached
    if ($attempts -ge $maxAttempts) {
        Write-Host ""
        Write-Host "Too many failed attempts. Uninstall cancelled." -ForegroundColor Red
        Write-Host ""
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit
    }
    
    # Prompt user for confirmation
    $userInput = Read-Host "Type 'AkAsH' to uninstall the app"
    
    # Check if input matches required text (case-insensitive)
    if ($userInput -eq "AkAsH") {
        Write-Host ""
        Write-Host "Uninstalling AkAsH Share..." -ForegroundColor Yellow
        Write-Host ""
        
        # Find installation paths
        $installPaths = Get-InstallationPaths
        
        if ($installPaths.Count -gt 0) {
            Write-Host "Found $($installPaths.Count) installation location(s):"
            foreach ($path in $installPaths) {
                Write-Host "  - $path"
            }
            Write-Host ""
            
            # Remove application files
            $removedCount = Remove-ApplicationFiles -Paths $installPaths
            
            if ($removedCount -gt 0) {
                Write-Host ""
                Write-Host "Uninstall successful!" -ForegroundColor Green
                Write-Host "All AkAsH Share files have been removed from your system." -ForegroundColor Green
            } else {
                Write-Host ""
                Write-Host "Uninstall completed with warnings." -ForegroundColor Yellow
                Write-Host "Some files may not have been removed." -ForegroundColor Yellow
            }
        } else {
            Write-Host "No AkAsH Share installation found on this system." -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit
    } else {
        # Incorrect input
        $attempts++
        $remaining = $maxAttempts - $attempts
        
        Write-Host ""
        Write-Host "Incorrect name. Uninstall cancelled." -ForegroundColor Red
        Write-Host "You have $remaining attempts remaining." -ForegroundColor Red
        Write-Host ""
    }
} while ($attempts -lt $maxAttempts)