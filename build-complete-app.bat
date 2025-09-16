@echo off
echo ==================================================
echo Akash Share - Complete Build Script
echo ==================================================
echo.

echo [1/6] Cleaning previous builds...
if exist "dist" rmdir /s /q "dist" 2>nul
if exist "dist-new" rmdir /s /q "dist-new" 2>nul
if exist "dist-final" rmdir /s /q "dist-final" 2>nul
if exist "build" rmdir /s /q "build" 2>nul
echo ✅ Previous builds cleaned
echo.

echo [2/6] Installing frontend dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependency installation failed
    exit /b %errorlevel%
)
echo ✅ Frontend dependencies installed
echo.

echo [3/6] Building React frontend...
npm run build
if %errorlevel% neq 0 (
    echo ❌ React build failed
    exit /b %errorlevel%
)
echo ✅ React frontend built
echo.

echo [4/6] Installing backend dependencies...
cd backend
npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependency installation failed
    exit /b %errorlevel%
)
cd ..
echo ✅ Backend dependencies installed
echo.

echo [5/6] Copying Electron files...
npm run electron:copy
if %errorlevel% neq 0 (
    echo ❌ Electron copy failed
    exit /b %errorlevel%
)
echo ✅ Electron files copied
echo.

echo [6/6] Building Windows installer...
npm run build:win
if %errorlevel% neq 0 (
    echo ❌ Windows installer build failed
    exit /b %errorlevel%
)
echo ✅ Windows installer built successfully
echo.

echo ==================================================
echo Build completed successfully!
echo Installer location: dist/Akash Share Setup.exe
echo ==================================================
pause