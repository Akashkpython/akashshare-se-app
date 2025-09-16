# 🚀 Electron App Build Instructions

## 🔧 **Quick Fix for Build Issues**

If you're getting the `app.asar` file locking error, follow these steps:

### **Method 1: Use the Clean Build Script (Recommended)**
```bash
npm run dist:clean
```

### **Method 2: Manual Cleanup**
```bash
# Step 1: Kill all processes
npm run kill-processes

# Step 2: Clean dist folder
npm run clean

# Step 3: Build
npm run dist
```

### **Method 3: PowerShell (More Robust)**
```powershell
# Run PowerShell script
.\scripts\kill-electron-processes.ps1

# Then build
npm run dist
```

## 🛠️ **Available Scripts**

| Script | Purpose |
|--------|---------|
| `npm run dist` | Standard build (may fail if processes running) |
| `npm run dist:clean` | **Recommended** - Clean build with process cleanup |
| `npm run kill-processes` | Kill all Electron/Node processes |
| `npm run clean` | Clean dist folder |
| `npm run build` | Build React app only |
| `npm run pack` | Build without installer (unpacked) |

## 🔍 **Troubleshooting**

### **If Build Still Fails:**

1. **Check for running processes:**
   ```bash
   tasklist | findstr /i "electron\|node"
   ```

2. **Check port usage:**
   ```bash
   netstat -ano | findstr ":5002\|:5003"
   ```

3. **Manual process cleanup:**
   ```bash
   # Kill specific processes
   taskkill /f /im "electron.exe"
   taskkill /f /im "node.exe"
   ```

4. **Restart your terminal/IDE:**
   - Close Cursor/VS Code
   - Close all command prompts
   - Reopen and try again

### **If Antivirus is Blocking:**

1. **Add exclusions:**
   - Add `D:\5th sem\project\akashshare-se\dist` to antivirus exclusions
   - Add `D:\5th sem\project\akashshare-se\node_modules` to exclusions

2. **Temporarily disable real-time protection** during build

## 📁 **Build Output**

After successful build, you'll find:
- **Installer:** `dist\Akash Share Setup 1.0.0.exe`
- **Unpacked App:** `dist\win-unpacked\`
- **Portable:** `dist\Akash Share-1.0.0.exe`

## ⚡ **Performance Tips**

1. **Use SSD storage** for faster builds
2. **Close unnecessary applications** during build
3. **Use `npm run pack`** for faster testing (no installer)
4. **Use `npm run dist:clean`** for reliable builds

## 🚨 **Common Issues & Solutions**

| Issue | Solution |
|-------|----------|
| `app.asar` locked | Use `npm run dist:clean` |
| Port 5002/5003 in use | Run `npm run kill-processes` |
| Antivirus blocking | Add exclusions or disable temporarily |
| ESLint warnings | Already configured as warnings (won't block build) |
| Build timeout | Increase timeout in electron-builder config |

## 🎯 **Success Indicators**

✅ **Build successful when you see:**
- `Building...` progress bar
- `Packaging...` progress bar  
- `Installer created at: dist\Akash Share Setup 1.0.0.exe`
- No error messages about file locking

❌ **Build failed if you see:**
- `ERR_ELECTRON_BUILDER_CANNOT_EXECUTE`
- `The process cannot access the file`
- `app.asar` related errors

---

**For best results, always use `npm run dist:clean` for production builds!** 🎉
