# AkAsH Share - Uninstall Confirmation Test Guide

## 🧪 Testing the Uninstall Confirmation Feature

The AkAsH Share application now includes a security feature that requires users to confirm uninstallation by typing "AkAsH" exactly to prevent accidental deletion.

### ✅ Feature Verification

The updated setup.exe includes the following enhancements:

1. **Case-sensitive validation** - Users must type "AkAsH" exactly (with capital A, k, A, S, H)
2. **3 attempt limit** - Users have up to 3 attempts to enter the correct confirmation
3. **Clear error messages** - Shows remaining attempts and validation feedback
4. **Security protection** - Prevents accidental uninstallation

### 🧪 How to Test the Feature

#### Method 1: Manual Testing (Recommended)

1. **Install the application**:
   - Run `dist\AkashShareUserSetup-x64.exe`
   - Complete the installation process

2. **Test uninstallation**:
   - Go to Windows Settings → Apps → Installed apps
   - Find "Akash Share" in the list
   - Click "Uninstall"
   - You should see a confirmation dialog requiring you to type "AkAsH"

3. **Test various inputs**:
   - ✅ Correct: "AkAsH" (should proceed with uninstall)
   - ❌ Incorrect: "akash" (wrong case)
   - ❌ Incorrect: "AKASH" (wrong case)
   - ❌ Incorrect: "Akash" (missing S and H)
   - ❌ Incorrect: "Delete" (wrong text)

#### Method 2: Automated Testing

Run the test scripts to verify the logic:

```bash
# Test basic confirmation logic
node test-uninstall-confirmation.js

# Test comprehensive scenarios
node test-uninstall-scenarios.js
```

### 📋 Expected Behavior

1. **First uninstall attempt**:
   - User sees confirmation dialog
   - User must type "AkAsH" exactly
   - If correct, uninstall proceeds
   - If incorrect, user gets 2 more attempts

2. **Subsequent attempts**:
   - User is informed of remaining attempts
   - Same validation process applies

3. **After 3 failed attempts**:
   - Uninstall is cancelled
   - Security message is displayed

### 🛡️ Security Benefits

1. **Prevents Accidental Deletion** - Users must consciously type the confirmation
2. **Case-Sensitive Validation** - Adds extra security layer
3. **Attempt Limiting** - Prevents automated attacks
4. **Clear Feedback** - Users know exactly what to type

### 📞 Support

If users have issues with the uninstall confirmation:

1. **Check spelling** - Must be exactly "AkAsH"
2. **Check case** - Must match exactly (capital A, k, A, S, H)
3. **Try again** - Up to 3 attempts allowed
4. **Contact support** - If all attempts fail

---

**Note**: This security feature ensures that only users who truly want to uninstall the application can do so, preventing accidental deletions and maintaining data integrity.