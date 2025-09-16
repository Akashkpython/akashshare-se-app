# AkAsH Share - Mandatory Uninstaller (PowerShell)
# This script requires users to type "AkAsH" exactly to uninstall

# Set console title and colors
$Host.UI.RawUI.WindowTitle = "AkAsH Share - Mandatory Uninstaller"
$Host.UI.RawUI.BackgroundColor = "Black"
$Host.UI.RawUI.ForegroundColor = "White"
Clear-Host

# Function to display header
function Show-Header {
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host "    🔒 AkAsH Share - MANDATORY Uninstaller" -ForegroundColor Red
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  WARNING: This will completely remove AkAsH Share" -ForegroundColor Yellow
    Write-Host "   from your computer. This action cannot be undone." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔐 SECURITY REQUIREMENT:" -ForegroundColor Cyan
    Write-Host "   You MUST type 'AkAsH' exactly to confirm uninstall." -ForegroundColor Cyan
    Write-Host "   This is mandatory and cannot be bypassed." -ForegroundColor Cyan
    Write-Host ""
}

# Function to get user input with timeout
function Get-UserInput {
    param(
        [string]$Prompt,
        [int]$TimeoutSeconds = 300
    )
    
    Write-Host $Prompt -ForegroundColor White -NoNewline
    $input = Read-Host
    return $input
}

# Function to remove application files
function Remove-ApplicationFiles {
    param([string[]]$Paths)
    
    $removedCount = 0
    
    foreach ($path in $Paths) {
        if (Test-Path $path) {
            Write-Host "📁 Removing application files from $path..." -ForegroundColor Yellow
            try {
                Remove-Item -Path $path -Recurse -Force -ErrorAction Stop
                Write-Host "✅ Successfully removed files from $path" -ForegroundColor Green
                $removedCount++
            }
            catch {
                Write-Host "⚠️  Warning: Could not remove all files from $path" -ForegroundColor Yellow
            }
        }
    }
    
    return $removedCount
}

# Main execution
Show-Header

# Initialize attempt counter
$attempts = 0
$maxAttempts = 3

