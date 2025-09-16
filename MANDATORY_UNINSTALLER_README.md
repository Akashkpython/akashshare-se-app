# 🔒 AkAsH Share - Mandatory Uninstaller System

## Overview
This system implements a **mandatory "AkAsH" confirmation** requirement for uninstalling the AkAsH Share application. Users must type "AkAsH" exactly (case-sensitive) to confirm uninstallation, preventing accidental deletion of the application.

## 🛡️ Security Features

### 1. **Mandatory Text Input**
- Users **MUST** type "AkAsH" exactly to uninstall
- **Case-sensitive** - "akash", "AKASH", "Akash" will NOT work
- Only "AkAsH" (with exact capitalization) is accepted

### 2. **Attempt Limiting**
- Maximum **3 attempts** to type "AkAsH" correctly
- After 3 failed attempts, uninstall is **permanently cancelled**
- This prevents brute force attempts

### 3. **Multiple Confirmation Steps**
- Initial warning dialog
- Text input requirement
- Final confirmation step
- Cannot be bypassed or skipped

## 📁 Files Included

### 1. **NSIS Uninstaller** (Primary)
- **File**: `build-resources/akash-mandatory-uninstaller.nsh`
- **Used by**: Electron Builder for Windows installer
- **Features**: 
  - Graphical dialog with text input
  - Real-time validation
  - Professional UI with security warnings

### 2. **Batch File Uninstaller** (Backup)
- **File**: `uninstaller-mandatory.bat`
- **Features**:
  - Console-based interface
  - Case-sensitive validation
  - Attempt limiting
  - Comprehensive file removal

### 3. **PowerShell Uninstaller** (Advanced)
- **File**: `uninstaller-mandatory.ps1`
- **Features**:
  - Enhanced console interface with colors
  - Robust error handling
  - Advanced file detection and removal
  - Professional user experience

## 🔧 Implementation Details

### NSIS Uninstaller Features:
```nsis
; Key features:
- Custom dialog with text input box
- Real-time validation of "AkAsH" input
- Attempt counter (max 3 attempts)
- Professional UI with security warnings
- Cannot be bypassed or skipped
```

### Batch File Features:
```batch
:: Key features:
- Case-sensitive "AkAsH" validation
- 3-attempt limit with remaining counter
- Final "YES" confirmation step
- Comprehensive file removal
- Clear error messages
```

### PowerShell Features:
```powershell
# Key features:
- Enhanced console interface
- Color-coded messages
- Robust error handling
- Advanced file detection
- Professional user experience
```

## 🚀 Usage Instructions

### For Users:
1. **Run the uninstaller** (from Start Menu, Control Panel, or desktop)
2. **Read the warning** about permanent deletion
3. **Type "AkAsH" exactly** when prompted
4. **Confirm with "YES"** in the final step
5. **Wait for completion** of the uninstall process

### For Developers:
1. **Build the application** with the new uninstaller:
   ```bash
   npm run dist
   ```
2. **Test the uninstaller** to ensure it works correctly
3. **Verify** that typing anything other than "AkAsH" fails
4. **Confirm** that the 3-attempt limit works

## ⚠️ Important Notes

### Security Considerations:
- **Cannot be bypassed** - the confirmation is mandatory
- **Case-sensitive** - prevents accidental typing
- **Attempt limited** - prevents brute force
- **Multiple confirmations** - ensures intentional deletion

### User Experience:
- **Clear instructions** - users know exactly what to type
- **Visual feedback** - shows remaining attempts
- **Professional interface** - maintains app quality
- **Comprehensive removal** - removes all app files

## 🔍 Testing the Uninstaller

### Test Cases:
1. **Correct input**: Type "AkAsH" → Should proceed to final confirmation
2. **Wrong case**: Type "akash" → Should fail and show error
3. **Wrong text**: Type "delete" → Should fail and show error
4. **Empty input**: Press Enter → Should fail and show error
5. **Max attempts**: Try 3 wrong inputs → Should cancel uninstall

### Expected Behavior:
- ✅ "AkAsH" → Proceeds to final confirmation
- ❌ "akash" → Shows error, decrements attempts
- ❌ "AKASH" → Shows error, decrements attempts
- ❌ "Akash" → Shows error, decrements attempts
- ❌ Any other text → Shows error, decrements attempts
- ❌ 3 failed attempts → Cancels uninstall permanently

## 📋 Configuration

### Electron Builder Config:
The `electron-builder.config.cjs` file is configured to use the mandatory uninstaller:
```javascript
include: "build-resources/akash-mandatory-uninstaller.nsh"
```

### Customization:
To change the required text from "AkAsH" to something else:
1. Edit all three uninstaller files
2. Replace "AkAsH" with your desired text
3. Update the validation logic
4. Rebuild the application

## 🎯 Benefits

1. **Prevents Accidental Deletion** - Users must intentionally type the confirmation
2. **Professional Security** - Shows the app takes security seriously
3. **User-Friendly** - Clear instructions and feedback
4. **Comprehensive** - Multiple uninstaller options for different scenarios
5. **Robust** - Cannot be bypassed or circumvented

## 🔧 Troubleshooting

### Common Issues:
1. **Uninstaller not working** - Check if NSIS is properly configured
2. **Text input not working** - Verify the dialog is properly created
3. **Files not removed** - Check file permissions and paths
4. **UI not displaying** - Ensure proper NSIS installation

### Solutions:
1. **Rebuild the application** with `npm run dist`
2. **Test the uninstaller** in a clean environment
3. **Check file permissions** for the installation directory
4. **Verify NSIS version** compatibility

---

**Note**: This mandatory uninstaller system ensures that users cannot accidentally delete the AkAsH Share application. The "AkAsH" confirmation acts as a password-like protection mechanism, requiring users to demonstrate intentional deletion by typing the exact text.
