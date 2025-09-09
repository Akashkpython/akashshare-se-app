# 🚀 Real Windows Setup.exe Installer Guide for Akash Share

## 📋 **Current Situation**

You have:
- ✅ **Portable App:** `dist\Akash Share-win32-x64\Akash Share.exe` (255 MB - Real working app)
- ❌ **Fake Setup.exe:** Just batch files with .exe extensions (3-4 KB - Not real installers)

You want:
- ✅ **Real Setup.exe:** Like VS Code, Discord, etc. (Proper Windows installer)

## 🎯 **Solution Options**

### **Option 1: Install NSIS (Recommended)**

**NSIS (Nullsoft Scriptable Install System)** is the most popular free installer creator.

#### **Step 1: Download and Install NSIS**
1. Go to: https://nsis.sourceforge.io/Download
2. Download the latest version (3.08 or newer)
3. Install with default settings
4. Add NSIS to your system PATH

#### **Step 2: Run the NSIS Installer Creator**
```bash
.\create-nsis-setup.bat
```

This will create a **real Setup.exe** installer.

### **Option 2: Use Inno Setup (Alternative)**

**Inno Setup** is another popular free installer creator.

#### **Step 1: Download and Install Inno Setup**
1. Go to: https://jrsoftware.org/isinfo.php
2. Download and install Inno Setup
3. Add to system PATH

#### **Step 2: Create Inno Setup Script**
```ini
; Akash Share Inno Setup Script
[Setup]
AppName=Akash Share
AppVersion=1.0.5
AppPublisher=Akash Share Team
AppPublisherURL=https://akashshare.com
AppSupportURL=https://akashshare.com/support
AppUpdatesURL=https://akashshare.com/updates
DefaultDirName={localappdata}\Programs\Akash Share
DefaultGroupName=Akash Share
AllowNoIcons=yes
OutputDir=dist
OutputBaseFilename=AkashShareSetup-x64-1.0.5
SetupIconFile=public\Akashshareicon.png
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunchicon"; Description: "{cm:CreateQuickLaunchIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked; OnlyBelowVersion: 0,6.1

[Files]
Source: "dist\Akash Share-win32-x64\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Akash Share"; Filename: "{app}\Akash Share.exe"
Name: "{group}\{cm:UninstallProgram,Akash Share}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\Akash Share"; Filename: "{app}\Akash Share.exe"; Tasks: desktopicon
Name: "{userappdata}\Microsoft\Internet Explorer\Quick Launch\Akash Share"; Filename: "{app}\Akash Share.exe"; Tasks: quicklaunchicon

[Run]
Filename: "{app}\Akash Share.exe"; Description: "{cm:LaunchProgram,Akash Share}"; Flags: nowait postinstall skipifsilent
```

#### **Step 3: Compile with Inno Setup**
```bash
"C:\Program Files (x86)\Inno Setup 6\ISCC.exe" akash-share-installer.iss
```

### **Option 3: Use Advanced Installer (Paid)**

**Advanced Installer** is a professional installer creator.

1. Download from: https://www.advancedinstaller.com/
2. Create a new project
3. Add your files
4. Configure installation options
5. Build the installer

### **Option 4: Use InstallShield (Paid)**

**InstallShield** is another professional installer creator.

1. Download from: https://www.revenera.com/installshield
2. Create a new project
3. Add your files
4. Configure installation options
5. Build the installer

## 🔧 **Quick Fix: Use the Portable App**

If you want to distribute your app immediately:

### **Option A: Share the Portable App**
- **File:** `dist\Akash Share-win32-x64\Akash Share.exe`
- **Size:** 255 MB
- **Usage:** Just run the .exe file
- **Distribution:** Share the entire `Akash Share-win32-x64` folder

### **Option B: Create a ZIP Distribution**
```bash
# Create a ZIP file
Compress-Archive -Path "dist\Akash Share-win32-x64\*" -DestinationPath "dist\AkashShare-Portable.zip" -Force
```

- **File:** `dist\AkashShare-Portable.zip` (408 MB)
- **Usage:** Extract and run `Akash Share.exe`
- **Distribution:** Share the ZIP file

## 📊 **Comparison of Options**

| Option | Cost | Difficulty | Result | File Size |
|--------|------|------------|---------|-----------|
| NSIS | Free | Easy | Real Setup.exe | ~255 MB |
| Inno Setup | Free | Easy | Real Setup.exe | ~255 MB |
| Advanced Installer | Paid | Medium | Professional Setup.exe | ~255 MB |
| InstallShield | Paid | Hard | Enterprise Setup.exe | ~255 MB |
| Portable App | Free | None | Direct .exe | 255 MB |
| ZIP Distribution | Free | None | Extract & Run | 408 MB |

## 🎯 **Recommended Approach**

### **For Immediate Distribution:**
1. **Use the Portable App** - It's ready to use right now
2. **Share the ZIP file** - Easy for users to extract and run

### **For Professional Distribution:**
1. **Install NSIS** (free and easy)
2. **Run the NSIS installer creator** I provided
3. **Get a real Setup.exe** installer

## 🚀 **Next Steps**

1. **Choose your preferred option** from above
2. **Follow the installation steps** for your chosen tool
3. **Run the installer creator** I provided
4. **Test the Setup.exe** on a fresh Windows machine

## 📝 **Files Created**

I've created these files for you:
- `create-nsis-setup.bat` - NSIS installer creator
- `akash-share-installer.nsi` - NSIS script (if NSIS is installed)
- `build-resources/installer.nsh` - Custom NSIS includes
- `build-resources/custom-installer.nsh` - Custom installer script
- `electron-builder.config.js` - Electron-builder configuration
- `REAL-SETUP-EXE-GUIDE.md` - This guide

## 💡 **Why the Current Setup.exe Files Don't Work**

The current "setup.exe" files are just batch files with .exe extensions:
- They're only 3-4 KB (should be ~255 MB)
- They don't contain the actual application
- They're not real Windows installers
- They won't work on other machines

## ✅ **What You Need for a Real Setup.exe**

1. **A real installer tool** (NSIS, Inno Setup, etc.)
2. **The actual application files** (255 MB)
3. **Proper installer configuration**
4. **Windows integration** (shortcuts, registry, etc.)

## 🎉 **Final Result**

Once you follow any of the options above, you'll have:
- ✅ **Real Setup.exe** (255 MB - contains the actual app)
- ✅ **Professional installer** (like VS Code, Discord)
- ✅ **Windows integration** (shortcuts, Add/Remove Programs)
- ✅ **Easy distribution** (single file to share)

Choose your preferred option and let me know if you need help with any specific step!
