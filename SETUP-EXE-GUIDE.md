# Akash Share Setup.exe Creation Guide

This guide explains how to create a professional setup.exe file for Akash Share, similar to CursorUserSetup-x64 and QoderUserSetup-x64.

## 🎯 Overview

The setup.exe will include:
- ✅ Complete Akash Share application
- ✅ Backend server with WebSocket support
- ✅ MongoDB integration
- ✅ Chat functionality
- ✅ File sharing capabilities
- ✅ Professional installer with uninstaller

## 📋 Prerequisites

Before creating the setup.exe, ensure you have:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **PowerShell** (Windows 10/11)
4. **Administrator privileges** (recommended)

## 🚀 Quick Start

### Option 1: Automated Build (Recommended)

Run the complete build and test process:

```bash
# PowerShell (Recommended)
.\build-and-test-setup.ps1

# Or Batch file
.\create-setup-exe.bat
```

### Option 2: Manual Build

If you prefer to run each step manually:

```bash
# 1. Build setup.exe
.\build-setup-exe.ps1

# 2. Test WebSocket functionality
node test-websocket-setup.js
```

## 📁 Output Files

After successful build, you'll find:

```
dist/
├── AkashShareUserSetup-x64.exe    # Main installer
└── win-unpacked/                  # Unpacked application (for testing)
```

## 🔧 Configuration Files

### Electron Builder Config
- **File**: `electron-builder-setup.config.cjs`
- **Purpose**: Defines how the setup.exe is built
- **Key Features**:
  - Professional NSIS installer
  - WebSocket support included
  - Backend server packaged
  - Optimized file structure

### Build Scripts
- **PowerShell**: `build-and-test-setup.ps1` (Complete process)
- **Batch**: `build-setup-exe.bat` (Simple build)
- **Test**: `test-websocket-setup.js` (WebSocket verification)

## 🧪 Testing WebSocket Functionality

The build process includes comprehensive WebSocket testing:

### Test Coverage
- ✅ Backend server connectivity
- ✅ WebSocket connection establishment
- ✅ Message sending/receiving
- ✅ API endpoint functionality
- ✅ File upload capabilities
- ✅ MongoDB connection

### Running Tests
```bash
# Test WebSocket functionality
node test-websocket-setup.js

# Or run with the complete build script
.\build-and-test-setup.ps1
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Fails
**Error**: `Failed to build setup.exe`
**Solutions**:
- Run as Administrator
- Check available disk space (need ~2GB)
- Ensure Node.js and npm are properly installed
- Check internet connection

#### 2. WebSocket Tests Fail
**Error**: `WebSocket connection failed`
**Solutions**:
- Ensure backend server is running
- Check firewall settings
- Verify port 5004 is available
- Check MongoDB connection

#### 3. Dependencies Issues
**Error**: `Module not found`
**Solutions**:
```bash
# Clean install
npm install
cd backend && npm install
```

#### 4. Permission Issues
**Error**: `Access denied`
**Solutions**:
- Run PowerShell as Administrator
- Check antivirus software
- Ensure write permissions to project directory

### Debug Mode

Run with verbose output:
```bash
.\build-and-test-setup.ps1 -Verbose
```

## 📦 Installation Process

The generated setup.exe provides:

1. **Professional Installer**
   - Custom installation directory
   - Desktop shortcut creation
   - Start menu integration
   - Progress indicators

2. **Backend Integration**
   - Automatic backend server setup
   - WebSocket server configuration
   - MongoDB connection setup
   - Environment configuration

3. **Security Features**
   - Mandatory uninstaller confirmation
   - Secure file handling
   - Rate limiting
   - CORS protection

## 🔒 Uninstaller Security

The setup.exe includes a secure uninstaller that requires users to type "AkAsH" exactly to confirm removal. This prevents accidental uninstallation.

## 🌐 WebSocket Configuration

### Backend Server
- **Port**: 5004
- **Path**: `/chat`
- **Protocol**: WebSocket (ws://)
- **CORS**: Configured for Electron and web clients

### Client Connection
```javascript
const ws = new WebSocket('ws://localhost:5004/chat?username=YourName&room=general');
```

## 📊 Build Statistics

Typical build results:
- **Setup.exe Size**: ~150-200 MB
- **Build Time**: 5-10 minutes
- **Dependencies**: ~1000+ packages
- **Files Included**: ~50,000+ files

## 🎉 Success Indicators

Your setup.exe is ready when you see:

```
✅ BUILD COMPLETED SUCCESSFULLY!
📦 Setup.exe location: dist\AkashShareUserSetup-x64.exe
🔌 WebSocket support: ✅ Included
🚀 Backend server: ✅ Included
📱 Chat functionality: ✅ Included
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the build logs for specific errors
3. Ensure all prerequisites are met
4. Try running as Administrator

## 🔄 Updates

To update the setup.exe:
1. Make your code changes
2. Run the build process again
3. The new setup.exe will replace the old one

---

**Note**: This setup.exe is designed to work like professional applications such as Cursor and Qoder, providing a seamless installation and user experience.
