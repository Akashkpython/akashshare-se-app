@echo off
echo ========================================
echo AkashShare React Build Script
echo ========================================
echo.
echo Fixing ESLint errors and building React app...
echo.

cd /d "d:\5th sem\project\akashshare-se"

echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Running ESLint fix...
call npm run lint:fix

echo.
echo Step 3: Building React app...
call npm run build

echo.
echo Step 4: Checking build output...
if exist "build\index.html" (
    echo ✅ SUCCESS: React build completed! index.html found.
    echo.
    echo Build contents:
    dir build\*.html
) else (
    echo ❌ ERROR: React build failed - index.html not found.
    echo.
    echo Build directory contents:
    dir build
)

echo.
echo ========================================
echo Build process completed.
echo ========================================
pause
