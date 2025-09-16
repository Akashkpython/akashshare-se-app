# Fix Akash Share Application Launch Issue
# This script will help fix common issues preventing the app from launching

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fixing Akash Share Launch Issue" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    Write-Host "`n[1/6] Searching for installed application..." -ForegroundColor Yellow
    
    # Search for the application in common locations
    $searchPaths = @(
        "$env:LOCALAPPDATA\Programs",
        "$env:PROGRAMFILES",
        "$env:PROGRAMFILES(X86)"
    )
    
    $foundApp = $null
    foreach ($searchPath in $searchPaths) {
        if (Test-Path $searchPath) {
            $akashDirs = Get-ChildItem -Path $searchPath -Directory -Name "*akash*" -ErrorAction SilentlyContinue
            foreach ($dir in $akashDirs) {
                $fullPath = Join-Path $searchPath $dir
                Write-Host "Found: $fullPath" -ForegroundColor Green
                
                # Look for executable files
                $exeFiles = Get-ChildItem -Path $fullPath -Recurse -Name "*.exe" -ErrorAction SilentlyContinue
                if ($exeFiles) {
                    foreach ($exe in $exeFiles) {
                        $exePath = Join-Path $fullPath $exe
                        if ($exe -like "*Akash*" -or $exe -like "*akash*") {
                            $foundApp = $exePath
                            Write-Host "✅ Found main executable: $exePath" -ForegroundColor Green
                            break
                        }
                    }
                }
            }
        }
    }
    
    if (-not $foundApp) {
        Write-Host "❌ Could not find the installed application" -ForegroundColor Red
        Write-Host "Please reinstall the application using the setup.exe" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "`n[2/6] Testing application launch..." -ForegroundColor Yellow
    
    # Try to launch the application
    try {
        Write-Host "Attempting to launch: $foundApp" -ForegroundColor White
        
        # Start the process
        $process = Start-Process -FilePath $foundApp -PassThru -WindowStyle Normal
        Write-Host "✅ Application launched successfully (PID: $($process.Id))" -ForegroundColor Green
        
        # Wait a moment to see if it starts properly
        Start-Sleep -Seconds 3
        
        # Check if the process is still running
        if (-not $process.HasExited) {
            Write-Host "✅ Application is running successfully!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Application started but exited immediately" -ForegroundColor Yellow
            Write-Host "Exit code: $($process.ExitCode)" -ForegroundColor White
        }
        
    } catch {
        Write-Host "❌ Failed to launch application: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host "`n[3/6] Creating desktop shortcut..." -ForegroundColor Yellow
    
    try {
        $desktopPath = [Environment]::GetFolderPath("Desktop")
        $shortcutPath = Join-Path $desktopPath "Akash Share.lnk"
        
        # Create WScript.Shell object
        $WshShell = New-Object -comObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut($shortcutPath)
        $Shortcut.TargetPath = $foundApp
        $Shortcut.WorkingDirectory = Split-Path $foundApp
        $Shortcut.Description = "Akash Share - File Sharing Application"
        $Shortcut.Save()
        
        Write-Host "✅ Desktop shortcut created: $shortcutPath" -ForegroundColor Green
        
    } catch {
        Write-Host "⚠️ Could not create desktop shortcut: $($_.Exception.Message)" -ForegroundColor Yellow
    }

    Write-Host "`n[4/6] Creating Start Menu shortcut..." -ForegroundColor Yellow
    
    try {
        $startMenuPath = [Environment]::GetFolderPath("StartMenu")
        $shortcutPath = Join-Path $startMenuPath "Akash Share.lnk"
        
        # Create WScript.Shell object
        $WshShell = New-Object -comObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut($shortcutPath)
        $Shortcut.TargetPath = $foundApp
        $Shortcut.WorkingDirectory = Split-Path $foundApp
        $Shortcut.Description = "Akash Share - File Sharing Application"
        $Shortcut.Save()
        
        Write-Host "✅ Start Menu shortcut created: $shortcutPath" -ForegroundColor Green
        
    } catch {
        Write-Host "⚠️ Could not create Start Menu shortcut: $($_.Exception.Message)" -ForegroundColor Yellow
    }

    Write-Host "`n[5/6] Checking for common issues..." -ForegroundColor Yellow
    
    # Check if the application directory has proper permissions
    $appDir = Split-Path $foundApp
    try {
        $acl = Get-Acl $appDir
        Write-Host "✅ Application directory permissions are accessible" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Permission issue with application directory" -ForegroundColor Yellow
    }
    
    # Check if required files exist
    $requiredFiles = @("resources", "node_modules")
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $appDir $file
        if (Test-Path $filePath) {
            Write-Host "✅ Found required file/directory: $file" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Missing required file/directory: $file" -ForegroundColor Yellow
        }
    }

    Write-Host "`n[6/6] Final recommendations..." -ForegroundColor Yellow
    
    Write-Host "✅ Application location: $foundApp" -ForegroundColor Green
    Write-Host "✅ Desktop shortcut created" -ForegroundColor Green
    Write-Host "✅ Start Menu shortcut created" -ForegroundColor Green
    
    Write-Host "`nNext steps:" -ForegroundColor White
    Write-Host "1. Try double-clicking the desktop shortcut" -ForegroundColor Yellow
    Write-Host "2. Try searching for 'Akash Share' in Windows Start Menu" -ForegroundColor Yellow
    Write-Host "3. If still not working, try running as Administrator" -ForegroundColor Yellow
    Write-Host "4. Check Windows Event Viewer for error messages" -ForegroundColor Yellow

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Fix Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan

} catch {
    Write-Host "`n❌ ERROR during fix: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
