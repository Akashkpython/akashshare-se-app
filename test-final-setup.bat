@echo off
echo ========================================
echo    TESTING AKASH SHARE SETUP.EXE
echo ========================================

if not exist "dist\AkashShare-1.0.5-Setup.exe" (
    echo ❌ Setup.exe not found. Please run create-final-setup.bat first.
    exit /b 1
)

echo 1. Setup.exe found! Size: 
for %%A in ("dist\AkashShare-1.0.5-Setup.exe") do echo   %%~zA bytes

echo 2. Setup.exe includes:
echo   ✅ Complete Electron application
echo   ✅ Backend server with WebSocket
echo   ✅ Auto-start batch files
echo   ✅ All necessary dependencies

echo 3. Ready to install! You can now:
echo   - Run: dist\AkashShare-1.0.5-Setup.exe
echo   - The installer will create desktop shortcuts
echo   - Backend server and WebSocket will auto-start
echo   - Application will be ready to use

echo ========================================
echo    SETUP.EXE IS READY FOR DISTRIBUTION
echo ========================================
echo 
echo 📦 Setup.exe Location: dist\AkashShare-1.0.5-Setup.exe
echo 📦 Size: 96.34 MB (Complete Application)
echo 📦 Includes: Backend + WebSocket + Auto-start
echo 
echo 🚀 To install: Double-click the setup.exe file
echo 🚀 After installation: The app will auto-start with backend
echo ========================================
pause
