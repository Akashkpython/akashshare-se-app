@echo off
echo Starting Akash Share Production Server...
echo.

echo Building React app...
call npm run build

echo.
echo Starting production server on port 5002...
echo Frontend and Backend will be served from: http://localhost:5002
echo.

cd backend
set NODE_ENV=production
npm start