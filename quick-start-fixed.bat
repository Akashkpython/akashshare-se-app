@echo off
cd /d "%~dp0"

echo ========================================
echo   AkAsH Share - Quick Start (IPv4 Fixed)
echo ========================================
echo.

REM Kill existing Node processes
echo 🔧 Stopping existing servers...
taskkill /f /im node.exe >nul 2>&1
timeout /t 3 >nul

REM Set IPv4 environment
set HOST=0.0.0.0

REM Start Backend Server
echo 🔧 Starting Backend Server (IPv4: 0.0.0.0:5004)...
start "Backend Server" cmd /k "cd backend && set HOST=0.0.0.0 && node server.js"

REM Wait for backend
echo ⏳ Waiting for backend to start...
timeout /t 8 >nul

REM Start Frontend Server
echo 🔧 Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "npm start"

REM Wait for frontend
echo ⏳ Waiting for frontend to compile...
timeout /t 12 >nul

echo.
echo ========================================
echo ✅ SERVERS STARTED!
echo ========================================
echo.
echo 🌐 Frontend:  http://localhost:5004
echo 🔧 Backend:   http://localhost:5004
echo 💬 WebSocket: ws://localhost:5004/chat
echo.
echo 🎯 GROUP CHAT SHOULD NOW WORK!
echo.
echo ⚠️  Both servers are running in separate windows
echo 🛑 To stop: Close both server windows
echo.
pause
