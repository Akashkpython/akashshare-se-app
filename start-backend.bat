@echo off
echo 🚀 Starting Akash Share Backend Server...
echo 🔧 Changing to backend directory...
cd /d "%~dp0backend"
echo 🔧 Starting server on port 5004...
set NODE_ENV=development
set PORT=5004
set HOST=0.0.0.0
node server.js
pause