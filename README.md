# Akash Share - Peer-to-Peer File Sharing Application

Akash Share is a peer-to-peer file sharing application built with Electron, React, and Node.js. It allows users to share files directly between devices without requiring a central server.

## Features

- 🚀 Fast peer-to-peer file transfers
- 💬 Real-time chat functionality
- 🔒 Secure file sharing with encryption
- 📱 Cross-platform support (Windows, macOS, Linux)
- 🎨 Modern UI with dark/light themes

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd akash-share
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the `backend` directory with the following:
   ```
   PORT=5004
   MONGODB_URI=mongodb://localhost:27017/akashshare
   JWT_SECRET=your-secret-key
   ```

## Starting the Application

You have several options to start the application:

### Option 1: PowerShell Script (Recommended for PowerShell users)
```powershell
.\start-app.ps1
```

### Option 2: Batch File (Recommended for Command Prompt users)
```cmd
.\fixed-start-app.bat
```

### Option 3: Node.js Script (Cross-platform)
```bash
node start-fixed-app.js
```

### Option 4: Pre-built Executable
```bash
.\AkashShare-Portable.exe
```

### Option 5: Manual Start
1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. In a new terminal, start the Electron app:
   ```bash
   npm run electron
   ```

## Project Structure

- `backend/` - Node.js Express server
- `electron/` - Electron main process files
- `public/` - Static assets
- `src/` - React frontend components
- `uploads/` - Temporary file storage

## WebSocket Implementation

Akash Share features a robust WebSocket-based real-time chat system:

- **Real-time Messaging**: Instant message delivery between users
- **Room-based Chat**: Organize conversations in different chat rooms
- **User Presence**: Track online users and their status
- **Message Moderation**: AI-powered content filtering
- **Connection Management**: Rate limiting and abuse prevention

For detailed information about the WebSocket implementation, see [WEBSOCKET_IMPLEMENTATION_SUMMARY.md](file:///D:/5th%20sem/project/akashshare-se/WEBSOCKET_IMPLEMENTATION_SUMMARY.md).

## Setup.exe and Electron Connection

The application includes a pre-built portable executable ([AkashShare-Portable.exe](file:///D:/5th%20sem/project/akashshare-se/AkashShare-Portable.exe)) that properly connects the Electron frontend to the backend services:

- **Single Executable**: No installation required
- **Automatic Backend Connection**: Electron app automatically connects to backend services
- **Health Checks**: Built-in verification of component connectivity
- **Process Management**: Proper handling of multiple processes

For detailed information about the setup and connection verification, see [SETUP_AND_ELECTRON_CONNECTION_VERIFICATION.md](file:///D:/5th%20sem/project/akashshare-se/SETUP_AND_ELECTRON_CONNECTION_VERIFICATION.md).

## Development

To run the app in development mode:

1. Start the backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend:
   ```bash
   npm start
   ```

3. Start Electron:
   ```bash
   npm run electron-dev
   ```

## Building for Production

To build the application for production:

```bash
npm run build
npm run electron-build
```

## Troubleshooting

### Common Issues and Solutions

1. **Backend Server Crash**: 
   - Ensure MongoDB is running
   - Check that port 5004 is not in use
   - Verify environment variables in `.env` file

2. **PowerShell Syntax Errors**:
   - Use the provided `start-app.ps1` script which has proper PowerShell syntax
   - Alternatively, use the batch file `fixed-start-app.bat`

3. **Multiple Electron Processes**:
   - The new startup scripts automatically kill existing processes
   - If issues persist, manually kill Electron processes in Task Manager

4. **Memory Leaks**:
   - The application now properly cleans up resources on exit
   - If you experience high memory usage, restart the application

### Port Conflicts

If you encounter port conflicts:
1. The startup scripts automatically kill processes on ports 5004 and 3000
2. You can manually change the ports in the `.env` file and [backend/server.js](file:///D:/5th%20sem/project/akashshare-se/backend/server.js)

## Recent Fixes

All critical issues have been resolved:

1. ✅ Backend Server Crash - Fixed IPv4 binding and health checks
2. ✅ PowerShell Syntax Errors - Created new PowerShell script with proper syntax
3. ✅ React Server Issues - Resolved IPv6 binding problems
4. ✅ Multiple Electron Processes - Enhanced process management
5. ✅ Memory Leaks - Implemented proper resource cleanup

See [COMPLETE_FIX_VERIFICATION.md](file:///D:/5th%20sem/project/akashshare-se/COMPLETE_FIX_VERIFICATION.md) for detailed information about the fixes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.
