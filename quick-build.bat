@echo off
echo Running React build...
cd /d "d:\5th sem\project\akashshare-se"
npm run build
if exist "build\index.html" (
    echo ✅ SUCCESS: Build completed! index.html created.
) else (
    echo ❌ Build failed - no index.html found.
)
pause
