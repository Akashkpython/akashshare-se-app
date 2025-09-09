# Akash Share - All Users Installation Guide

## 🎯 Overview
This guide explains how to install Akash Share for **ALL USERS** on a Windows system. The all-users installer creates a system-wide installation that makes the application available to every user on the computer.

## 📋 Prerequisites

### System Requirements
- **Operating System**: Windows 10/11 (64-bit)
- **Administrator Privileges**: Required for installation
- **Disk Space**: 500MB free space
- **Memory**: 4GB RAM minimum
- **Internet**: Connection required for MongoDB Atlas

### Software Requirements
- **NSIS**: Required to build the installer
  - Download from: https://nsis.sourceforge.io/Download
  - Add to system PATH after installation

## 🚀 Creating the All-Users Installer

### Step 1: Prepare the Environment
```bash
# Ensure you have the portable app built
npm run build
npx electron-packager . "Akash Share" --platform=win32 --arch=x64 --out=dist --overwrite --asar --icon=public/Akashshareicon.png
```

### Step 2: Create the Installer
```bash
# Run the all-users installer creation script
.\create-all-users-installer.bat
```

### Step 3: Verify the Installer
- Check that `dist\Akash Share Setup - All Users.exe` was created
- File size should be approximately 200-250MB

## 💻 Installing for All Users

### Method 1: GUI Installation (Recommended)
1. **Right-click** on `Akash Share Setup - All Users.exe`
2. Select **"Run as administrator"**
3. Click **"Yes"** when Windows asks for permission
4. Follow the installation wizard:
   - Accept the license agreement
   - Choose installation directory (default: `C:\Program Files\Akash Share`)
   - Wait for installation to complete
5. Click **"Finish"** when done

### Method 2: Silent Installation (Advanced)
```cmd
# Run as administrator
"Akash Share Setup - All Users.exe" /S
```

## 🎯 What Gets Installed

### Application Files
- **Location**: `C:\Program Files\Akash Share\`
- **Main Executable**: `Akash Share.exe`
- **Backend Server**: Complete Node.js/Express server
- **Frontend**: React application build
- **Dependencies**: All required libraries and modules

### Shortcuts Created
- **Desktop**: Available to all users
- **Start Menu**: `Start Menu > Akash Share`
- **Quick Launch**: Windows 7/8/10/11 compatibility

### Registry Entries
- **HKLM**: System-wide registry entries
- **Add/Remove Programs**: Proper uninstall entry
- **File Associations**: `.akash` file type
- **Auto-start**: Optional system startup

### Application Data
- **User Data**: `%APPDATA%\AkashShare\`
- **Shared Data**: `%PROGRAMDATA%\AkashShare\`
- **Logs**: `%APPDATA%\AkashShare\logs\`
- **Uploads**: `%APPDATA%\AkashShare\uploads\`

## 🔧 Configuration

### Environment Variables
The installer sets up the following system-wide configuration:
- **NODE_ENV**: `production`
- **Install Path**: Registry entry for application location
- **Version Info**: Stored in registry for updates

### Permissions
- **Application Directory**: Read/Execute for all users
- **Data Directories**: Full access for all users
- **Registry**: System-wide read access

## 👥 User Experience

### For Each User
1. **First Launch**: Application starts with default settings
2. **Data Isolation**: Each user has their own data directory
3. **Shared Resources**: Common application files are shared
4. **Updates**: System-wide updates affect all users

### Administrator Benefits
- **Centralized Management**: Single installation point
- **Easy Updates**: Update once, affects all users
- **Consistent Experience**: Same version for all users
- **Resource Efficiency**: Shared application files

## 🗑️ Uninstalling

### Method 1: Add/Remove Programs
1. Open **Settings** > **Apps** > **Apps & features**
2. Find **"Akash Share"**
3. Click **"Uninstall"**
4. Follow the uninstall wizard

### Method 2: Control Panel
1. Open **Control Panel** > **Programs** > **Uninstall a program**
2. Find **"Akash Share"**
3. Right-click and select **"Uninstall"**

### Method 3: Silent Uninstall
```cmd
# Run as administrator
"C:\Program Files\Akash Share\uninstall.exe" /S
```

## 🔍 Troubleshooting

### Common Issues

#### "Administrator rights required"
- **Solution**: Right-click installer and select "Run as administrator"
- **Cause**: All-users installation requires elevated privileges

#### "Installation failed"
- **Solution**: Check disk space and permissions
- **Cause**: Insufficient space or permission issues

#### "Application won't start"
- **Solution**: Check Windows Firewall and antivirus
- **Cause**: Security software blocking the application

### Log Files
- **Installation Logs**: Check Windows Event Viewer
- **Application Logs**: `%APPDATA%\AkashShare\logs\`
- **System Logs**: Windows Event Viewer > Applications

## 🚀 Deployment Scenarios

### Corporate Environment
- **Domain Deployment**: Use Group Policy for mass deployment
- **Silent Installation**: Deploy via SCCM or similar tools
- **User Training**: Provide documentation for end users

### Educational Institutions
- **Lab Computers**: Install on shared student computers
- **Teacher Workstations**: Individual installations
- **Network Deployment**: Centralized management

### Home/Small Office
- **Family Computers**: Single installation for all family members
- **Shared Workstations**: Multiple users, single installation
- **Guest Access**: Available to all computer users

## 📊 Technical Details

### Installation Process
1. **Verification**: Check administrator privileges
2. **File Copy**: Copy application files to Program Files
3. **Registry**: Create system-wide registry entries
4. **Shortcuts**: Create shortcuts for all users
5. **Permissions**: Set appropriate file permissions
6. **Integration**: Register with Windows

### Security Considerations
- **Code Signing**: Consider signing the installer for trust
- **Antivirus**: May trigger false positives (common with Electron apps)
- **Firewall**: Application may need firewall exceptions
- **Permissions**: Minimal required permissions for security

## 🎉 Success Indicators

After successful installation, you should see:
- ✅ Desktop shortcut appears for all users
- ✅ Start Menu entry available to all users
- ✅ Application appears in Add/Remove Programs
- ✅ File associations work (`.akash` files)
- ✅ Application starts without errors
- ✅ All users can access the application

## 📞 Support

For issues with all-users installation:
- **GitHub Issues**: https://github.com/Akashkpython/akashshare-se-app/issues
- **Documentation**: Check this guide and README files
- **Logs**: Provide installation and application logs

---

**Note**: This all-users installer is designed for system administrators and advanced users. For single-user installations, use the standard installer instead.
