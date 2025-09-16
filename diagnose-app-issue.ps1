# Diagnose Akash Share Application Launch Issue
# This script will help identify why the app isn't opening after installation

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Diagnosing Akash Share Launch Issue" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    Write-Host "`n[1/8] Checking installed application locations..." -ForegroundColor Yellow
    
    # Check common installation locations
    $installPaths = @(
        "$env:LOCALAPPDATA\Programs\akash-share",
        "$env:PROGRAMFILES\akash-share",
        "$env:PROGRAMFILES(X86)\akash-share",
        "$env:LOCALAPPDATA\Programs\Akash Share",
        "$env:PROGRAMFILES\Akash Share",
        "$env:PROGRAMFILES(X86)\Akash Share"
    )
    
    $foundApp = $false
    foreach ($path in $installPaths) {
        if (Test-Path $path) {
            Write-Host "✅ Found installation at: $path" -ForegroundColor Green
            $foundApp = $true
            
            # Look for executable files
            $exeFiles = Get-ChildItem -Path $path -Recurse -Name "*.exe" -ErrorAction SilentlyContinue
            if ($exeFiles) {
                Write-Host "   Executable files found:" -ForegroundColor White
                foreach ($exe in $exeFiles) {
                    Write-Host "   - $exe" -ForegroundColor White
                }
            } else {
                Write-Host "   ⚠️ No executable files found" -ForegroundColor Yellow
            }
        }
    }
    
    if (-not $foundApp) {
        Write-Host "❌ No installation found in common locations" -ForegroundColor Red
    }

    Write-Host "`n[2/8] Checking Windows Registry for application..." -ForegroundColor Yellow
    
    # Check registry for installed applications
    $registryPaths = @(
        "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*",
        "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*",
        "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*"
    )
    
    $foundInRegistry = $false
    foreach ($regPath in $registryPaths) {
        try {
            $apps = Get-ItemProperty $regPath -ErrorAction SilentlyContinue | Where-Object { 
                $_.DisplayName -like "*akash*" -or $_.DisplayName -like "*Akash*" 
            }
            if ($apps) {
                Write-Host "✅ Found in registry:" -ForegroundColor Green
                foreach ($app in $apps) {
                    Write-Host "   - $($app.DisplayName)" -ForegroundColor White
                    Write-Host "     Install Location: $($app.InstallLocation)" -ForegroundColor Gray
                }
                $foundInRegistry = $true
            }
        } catch {
            # Ignore registry access errors
        }
    }
    
    if (-not $foundInRegistry) {
        Write-Host "❌ Not found in Windows Registry" -ForegroundColor Red
    }

    Write-Host "`n[3/8] Checking for desktop shortcuts..." -ForegroundColor Yellow
    
    $desktopShortcuts = Get-ChildItem -Path "$env:USERPROFILE\Desktop" -Name "*akash*" -ErrorAction SilentlyContinue
    if ($desktopShortcuts) {
        Write-Host "✅ Desktop shortcuts found:" -ForegroundColor Green
        foreach ($shortcut in $desktopShortcuts) {
            Write-Host "   - $shortcut" -ForegroundColor White
        }
    } else {
        Write-Host "❌ No desktop shortcuts found" -ForegroundColor Red
    }

    Write-Host "`n[4/8] Checking Start Menu shortcuts..." -ForegroundColor Yellow
    
    $startMenuShortcuts = Get-ChildItem -Path "$env:APPDATA\Microsoft\Windows\Start Menu\Programs" -Recurse -Name "*akash*" -ErrorAction SilentlyContinue
    if ($startMenuShortcuts) {
        Write-Host "✅ Start Menu shortcuts found:" -ForegroundColor Green
        foreach ($shortcut in $startMenuShortcuts) {
            Write-Host "   - $shortcut" -ForegroundColor White
        }
    } else {
        Write-Host "❌ No Start Menu shortcuts found" -ForegroundColor Red
    }

    Write-Host "`n[5/8] Checking for running processes..." -ForegroundColor Yellow
    
    $runningProcesses = Get-Process | Where-Object { $_.ProcessName -like "*akash*" -or $_.ProcessName -like "*Akash*" }
    if ($runningProcesses) {
        Write-Host "✅ Running processes found:" -ForegroundColor Green
        foreach ($process in $runningProcesses) {
            Write-Host "   - $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor White
        }
    } else {
        Write-Host "❌ No running Akash Share processes" -ForegroundColor Red
    }

    Write-Host "`n[6/8] Checking Windows Event Logs for errors..." -ForegroundColor Yellow
    
    try {
        $recentErrors = Get-WinEvent -FilterHashtable @{LogName='Application'; Level=2; StartTime=(Get-Date).AddHours(-1)} -ErrorAction SilentlyContinue | 
                       Where-Object { $_.Message -like "*akash*" -or $_.Message -like "*Akash*" -or $_.Message -like "*electron*" }
        
        if ($recentErrors) {
            Write-Host "⚠️ Recent errors found in Event Log:" -ForegroundColor Yellow
            foreach ($error in $recentErrors | Select-Object -First 3) {
                Write-Host "   - $($error.TimeCreated): $($error.Message.Substring(0, [Math]::Min(100, $error.Message.Length)))..." -ForegroundColor White
            }
        } else {
            Write-Host "✅ No recent errors in Event Log" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️ Could not access Event Log" -ForegroundColor Yellow
    }

    Write-Host "`n[7/8] Testing application launch..." -ForegroundColor Yellow
    
    # Try to find and launch the application
    $possibleExePaths = @()
    foreach ($path in $installPaths) {
        if (Test-Path $path) {
            $exeFiles = Get-ChildItem -Path $path -Recurse -Name "*.exe" -ErrorAction SilentlyContinue
            foreach ($exe in $exeFiles) {
                $possibleExePaths += Join-Path $path $exe
            }
        }
    }
    
    if ($possibleExePaths.Count -gt 0) {
        Write-Host "Found potential executable files:" -ForegroundColor White
        foreach ($exePath in $possibleExePaths) {
            Write-Host "   - $exePath" -ForegroundColor White
            
            # Test if the file exists and is executable
            if (Test-Path $exePath) {
                Write-Host "     ✅ File exists" -ForegroundColor Green
                
                # Try to get file information
                try {
                    $fileInfo = Get-Item $exePath
                    Write-Host "     Size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Gray
                    Write-Host "     Created: $($fileInfo.CreationTime)" -ForegroundColor Gray
                } catch {
                    Write-Host "     ⚠️ Could not get file info" -ForegroundColor Yellow
                }
            } else {
                Write-Host "     ❌ File does not exist" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "❌ No executable files found to test" -ForegroundColor Red
    }

    Write-Host "`n[8/8] Recommendations..." -ForegroundColor Yellow
    
    if (-not $foundApp) {
        Write-Host "🔧 RECOMMENDATION: Reinstall the application" -ForegroundColor Yellow
        Write-Host "   1. Uninstall the current installation" -ForegroundColor White
        Write-Host "   2. Run the setup.exe again as Administrator" -ForegroundColor White
        Write-Host "   3. Check the installation directory during setup" -ForegroundColor White
    } elseif ($possibleExePaths.Count -gt 0) {
        Write-Host "🔧 RECOMMENDATION: Try launching from command line" -ForegroundColor Yellow
        Write-Host "   1. Open Command Prompt as Administrator" -ForegroundColor White
        Write-Host "   2. Navigate to the installation directory" -ForegroundColor White
        Write-Host "   3. Run the executable directly" -ForegroundColor White
        Write-Host "   4. Check for error messages" -ForegroundColor White
    } else {
        Write-Host "🔧 RECOMMENDATION: Check installation logs" -ForegroundColor Yellow
        Write-Host "   1. Look for installation error messages" -ForegroundColor White
        Write-Host "   2. Check Windows Event Viewer" -ForegroundColor White
        Write-Host "   3. Try running setup.exe again" -ForegroundColor White
    }

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Diagnosis Complete" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan

} catch {
    Write-Host "`n❌ ERROR during diagnosis: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
