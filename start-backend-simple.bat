@echo off
cd /d "%~dp0\backend"
set HOST=0.0.0.0
echo Starting backend server on IPv4 (0.0.0.0:5004)...
node server.js
pause
