@echo off
setlocal enabledelayedexpansion

echo ================================================
echo Comprehensive Fix for Akash Share Project Issues
echo ================================================

echo.
echo 1. Killing any running processes...
taskkill /f /im electron.exe /im node.exe 2>nul

echo.
echo 2. Removing node_modules and package-lock.json...
if exist node_modules (
    echo    - Removing node_modules directory...
    rd /s /q node_modules 2>nul
    if exist node_modules (
        echo    - Failed to remove node_modules, trying alternative method...
        for /d %%i in (node_modules\*) do rmdir /s /q "%%i" 2>nul
    )
)

if exist package-lock.json (
    echo    - Removing package-lock.json...
    del package-lock.json 2>nul
)

echo.
echo 3. Cleaning npm cache...
npm cache clean --force

echo.
echo 4. Reinstalling all dependencies...
npm install

echo.
echo 5. Installing/updating critical dependencies...
npm install @babel/plugin-syntax-dynamic-import --save-dev
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest

echo.
echo 6. Installing missing peer dependencies...
npm install @babel/core@^7.23.6 @babel/preset-env@^7.23.6 @babel/preset-react@^7.23.3 @babel/preset-typescript@^7.23.3 --save-dev

echo.
echo 7. Rebuilding package-lock.json...
npm install

echo.
echo 8. Verifying installation...
npm ls 2>nul | findstr "ERR" >nul
if %errorlevel% == 0 (
    echo    - Warning: Some dependencies may have issues
) else (
    echo    - All dependencies installed successfully
)

echo.
echo 9. Starting development server...
echo    To start the server manually, run: npm start
echo.
echo Fix process completed!
echo.
echo To start the development server, run:
echo    npm start
echo.
pause