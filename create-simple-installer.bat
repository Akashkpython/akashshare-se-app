@echo off
echo Creating AkashShare installer...

REM Create the dist directory if it doesn't exist
if not exist "dist" mkdir dist

REM Create the installer using NSIS
echo Compiling installer with NSIS...
"NSIS\makensis.exe" simple-installer.nsi

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Installer created successfully!
    echo Installer location: dist\AkashShareUserSetup-x64.exe
) else (
    echo.
    echo Error creating installer!
    echo Error code: %ERRORLEVEL%
)

pause