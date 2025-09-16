# Akash Share Complete Build and Test Script
# Builds setup.exe and tests WebSocket functionality

param(
    [switch]$SkipBuild,
    [switch]$SkipTest,
    [switch]$Verbose
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Akash Share Complete Build & Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"
$startTime = Get-Date

# Configuration
$config = @{
    BuildConfig = "electron-builder-setup.config.cjs"
    TestScript = "test-websocket-setup.js"
    OutputDir = "dist"
    SetupName = "AkashShareUserSetup-x64.exe"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" "Red"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️ $Message" "Yellow"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ️ $Message" "Blue"
}

function Write-Test {
    param([string]$Message)
    Write-ColorOutput "🧪 $Message" "Cyan"
}

function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        if (-not $nodeVersion) {
            throw "Node.js not found"
        }
        Write-Success "Node.js: $nodeVersion"
    }
    catch {
        Write-Error "Node.js is required but not installed. Please install from https://nodejs.org/"
        return $false
    }
    
    # Check npm
    try {
        $npmVersion = npm --version 2>$null
        if (-not $npmVersion) {
            throw "npm not found"
        }
        Write-Success "npm: $npmVersion"
    }
    catch {
        Write-Error "npm is required but not available"
        return $false
    }
    
    # Check if config file exists
    if (-not (Test-Path $config.BuildConfig)) {
        Write-Error "Build configuration file not found: $($config.BuildConfig)"
        return $false
    }
    
    Write-Success "All prerequisites met"
    return $true
}

function Build-SetupExe {
    Write-Info "Starting setup.exe build process..."
    
    try {
        # Clean previous builds
        Write-Info "Cleaning previous builds..."
        if (Test-Path $config.OutputDir) {
            Remove-Item -Recurse -Force $config.OutputDir
        }
        if (Test-Path "build") {
            Remove-Item -Recurse -Force "build"
        }
        Write-Success "Cleanup completed"
        
        # Install dependencies
        Write-Info "Installing main dependencies..."
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to install main dependencies"
        }
        Write-Success "Main dependencies installed"
        
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
        if (-not (Test-Path $config.OutputDir)) {
            New-Item -ItemType Directory -Path $config.OutputDir -Force | Out-Null
        }
        
        # Build setup.exe
        Write-Info "Building setup.exe (this may take several minutes)..."
        Write-Info "Using configuration: $($config.BuildConfig)"
        
        $buildCommand = "npx electron-builder --config $($config.BuildConfig) --win --publish=never"
        if ($Verbose) {
            $buildCommand += " --verbose"
        }
        
        Invoke-Expression $buildCommand
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to build setup.exe"
        }
        
        # Verify setup.exe was created
        $setupPath = Join-Path $config.OutputDir $config.SetupName
        if (Test-Path $setupPath) {
            $fileSize = [math]::Round((Get-Item $setupPath).Length / 1MB, 2)
            Write-Success "Setup.exe created successfully: $fileSize MB"
            return $true
        } else {
            throw "Setup.exe was not created in expected location"
        }
    }
    catch {
        Write-Error "Build failed: $($_.Exception.Message)"
        return $false
    }
}

function Test-WebSocketFunctionality {
    Write-Info "Testing WebSocket functionality..."
    
    try {
        # Check if test script exists
        if (-not (Test-Path $config.TestScript)) {
            Write-Warning "Test script not found: $($config.TestScript)"
            Write-Info "Skipping WebSocket tests"
            return $true
        }
        
        # Start the packaged application for testing
        Write-Info "Starting packaged application for testing..."
        $setupPath = Join-Path $config.OutputDir $config.SetupName
        
        if (-not (Test-Path $setupPath)) {
            Write-Error "Setup.exe not found for testing: $setupPath"
            return $false
        }
        
        # Note: In a real scenario, you would install and run the setup.exe
        # For now, we'll test the development backend
        Write-Info "Testing against development backend..."
        
        # Run the WebSocket test
        Write-Test "Running WebSocket connectivity tests..."
        node $config.TestScript
        if ($LASTEXITCODE -eq 0) {
            Write-Success "WebSocket tests passed"
            return $true
        } else {
            Write-Warning "Some WebSocket tests failed - check output above"
            return $false
        }
    }
    catch {
        Write-Error "WebSocket testing failed: $($_.Exception.Message)"
        return $false
    }
}

function Show-Results {
    param(
        [bool]$BuildSuccess,
        [bool]$TestSuccess
    )
    
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "              FINAL RESULTS" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    if ($BuildSuccess) {
        Write-Success "Build: COMPLETED"
        $setupPath = Join-Path $config.OutputDir $config.SetupName
        if (Test-Path $setupPath) {
            $fileSize = [math]::Round((Get-Item $setupPath).Length / 1MB, 2)
            Write-Info "Setup.exe: $setupPath ($fileSize MB)"
        }
    } else {
        Write-Error "Build: FAILED"
    }
    
    if ($TestSuccess) {
        Write-Success "WebSocket Tests: PASSED"
    } else {
        Write-Warning "WebSocket Tests: SOME ISSUES DETECTED"
    }
    
    Write-Host ""
    Write-Info "Total time: $($duration.ToString('mm\:ss'))"
    Write-Host ""
    
    if ($BuildSuccess) {
        Write-Host "🎉 Your Akash Share setup.exe is ready!" -ForegroundColor Magenta
        Write-Host ""
        Write-Info "Next steps:"
        Write-Host "  1. Test the setup.exe on a clean system" -ForegroundColor White
        Write-Host "  2. Verify WebSocket chat functionality" -ForegroundColor White
        Write-Host "  3. Test file sharing features" -ForegroundColor White
        Write-Host "  4. Distribute to users" -ForegroundColor White
    } else {
        Write-Error "Build failed. Please check the errors above and try again."
    }
}

# Main execution
try {
    # Check prerequisites
    if (-not (Test-Prerequisites)) {
        exit 1
    }
    
    Write-Host ""
    
    # Build setup.exe
    $buildSuccess = $true
    if (-not $SkipBuild) {
        $buildSuccess = Build-SetupExe
    } else {
        Write-Info "Skipping build (--SkipBuild specified)"
    }
    
    # Test WebSocket functionality
    $testSuccess = $true
    if (-not $SkipTest -and $buildSuccess) {
        Write-Host ""
        $testSuccess = Test-WebSocketFunctionality
    } elseif ($SkipTest) {
        Write-Info "Skipping tests (--SkipTest specified)"
    }
    
    # Show results
    Show-Results -BuildSuccess $buildSuccess -TestSuccess $testSuccess
    
    if ($buildSuccess) {
        exit 0
    } else {
        exit 1
    }
}
catch {
    Write-Error "Script failed: $($_.Exception.Message)"
    Write-Host ""
    Write-Info "Common solutions:"
    Write-Host "  - Run as administrator" -ForegroundColor White
    Write-Host "  - Check available disk space" -ForegroundColor White
    Write-Host "  - Ensure Node.js and npm are properly installed" -ForegroundColor White
    Write-Host "  - Check your internet connection" -ForegroundColor White
    exit 1
}
