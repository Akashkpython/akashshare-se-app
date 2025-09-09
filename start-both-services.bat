@echo off
echo 🚀 Starting Akash Share - Complete System
echo ==========================================

REM Set environment for development
set NODE_ENV=development
REM SECURITY WARNING: These credentials should be loaded from secure environment variables
REM set MONGO_URI=YOUR_MONGODB_CONNECTION_STRING_HERE
REM set JWT_SECRET=YOUR_SECURE_JWT_SECRET_HERE

REM Load from .env file or environment variables instead
if not defined MONGO_URI set MONGO_URI=mongodb://localhost:27017/akashshare
if not defined JWT_SECRET set JWT_SECRET=dev-jwt-secret-change-in-production

echo 🔧 Environment configured for development
echo 🗄️  MongoDB: Atlas Cloud Database
echo 🔑 Security: JWT configured
echo.

REM Kill any existing processes on ports 3000 and 5002
echo 🧹 Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo Killing process %%a on port 3000
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5002 ^| findstr LISTENING') do (
    echo Killing process %%a on port 5002
    taskkill /F /PID %%a >nul 2>&1
)

echo ✅ Ports cleaned

echo.
echo 🎯 Starting Backend Server (Node.js + WebSocket)...
cd backend
start "Backend Server" cmd /k "node server.js"
cd ..

echo ⏳ Waiting for backend to initialize...
timeout /t 8 /nobreak >nul

echo.
echo 🌐 Starting Frontend (React)...
start "Frontend React" cmd /k "npm start"

echo.
echo ✅ Both services are starting!
echo 📱 Frontend: http://localhost:5002
echo 🔌 Backend API: http://localhost:5002
echo 💬 WebSocket Chat: ws://localhost:5002/chat
echo.
echo 🔧 Troubleshooting:
echo - If chat doesn't connect, check backend console for errors
echo - If ports are busy, close and restart this script
echo - For production, use production-config.env
echo.
echo 🎉 Ready for development!
pause
