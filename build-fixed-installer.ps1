# Build Akash Share - Fixed Installer
# This script ensures proper file packaging and path resolution

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Akash Share - Fixed Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    # Step 1: Clean previous builds
    Write-Host "`n[1/6] Cleaning previous builds..." -ForegroundColor Yellow
    if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
    if (Test-Path "build") { Remove-Item -Recurse -Force "build" }
    Write-Host "✅ Cleaned previous builds" -ForegroundColor Green

    # Step 2: Install dependencies
    Write-Host "`n[2/6] Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install dependencies"
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green

    # Step 3: Build React application
    Write-Host "`n[3/6] Building React application..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to build React application"
    }
    Write-Host "✅ React application built" -ForegroundColor Green

    # Step 4: Verify build files
    Write-Host "`n[4/6] Verifying build files..." -ForegroundColor Yellow
    
    if (-not (Test-Path "build\index.html")) {
        throw "index.html not found in build directory"
    }
    Write-Host "✅ index.html found" -ForegroundColor Green

    if (-not (Test-Path "build\static")) {
        throw "static directory not found in build directory"
    }
    Write-Host "✅ static directory found" -ForegroundColor Green

    # Check for critical static files
    $staticFiles = @("build\static\js", "build\static\css")
    foreach ($dir in $staticFiles) {
        if (-not (Test-Path $dir)) {
            throw "$dir not found in build directory"
        }
    }
    Write-Host "✅ All static files verified" -ForegroundColor Green

    # Step 5: Build Electron application
    Write-Host "`n[5/6] Building Electron application..." -ForegroundColor Yellow
    npm run dist
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to build Electron application"
    }
    Write-Host "✅ Electron application built" -ForegroundColor Green

    # Step 6: Verify installer
    Write-Host "`n[6/6] Verifying installer..." -ForegroundColor Yellow
    
    if (Test-Path "dist\AkashShareUserSetup-x64.exe") {
        $fileInfo = Get-Item "dist\AkashShareUserSetup-x64.exe"
        Write-Host "✅ Installer created successfully" -ForegroundColor Green
        Write-Host "   File: $($fileInfo.Name)" -ForegroundColor White
        Write-Host "   Size: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor White
        Write-Host "   Path: $($fileInfo.FullName)" -ForegroundColor White
    } else {
        throw "Installer not found at dist\AkashShareUserSetup-x64.exe"
    }

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Build completed successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "`nThe installer is ready at: dist\AkashShareUserSetup-x64.exe" -ForegroundColor White

} catch {
    Write-Host "`n❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nBuild failed. Please check the error above and try again." -ForegroundColor Red
    exit 1
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
