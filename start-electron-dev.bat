@echo off
echo 🚀 Starting Akash Share Electron Development Environment...
echo 🔧 This will start both the backend (port 5003) and frontend (port 5002)...
echo.

cd /d "%~dp0"

echo 🔧 Starting backend server on port 5003...
start "Backend Server" cmd /k "cd backend && node server.js"

timeout /t 5 /nobreak >nul

echo 🔧 Starting frontend development server on port 5002...
npm start

echo.
echo 🛑 Press Ctrl+C to stop the development environment