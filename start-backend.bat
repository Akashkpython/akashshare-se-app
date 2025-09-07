@echo off
echo 🚀 Starting Akash Share Backend Server...
echo 🔧 Changing to backend directory...
cd /d "d:\5th sem\project\akashshare-se\backend"
echo 🔧 Starting server on port 5002...
set NODE_ENV=development
set PORT=5002
set HOST=localhost
node server.js
pause