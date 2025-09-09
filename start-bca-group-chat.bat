@echo off
title Akash Share Group Chat Startup
echo ================================
echo   Akash Share Group Chat Server Startup
echo ================================

echo.
echo 🔧 Stopping any existing servers...
taskkill /f /im node.exe 2>nul
timeout /t 2 >nul

echo.
echo 🚀 Starting Backend Server (Port 5002)...
cd backend
start "Backend Server" cmd /k "node server.js"
timeout /t 3 >nul

echo.
echo 🌐 Testing Backend Connection...
powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:5002/health -UseBasicParsing; Write-Host '✅ Backend server is running' -ForegroundColor Green; } catch { Write-Host '❌ Backend server failed to start' -ForegroundColor Red; }"

echo.
echo 🎨 Starting Frontend Server (Port 3001)...
cd ..
set PORT=3001
start "Frontend Server" cmd /k "npm start"

echo.
echo ================================
echo   Servers Starting...
echo ================================
echo.
echo 📍 Backend:  http://localhost:5002
echo 📍 Frontend: http://localhost:3001
echo 💬 WebSocket: ws://localhost:5002/chat
echo.
echo 🔧 Instructions:
echo 1. Wait for both servers to fully start
echo 2. Open http://localhost:3001 in your browser
echo 3. Click the sidebar menu (☰) if hidden
echo 4. Click on "Bca Group Chat"
echo 5. Enter your name and start chatting!
echo.
echo ⚠️  If you see connection issues:
echo    - Make sure Windows Firewall allows Node.js
echo    - Check that ports 5002 and 3001 are free
echo    - Try restarting this script
echo.
echo Press any key to open the browser...
pause >nul
start http://localhost:3001

echo.
echo 🎉 Akash Share Group Chat is ready!
echo    Close this window to stop all servers.
echo.
pause