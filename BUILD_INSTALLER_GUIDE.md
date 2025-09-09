# 🚀 Akash Share - Professional Windows Installer Build Guide

This guide will help you create a professional Windows installer for Akash Share using `electron-builder` and NSIS.

## 📋 Prerequisites

### Required Software
1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **NSIS** (v3.11 or higher) - [Download](https://nsis.sourceforge.io/Download)
3. **Git** (optional) - [Download](https://git-scm.com/)

### Verification Commands
```bash
# Check Node.js
node --version

# Check npm
npm --version

# Check NSIS
makensis -VERSION
```

## 🎯 Quick Start (Recommended)

### Option 1: Use the Build Script
```bash
# Run the automated build script
.\create-nsis-setup.bat
```

This script will:
- ✅ Check all prerequisites
- ✅ Build the React app
- ✅ Create the NSIS installer
- ✅ Generate "Akash Share Setup.exe"

### Option 2: Manual Build
```bash
# Build the installer manually
npm run build:win
```

## 📁 Project Structure

```
akashshare-se/
├── build-resources/
│   ├── icon.ico              # App icon (required)
│   ├── icon.png              # App icon (PNG format)
│   ├── installer.nsh         # NSIS customizations
│   ├── welcome.html          # Installer welcome page
│   └── ICON_SETUP.md         # Icon setup instructions
├── dist/                     # Build output directory
├── electron-builder.config.js # Electron builder configuration
├── package.json              # Project configuration
└── create-nsis-setup.bat     # Build script
```

## 🔧 Configuration Files

### 1. electron-builder.config.js
- **Purpose**: Main configuration for electron-builder
- **Features**: NSIS settings, shortcuts, installation directory
- **Location**: Root directory

### 2. build-resources/installer.nsh
- **Purpose**: Custom NSIS script additions
- **Features**: Registry entries, file associations, custom pages
- **Location**: build-resources/ directory

### 3. package.json Scripts
- **build:win**: Main installer build command
- **build:win:portable**: Create portable app (no installer)
- **build:installer**: Alias for build:win

## 🎨 Icon Setup

### Current Status
- ✅ PNG icon copied to `build-resources/icon.png`
- ⚠️ ICO file needed for Windows installer

### Create ICO File
1. **Online Converter** (Recommended):
   - Go to https://convertio.co/png-ico/
   - Upload `build-resources/icon.png`
   - Select sizes: 16, 32, 48, 64, 128, 256
   - Download and save as `build-resources/icon.ico`

2. **Alternative Tools**:
   - GIMP (free)
   - Photoshop
   - IconWorkshop
   - Online ICO converters

### Verification
```bash
# Check if ICO file exists
dir build-resources\icon.ico
```

## 🚀 Build Process

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build the Installer
```bash
# Option A: Use build script (recommended)
.\create-nsis-setup.bat

# Option B: Use npm script
npm run build:win

# Option C: Use electron-builder directly
npx electron-builder --win --publish=never
```

### Step 3: Verify Output
```bash
# Check installer was created
dir dist\*.exe
```

Expected output: `Akash Share Setup 1.0.5.exe`

## 📦 Installer Features

### Professional Features
- ✅ **Professional Naming**: "Akash Share Setup 1.0.5.exe"
- ✅ **NSIS Installer**: Industry-standard Windows installer
- ✅ **Desktop Shortcut**: Automatic desktop shortcut creation
- ✅ **Start Menu Integration**: Appears in Start Menu
- ✅ **Add/Remove Programs**: Shows in Windows Programs list
- ✅ **Custom Installation Directory**: User can choose location
- ✅ **Uninstaller Support**: Clean removal via Add/Remove Programs
- ✅ **Professional Branding**: Custom installer UI

### Installation Directory
- **Default**: `%LOCALAPPDATA%\Programs\Akash Share`
- **User Choice**: Can be changed during installation
- **Per-User**: Installs for current user only (no admin required)

### Shortcuts Created
- **Desktop**: `Akash Share.lnk`
- **Start Menu**: `Programs\Akash Share\Akash Share.lnk`
- **Uninstaller**: Available in Add/Remove Programs

## 🧪 Testing the Installer

### Test Installation
1. **Run the installer**: Double-click `Akash Share Setup 1.0.5.exe`
2. **Follow the wizard**: Accept defaults or customize
3. **Verify shortcuts**: Check desktop and Start Menu
4. **Test the app**: Launch from shortcut
5. **Check Programs**: Verify in Add/Remove Programs

### Test Uninstallation
1. **Via Add/Remove Programs**: Windows Settings > Apps
2. **Via Uninstaller**: Run uninstaller directly
3. **Verify cleanup**: Check that files and shortcuts are removed

## 🔧 Troubleshooting

### Common Issues

#### 1. "NSIS not found"
```bash
# Solution: Install NSIS and add to PATH
# Download from: https://nsis.sourceforge.io/Download
# Add NSIS installation directory to Windows PATH
```

#### 2. "electron-builder not found"
```bash
# Solution: Install electron-builder
npm install electron-builder --save-dev
```

#### 3. "Build failed"
```bash
# Solution: Check React build
npm run build

# If React build fails, fix the issues first
```

#### 4. "Icon not showing"
```bash
# Solution: Create proper ICO file
# Convert PNG to ICO with multiple sizes
# Place in build-resources/icon.ico
```

#### 5. "File lock errors"
```bash
# Solution: Close all instances of the app
# Kill any running Electron processes
# Try building again
```

### Build Logs
```bash
# Enable verbose logging
npm run build:win -- --verbose

# Check for specific errors
npm run build:win 2>&1 | findstr "error"
```

## 📊 File Sizes

### Expected Output
- **Installer**: ~50-100 MB (compressed)
- **Installed App**: ~200-300 MB (uncompressed)
- **Portable App**: ~200-300 MB (if created)

### Comparison
| Type | Size | Purpose |
|------|------|---------|
| **Setup.exe** | 50-100 MB | Professional installer |
| **Portable** | 200-300 MB | Direct executable |
| **ZIP Archive** | 200-300 MB | Manual distribution |

## 🎯 Professional Standards

### Naming Convention
- ✅ **Professional**: "Akash Share Setup 1.0.5.exe"
- ✅ **Versioned**: Includes version number
- ✅ **Descriptive**: Clear purpose and platform
- ✅ **Consistent**: Follows industry standards

### Comparison with Major Apps
- **VS Code**: "VSCodeUserSetup-x64-1.85.0.exe"
- **Discord**: "DiscordSetup.exe"
- **Slack**: "SlackSetup.exe"
- **Akash Share**: "Akash Share Setup 1.0.5.exe"

## 🚀 Distribution

### Ready for Distribution
Once built, your installer is ready for:
- ✅ **Direct distribution**: Share the .exe file
- ✅ **Website download**: Host on your website
- ✅ **Software repositories**: Submit to app stores
- ✅ **Enterprise deployment**: Use in corporate environments

### Distribution Checklist
- [ ] Installer builds successfully
- [ ] Icons display correctly
- [ ] Shortcuts work properly
- [ ] App launches from shortcuts
- [ ] Uninstaller works correctly
- [ ] App appears in Add/Remove Programs
- [ ] No file lock issues
- [ ] Professional naming convention

## 🎉 Success!

After following this guide, you should have:
- ✅ A professional Windows installer
- ✅ Proper shortcuts and integration
- ✅ Clean installation and uninstallation
- ✅ Professional branding and naming
- ✅ Industry-standard NSIS installer

Your Akash Share app now has a professional installer that matches the quality of major software applications like VS Code, Discord, and Slack!

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check the build logs for specific errors
4. Ensure the React app builds successfully
5. Verify NSIS is properly installed and in PATH

---

**Happy Building! 🚀**
