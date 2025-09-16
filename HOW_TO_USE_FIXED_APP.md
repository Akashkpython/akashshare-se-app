# How to Use the Fixed Akash Share Application

## Overview
This document provides instructions on how to use the fixed version of the Akash Share application, which resolves the "Backend Server Error" issue.

## What Was Fixed
The backend server error was caused by two main issues:
1. Missing .env file in the packaged application
2. Improper handling of environment variables in the Electron main process

These issues have been resolved, and the application should now start correctly with all functionality working.

## Installation Instructions

### Option 1: Using the Installer (Recommended)
1. Locate the installer file: `dist-final\AkashShareUserSetup-x64.exe`
2. Double-click the installer to begin installation
3. Follow the installation wizard prompts
4. Choose your preferred installation directory
5. Complete the installation process
6. Launch the application from the Start Menu or desktop shortcut

### Option 2: Running Directly from Packaged Directory
1. Navigate to `dist-final\win-unpacked`
2. Double-click `Akash Share.exe` to launch the application

## Usage Instructions

### Starting the Application
1. Launch the application using one of the methods above
2. The application window should appear with the main interface
3. The backend server will start automatically in the background

### Using the Application Features
1. **File Sharing**:
   - Click "Send Files" to share files with others
   - Enter the generated code on another device to receive files
   - Click "Receive Files" to download shared files using a code

2. **Group Chat**:
   - Click "Group Chat" to access the chat interface
   - Enter a username and room name to join a chat room
   - Send messages and files to other users in the same room

3. **Developer Tools**:
   - Access developer tools through the Developer section
   - View system information and performance metrics

### Troubleshooting

#### If the Application Still Shows Backend Server Error
1. Check that MongoDB Atlas is accessible from your network
2. Verify that your firewall is not blocking the application
3. Ensure you have a stable internet connection
4. Try restarting the application

#### If the Application Fails to Start
1. Check Windows Event Viewer for any error messages
2. Ensure you have the latest version of the application
3. Try reinstalling the application
4. Contact support if the issue persists

## Technical Details

### Environment Variables
The application now properly includes and uses the following environment variables:
- `MONGO_URI`: MongoDB connection string for database access
- `JWT_SECRET`: Secret key for JWT token generation
- `PORT`: Backend server port (5003)
- `HOST`: Backend server host (localhost)
- `NODE_ENV`: Environment mode (production)

### File Structure
The packaged application includes:
- Frontend build files in the `app/build` directory
- Backend server files in the `resources/backend` directory
- Environment configuration file at `resources/backend/.env`
- All required dependencies and modules

## Support
If you continue to experience issues with the application, please:
1. Check the application logs in `%APPDATA%\akash-share\logs`
2. Ensure you have the latest version of the application
3. Contact the development team for assistance