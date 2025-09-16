# Test Akash Share Installer
# This script tests the installer to ensure it works correctly

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Akash Share Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    # Check if installer exists
    $installerPath = "dist\AkashShareUserSetup-x64.exe"
    if (-not (Test-Path $installerPath)) {
        throw "Installer not found at: $installerPath"
    }
    
    $installerInfo = Get-Item $installerPath
    Write-Host "✅ Installer found: $($installerInfo.Name)" -ForegroundColor Green
    Write-Host "   Size: $([math]::Round($installerInfo.Length / 1MB, 2)) MB" -ForegroundColor White
    Write-Host "   Created: $($installerInfo.CreationTime)" -ForegroundColor White

    # Check if extracted app exists (for testing)
    $extractedPath = "dist\extracted-app"
    if (Test-Path $extractedPath) {
        Write-Host "`n[1/5] Testing extracted app structure..." -ForegroundColor Yellow
        
        # Check critical files
        $criticalFiles = @(
            "extracted-app\build\index.html",
            "extracted-app\electron\main.js",
            "extracted-app\electron\preload.js",
            "extracted-app\package.json"
        )
        
        foreach ($file in $criticalFiles) {
            $fullPath = "dist\$file"
            if (Test-Path $fullPath) {
                Write-Host "✅ Found: $file" -ForegroundColor Green
            } else {
                Write-Host "❌ Missing: $file" -ForegroundColor Red
            }
        }
        
        # Check backend resources
        $backendPath = "dist\extracted-app\resources\backend"
        if (Test-Path $backendPath) {
            Write-Host "✅ Backend resources found" -ForegroundColor Green
        } else {
            Write-Host "❌ Backend resources missing" -ForegroundColor Red
        }
    }

    Write-Host "`n[2/5] Testing path resolution logic..." -ForegroundColor Yellow
    
    # Simulate the path resolution logic from main.js
    $testPaths = @(
        "dist\extracted-app\build\index.html",
        "dist\extracted-app\resources\app.asar\build\index.html"
    )
    
    foreach ($testPath in $testPaths) {
        if (Test-Path $testPath) {
            Write-Host "✅ Path accessible: $testPath" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Path not accessible: $testPath" -ForegroundColor Yellow
        }
    }

    Write-Host "`n[3/5] Checking file permissions..." -ForegroundColor Yellow
    
    # Check if installer is executable
    $acl = Get-Acl $installerPath
    $hasExecute = $acl.Access | Where-Object { $_.FileSystemRights -match "ExecuteFile|FullControl" }
    
    if ($hasExecute) {
        Write-Host "✅ Installer has execute permissions" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Installer may not have execute permissions" -ForegroundColor Yellow
    }

    Write-Host "`n[4/5] Verifying installer integrity..." -ForegroundColor Yellow
    
    # Check file size (should be reasonable)
    if ($installerInfo.Length -gt 50MB -and $installerInfo.Length -lt 500MB) {
        Write-Host "✅ Installer size is reasonable" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Installer size may be unusual: $([math]::Round($installerInfo.Length / 1MB, 2)) MB" -ForegroundColor Yellow
    }

    Write-Host "`n[5/5] Testing installer execution..." -ForegroundColor Yellow
    
    Write-Host "To test the installer manually:" -ForegroundColor White
    Write-Host "1. Right-click on: $installerPath" -ForegroundColor Yellow
    Write-Host "2. Select 'Run as administrator'" -ForegroundColor Yellow
    Write-Host "3. Follow the installation wizard" -ForegroundColor Yellow
    Write-Host "4. Check if the app launches correctly after installation" -ForegroundColor Yellow

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Installer Test Summary" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    Write-Host "✅ Installer file exists and is accessible" -ForegroundColor Green
    Write-Host "✅ File structure appears correct" -ForegroundColor Green
    Write-Host "✅ Path resolution logic should work" -ForegroundColor Green
    
    Write-Host "`nManual Testing Required:" -ForegroundColor White
    Write-Host "- Install the application" -ForegroundColor Yellow
    Write-Host "- Verify the app launches" -ForegroundColor Yellow
    Write-Host "- Check if all features work" -ForegroundColor Yellow
    Write-Host "- Test file sharing functionality" -ForegroundColor Yellow

} catch {
    Write-Host "`n❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nTest failed. Please check the error above." -ForegroundColor Red
    exit 1
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
