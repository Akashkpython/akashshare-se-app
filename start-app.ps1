# Akash Share - Auto Start Application
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "    Akash Share - Auto Start Application" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Akash Share with auto-backend integration..." -ForegroundColor Green
Write-Host ""

# Kill any existing processes first
Write-Host "[0/3] Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start React dev server in background
Write-Host "[1/3] Starting React development server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal

# Wait for React server to be ready
Write-Host "[2/3] Waiting for React server to be ready..." -ForegroundColor Yellow
do {
    Start-Sleep -Seconds 3
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5004" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        $reactReady = $true
    } catch {
        Write-Host "Still waiting for React server..." -ForegroundColor Yellow
        $reactReady = $false
    }
} while (-not $reactReady)
Write-Host "React server is ready!" -ForegroundColor Green

# Start Electron app (which will auto-start backend)
Write-Host "[3/3] Starting Electron application with auto-backend..." -ForegroundColor Yellow
npm run electron

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "    Application started successfully!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Features:" -ForegroundColor Green
Write-Host "- Backend auto-starts with Electron" -ForegroundColor White
Write-Host "- File sharing ready" -ForegroundColor White
Write-Host "- Group chat ready" -ForegroundColor White
Write-Host "- No manual backend startup needed" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")