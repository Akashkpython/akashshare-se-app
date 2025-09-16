@echo off
echo ========================================
echo   Akash Share Professional Setup Builder
echo ========================================
echo.

echo [1/6] Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist build rmdir /s /q build
echo ✅ Cleaned previous builds

echo.
echo [2/6] Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependencies installation failed
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed

echo.
echo [3/6] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependencies installation failed
    pause
    exit /b 1
)
cd ..
echo ✅ Backend dependencies installed

echo.
echo [4/6] Building React application...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ React build failed
    pause
    exit /b 1
)
echo ✅ React application built

echo.
echo [5/6] Copying Electron and backend files...
call npm run electron:copy
if %errorlevel% neq 0 (
    echo ❌ File copying failed
    pause
    exit /b 1
)
echo ✅ Files copied successfully

echo.
echo [6/6] Building professional installer...
call npm run build:win:custom
if %errorlevel% neq 0 (
    echo ❌ Installer build failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo   🎉 Professional Setup Complete!
echo ========================================
echo.
echo 📁 Installer location: dist\AkashShare-1.0.5-Setup.exe
echo 📦 Size: 
for %%A in ("dist\AkashShare-1.0.5-Setup.exe") do echo    %%~zA bytes
echo.
echo ✨ Features included:
echo    • Complete Electron application
echo    • Bundled backend server
echo    • WebSocket chat functionality
echo    • File sharing capabilities
echo    • Auto-update system
echo    • Professional installer
echo.
echo 🚀 Ready for distribution!
echo.
pause
