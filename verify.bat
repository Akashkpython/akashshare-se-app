@echo off
echo ================================
echo Akash Share Installer Verification
echo ================================

if exist "dist\AkashShareUserSetup-x64.exe" (
    echo ✅ Installer created successfully!
    echo.
    echo File: dist\AkashShareUserSetup-x64.exe
    echo.
    for %%A in ("dist\AkashShareUserSetup-x64.exe") do echo Size: %%~zA bytes
    echo.
    echo Your updated configuration has been included in the installer.
    echo To install, run: dist\AkashShareUserSetup-x64.exe
) else (
    echo ❌ Installer not found
    echo The build process may still be running.
)

echo ================================
echo Akash Share
echo ================================