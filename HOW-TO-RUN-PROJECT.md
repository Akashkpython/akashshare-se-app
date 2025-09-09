# 🚀 How to Run AkAsH Share Project

## ⚠️ Prerequisites Required

Before running the project, you need to install Node.js:

### 1. Install Node.js
1. Go to https://nodejs.org/
2. Download the **LTS version** (recommended)
3. Run the installer and follow the setup wizard
4. Restart your command prompt/PowerShell after installation

### 2. Verify Installation
Open Command Prompt or PowerShell and run:
```bash
node --version
npm --version
```
You should see version numbers if Node.js is installed correctly.

## 🎯 Running the Project (3 Methods)

### **Method 1: Easy Startup Scripts (Recommended)**

#### Windows Batch File:
```bash
# Double-click this file or run in Command Prompt:
start-app.bat
```

#### PowerShell Script:
```bash
# Right-click → "Run with PowerShell" or run:

```

### **Method 2: Manual Step-by-Step**

#### Terminal 1 - Backend Server:
```bash
cd backend
node server.js
```

#### Terminal 2 - Frontend Server (new terminal):
```bash
npm start
```

### **Method 3: Electron Desktop App**
```bash
npm run electron
```

## 📱 Accessing the Application

Once running, open your web browser and go to:
- **Frontend UI:** http://localhost:5002
- **Backend API:** http://localhost:5002

## ✅ What You'll See When Running

### Backend Server (Port 5002):
```
🚀 Backend server running on port 5002
✅ MongoDB connected successfully
📡 WebSocket server started
🔒 Security middleware enabled
```

### Frontend Server (Port 5002):
```
webpack compiled successfully
Local: http://localhost:5002
Network: http://192.168.x.x:5002
```

## 🎮 Using the Application

### File Sharing:
1. Go to **Send Files** page
2. Drag & drop files or click to browse
3. Click **Upload & Generate Code**
4. Share the 4-digit code with recipients

### Receiving Files:
1. Go to **Receive Files** page  
2. Enter the 4-digit code
3. Preview and download files

### Group Chat:
1. Go to **Group Chat** page
2. Join or create chat rooms
3. Real-time messaging with WebSocket

## 🔧 Troubleshooting

### "Node.js not found":
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### "Port already in use":
- Check if another app is using port 5002
- Kill existing Node processes: `taskkill /f /im node.exe`

### "npm command not found":
- Node.js installation includes npm
- Restart terminal after installing Node.js

### Dependencies issues:
```bash
npm install
cd backend
npm install
```

### MongoDB connection issues:
- The app uses MongoDB Atlas (cloud database)
- Check internet connection
- Verify `.env` file in backend folder

## 🚀 Quick Start Commands

```bash
# Install all dependencies
npm install && cd backend && npm install && cd ..

# Run in development mode
npm start

# Build for production
npm run build

# Run Electron desktop app
npm run electron

# Create installer
npm run build:win
```

## 📂 Project Structure

```
akashshare-se/
├── src/                 # React frontend source
├── backend/            # Node.js backend server
├── electron/           # Electron main process
├── public/            # Static assets
├── build/             # Production build output
├── start-app.bat      # Windows startup script
├── start-app.ps1      # PowerShell startup script
└── package.json       # Project configuration
```

## 🌟 Features Available

- ✅ Professional file sharing with 4-digit codes
- ✅ Real-time group chat with WebSocket
- ✅ AI-powered content moderation
- ✅ File upload up to 10MB
- ✅ 30+ supported file types
- ✅ Auto-deletion after 24 hours
- ✅ Cross-platform support
- ✅ Mobile-friendly interface

---
**Ready to share files like a pro! 🎉**
