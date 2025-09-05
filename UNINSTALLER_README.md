# AkAsH Share Uninstaller

This directory contains uninstaller scripts for the AkAsH Share application.

## Available Uninstallers

### 1. Batch File Uninstaller (uninstaller.bat)
- Simple Windows batch script
- Works on all Windows versions
- No additional dependencies required
- Easy to run by double-clicking
- Enhanced to find installation directories more reliably

### 2. PowerShell Uninstaller (uninstaller.ps1)
- More robust PowerShell script
- Better error handling and feedback
- Can detect installation paths more accurately
- Requires PowerShell to be installed (available by default on Windows 7+)
- Enhanced to search for additional installation locations

### 3. C# Uninstaller (Uninstaller.cs)
- Standalone executable when compiled
- Most robust implementation
- Can be compiled to a single .exe file
- Best for distribution

## How to Use

1. **Download** the uninstaller script you prefer
2. **Run** the script as Administrator (right-click → "Run as administrator")
3. **Type 'AkAsH'** when prompted to confirm uninstallation
4. **Wait** for the uninstall process to complete

## Security Features

- Requires typing the exact application name "AkAsH" to proceed
- Limits to 3 attempts to prevent brute-force
- Removes all application files and shortcuts
- Cleans up registry entries (PowerShell and C# versions)

## Requirements

- Windows 7 or later
- Administrator privileges
- PowerShell 3.0+ (for PowerShell version)
- .NET SDK (for compiling C# version)

## Building the C# Uninstaller

To compile the C# uninstaller into a standalone executable:

1. Install .NET SDK from https://dotnet.microsoft.com/download
2. Run the build-uninstaller.bat script
3. The compiled Uninstaller.exe will be created in the dist folder

Alternatively, if you have Visual Studio or the .NET Framework SDK installed:
```
csc /target:exe /out:Uninstaller.exe Uninstaller.cs
```

## Notes

- If the application was installed in a custom location, you may need to manually remove those files
- Some antivirus software may flag the uninstaller - this is a false positive due to the script's file removal capabilities
- The uninstallers will search multiple common installation locations to ensure complete removal
- All uninstallers provide clear console messages as requested:
  - "Type 'AkAsH' to uninstall the app:"
  - "Uninstall successful!" or "Incorrect name. Uninstall cancelled."