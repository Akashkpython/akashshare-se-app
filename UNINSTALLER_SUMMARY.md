# AkAsH Share Uninstaller Solutions

This project provides multiple uninstaller solutions for the AkAsH Share application, each with different advantages.

## Solution 1: NSIS Installer Integration (installer.nsh)

### Features:
- Integrated with Electron app distribution package
- Professional Windows installer/uninstaller experience
- Custom uninstall confirmation dialog
- Part of the automated build process

### Usage:
1. Build the Electron app with `npm run dist`
2. Install using the generated NSIS installer
3. Uninstall from Control Panel or Programs & Features
4. Type 'AkAsH' when prompted during uninstallation

## Solution 2: Batch File Uninstaller (uninstaller.bat)

### Features:
- Simple Windows batch script
- Works on all Windows versions
- No additional dependencies required
- Easy to run by double-clicking

### Usage:
1. Double-click `uninstaller.bat`
2. Type 'AkAsH' when prompted
3. Wait for uninstall to complete

## Solution 3: PowerShell Uninstaller (uninstaller.ps1)

### Features:
- More robust PowerShell script
- Better error handling and feedback
- Can detect installation paths more accurately
- Requires PowerShell (available by default on Windows 7+)

### Usage:
1. Right-click `uninstaller.ps1` → "Run with PowerShell"
2. Type 'AkAsH' when prompted
3. Wait for uninstall to complete

## Solution 4: C# Executable Uninstaller (Uninstaller.cs)

### Features:
- Standalone executable (no runtime dependencies)
- Professional console interface
- Registry-aware uninstallation
- Can be compiled to a single .exe file

### Building:
1. Run `build-uninstaller.bat`
2. Find the compiled executable in the `dist` folder

### Usage:
1. Run `Uninstaller.exe` as Administrator
2. Type 'AkAsH' when prompted
3. Wait for uninstall to complete

## Solution 5: Inno Setup Integration (uninstaller.iss)

### Features:
- Integrates with Inno Setup installer
- Professional installer/uninstaller experience
- Built-in confirmation dialogs
- Part of the installation package

### Building:
1. Install Inno Setup
2. Open `uninstaller.iss`
3. Compile the script

## Security Features (All Solutions)

1. **Name Confirmation**: Requires typing 'AkAsH' to proceed
2. **Attempt Limiting**: Maximum 3 attempts to prevent brute-force
3. **Administrator Rights**: Requires elevated privileges for system changes
4. **Comprehensive Cleanup**: Removes files, shortcuts, and registry entries

## Files Included

- `installer.nsh` - NSIS installer script with custom uninstall confirmation
- `custom-uninstaller.nsh` - Custom NSIS uninstaller extension
- `uninstaller.bat` - Batch file uninstaller
- `uninstaller.ps1` - PowerShell uninstaller
- `Uninstaller.cs` - C# source code for executable uninstaller
- `compile-uninstaller.bat` - Compile script for C# version
- `uninstaller.iss` - Inno Setup script
- `UNINSTALLER_README.md` - Documentation file
- `test-electron-uninstaller.bat` - Test script for Electron integration

## Recommendations

1. **For Electron app distribution**: Use the NSIS integration (default with `npm run dist`)
2. **For simplicity**: Use `uninstaller.bat`
3. **For robustness**: Use `uninstaller.ps1`
4. **For professional deployment**: Compile the C# version
5. **For custom installer integration**: Use the Inno Setup script

## Notes

- All uninstallers must be run as Administrator
- The NSIS integration is automatically included when building the Electron app with `npm run dist`
- The PowerShell version provides the most accurate detection of installation paths
- The C# version can be digitally signed for enterprise deployment
- The batch file version is the most compatible with older systems