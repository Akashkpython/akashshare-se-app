@echo off
echo 🔧 Starting Akash Share with all components...

REM Kill any existing processes on port 5004
echo 🔧 Checking for processes on port 5004...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5004') do (
    echo 🔧 Killing process %%a on port 5004
    taskkill /PID %%a /F >nul 2>&1
)

REM Start backend server in background
echo 🔧 Starting backend server...
start "Backend Server" /min node backend/server.js

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Start Electron app
echo 🔧 Starting Electron application...
npm run electron

echo 🎉 Akash Share started successfully!