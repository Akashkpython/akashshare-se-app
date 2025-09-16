@echo off
echo ================================================
echo    Akash Share - Installer Builder
echo ================================================
echo.

echo Choose installation type:
echo 1. System-wide installation (C:\Program Files\Akash Share)
echo 2. User installation (%LOCALAPPDATA%\Programs\Akash Share)
echo 3. Portable installation (Current directory)
echo 4. Custom location
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo Building system-wide installer...
    npm run build:win:custom
    echo.
    echo ✅ System-wide installer created successfully!
    echo 📁 Installation location: C:\Program Files\Akash Share
    echo 🔧 Requires: Administrator rights
    goto end
)

if "%choice%"=="2" (
    echo.
    echo Building user installer...
    npm run build:win:user
    echo.
    echo ✅ User installer created successfully!
    echo 📁 Installation location: %LOCALAPPDATA%\Programs\Akash Share
    echo 🔧 Requires: No administrator rights
    goto end
)

if "%choice%"=="3" (
    echo.
    echo Building portable version...
    npm run build:win:portable
    echo.
    echo ✅ Portable version created successfully!
    echo 📁 Installation location: Current directory
    echo 🔧 Requires: No installation, just extract and run
    goto end
)

if "%choice%"=="4" (
    echo.
    set /p customPath="Enter custom installation path: "
    echo.
    echo Building custom installer for: %customPath%
    npm run build && npm run electron:copy && electron-builder --win --config.nsis.installerDirectory="%customPath%" --publish=never
    echo.
    echo ✅ Custom installer created successfully!
    echo 📁 Installation location: %customPath%
    goto end
)

echo ❌ Invalid choice. Please run the script again and choose 1-4.

:end
echo.
echo ================================================
echo    Build completed!
echo ================================================
echo.
echo 📦 Installer location: dist\
echo 🚀 Ready for distribution!
echo.
pause

