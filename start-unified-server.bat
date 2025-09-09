@echo off
title Akash Share Group Chat - Unified Server (Port 5002)
color 0A

echo ============================================
echo   BCA GROUP CHAT - UNIFIED SERVER
echo       Frontend + Backend + WebSocket
echo            ALL ON PORT 5002
echo ============================================
echo.

echo 🔄 Stopping any existing servers...
powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force"
timeout /t 2 >nul

echo.
echo 🏗️  Building React Frontend...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Frontend built successfully!
echo.

echo 🚀 Starting Unified Server on Port 5002...
echo    📱 Frontend: http://localhost:5002
echo    🔗 Backend:  http://localhost:5002
echo    💬 WebSocket: ws://localhost:5002/chat
echo.

cd backend
start "Akash Share Group Chat - Unified Server" cmd /k "echo Akash Share Group Chat - All services on PORT 5002 && echo. && echo Frontend: http://localhost:5002 && echo Backend:  http://localhost:5002 && echo WebSocket: ws://localhost:5002/chat && echo. && node server.js"

echo.
echo ⏳ Waiting for server to start...
timeout /t 5 >nul

echo.
echo 🌐 Testing server connection...
cd ..
powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:5002/health -UseBasicParsing; Write-Host '✅ Server is running!' -ForegroundColor Green; } catch { Write-Host '⚠️ Server starting...' -ForegroundColor Yellow; }"

echo.
echo 🎉 Opening Akash Share Group Chat...
timeout /t 2 >nul
start http://localhost:5002

echo.
echo ============================================
echo        BCA GROUP CHAT IS READY!
echo ============================================
echo.
echo 🎓 How to use:
echo    1. Browser will open automatically
echo    2. Click "Bca Group Chat" in sidebar
echo    3. Enter your name
echo    4. Start chatting!
echo.
echo 💡 Benefits of unified server:
echo    ✅ No CORS issues
echo    ✅ Same port for everything
echo    ✅ Faster connections
echo    ✅ No port conflicts
echo.
echo ⚠️  To stop: Close the server window
echo.
pause
