# Simple Akash Share Setup.exe Builder
param(
    [switch]$SkipTest
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Akash Share Setup.exe Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️ $Message" -ForegroundColor Blue
}

try {
    # Check Node.js
    Write-Info "Checking Node.js..."
    $nodeVersion = node --version 2>$null
    if (-not $nodeVersion) {
        throw "Node.js not found"
    }
    Write-Success "Node.js: $nodeVersion"
    
    # Check npm
    Write-Info "Checking npm..."
    $npmVersion = npm --version 2>$null
    if (-not $npmVersion) {
        throw "npm not found"
    }
    Write-Success "npm: $npmVersion"
    
    # Clean previous builds
    Write-Info "Cleaning previous builds..."
    if (Test-Path "dist") {
        Remove-Item -Recurse -Force "dist"
    }
    if (Test-Path "build") {
        Remove-Item -Recurse -Force "build"
    }
    Write-Success "Cleanup completed"
    
    # Install dependencies
    Write-Info "Installing dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to install dependencies"
    }
    Write-Success "Dependencies installed"
    
    # Install backend dependencies
    Write-Info "Installing backend dependencies..."
    Push-Location "backend"
    try {
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to install backend dependencies"
        }
        Write-Success "Backend dependencies installed"
    }
    finally {
        Pop-Location
    }
    
    # Build React app
    Write-Info "Building React application..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to build React application"
    }
    Write-Success "React application built"
    
    # Copy electron files
    Write-Info "Copying electron files..."
    if (-not (Test-Path "build\electron")) {
        New-Item -ItemType Directory -Path "build\electron" -Force | Out-Null
    }
    Copy-Item -Path "electron\*" -Destination "build\electron\" -Recurse -Force
    Write-Success "Electron files copied"
    
    # Create dist directory
    if (-not (Test-Path "dist")) {
        New-Item -ItemType Directory -Path "dist" -Force | Out-Null
    }
    
    # Build setup.exe
    Write-Info "Building setup.exe..."
    Write-Info "This may take several minutes..."
    
    npx electron-builder --config electron-builder-setup.config.cjs --win --publish=never
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to build setup.exe"
    }
    
    # Check if setup.exe was created
    $setupPath = "dist\AkashShareUserSetup-x64.exe"
    if (Test-Path $setupPath) {
        $fileSize = [math]::Round((Get-Item $setupPath).Length / 1MB, 2)
        Write-Success "Setup.exe created successfully: $fileSize MB"
        
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "    ✅ BUILD COMPLETED SUCCESSFULLY!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Setup.exe location: $setupPath" -ForegroundColor Cyan
        Write-Host "WebSocket support: Included" -ForegroundColor Green
        Write-Host "Backend server: Included" -ForegroundColor Green
        Write-Host "Chat functionality: Included" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your Akash Share setup.exe is ready!" -ForegroundColor Magenta
        
        # List files in dist
        Write-Host ""
        Write-Host "Files in dist directory:" -ForegroundColor Yellow
        Get-ChildItem -Path "dist" -Filter "*.exe" | ForEach-Object {
            $size = [math]::Round($_.Length / 1MB, 2)
            $fileName = $_.Name
            Write-Host "  File: $fileName ($size MB)" -ForegroundColor Cyan
        }
    } else {
        throw "Setup.exe was not created"
    }
    
} catch {
    Write-Host ""
    Write-Error "BUILD FAILED!"
    Write-Error "Error: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "Common solutions:" -ForegroundColor Yellow
    Write-Host "  - Run as administrator" -ForegroundColor White
    Write-Host "  - Check available disk space" -ForegroundColor White
    Write-Host "  - Ensure Node.js and npm are installed" -ForegroundColor White
    Write-Host "  - Check internet connection" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
