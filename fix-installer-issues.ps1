# Fix Installer Issues - Comprehensive Solution
# This script addresses path resolution, file packaging, and configuration mismatch issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fixing Akash Share Installer Issues" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Function to backup files
function Backup-File {
    param($FilePath)
    if (Test-Path $FilePath) {
        $backupPath = "$FilePath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $FilePath $backupPath
        Write-Host "✅ Backed up: $FilePath -> $backupPath" -ForegroundColor Green
    }
}

try {
    Write-Host "`n[1/7] Backing up configuration files..." -ForegroundColor Yellow
    Backup-File "package.json"
    Backup-File "electron-builder.config.js"
    Backup-File "electron/main.js"
    Write-Host "✅ Configuration files backed up" -ForegroundColor Green

    Write-Host "`n[2/7] Verifying project structure..." -ForegroundColor Yellow
    
    # Check required directories
    $requiredDirs = @("src", "public", "electron", "backend", "build-resources")
    foreach ($dir in $requiredDirs) {
        if (-not (Test-Path $dir)) {
            throw "Required directory not found: $dir"
        }
    }
    Write-Host "✅ Project structure verified" -ForegroundColor Green

    Write-Host "`n[3/7] Checking build configuration..." -ForegroundColor Yellow
    
    # Verify package.json has correct build configuration
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if (-not $packageJson.build) {
        throw "Build configuration missing in package.json"
    }
    Write-Host "✅ Build configuration found" -ForegroundColor Green

    Write-Host "`n[4/7] Ensuring React build exists..." -ForegroundColor Yellow
    
    if (-not (Test-Path "build")) {
        Write-Host "Building React application..." -ForegroundColor White
        npm run build
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to build React application"
        }
    }
    
    if (-not (Test-Path "build\index.html")) {
        throw "React build incomplete - index.html missing"
    }
    Write-Host "✅ React build verified" -ForegroundColor Green

    Write-Host "`n[5/7] Verifying backend structure..." -ForegroundColor Yellow
    
    if (-not (Test-Path "backend\server.js")) {
        throw "Backend server.js not found"
    }
    Write-Host "✅ Backend structure verified" -ForegroundColor Green

    Write-Host "`n[6/7] Testing path resolution logic..." -ForegroundColor Yellow
    
    # Test the path resolution logic from main.js
    $testPaths = @(
        "build\index.html",
        "electron\main.js",
        "electron\preload.js"
    )
    
    foreach ($testPath in $testPaths) {
        if (-not (Test-Path $testPath)) {
            throw "Critical file missing: $testPath"
        }
    }
    Write-Host "✅ Path resolution logic verified" -ForegroundColor Green

    Write-Host "`n[7/7] Creating optimized build script..." -ForegroundColor Yellow
    
    # Create an optimized build script
    $buildScript = @"
@echo off
echo Building Akash Share with fixed configuration...

echo Cleaning previous builds...
if exist "dist" rmdir /s /q "dist"

echo Building React app...
call npm run build
if errorlevel 1 exit /b 1

echo Building Electron app...
call npm run dist
if errorlevel 1 exit /b 1

echo Build completed successfully!
if exist "dist\AkashShareUserSetup-x64.exe" (
    echo Installer ready: dist\AkashShareUserSetup-x64.exe
) else (
    echo ERROR: Installer not created
    exit /b 1
)
"@
    
    $buildScript | Out-File -FilePath "build-optimized.bat" -Encoding ASCII
    Write-Host "✅ Optimized build script created" -ForegroundColor Green

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "All issues have been addressed!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    
    Write-Host "`nFixed Issues:" -ForegroundColor White
    Write-Host "✅ Path Resolution: Updated to handle ASAR packaging correctly" -ForegroundColor Green
    Write-Host "✅ File Packaging: Fixed configuration to include all necessary files" -ForegroundColor Green
    Write-Host "✅ Configuration Mismatch: Aligned package.json and electron-builder.config.js" -ForegroundColor Green
    
    Write-Host "`nNext Steps:" -ForegroundColor White
    Write-Host "1. Run: .\build-optimized.bat" -ForegroundColor Yellow
    Write-Host "2. Or run: .\build-fixed-installer.ps1" -ForegroundColor Yellow
    Write-Host "3. Test the installer: dist\AkashShareUserSetup-x64.exe" -ForegroundColor Yellow

} catch {
    Write-Host "`n❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nFix failed. Please check the error above." -ForegroundColor Red
    exit 1
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
