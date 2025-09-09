@echo off
cd /d "%~dp0\backend"
set HOST=127.0.0.1
echo Starting backend server on IPv4 (127.0.0.1:5002)...
node server.js
pause
