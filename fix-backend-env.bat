@echo off
echo Fixing Backend Environment Configuration...
cd /d "d:\5th sem\project\akashshare-se\backend"

echo.
echo Creating proper .env file for local development...

echo # Local Development Configuration > .env
echo NODE_ENV=development >> .env
echo PORT=5004 >> .env
echo HOST=0.0.0.0 >> .env
echo. >> .env
echo # MongoDB Atlas - Replace with your actual credentials >> .env
echo MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/akashshare?retryWrites=true^&w=majority >> .env
echo. >> .env
echo # JWT Secret - Generate a secure random string >> .env
echo JWT_SECRET=your_super_secure_jwt_secret_here_replace_with_random_string >> .env
echo. >> .env
echo # File Upload Configuration >> .env
echo FILE_SIZE_LIMIT=10485760 >> .env
echo ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,image/bmp,image/svg+xml,image/x-icon,application/pdf,text/plain,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip,application/x-rar-compressed,application/x-7z-compressed,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,audio/mpeg,audio/wav,audio/mp4,audio/aac,application/json,application/xml,application/javascript,text/html,text/css,application/vnd.openxmlformats-officedocument.presentationml.slideshow,application/vnd.oasis.opendocument.text,application/vnd.oasis.opendocument.spreadsheet,application/vnd.oasis.opendocument.presentation,application/x-tar,application/gzip,text/markdown,application/rtf >> .env
echo. >> .env
echo # Rate Limiting >> .env
echo RATE_LIMIT_WINDOW_MS=900000 >> .env
echo RATE_LIMIT_MAX_REQUESTS=100 >> .env

echo ✅ Created .env file with local development settings
echo.
echo IMPORTANT: You need to update the MONGO_URI with your actual MongoDB Atlas credentials
echo.
echo Now testing backend server...
node server.js

pause
