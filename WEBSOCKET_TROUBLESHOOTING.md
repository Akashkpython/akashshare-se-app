# WebSocket Connection Troubleshooting Guide

## Common Issues and Solutions

### 1. Backend Server Not Running
**Problem**: The group chat shows "Connecting..." and never connects.
**Solution**: 
- Make sure the backend server is running on port 5002
- Run `node run-backend.js` from the project root
- Or run `node server.js` from the backend directory
- Check that MongoDB is accessible

### 2. Port Conflicts
**Problem**: The backend server fails to start with "Port already in use" error.
**Solution**:
- Check if another instance of the server is running
- Kill any processes using port 5002
- On Windows: `netstat -ano | findstr :5002` then `taskkill /PID <PID> /F`

### 3. MongoDB Connection Issues
**Problem**: Server starts but WebSocket connections fail.
**Solution**:
- Verify MongoDB Atlas connection string in .env files
- Check network connectivity to MongoDB Atlas
- Ensure IP whitelist includes your current IP

### 4. Firewall Blocking Connections
**Problem**: WebSocket connections time out.
**Solution**:
- Check Windows Firewall settings
- Ensure port 5002 is allowed for both inbound and outbound connections
- Run `configure-firewall.ps1` script if available

## Testing Steps

### 1. Verify Backend Server
```bash
# From project root
node run-backend.js
# Or directly from backend directory:
cd backend && node server.js
```

Check for output like:
```
Server running on http://localhost:5002
WebSocket chat available at: ws://localhost:5002/chat
```

### 2. Test WebSocket Connection
```bash
# Run the test script
node test-websocket.js
```

### 3. Check Browser Console
In the Electron app, open Developer Tools (Ctrl+Shift+I) and check the Console tab for:
- WebSocket connection logs
- Error messages
- Network requests

## Debugging Information

### Environment Variables
Make sure these are set correctly:
- `MONGO_URI`: MongoDB Atlas connection string
- `PORT`: 5002 (backend port)
- `HOST`: localhost or 0.0.0.0
- `NODE_ENV`: development

### Expected WebSocket URL
The WebSocket should connect to:
```
ws://localhost:5002/chat?username=USERNAME&room=ROOM
```

### Common Error Messages
- "Connection timeout": Backend server not running or not reachable
- "Connection failed": Incorrect WebSocket URL or network issues
- "Server unreachable": Backend server not started or port blocked

## Quick Start Commands

### Windows
```cmd
# Start backend server
node run-backend.js

# Start development environment (backend only)
cd backend && npm run dev
```

### PowerShell/Terminal
```bash
# Start backend server
node run-backend.js

# Start development environment (backend only)
cd backend && npm run dev
```

## Manual Verification Steps

1. Open two terminals
2. Terminal 1: Start backend server
   ```bash
   node run-backend.js
   ```
3. Terminal 2: Test WebSocket connection
   ```bash
   node test-websocket.js
   ```
4. Check for successful connection messages
5. If successful, start the Electron app and test the group chat

## Network Troubleshooting

If connections still fail:

1. Check if you can access http://localhost:5002 in your browser
2. Verify that no antivirus software is blocking the connection
3. Try using 127.0.0.1 instead of localhost
4. Check if you're using a VPN that might interfere with localhost connections

## Contact Support

If you continue to experience issues:
1. Take a screenshot of the console logs
2. Note the exact error messages
3. Check the backend server logs
4. Contact the development team with this information