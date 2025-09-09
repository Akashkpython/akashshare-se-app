Write-Host "================================================" -ForegroundColor Green
Write-Host "Quick Fix for All Akash Share Project Issues" -ForegroundColor Green
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

Write-Host "`n4. Installing required dependencies..." -ForegroundColor Yellow
npm install

Write-Host "`n5. Installing missing Babel plugin..." -ForegroundColor Yellow
npm install @babel/plugin-syntax-dynamic-import --save-dev

Write-Host "`n6. Installing/updating Tailwind CSS and related packages..." -ForegroundColor Yellow
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
npx tailwindcss init -p

Write-Host "`n7. Starting development server..." -ForegroundColor Yellow
npm start

Write-Host "`nFix process completed!" -ForegroundColor Green
Write-Host "Press any key to exit..."
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")