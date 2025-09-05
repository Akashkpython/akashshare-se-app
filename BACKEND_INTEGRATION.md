# Akash Share Backend Integration

This document explains how the backend server is integrated into the Electron application build.

## Integration Overview

The backend server is now fully integrated into the Electron build process, allowing the application to run as a standalone desktop application with both frontend and backend components bundled together.

## How It Works

### 1. Build Process
- During the build process (`npm run dist`), the backend files are included in the packaged application
- Backend dependencies are installed automatically when the application starts
- The uploads directory is created if it doesn't exist

### 2. Application Startup
1. When the Electron app starts, it checks for backend dependencies
2. If dependencies are missing, they are automatically installed using `npm install`
3. The backend server (`backend/server.js`) is started as a child process
4. The frontend React app communicates with the backend via `http://localhost:5002`

### 3. File Structure in Build
```
dist/
├── win-unpacked/
│   ├── resources/
│   │   ├── app.asar (contains frontend files)
│   │   └── backend/
│   │       ├── server.js
│   │       ├── package.json
│   │       ├── node_modules/
│   │       └── uploads/
│   └── Akash Share.exe
```

## Key Changes Made

### 1. Electron Main Process (`electron/main.js`)
- Added functions to install backend dependencies
- Added functions to start/stop the backend server
- Modified app startup to initialize the backend before creating the window

### 2. Package Configuration (`package.json`)
- Updated build configuration to include backend files
- Added exclusion patterns for unnecessary files (node_modules, uploads/*)
- Added extraResources configuration for proper backend packaging

### 3. Build Scripts (`scripts/copy-electron.js`)
- Modified to copy essential backend files to the build directory
- Ensures the uploads directory is created

## Environment Variables

The backend server uses the following environment variables when running in the packaged application:
- `NODE_ENV`: Set to 'production'
- `PORT`: Set to '5002'
- `HOST`: Set to 'localhost'

For development, you still need to set these variables manually or use a `.env` file.

## Testing the Integration

To test the backend integration:

```bash
# Run the test script
node test-backend-integration.js
```

## Building the Application

To build the application with integrated backend:

```bash
# Build for distribution
npm run dist
```

## Troubleshooting

### Backend Not Starting
1. Check if MongoDB is accessible
2. Verify environment variables are set correctly
3. Check the Electron console for error messages

### Dependency Installation Issues
1. Ensure npm is available in the system PATH
2. Check network connectivity for downloading packages
3. Verify disk space is available

### File Upload Issues
1. Ensure the uploads directory has write permissions
2. Check available disk space
3. Verify file size limits in the backend configuration

## Security Considerations

- The backend server only binds to localhost (127.0.0.1)
- No external network access is allowed by default
- File type validation is performed on uploads
- Rate limiting is implemented to prevent abuse

## Future Improvements

1. Add automatic MongoDB embedding for fully standalone operation
2. Implement better error handling and recovery mechanisms
3. Add progress indicators for backend dependency installation
4. Optimize the build process to reduce application size