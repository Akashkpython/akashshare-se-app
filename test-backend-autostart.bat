@echo off
echo ========================================
echo    TESTING BACKEND AUTO-START
echo ========================================

echo 1. Testing backend server startup...
echo.

REM Test the fixed backend startup script
echo Running start-backend-fixed.bat...
start "Test Backend" /min cmd /c "start-backend-fixed.bat"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo 2. Checking backend status...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5005/health' -UseBasicParsing; Write-Host 'SUCCESS: Backend is running!' $response.Content } catch { Write-Host 'FAILURE: Backend not responding' }"

echo.
echo 3. Testing WebSocket connection...
powershell -Command "try { $ws = New-Object System.Net.WebSockets.ClientWebSocket; $ws.ConnectAsync('ws://localhost:5005/chat', $null).Wait(); Write-Host 'SUCCESS: WebSocket connected!' } catch { Write-Host 'FAILURE: WebSocket not responding' }"

echo.
echo ========================================
echo    BACKEND AUTO-START TEST COMPLETE
echo ========================================
echo.
echo If you see SUCCESS messages above, the backend auto-start is working!
echo If you see FAILURE messages, there may be an issue with the setup.
echo.
pause
