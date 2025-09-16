# Akash Share Professional Setup Builder
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Akash Share Professional Setup Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean previous builds
Write-Host "[1/6] Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path "build") { Remove-Item -Recurse -Force "build" }
Write-Host "✅ Cleaned previous builds" -ForegroundColor Green

# Step 2: Install frontend dependencies
Write-Host ""
Write-Host "[2/6] Installing frontend dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Frontend dependencies installation failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green

# Step 3: Install backend dependencies
Write-Host ""
Write-Host "[3/6] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location "backend"
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend dependencies installation failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Set-Location ".."
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green

# Step 4: Build React application
Write-Host ""
Write-Host "[4/6] Building React application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ React build failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ React application built" -ForegroundColor Green

# Step 5: Copy Electron and backend files
Write-Host ""
Write-Host "[5/6] Copying Electron and backend files..." -ForegroundColor Yellow
npm run electron:copy
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ File copying failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "✅ Files copied successfully" -ForegroundColor Green

# Step 6: Build professional installer
Write-Host ""
Write-Host "[6/6] Building professional installer..." -ForegroundColor Yellow
npm run build:win:custom
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Installer build failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Success message
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🎉 Professional Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$installerPath = "dist\AkashShare-1.0.5-Setup.exe"
if (Test-Path $installerPath) {
    $fileSize = (Get-Item $installerPath).Length
    Write-Host "📁 Installer location: $installerPath" -ForegroundColor Green
    Write-Host "📦 Size: $([math]::Round($fileSize / 1MB, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "❌ Installer not found at expected location" -ForegroundColor Red
}

Write-Host ""
Write-Host "✨ Features included:" -ForegroundColor Magenta
Write-Host "   • Complete Electron application" -ForegroundColor White
Write-Host "   • Bundled backend server" -ForegroundColor White
Write-Host "   • WebSocket chat functionality" -ForegroundColor White
Write-Host "   • File sharing capabilities" -ForegroundColor White
Write-Host "   • Auto-update system" -ForegroundColor White
Write-Host "   • Professional installer" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Ready for distribution!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
