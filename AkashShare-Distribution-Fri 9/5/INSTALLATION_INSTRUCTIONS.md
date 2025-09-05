# Akash Share Installation Instructions

## Overview
This document provides instructions for installing the Akash Share application on another PC.

## Prerequisites
- Windows 7 or later (64-bit)
- Administrator privileges for installation

## Installation Steps

### Method 1: Using the NSIS Installer (Recommended)
1. Once the build process completes, locate the installer file:
   - File: `dist\Akash Share Setup 1.0.1.exe`
   - Size: Approximately 170-180 MB
2. Double-click the installer to begin installation
3. Follow the installation wizard prompts
4. Accept the license agreement when prompted
5. Choose installation location (or use default)
6. Click "Install" to begin installation
7. Once completed, click "Finish" to launch the application

### Method 2: Using the Unpacked Version
If the installer is not available, you can use the unpacked version:
1. Copy the entire `dist\win-unpacked` folder to the target PC
2. Navigate to the folder and double-click `Akash Share.exe` to run the application
3. Note: This method does not create desktop shortcuts or start menu entries

## Uninstallation
To uninstall Akash Share from your system:
1. Go to Control Panel > Programs and Features (or Apps & Features in Windows 10/11)
2. Find "AkAsH Share" in the list of installed programs
3. Click "Uninstall" and confirm
4. During uninstallation, you will be prompted to type "AkAsH" to confirm removal
5. The uninstallation process will remove all application files and shortcuts

### Alternative Uninstallation Methods
If the standard uninstallation fails, you can use the provided uninstaller scripts:
- `uninstaller.bat` - Batch script uninstaller
- `uninstaller.ps1` - PowerShell script uninstaller
- `Uninstaller.exe` - Standalone executable uninstaller (created by compiling Uninstaller.cs)

To use any of these scripts:
1. Run the script as Administrator
2. When prompted, type "AkAsH" to confirm uninstallation
3. The script will remove all application files and shortcuts

## System Requirements
- Operating System: Windows 7 SP1 or later (64-bit)
- Processor: 1 GHz or faster
- Memory: 1 GB RAM (32-bit) or 2 GB RAM (64-bit)
- Storage: 200 MB available space
- Display: 800 x 600 screen resolution

## Troubleshooting
If you encounter issues during installation or running the application:

1. **Installation fails with permissions error**
   - Ensure you're running the installer as Administrator
   - Check that you have write permissions to the installation directory

2. **Application fails to start**
   - Ensure all required dependencies are installed
   - Check Windows Event Viewer for error details

3. **Uninstallation fails**
   - Try running the alternative uninstaller scripts as Administrator
   - Manually delete the installation folder if necessary

## Security Note
For security, the uninstallation process requires you to type "AkAsH" exactly to confirm removal of the application. This prevents accidental uninstallation.

## Support
For additional help, please refer to the project documentation or contact the development team.