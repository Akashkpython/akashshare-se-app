# 🎓 Akash Share - Student PC Installation Guide

## 📋 **Overview**
Akash Share is a modern file sharing application that allows students to easily share files using 4-digit codes. This guide provides multiple ways to install and run the application on student PCs.

## 🚀 **Method 1: Web Application (Recommended for Quick Setup)**

### Prerequisites:
- Node.js 18+ installed on the PC
- Internet connection for MongoDB Atlas

### Installation Steps:
1. **Download the project folder** to each student PC
2. **Install dependencies:**
   ```bash
   npm install
   cd backend
   npm install
   cd ..
   ```
3. **Start the application:**
   ```bash
   # Terminal 1 - Start Backend Server
   cd backend
   node server.js
   
   # Terminal 2 - Start Frontend (in new terminal)
   npm start
   ```
4. **Access the application:**
   - Open browser and go to: `http://localhost:3000`
   - Backend API runs on: `http://localhost:5002`

## 🖥️ **Method 2: Desktop Application (Electron)**

### Current Status:
- Application builds successfully
- Installer creation has file lock issues
- Portable version can be created manually

### Manual Portable Setup:
1. Run the build process:
   ```bash
   npm run build
   npm run electron:copy
   ```
2. Copy the entire project folder to student PCs
3. Create a startup script for students

## 📱 **Method 3: Network Access Setup**

### For Classroom/Lab Environment:
1. **Set up one central server:**
   - Install on teacher/admin PC
   - Configure network access
   
2. **Students access via browser:**
   - Backend: `http://TEACHER_IP:5002`
   - Frontend: `http://TEACHER_IP:3000`

## 🔧 **Configuration for Student PCs**

### Backend Configuration (.env file needed in backend folder):
```env
# MongoDB Atlas Configuration (Use your actual connection string)
MONGO_URI=mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/?retryWrites=true&w=majority&appName=akashshare


# JWT Secret
JWT_SECRET=student-lab-secret-key

# Server Configuration
PORT=5002
HOST=0.0.0.0

# File Upload Configuration
FILE_SIZE_LIMIT=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,application/x-rar-compressed,application/x-7z-compressed,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,audio/mpeg,audio/wav,audio/mp4,audio/aac,application/json,application/xml,application/javascript,text/html,text/css

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

NODE_ENV=production
```

## 🎯 **Features Available for Students:**

### ✅ Core Functionality:
- **File Upload**: Students can upload files up to 10MB
- **4-Digit Share Codes**: Easy sharing system
- **File Download**: Download files using share codes
- **Real-time Chat**: Group messaging functionality
- **File History**: Track uploaded and downloaded files
- **Auto-Delete**: Files automatically delete after 24 hours

### 📱 **Supported File Types:**
- **Images**: JPG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Archives**: ZIP, RAR, 7Z, TAR, GZIP
- **Media**: MP4, MOV, AVI, MKV, MP3, WAV, AAC
- **Code**: JSON, XML, JavaScript, HTML, CSS, Markdown

### 🔒 **Security Features:**
- Rate limiting (100 requests per 15 minutes)
- File type validation
- Size restrictions
- Automatic file expiry
- Secure file storage

## 🚀 **Quick Start Scripts for Students**

### Windows Batch Script (start-app.bat):
```batch
@echo off
echo Starting Akash Share Application...
echo ================================

cd backend
start "Backend Server" cmd /k "node server.js"
cd ..

timeout /t 3 /nobreak > nul

start "Frontend Server" cmd /k "npm start"

echo.
echo Application is starting...
echo Backend: http://localhost:5002
echo Frontend: http://localhost:3000
echo.
echo Wait for both servers to start, then open your browser!
pause
```

### PowerShell Script (start-app.ps1):
```powershell
Write-Host "Starting Akash Share Application..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Start backend
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "cd backend; node server.js"

# Wait a moment
Start-Sleep -Seconds 3

# Start frontend
Start-Process PowerShell -ArgumentList "-NoExit", "-Command", "npm start"

Write-Host "Application servers are starting..." -ForegroundColor Yellow
Write-Host "Backend: http://localhost:5002" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait for both servers to start, then open your browser!" -ForegroundColor Green
```

## 🛠️ **Troubleshooting for Students**

### Common Issues:

1. **Port Already in Use:**
   - Check if another application is using ports 3000 or 5002
   - Use different ports if needed

2. **MongoDB Connection Error:**
   - Ensure internet connection is available
   - Check if MongoDB Atlas credentials are correct

3. **File Upload Issues:**
   - Check file size (must be under 10MB)
   - Verify file type is supported

4. **Cannot Access from Other Devices:**
   - Check Windows firewall settings
   - Ensure network allows local connections

## 📚 **For Instructors/Lab Administrators**

### Batch Installation:
1. **Prepare master image** with Node.js and application installed
2. **Create network share** with application files
3. **Use deployment scripts** for multiple PC setup
4. **Configure firewall rules** for network access

### Monitoring:
- Backend provides health check at `/health`
- File statistics available at `/debug/files`
- Rate limiting and security logs in console

## 📞 **Support**

For technical issues or questions:
1. Check the application logs in the terminal
2. Verify network connectivity
3. Ensure all dependencies are installed
4. Check firewall and antivirus settings

---

**Version**: 1.0.1  
**Last Updated**: January 2025  
**Compatible with**: Windows 10/11, Node.js 18+
