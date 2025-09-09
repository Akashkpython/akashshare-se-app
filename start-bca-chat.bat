@echo off
title Akash Share Group Chat - Quick Start
color 0A

echo ============================================
echo           BCA GROUP CHAT - QUICK START
echo ============================================
echo.

echo 🔄 Stopping any existing servers...
taskkill /f /im node.exe 2>nul >nul
timeout /t 2 >nul

echo.
echo 🚀 Starting Backend Server (Port 5002)...
cd backend
start "Akash Share Chat Backend" cmd /k "echo Backend Server for Akash Share Group Chat && echo. && node server.js"
timeout /t 3 >nul

echo.
echo 🌐 Testing Backend Connection...
cd ..
powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:5002/health -UseBasicParsing; Write-Host '✅ Backend is ready!' -ForegroundColor Green; } catch { Write-Host '⚠️ Backend starting...' -ForegroundColor Yellow; }"

echo.
echo 🎨 Starting Frontend Server (Port 3001)...
set PORT=3001
start "Akash Share Chat Frontend" cmd /k "echo Frontend Server for Akash Share Group Chat && echo Opening: http://localhost:3001 && echo. && npm start"

echo.
echo ============================================
echo        BCA GROUP CHAT IS STARTING...
echo ============================================
echo.
echo 📍 Backend:  http://localhost:5002
echo 📍 Frontend: http://localhost:3001
echo 💬 WebSocket: ws://localhost:5002/chat
echo.
echo 🎓 How to use Akash Share Group Chat:
echo    1. Wait for both servers to start (30 seconds)
echo    2. Frontend will open automatically
echo    3. Click "Bca Group Chat" in the sidebar
echo    4. Enter your name (e.g., "Student_123")
echo    5. Start chatting with your BCA classmates!
echo.
echo 💡 Features:
echo    ✅ Real-time messaging
echo    ✅ 100+ members support
echo    ✅ Join/leave notifications
echo    ✅ Online member count
echo    ✅ Image sharing
echo    ✅ Auto-reconnection
echo.
echo ⏳ Waiting 5 seconds then opening browser...
timeout /t 5 >nul
start http://localhost:3001

echo.
echo 🎉 Akash Share Group Chat is ready!
echo    Look for "Bca Group Chat" in the sidebar
echo.
echo ⚠️  If you see connection issues:
echo    - Wait for backend to fully start
echo    - Check Windows Firewall settings
echo    - Click the "Reconnect" button in chat
echo.
pause