do {
    # Check if maximum attempts reached
    if ($attempts -ge $maxAttempts) {
        Write-Host ""
        Write-Host "❌ Too many failed attempts. Uninstall cancelled." -ForegroundColor Red
        Write-Host "   This is a security measure to prevent accidental deletion." -ForegroundColor Red
        Write-Host ""
        Write-Host "Press any key to exit..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    
    # Calculate remaining attempts
    $remaining = $maxAttempts - $attempts
    
    # Display security confirmation
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host "🔐 SECURITY CONFIRMATION REQUIRED" -ForegroundColor Red
    Write-Host "==================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Required text to type: " -NoNewline -ForegroundColor White
    Write-Host "AkAsH" -ForegroundColor Cyan -BackgroundColor DarkBlue
    Write-Host "Attempts remaining: $remaining" -ForegroundColor Yellow
    Write-Host ""
    
    # Get user input
    $userInput = Get-UserInput "Type 'AkAsH' exactly to uninstall: "
    
    # Check if input matches exactly "AkAsH" (case-sensitive)
    if ($userInput -eq "AkAsH") {
        Write-Host ""
        Write-Host "✅ You typed 'AkAsH' correctly!" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  FINAL WARNING:" -ForegroundColor Yellow
        Write-Host "   Are you absolutely sure you want to uninstall AkAsH Share?" -ForegroundColor Yellow
        Write-Host "   This will completely remove the application from your computer." -ForegroundColor Yellow
        Write-Host ""
        
        $finalConfirm = Get-UserInput "Type 'YES' to confirm uninstall: "
        
        if ($finalConfirm -eq "YES") {
            Write-Host ""
            Write-Host "🔄 Uninstalling AkAsH Share..." -ForegroundColor Yellow
            Write-Host ""
            
            # Define possible installation directories
            $installDirs = @(
                "$env:ProgramFiles\AkAsH Share",
                "${env:ProgramFiles(x86)}\AkAsH Share",
                "$env:LOCALAPPDATA\AkAsH Share",
                "$env:APPDATA\AkAsH Share"
            )
            
            # Check current directory if it contains the app
            if (Test-Path "resources\app.asar") {
                $installDirs += "."
            }
            
            # Remove application files
            $removedCount = Remove-ApplicationFiles -Paths $installDirs
            
            # Remove start menu shortcuts
            $startMenuDirs = @(
                "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\AkAsH Share",
                "$env:PROGRAMDATA\Microsoft\Windows\Start Menu\Programs\AkAsH Share"
            )
            
            foreach ($dir in $startMenuDirs) {
                if (Test-Path $dir) {
                    Write-Host "📁 Removing start menu shortcuts from $dir..." -ForegroundColor Yellow
                    try {
                        Remove-Item -Path $dir -Recurse -Force -ErrorAction Stop
                        Write-Host "✅ Successfully removed start menu shortcuts" -ForegroundColor Green
                    }
                    catch {
                        Write-Host "⚠️  Warning: Could not remove start menu shortcuts" -ForegroundColor Yellow
                    }
                }
            }
            
            # Remove desktop shortcut
            $desktopShortcut = "$env:USERPROFILE\Desktop\AkAsH Share.lnk"
            if (Test-Path $desktopShortcut) {
                Write-Host "📁 Removing desktop shortcut..." -ForegroundColor Yellow
                try {
                    Remove-Item -Path $desktopShortcut -Force -ErrorAction Stop
                    Write-Host "✅ Successfully removed desktop shortcut" -ForegroundColor Green
                }
                catch {
                    Write-Host "⚠️  Warning: Could not remove desktop shortcut" -ForegroundColor Yellow
                }
            }
            
            # Try to find and remove any remaining installation directories
            try {
                $additionalPaths = Get-ChildItem -Path "$env:ProgramFiles*", "$env:LOCALAPPDATA", "$env:APPDATA" -Recurse -Directory -ErrorAction SilentlyContinue | 
                    Where-Object { $_.Name -like "*AkAsH*Share*" }
                
                foreach ($path in $additionalPaths) {
                    $pathStr = $path.FullName
                    if (Test-Path $pathStr) {
                        Write-Host "📁 Removing additional installation files from $pathStr..." -ForegroundColor Yellow
                        try {
                            Remove-Item -Path $pathStr -Recurse -Force -ErrorAction Stop
                            Write-Host "✅ Successfully removed files from $pathStr" -ForegroundColor Green
                            $removedCount++
                        }
                        catch {
                            Write-Host "⚠️  Warning: Could not remove files from $pathStr" -ForegroundColor Yellow
                        }
                    }
                }
            }
            catch {
                Write-Host "⚠️  Warning: Could not search for additional files" -ForegroundColor Yellow
            }
            
            Write-Host ""
            Write-Host "==================================================" -ForegroundColor Green
            if ($removedCount -gt 0) {
                Write-Host "✅ UNINSTALL SUCCESSFUL!" -ForegroundColor Green
                Write-Host "   All AkAsH Share files and shortcuts have been removed." -ForegroundColor Green
            } else {
                Write-Host "ℹ️  UNINSTALL COMPLETED." -ForegroundColor Cyan
                Write-Host "   No AkAsH Share installation found on this system." -ForegroundColor Cyan
            }
            Write-Host "==================================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Press any key to exit..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            exit 0
        } else {
            Write-Host ""
            Write-Host "❌ Final confirmation failed. Uninstall cancelled." -ForegroundColor Red
            Write-Host ""
            Write-Host "Press any key to exit..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            exit 1
        }
    } else {
        # Incorrect input
        $attempts++
        $remaining = $maxAttempts - $attempts
        
        Write-Host ""
        Write-Host "❌ INCORRECT! You typed: '$userInput'" -ForegroundColor Red
        Write-Host "   You must type 'AkAsH' exactly (case-sensitive)." -ForegroundColor Red
        Write-Host ""
        
        if ($remaining -gt 0) {
            Write-Host "Attempts remaining: $remaining" -ForegroundColor Yellow
            Write-Host ""
        } else {
            Write-Host "❌ Too many failed attempts. Uninstall cancelled." -ForegroundColor Red
            Write-Host "   This is a security measure to prevent accidental deletion." -ForegroundColor Red
            Write-Host ""
            Write-Host "Press any key to exit..."
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            exit 1
        }
    }
} while ($attempts -lt $maxAttempts)
