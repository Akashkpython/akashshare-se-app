@echo off
echo ================================================
echo Fixing Babel Plugin Error for Akash Share Project
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
echo 4. Reinstalling dependencies...
npm install

echo.
echo 5. Installing missing Babel plugin...
npm install @babel/plugin-syntax-dynamic-import --save-dev

echo.
echo 6. Starting development server...
npm start

echo.
echo Fix process completed!
pause