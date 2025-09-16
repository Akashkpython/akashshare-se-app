# Akash Share - Installer Builder (PowerShell)
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "    Akash Share - Installer Builder" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Choose installation type:" -ForegroundColor Yellow
Write-Host "1. System-wide installation (C:\Program Files\Akash Share)" -ForegroundColor White
Write-Host "2. User installation (`$env:LOCALAPPDATA\Programs\Akash Share)" -ForegroundColor White
Write-Host "3. Portable installation (Current directory)" -ForegroundColor White
Write-Host "4. Custom location" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Building system-wide installer..." -ForegroundColor Green
        npm run build:win:custom
        Write-Host ""
        Write-Host "✅ System-wide installer created successfully!" -ForegroundColor Green
        Write-Host "📁 Installation location: C:\Program Files\Akash Share" -ForegroundColor Cyan
        Write-Host "🔧 Requires: Administrator rights" -ForegroundColor Yellow
    }
    "2" {
        Write-Host ""
        Write-Host "Building user installer..." -ForegroundColor Green
        npm run build:win:user
        Write-Host ""
        Write-Host "✅ User installer created successfully!" -ForegroundColor Green
        Write-Host "📁 Installation location: $env:LOCALAPPDATA\Programs\Akash Share" -ForegroundColor Cyan
        Write-Host "🔧 Requires: No administrator rights" -ForegroundColor Yellow
    }
    "3" {
        Write-Host ""
        Write-Host "Building portable version..." -ForegroundColor Green
        npm run build:win:portable
        Write-Host ""
        Write-Host "✅ Portable version created successfully!" -ForegroundColor Green
        Write-Host "📁 Installation location: Current directory" -ForegroundColor Cyan
        Write-Host "🔧 Requires: No installation, just extract and run" -ForegroundColor Yellow
    }
    "4" {
        Write-Host ""
        $customPath = Read-Host "Enter custom installation path"
        Write-Host ""
        Write-Host "Building custom installer for: $customPath" -ForegroundColor Green
        npm run build
        npm run electron:copy
        electron-builder --win --config.nsis.installerDirectory="$customPath" --publish=never
        Write-Host ""
        Write-Host "✅ Custom installer created successfully!" -ForegroundColor Green
        Write-Host "📁 Installation location: $customPath" -ForegroundColor Cyan
    }
    default {
        Write-Host "❌ Invalid choice. Please run the script again and choose 1-4." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "    Build completed!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Installer location: dist\" -ForegroundColor Green
Write-Host "🚀 Ready for distribution!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue"

