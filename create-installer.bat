@echo off
echo Creating AkashShare installer...

REM Create the installer using NSIS
echo Compiling installer with NSIS...
"NSIS\makensis.exe" installer.nsi

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