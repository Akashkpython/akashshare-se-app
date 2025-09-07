@echo off
echo Testing Backend Server Startup...
cd /d "d:\5th sem\project\akashshare-se\backend"

echo.
echo Step 1: Checking if .env file exists...
if exist ".env" (
    echo ✅ .env file found
) else (
    echo ❌ .env file missing - copying from .env.example
    if exist "../.env.example" (
        copy "..\\.env.example" ".env"
        echo ✅ Created .env from .env.example
    ) else (
        echo ❌ No .env.example found
    )
)

echo.
echo Step 2: Checking backend dependencies...
if exist "node_modules" (
    echo ✅ node_modules found
) else (
    echo ❌ Installing backend dependencies...
    npm install
)

echo.
echo Step 3: Starting backend server...
echo Press Ctrl+C to stop the server
node server.js

pause
