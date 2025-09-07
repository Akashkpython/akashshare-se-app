@echo off
echo Starting AkashShare Backend Server...
echo.

REM Set environment variables
set MONGO_URI=mongodb+srv://dreamguy499:xyEz3A4YI5PkMwjR@akashshare.znzo9ht.mongodb.net/?retryWrites=true^&w=majority^&appName=akashshare
set JWT_SECRET=f8e7d6c5b4a39281706f5e4d3c2b1a0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321fedcba09
set NODE_ENV=development
set PORT=5002
set HOST=localhost
set FILE_SIZE_LIMIT=10485760
set ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,text/plain,application/pdf
set RATE_LIMIT_WINDOW_MS=900000
set RATE_LIMIT_MAX_REQUESTS=100
set WS_CONNECTION_LIMIT=10
set WS_RATE_LIMIT_WINDOW=60000
set WS_RATE_LIMIT_MAX=5

echo Environment variables set
echo Starting server on http://localhost:5002
echo.

cd backend
npm start
