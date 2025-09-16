# AkAsH Share - Uninstall Confirmation Guide

## 🔒 **Security Feature: Uninstall Confirmation**

To prevent accidental deletion of the AkAsH Share application, a confirmation prompt is required during uninstallation.

### 📋 **How It Works:**

When a user tries to uninstall the app, they will see a confirmation dialog that says:

> **"To delete this app, please type your name exactly as shown: AkAsH"**

The uninstall process will **only proceed** if the user enters **'AkAsH'** exactly (case-sensitive).

### 🎯 **Key Features:**

- ✅ **Case-sensitive validation** - Must type exactly "AkAsH"
- ✅ **3 attempt limit** - Prevents brute force attempts
- ✅ **Clear error messages** - Shows remaining attempts
- ✅ **Security protection** - Prevents accidental deletion
- ✅ **Professional UI** - Clean, user-friendly interface

### 🚀 **Implementation Methods:**

#### **1. NSIS Installer Integration (Primary)**
- **File:** `custom-uninstaller.nsh`
- **Integration:** `electron-builder.config.js`
- **Usage:** Built into the main installer package

#### **2. Standalone Uninstallers**
- **Batch Script:** `uninstaller.bat`
- **PowerShell Script:** `uninstaller.ps1`
- **C# Executable:** `Uninstaller.cs`
- **Inno Setup:** `uninstaller.iss`

### 📱 **User Experience:**

1. **User initiates uninstall** (Control Panel, Start Menu, etc.)
2. **Confirmation dialog appears** with input field
3. **User must type "AkAsH"** exactly
4. **System validates input** (case-sensitive)
5. **If correct:** Uninstall proceeds
6. **If incorrect:** Error message + retry (max 3 attempts)
7. **If 3 failures:** Uninstall cancelled

### 🔧 **Technical Details:**

#### **Validation Logic:**
```javascript
if (userInput === "AkAsH") {
    // Proceed with uninstall
} else {
    // Show error, allow retry
    attempts++;
    if (attempts >= 3) {
        // Cancel uninstall
    }
}
```

#### **Error Messages:**
- **Incorrect input:** "Incorrect name. Uninstall cancelled. X attempts remaining."
- **Too many attempts:** "Too many failed attempts. Uninstall cancelled."

### 🧪 **Testing:**

#### **Test Script:**
Run `test-uninstall-confirmation.bat` to test the confirmation logic:

```bash
# Test the confirmation feature
test-uninstall-confirmation.bat
```

#### **Manual Testing:**
1. Install the app using the NSIS installer
2. Try to uninstall from Control Panel
3. Test with various inputs:
   - ✅ "AkAsH" (should work)
   - ❌ "akash" (should fail - wrong case)
   - ❌ "AKASH" (should fail - wrong case)
   - ❌ "Akash" (should fail - wrong case)
   - ❌ "akAsH" (should fail - wrong case)

### 📁 **File Structure:**

```
├── custom-uninstaller.nsh          # Main NSIS uninstaller script
├── build-resources/installer.nsh   # Installer integration
├── electron-builder.config.js      # Electron builder config
├── uninstaller.bat                 # Standalone batch uninstaller
├── uninstaller.ps1                 # Standalone PowerShell uninstaller
├── Uninstaller.cs                  # Standalone C# uninstaller
├── uninstaller.iss                 # Inno Setup uninstaller
└── test-uninstall-confirmation.bat # Test script
```

### 🛡️ **Security Benefits:**

1. **Prevents Accidental Deletion** - Users must consciously type the confirmation
2. **Case-Sensitive Validation** - Adds extra security layer
3. **Attempt Limiting** - Prevents automated attacks
4. **Clear Feedback** - Users know exactly what to type
5. **Professional Implementation** - Maintains app credibility

### 🔄 **Build Integration:**

The uninstall confirmation is automatically included when building the app:

```bash
# Build with uninstall confirmation
npm run dist

# The generated installer will include the confirmation feature
```

### 📞 **Support:**

If users have issues with the uninstall confirmation:

1. **Check spelling** - Must be exactly "AkAsH"
2. **Check case** - Must match exactly (capital A, k, A, S, H)
3. **Try again** - Up to 3 attempts allowed
4. **Contact support** - If all attempts fail

---

**Note:** This security feature ensures that only users who truly want to uninstall the application can do so, preventing accidental deletions and maintaining data integrity.
