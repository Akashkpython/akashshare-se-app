# Backend Auto-Start Solution for AkashShare

## Problem Summary
The backend is not auto-starting when the Electron app launches, and when navigating between pages, the backend goes offline.

## Root Causes Identified
1. **Path handling issue**: Fixed with proper path quoting
2. **Backend process crashes**: No auto-restart mechanism
3. **No backend monitoring**: Backend health not monitored
4. **Process cleanup issues**: Backend processes not properly managed

## Solutions Implemented

### 1. ✅ Fixed Path Quoting Issue
- Updated `electron/main.js` to properly quote paths with spaces
- Changed from `spawn('node', [backendPath], ...)` to `spawn('node', [\`"${backendPath}"\`], ...)`

### 2. ✅ Added Backend Monitoring System
- **Health Check Monitoring**: Checks backend health every 30 seconds
- **Auto-Restart on Crash**: Automatically restarts backend if it crashes
- **Process Management**: Proper cleanup of backend processes

### 3. ✅ Enhanced Backend Process Management
- **Crash Detection**: Monitors backend process exit events
- **Graceful Restart**: Restarts backend with proper error handling
- **Resource Cleanup**: Clears monitoring intervals on app shutdown

### 4. ✅ Improved Error Handling
- **Timeout Reduction**: Reduced startup timeout from 45s to 15s
- **Better Logging**: Enhanced logging for debugging
- **Retry Logic**: Maximum 5 restart attempts before giving up

## Key Features Added

### Backend Health Monitoring
```javascript
// Monitors backend health every 30 seconds
async function monitorBackendHealth() {
  // Checks http://localhost:5005/health
  // Auto-restarts if backend is not responding
}
```

### Auto-Restart on Crash
```javascript
backendProcess.on('close', (code, signal) => {
  if (code !== 0) {
    // Auto-restart backend after 3 seconds
    setTimeout(() => {
      backendProcess = await createBackendProcess();
    }, 3000);
  }
});
```

### Process Cleanup
```javascript
// Proper cleanup on app shutdown
if (backendProcess.monitoringInterval) {
  clearInterval(backendProcess.monitoringInterval);
}
```

## How It Works

1. **App Launch**: Electron app starts and initializes backend
2. **Backend Startup**: Backend process starts on port 5005
3. **Health Monitoring**: Continuous health checks every 30 seconds
4. **Auto-Restart**: If backend crashes, it's automatically restarted
5. **Page Navigation**: Backend stays online during navigation
6. **App Shutdown**: Proper cleanup of all processes

## Testing the Solution

### 1. Start the Electron App
```bash
npm run electron
```

### 2. Verify Backend is Running
```bash
# Check if backend is responding
curl http://localhost:5005/health
```

### 3. Test Backend Persistence
- Navigate between different pages in the app
- Backend should stay online
- Check logs for any restart messages

## Expected Behavior

✅ **Auto-Start**: Backend starts automatically when Electron app launches  
✅ **Health Monitoring**: Backend health is checked every 30 seconds  
✅ **Auto-Restart**: Backend restarts automatically if it crashes  
✅ **Page Navigation**: Backend stays online when navigating between pages  
✅ **Error Recovery**: Backend recovers from temporary issues  
✅ **Clean Shutdown**: Proper cleanup when app closes  

## Troubleshooting

### If Backend Still Doesn't Start
1. Check if port 5005 is available: `netstat -ano | findstr :5005`
2. Verify Node.js is working: `node --version`
3. Check backend dependencies: `cd backend && npm install`
4. Test backend manually: `cd backend && node simple-backend.js`

### If Backend Keeps Crashing
1. Check backend logs in Electron console
2. Verify MongoDB connection (if using database)
3. Check for port conflicts
4. Review backend error messages

### If Auto-Restart Isn't Working
1. Check monitoring interval is running
2. Verify health check endpoint responds
3. Check restart attempt counter
4. Review error logs for restart failures

## Configuration Options

### Backend Port
- Default: 5005
- Change in `electron/main.js`: `PORT: '5005'`

### Monitoring Interval
- Default: 30 seconds
- Change in `startBackendMonitoring()`: `30000` ms

### Max Restart Attempts
- Default: 5 attempts
- Change: `maxBackendRestartAttempts = 5`

### Startup Timeout
- Default: 15 seconds
- Change: `maxAttempts = 15`

## Files Modified

1. **`electron/main.js`**: Added monitoring and auto-restart logic
2. **`backend/simple-backend.js`**: Updated to use ES modules
3. **Port separation**: React dev server (5004) vs Backend (5005)

## Next Steps

1. Test the Electron app with the new monitoring system
2. Verify backend stays online during page navigation
3. Check logs for any monitoring messages
4. Test backend restart functionality by manually killing the backend process

The solution provides robust backend management with automatic recovery, ensuring the backend stays online throughout the application lifecycle.
