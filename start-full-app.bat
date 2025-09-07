@echo off
echo Starting AkashShare Electron Application...
echo.

echo 🚀 Launching Electron app with integrated backend...
echo 📱 App will open in desktop window
echo 🔧 Backend auto-starts on http://localhost:5002
echo 💬 WebSocket Chat: ws://localhost:5002/chat
echo 🗄️ Database: MongoDB Atlas (cloud)
echo.

npm run electron

echo.
echo Application closed.
pause >nul
