@echo off
echo 🚀 Starting Akash Share Development Environment...
echo 🔧 This will start both the backend and frontend servers.
echo 🔗 Backend will be available at http://localhost:5002
echo 🔗 Frontend will be available at http://localhost:3000
echo ⏳ Please wait for both servers to start...

REM Start the backend server in a new window
start "Akash Share Backend" /D "d:\5th sem\project\akashshare-se\backend" cmd /k "set NODE_ENV=development && set PORT=5002 && set HOST=localhost && node server.js"

REM Wait a few seconds for backend to start
timeout /t 5 /nobreak >nul

REM Start the frontend
npm start

echo ✅ Development environment started!