Write-Host "================================================" -ForegroundColor Green
Write-Host "Comprehensive Fix for Akash Share Project Issues" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

Write-Host "`n1. Killing any running processes..." -ForegroundColor Yellow
Stop-Process -Name "electron" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

Write-Host "`n2. Removing node_modules and package-lock.json..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   - Removing node_modules directory..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}

if (Test-Path "package-lock.json") {
    Write-Host "   - Removing package-lock.json..." -ForegroundColor Cyan
    Remove-Item "package-lock.json" -ErrorAction SilentlyContinue
}

Write-Host "`n3. Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "`n4. Reinstalling all dependencies..." -ForegroundColor Yellow
npm install

Write-Host "`n5. Installing/updating critical dependencies..." -ForegroundColor Yellow
npm install @babel/plugin-syntax-dynamic-import --save-dev
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest

Write-Host "`n6. Installing missing peer dependencies..." -ForegroundColor Yellow
npm install @babel/core@^7.23.6 @babel/preset-env@^7.23.6 @babel/preset-react@^7.23.3 @babel/preset-typescript@^7.23.3 --save-dev

Write-Host "`n7. Rebuilding package-lock.json..." -ForegroundColor Yellow
npm install

Write-Host "`n8. Verifying installation..." -ForegroundColor Yellow
try {
    $npmLsOutput = npm ls 2>&1
    if ($npmLsOutput -match "ERR") {
        Write-Host "   - Warning: Some dependencies may have issues" -ForegroundColor Red
    } else {
        Write-Host "   - All dependencies installed successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "   - Warning: Could not verify installation" -ForegroundColor Yellow
}

Write-Host "`n9. Starting development server..." -ForegroundColor Yellow
Write-Host "   To start the server manually, run: npm start" -ForegroundColor Cyan

Write-Host "`nFix process completed!" -ForegroundColor Green
Write-Host "`nTo start the development server, run:" -ForegroundColor Yellow
Write-Host "   npm start" -ForegroundColor Cyan
Write-Host "`nPress any key to exit..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")