# PowerShell script to kill Electron and Node processes
# More robust than batch script

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "        Killing Electron and Node Processes" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Kill Electron processes
Write-Host "Killing Electron processes..." -ForegroundColor Yellow
$electronProcesses = @("Akash Share", "electron", "AkashShare")
foreach ($process in $electronProcesses) {
    try {
        Get-Process -Name $process -ErrorAction SilentlyContinue | Stop-Process -Force
        Write-Host "Killed $process processes" -ForegroundColor Green
    } catch {
        Write-Host "No $process processes found" -ForegroundColor Gray
    }
}

# Kill Node.js processes (be careful)
Write-Host "Killing Node.js processes..." -ForegroundColor Yellow
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        $nodeProcesses | Stop-Process -Force
        Write-Host "Killed $($nodeProcesses.Count) Node.js processes" -ForegroundColor Green
    } else {
        Write-Host "No Node.js processes found" -ForegroundColor Gray
    }
} catch {
    Write-Host "Error killing Node.js processes: $($_.Exception.Message)" -ForegroundColor Red
}

# Kill React dev server processes
Write-Host "Killing React dev server processes..." -ForegroundColor Yellow
try {
    Get-Process -Name "react-scripts" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "Killed React dev server processes" -ForegroundColor Green
} catch {
    Write-Host "No React dev server processes found" -ForegroundColor Gray
}

# Kill processes using ports 5004 and 3000
Write-Host "Killing processes using ports 5004 and 3000..." -ForegroundColor Yellow
$ports = @(5004, 3000)
foreach ($port in $ports) {
    try {
        $connections = netstat -ano | Select-String ":$port "
        foreach ($connection in $connections) {
            $parts = $connection.ToString().Split() | Where-Object { $_ -ne "" }
            if ($parts.Length -ge 5) {
                $pid = $parts[-1]
                if ($pid -match '^\d+$') {
                    try {
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        Write-Host "Killed process $pid using port $port" -ForegroundColor Green
                    } catch {
                        Write-Host "Could not kill process $pid using port $port" -ForegroundColor Yellow
                    }
                }
            }
        }
    } catch {
        Write-Host "Error checking port $port" -ForegroundColor Red
    }
}

# Wait a moment for processes to terminate
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Process cleanup completed." -ForegroundColor Green
Write-Host ""
