@echo off
echo ========================================
echo    AKASH SHARE - FIXED STARTUP SCRIPT
echo ========================================
echo.

echo 🔧 Setting up environment variables...
set NODE_ENV=development
set REACT_APP_API_URL=http://localhost:5002
set REACT_APP_DEBUG=true

echo ✅ Environment variables set:
echo    NODE_ENV=%NODE_ENV%
echo    REACT_APP_API_URL=%REACT_APP_API_URL%
echo    REACT_APP_DEBUG=%REACT_APP_DEBUG%
echo.

echo 🚀 Starting Akash Share Project (Fixed Version)...
echo.

echo Step 1: Checking for existing processes...
echo.

REM Kill any existing processes on port 5002
echo 🔍 Checking for processes on port 5002...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5002') do (
    echo 🗑️ Killing process %%a on port 5002...
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill any existing processes on port 3000
echo 🔍 Checking for processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo 🗑️ Killing process %%a on port 3000...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo Step 2: Starting Backend Server...
echo.

cd backend
start "Backend Server" cmd /k "echo 🚀 Starting Backend Server... && npm start"
cd ..

echo ⏳ Waiting for backend server to start...
timeout /t 5 /nobreak >nul

echo.
echo Step 3: Starting React Development Server...
echo.

start "React Dev Server" cmd /k "echo 🚀 Starting React Dev Server... && npm start"

echo ⏳ Waiting for React dev server to start...
timeout /t 8 /nobreak >nul

echo.
echo Step 4: Starting Electron Application...
echo.

start "Electron App" cmd /k "echo 🚀 Starting Electron App... && npm run electron"

echo.
echo ========================================
echo    🎉 ALL SERVICES STARTED!
echo ========================================
echo.
echo ✅ Backend Server: http://localhost:5002
echo ✅ React Dev Server: http://localhost:3000
echo ✅ Electron App: Starting...
echo ✅ WebSocket Chat: ws://localhost:5002/chat
echo.
echo 🎯 Your Akash Share app should now be running!
echo    - The Electron window should open automatically
echo    - Navigate to "Bca Group Chat" to test the chat
echo    - All WebSocket connections should work perfectly
echo.
echo 💡 If you encounter any issues:
echo    1. Check that all three windows are running
echo    2. Ensure no firewall is blocking the ports
echo    3. Try refreshing the Electron app (Ctrl+R)
echo.
pause
