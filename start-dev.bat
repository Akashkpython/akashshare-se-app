@echo off
echo Starting Akash Share Development Environment...
echo.

echo Starting MongoDB (if not running)...
echo Please ensure MongoDB is running on your system
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"

timeout /t 3

echo Starting Frontend React App...
start "React Frontend" cmd /k "npm start"

echo.
echo ==========================================
echo Development environment is starting...
echo Backend: http://localhost:5002
echo Frontend: http://localhost:3000
echo ==========================================
echo.
echo Press any key to exit...
pause > nul