# Kill processes using port 5004
Write-Host "Checking for processes using port 5004..." -ForegroundColor Yellow

# Method 1: Using netstat and taskkill (Windows)
try {
    $connections = Get-NetTCPConnection -LocalPort 5004 -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $processId = $conn.OwningProcess
            Write-Host "Found process $processId using port 5004, terminating..." -ForegroundColor Red
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    }
} catch {
    Write-Host "Get-NetTCPConnection failed, trying alternative method..." -ForegroundColor Yellow
}

# Method 2: Using netstat (cross-platform approach)
$netstatOutput = netstat -ano | findstr ":5004"
if ($netstatOutput) {
    $lines = $netstatOutput -split "`n"
    foreach ($line in $lines) {
        if ($line -match "(\d+)$") {
            $processId = $matches[1]
            Write-Host "Found process $processId using port 5004, terminating..." -ForegroundColor Red
            taskkill /f /pid $processId | Out-Null
        }
    }
}

# Method 3: Kill all Node.js processes (fallback)
Write-Host "Killing all Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment for processes to fully terminate
Start-Sleep 2

# Verify port is free
$stillInUse = netstat -ano | findstr ":5004"
if ($stillInUse) {
    Write-Host "WARNING: Port 5004 is still in use!" -ForegroundColor Red
    Write-Host "Process details:" -ForegroundColor Red
    $stillInUse
} else {
    Write-Host "SUCCESS: Port 5004 is now free!" -ForegroundColor Green
}

Write-Host "Port cleanup completed." -ForegroundColor Cyan
