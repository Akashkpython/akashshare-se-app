@echo off
echo ==========================================
echo     Manual MongoDB Startup
echo ==========================================
echo.

echo This will start MongoDB manually (no admin required)
echo.

REM Check if MongoDB data directory exists
if not exist "C:\data\db" (
    echo Creating MongoDB data directory...
    mkdir "C:\data\db" 2>nul
    if %errorLevel% == 0 (
        echo ✅ Created C:\data\db
    ) else (
        echo ⚠️  Could not create C:\data\db
        echo You may need to create it manually or run as administrator
    )
    echo.
)

echo Starting MongoDB manually...
echo.
echo 📍 MongoDB will run in this window
echo 📍 Keep this window open while using the application
echo 📍 Press Ctrl+C to stop MongoDB
echo.

REM Try common MongoDB installation paths
if exist "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" (
    echo Using MongoDB 6.0...
    "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath "C:\data\db"
) else if exist "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" (
    echo Using MongoDB 7.0...
    "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
) else if exist "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" (
    echo Using MongoDB 5.0...
    "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" --dbpath "C:\data\db"
) else (
    echo ❌ MongoDB not found in standard locations
    echo.
    echo Please check if MongoDB is installed:
    echo 1. Download from: https://www.mongodb.com/try/download/community
    echo 2. Or install via chocolatey: choco install mongodb
    echo 3. Or add MongoDB to your PATH environment variable
    echo.
    echo Common installation paths:
    echo - C:\Program Files\MongoDB\Server\[version]\bin\
    echo.
    pause
)