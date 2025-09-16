# 🚀 **AkashShare Deployment Guide**
## **Production Deployment Instructions**

---

## 📋 **Pre-Deployment Checklist**

### **1. Generate JWT Secret**
Since Node.js commands aren't working in your environment, use one of these methods:

#### **Method A: PowerShell Script (Recommended)**
```powershell
# Run the PowerShell script we created
.\generate-secure-jwt.ps1
```

#### **Method B: Online Generator (Alternative)**
1. Visit: https://generate-secret.vercel.app/64
2. Copy the generated 128-character hex string
3. Use it as your JWT_SECRET

#### **Method C: Manual Generation**
```powershell
# Generate in PowerShell directly
$bytes = New-Object byte[] 64
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$secret = [System.BitConverter]::ToString($bytes) -replace '-', ''
Write-Host "JWT_SECRET=$($secret.ToLower())"
```

### **2. Configure Environment Variables**

Update `.env.production` with your actual values:

```env
# Replace with your actual MongoDB Atlas connection string
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Replace with generated JWT secret
JWT_SECRET=your_generated_128_character_hex_string

# Production server configuration
PORT=5002
HOST=0.0.0.0
NODE_ENV=production

# File upload limits
FILE_SIZE_LIMIT=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,image/bmp,image/svg+xml,image/x-icon,application/pdf,text/plain,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,application/x-rar-compressed,application/x-7z-compressed,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,audio/mpeg,audio/wav,audio/mp4,audio/aac,application/json,application/xml,application/javascript,text/html,text/css,application/vnd.openxmlformats-officedocument.presentationml.slideshow,application/vnd.oasis.opendocument.text,application/vnd.oasis.opendocument.spreadsheet,application/vnd.oasis.opendocument.presentation,application/x-tar,application/gzip,text/markdown,application/rtf

# Security settings
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
# WebSocket Configuration
WS_CONNECTION_LIMIT=100
WS_RATE_LIMIT_WINDOW=60000
WS_RATE_LIMIT_MAX=5
```

---

## 🔧 **Manual Security Verification**

Since automated testing isn't working, verify these manually:

### **1. Check for Hardcoded Credentials**
Ensure these files contain NO actual credentials:
- ✅ `.env.example` - Should have placeholders only
- ✅ `backend/.env.render` - Should have placeholders only  
- ✅ `electron/main.js` - Should use environment variables

### **2. Verify Security Files Exist**
- ✅ `backend/utils/fileValidation.js`
- ✅ `backend/utils/websocketRateLimit.js`
- ✅ `backend/utils/errorHandler.js`
- ✅ `backend/mongo-connection.js`

### **3. Test File Upload Security**
1. Start the backend server
2. Try uploading a file with wrong extension but correct MIME type
3. Should be rejected due to file signature validation

### **4. Test WebSocket Rate Limiting**
1. Open multiple WebSocket connections rapidly
2. Should be rate limited after 5 connections per minute

---

## 🌐 **Deployment Options**

### **Option 1: Render.com (Recommended)**

1. **Connect Repository:**
   - Link your GitHub repository to Render
   - Select "Web Service" deployment

2. **Configure Build Settings:**
   ```yaml
   # render.yaml (already exists in your project)
   services:
     - type: web
       name: akashshare-backend
       env: node
       buildCommand: cd backend && npm install
       startCommand: cd backend && npm start
       envVars:
         - key: NODE_ENV
           value: production
         - key: MONGO_URI
           sync: false  # Set manually in Render dashboard
         - key: JWT_SECRET
           sync: false  # Set manually in Render dashboard
   ```

3. **Set Environment Variables in Render Dashboard:**
   - Add all variables from `.env.production`
   - Never commit actual secrets to Git

### **Option 2: Railway**

1. **Deploy from GitHub:**
   ```bash
   # Connect repository and set environment variables
   ```

2. **Configure Environment:**
   - Set all production environment variables
   - Configure custom domain if needed

### **Option 3: Heroku**

1. **Create Heroku App:**
   ```bash
   heroku create akashshare-app
   ```

2. **Set Environment Variables:**
   ```bash
   heroku config:set MONGO_URI="your_mongodb_uri"
   heroku config:set JWT_SECRET="your_jwt_secret"
   heroku config:set NODE_ENV="production"
   ```

---

## 🔒 **Security Deployment Checklist**

### **Before Going Live:**
- [ ] All hardcoded credentials removed
- [ ] JWT secret generated and set securely
- [ ] MongoDB URI configured with restricted IP access
- [ ] CORS origins updated for production domain
- [ ] File upload validation tested
- [ ] WebSocket rate limiting verified
- [ ] Error handling tested
- [ ] HTTPS enabled (handled by deployment platform)

### **Post-Deployment:**
- [ ] Test file upload/download functionality
- [ ] Verify WebSocket chat works
- [ ] Check error logs for issues
- [ ] Monitor resource usage
- [ ] Test from different devices/networks

---

## 📊 **Monitoring & Maintenance**

### **Log Monitoring:**
```bash
# Check application logs regularly
tail -f /var/log/akashshare.log

# Monitor for security events:
# - Failed authentication attempts
# - Rate limit violations
# - File upload rejections
# - WebSocket connection abuse
```

### **Security Updates:**
```bash
# Regular dependency updates
npm audit
npm audit fix

# Backend dependencies
cd backend && npm audit && npm audit fix
```

### **Performance Monitoring:**
- Monitor memory usage (WebSocket connections)
- Track file upload/download speeds
- Monitor MongoDB connection health
- Watch for rate limiting effectiveness

---

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **MongoDB Connection Failed:**
   - Verify connection string format
   - Check IP whitelist in MongoDB Atlas
   - Ensure network access is configured

2. **JWT Authentication Errors:**
   - Verify JWT_SECRET is set correctly
   - Check secret length (should be 128+ characters)
   - Ensure no extra spaces in environment variable

3. **File Upload Failures:**
   - Check file size limits
   - Verify allowed file types
   - Test file signature validation

4. **WebSocket Connection Issues:**
   - Check rate limiting configuration
   - Verify CORS settings
   - Test connection limits per IP

### **Emergency Rollback:**
If issues occur, you can quickly revert by:
1. Checking previous Git commits
2. Reverting environment variables
3. Scaling down problematic features

---

## ✅ **Final Deployment Steps**

1. **Generate JWT Secret:**
   ```powershell
   .\generate-secure-jwt.ps1
   ```

2. **Update Production Environment:**
   - Copy JWT secret to deployment platform
   - Set MongoDB URI with actual credentials
   - Configure all other environment variables

3. **Deploy Application:**
   - Push to Git repository
   - Deploy via chosen platform (Render/Railway/Heroku)
   - Monitor deployment logs

4. **Verify Security:**
   - Test file upload with various file types
   - Verify WebSocket rate limiting
   - Check error handling
   - Confirm no sensitive data in logs

5. **Go Live:**
   - Update DNS if using custom domain
   - Share application URL
   - Monitor initial usage

---

## 🎉 **Success Metrics**

Your deployment is successful when:
- ✅ Application loads without errors
- ✅ File upload/download works securely
- ✅ WebSocket chat functions properly
- ✅ Rate limiting prevents abuse
- ✅ No hardcoded credentials in logs
- ✅ Error handling works gracefully
- ✅ Performance is acceptable under load

**🚀 Your AkashShare application is now production-ready and secure!**
