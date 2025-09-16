# Akash Share Application Launch Issue - Solution Guide

## Problem
The setup.exe installed successfully, but the application doesn't open when you:
- Double-click the app icon
- Right-click and select "Open"
- Search for it in Windows Start Menu
- Try to run it from the Run dialog

## Common Causes & Solutions

### 1. Application Not Found in Expected Location

**Check these locations:**
```
C:\Users\[YourUsername]\AppData\Local\Programs\akash-share\
C:\Program Files\akash-share\
C:\Program Files (x86)\akash-share\
```

**Solution:**
1. Navigate to the installation directory
2. Look for a file named `Akash Share.exe` or similar
3. Try double-clicking it directly

### 2. Missing Desktop/Start Menu Shortcuts

**Solution:**
1. Right-click on the executable file
2. Select "Create shortcut"
3. Move the shortcut to Desktop or Start Menu

### 3. Application Crashes on Startup

**Check for errors:**
1. Open Windows Event Viewer
2. Go to Windows Logs > Application
3. Look for recent errors related to "Akash Share" or "Electron"

**Solution:**
1. Run the application as Administrator
2. Check if antivirus is blocking it
3. Try running from Command Prompt to see error messages

### 4. Backend Server Issues

**The app might be failing to start the backend server.**

**Solution:**
1. Check if port 5003 is available
2. Look for error messages in the console
3. Ensure MongoDB connection is working

## Step-by-Step Troubleshooting

### Step 1: Find the Application
```cmd
# Open Command Prompt and run:
dir /s "C:\Users\%USERNAME%\AppData\Local\Programs\*akash*"
dir /s "C:\Program Files\*akash*"
dir /s "C:\Program Files (x86)\*akash*"
```

### Step 2: Test Direct Launch
1. Navigate to the installation directory
2. Find the main executable (usually `Akash Share.exe`)
3. Double-click it or run from Command Prompt

### Step 3: Check for Error Messages
```cmd
# Run from Command Prompt to see error messages:
cd "C:\Users\%USERNAME%\AppData\Local\Programs\akash-share"
"Akash Share.exe"
```

### Step 4: Run as Administrator
1. Right-click on the executable
2. Select "Run as administrator"
3. Check if it launches successfully

### Step 5: Check Windows Event Logs
1. Press `Win + R`, type `eventvwr.msc`
2. Go to Windows Logs > Application
3. Look for recent errors

## Quick Fix Scripts

### Option 1: Use the Batch File
Run the `find-and-launch-app.bat` script I created:
```cmd
find-and-launch-app.bat
```

### Option 2: Use PowerShell Script
Run the PowerShell diagnostic script:
```powershell
powershell -ExecutionPolicy Bypass -File "diagnose-app-issue.ps1"
```

### Option 3: Manual Fix
1. Find the installation directory
2. Create a shortcut manually
3. Test the application

## Alternative Solutions

### Solution 1: Reinstall the Application
1. Uninstall the current installation
2. Run the setup.exe again as Administrator
3. Choose a different installation directory if needed

### Solution 2: Use the Unpacked Version
1. Go to `dist-new\win-unpacked\`
2. Find `Akash Share.exe`
3. Run it directly from there

### Solution 3: Check Dependencies
The application might be missing required dependencies:
1. Install Visual C++ Redistributable
2. Update .NET Framework
3. Check Node.js installation

## Expected Behavior

When working correctly, the application should:
1. ✅ Launch and show the main window
2. ✅ Start the backend server automatically
3. ✅ Display the file sharing interface
4. ✅ Allow you to send and receive files

## If Nothing Works

1. **Check the build logs** in `dist-new\builder-debug.yml`
2. **Try the unpacked version** in `dist-new\win-unpacked\`
3. **Reinstall with different settings**
4. **Check system requirements** (Windows version, architecture)

## Contact Information

If you continue to have issues:
1. Check the application logs
2. Note any error messages
3. Try running from Command Prompt to see detailed errors
4. Consider reinstalling the application

## Files Created for You

- `find-and-launch-app.bat` - Automated fix script
- `diagnose-app-issue.ps1` - Diagnostic script
- `fix-app-launch.ps1` - Fix script
- `APP_LAUNCH_SOLUTION.md` - This guide

Run any of these scripts to help resolve the issue!
