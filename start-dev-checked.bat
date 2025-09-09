@echo off
cd /d "%~dp0"
echo ==========================================
echo        Akash Share Startup Checker
echo ==========================================
echo.

echo [1/4] Checking MongoDB connection...
echo.

REM Test MongoDB connection
echo Connecting to MongoDB...
timeout /t 2 > nul

REM Check if MongoDB process is running
tasklist /fi "imagename eq mongod.exe" 2>nul | find /i "mongod.exe" >nul
if errorlevel 1 (
    echo ⚠️  MongoDB process not detected locally. Continuing (Atlas may be used).
) else (
    echo ✅ MongoDB process found
)

echo.
echo [2/4] Starting Backend Server...
echo.

start "Backend Server" cmd /k "cd /d %~dp0backend && echo Starting backend on port 5002... && npm start"

REM Wait for backend to start
echo Waiting for backend to initialize...
timeout /t 5 > nul

echo.
echo [3/4] Testing Backend Connection...
echo.

REM Test backend health endpoint
curl -s http://localhost:5002/health > nul 2>&1
if errorlevel 1 (
    powershell -Command "try { iwr http://localhost:5002/health -UseBasicParsing -TimeoutSec 3 ^| Out-Null; exit 0 } catch { exit 1 }"
    if errorlevel 1 (
        echo ⚠️  Backend might still be starting...
        echo    Please wait and check the backend terminal
    ) else (
        echo ✅ Backend server is responding
    )
) else (
    echo ✅ Backend server is responding
)

echo.
echo [4/4] Starting Frontend...
echo.

start "React Frontend" cmd /k "cd /d %~dp0 && echo Starting React development server... && npm start"

echo.
echo ==========================================
echo          🚀 Startup Complete!
echo ==========================================
echo.
echo 📍 Application URLs:
echo    Frontend: http://localhost:5002
echo    Backend:  http://localhost:5002
echo    Health:   http://localhost:5002/health
echo.
echo 📝 Next Steps:
echo    1. Wait for React dev server to start (usually 1-2 minutes)
echo    2. Browser should open automatically
echo    3. Try uploading a file to test
echo.
echo ❌ If you get upload errors:
echo    - Check MongoDB is running (task manager)
echo    - Check backend terminal for errors
echo    - Ensure uploads/ folder exists
echo.
echo Press any key to exit this window...
pause > nul