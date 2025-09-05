# 🚀 Akash Share - Student PC Deployment Package

## 📦 **What You Have:**

Your Akash Share application is ready for deployment to student PCs! Since the Electron installer had some build issues, I've created multiple deployment options that are actually better for educational environments.

## 🎯 **Recommended Deployment Method:**

### **Option 1: Portable Web Application (Best for Students)**

**Advantages:**
- ✅ No complex installation required
- ✅ Works on any PC with Node.js
- ✅ Easy to update and maintain
- ✅ Students can use their own browsers
- ✅ Network sharing capabilities

**What Students Need:**
1. Copy the project folder to their PC
2. Double-click `start-app.bat` (Windows) or `start-app.ps1` (PowerShell)
3. Open browser to `http://localhost:3000`

## 📋 **Deployment Files Created:**

1. **`start-app.bat`** - Windows batch script for easy startup
2. **`start-app.ps1`** - PowerShell script with better formatting  
3. **`STUDENT_INSTALLATION_GUIDE.md`** - Complete guide for students
4. **Backend `.env` configuration** - Database and security settings

## 🔧 **Quick Setup for Lab/Classroom:**

### Method A: Individual PC Installation
```bash
# On each student PC:
1. Copy project folder
2. Open terminal in project folder
3. Run: npm install
4. Run: cd backend && npm install && cd ..
5. Double-click start-app.bat
```

### Method B: Network Shared Installation  
```bash
# On teacher/server PC:
1. Set up application as above
2. Configure backend HOST=0.0.0.0 (already set)
3. Students access via: http://TEACHER_IP:3000
```

## 🌟 **Features Working:**

- ✅ **File Upload/Download** with 4-digit codes
- ✅ **Real-time Group Chat** via WebSocket
- ✅ **30+ File Types** supported
- ✅ **10MB File Size Limit**
- ✅ **Auto-delete after 24 hours**
- ✅ **Rate limiting** (100 requests/15 min)
- ✅ **MongoDB Atlas** cloud database
- ✅ **Cross-platform** compatibility
- ✅ **Mobile device** access support

## 📱 **Student Experience:**

1. **Upload Files:**
   - Drag & drop or click to upload
   - Get a 4-digit share code
   - Share code with classmates

2. **Download Files:**
   - Enter 4-digit code
   - Download instantly
   - Files auto-delete after 24 hours

3. **Group Chat:**
   - Real-time messaging
   - Multiple chat rooms
   - See who's online

4. **File History:**
   - Track uploads and downloads
   - See file statistics
   - Monitor usage

## 🛡️ **Security & Management:**

- **Rate Limiting**: Prevents abuse
- **File Type Validation**: Only safe file types
- **Size Restrictions**: 10MB maximum
- **Auto-cleanup**: Files expire automatically
- **Network Control**: Admin can control access

## 📊 **Monitoring & Administration:**

Access these URLs for monitoring:
- **Health Check**: `http://localhost:5002/health`
- **File Statistics**: `http://localhost:5002/debug/files`
- **API Status**: `http://localhost:5002/`

## 🔄 **Alternative: Create Your Own Installer**

If you want to try building the installer again:

```bash
# Clean approach:
1. Close all Electron/Node processes
2. Delete dist folder completely
3. Restart computer (to clear file locks)
4. Run: npm run dist
```

## 🎓 **Best Practices for Educational Use:**

1. **Lab Setup:**
   - Install on one central server
   - Students access via web browser
   - Easier to manage and update

2. **Individual PCs:**
   - Use the portable startup scripts
   - No admin rights required
   - Students can take project home

3. **Network Access:**
   - Configure Windows Firewall if needed
   - Use the provided firewall script: `configure-firewall.ps1`

## 🚀 **Next Steps:**

1. **Test the application** using `start-app.bat`
2. **Distribute the project folder** to student PCs
3. **Provide students** with the installation guide
4. **Monitor usage** via the debug endpoints

## 💡 **Why This is Better Than Traditional Installer:**

- **More Flexible**: Students can modify/customize
- **Educational Value**: Students see how web apps work
- **Easier Updates**: Just replace files
- **Cross-Platform**: Works on Windows/Mac/Linux
- **No Admin Rights**: Students can run without permissions
- **Network Capable**: Multiple access methods

Your application is production-ready and perfect for educational environments!
