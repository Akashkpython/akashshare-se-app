# Akash Share Setup.exe Builder
# PowerShell script for building professional setup.exe

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Akash Share Setup.exe Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set error handling
$ErrorActionPreference = "Stop"

try {
    # Check if Node.js is installed
    Write-Host "🔍 Checking Node.js installation..." -ForegroundColor Yellow
    $nodeVersion = node --version 2>$null
    if (-not $nodeVersion) {
        throw "Node.js is not installed or not in PATH. Please install Node.js from https://nodejs.org/"
    }
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

    # Check if npm is available
    Write-Host "🔍 Checking npm availability..." -ForegroundColor Yellow
    $npmVersion = npm --version 2>$null
    if (-not $npmVersion) {
        throw "npm is not available"
    }
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
    Write-Host ""

    # Clean previous builds
    Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
    if (Test-Path "dist") {
        Remove-Item -Recurse -Force "dist"
        Write-Host "✅ Removed dist directory" -ForegroundColor Green
    }
    if (Test-Path "build") {
        Remove-Item -Recurse -Force "build"
        Write-Host "✅ Removed build directory" -ForegroundColor Green
    }
    Write-Host "✅ Cleanup completed" -ForegroundColor Green
    Write-Host ""

    # Install dependencies
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install dependencies"
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
    Write-Host ""

    # Install backend dependencies
    Write-Host "🔧 Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location "backend"
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to install backend dependencies"
        }
        Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
    }
    finally {
        Pop-Location
    }
    Write-Host ""

    # Build React application
    Write-Host "🏗️ Building React application..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to build React application"
    }
    Write-Host "✅ React application built" -ForegroundColor Green
    Write-Host ""

    # Copy electron files to build directory
    Write-Host "📋 Copying electron files..." -ForegroundColor Yellow
    if (-not (Test-Path "build\electron")) {
        New-Item -ItemType Directory -Path "build\electron" -Force | Out-Null
    }
    Copy-Item -Path "electron\*" -Destination "build\electron\" -Recurse -Force
    Write-Host "✅ Electron files copied" -ForegroundColor Green
    Write-Host ""

    # Create dist directory
    Write-Host "📁 Creating dist directory..." -ForegroundColor Yellow
    if (-not (Test-Path "dist")) {
        New-Item -ItemType Directory -Path "dist" -Force | Out-Null
    }
    Write-Host "✅ Dist directory created" -ForegroundColor Green
    Write-Host ""

    # Build setup.exe using electron-builder
    Write-Host "🔨 Building setup.exe..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Cyan
    npx electron-builder --config electron-builder-setup.config.cjs --win --publish=never
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to build setup.exe"
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "    ✅ BUILD COMPLETED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Setup.exe location: dist\AkashShareUserSetup-x64.exe" -ForegroundColor Cyan
    Write-Host "🔌 WebSocket support: ✅ Included" -ForegroundColor Green
    Write-Host "🚀 Backend server: ✅ Included" -ForegroundColor Green
    Write-Host "📱 Chat functionality: ✅ Included" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Your Akash Share setup.exe is ready!" -ForegroundColor Magenta
    Write-Host ""

    # List files in dist directory
    Write-Host "📋 Files in dist directory:" -ForegroundColor Yellow
    $exeFiles = Get-ChildItem -Path "dist" -Filter "*.exe" -ErrorAction SilentlyContinue
    if ($exeFiles) {
        foreach ($file in $exeFiles) {
            $size = [math]::Round($file.Length / 1MB, 2)
            Write-Host "  📄 $($file.Name) ($size MB)" -ForegroundColor Cyan
        }
        Write-Host ""
        Write-Host "💡 You can now distribute the setup.exe file" -ForegroundColor Green
    } else {
        Write-Host "❌ No .exe files found in dist directory" -ForegroundColor Red
    }

} catch {
    Write-Host ""
    Write-Host "❌ BUILD FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error above and try again." -ForegroundColor Yellow
    Write-Host "Common solutions:" -ForegroundColor Yellow
    Write-Host "  - Ensure Node.js and npm are properly installed" -ForegroundColor White
    Write-Host "  - Check your internet connection" -ForegroundColor White
    Write-Host "  - Run as administrator if needed" -ForegroundColor White
    Write-Host "  - Check available disk space" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
