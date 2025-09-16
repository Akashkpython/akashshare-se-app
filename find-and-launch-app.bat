@echo off
echo ========================================
echo Finding and Launching Akash Share
echo ========================================

echo.
echo Searching for Akash Share installation...

REM Search in common installation locations
set "FOUND_APP="

REM Check LocalAppData\Programs
for /d %%i in ("%LOCALAPPDATA%\Programs\*akash*") do (
    echo Found installation directory: %%i
    for /r "%%i" %%j in (*.exe) do (
        echo Found executable: %%j
        set "FOUND_APP=%%j"
        goto :found
    )
)

REM Check Program Files
for /d %%i in ("%PROGRAMFILES%\*akash*") do (
    echo Found installation directory: %%i
    for /r "%%i" %%j in (*.exe) do (
        echo Found executable: %%j
        set "FOUND_APP=%%j"
        goto :found
    )
)

REM Check Program Files (x86)
for /d %%i in ("%PROGRAMFILES(X86)%\*akash*") do (
    echo Found installation directory: %%i
    for /r "%%i" %%j in (*.exe) do (
        echo Found executable: %%j
        set "FOUND_APP=%%j"
        goto :found
    )
)

:found
if "%FOUND_APP%"=="" (
    echo.
    echo ERROR: Could not find Akash Share installation
    echo.
    echo Please check:
    echo 1. The application was installed successfully
    echo 2. Look in: %LOCALAPPDATA%\Programs\
    echo 3. Look in: %PROGRAMFILES%\
    echo 4. Try reinstalling the application
    echo.
    pause
    exit /b 1
)

echo.
echo Found application: %FOUND_APP%
echo.
echo Attempting to launch the application...

REM Try to launch the application
start "" "%FOUND_APP%"

if %errorlevel% equ 0 (
    echo.
    echo SUCCESS: Application launched!
    echo.
    echo If the application doesn't appear:
    echo 1. Check the system tray (bottom-right corner)
    echo 2. Look for the application window
    echo 3. Check Task Manager for running processes
    echo 4. Try running as Administrator
) else (
    echo.
    echo ERROR: Failed to launch application
    echo Error code: %errorlevel%
    echo.
    echo Try:
    echo 1. Right-click and "Run as Administrator"
    echo 2. Check Windows Event Viewer for errors
    echo 3. Reinstall the application
)

echo.
echo Creating desktop shortcut...

REM Create desktop shortcut
set "DESKTOP=%USERPROFILE%\Desktop"
set "SHORTCUT=%DESKTOP%\Akash Share.lnk"

echo Set oWS = WScript.CreateObject("WScript.Shell") > "%TEMP%\CreateShortcut.vbs"
echo sLinkFile = "%SHORTCUT%" >> "%TEMP%\CreateShortcut.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%TEMP%\CreateShortcut.vbs"
echo oLink.TargetPath = "%FOUND_APP%" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.WorkingDirectory = "%~dp0" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.Description = "Akash Share - File Sharing Application" >> "%TEMP%\CreateShortcut.vbs"
echo oLink.Save >> "%TEMP%\CreateShortcut.vbs"

cscript //nologo "%TEMP%\CreateShortcut.vbs"
del "%TEMP%\CreateShortcut.vbs"

if exist "%SHORTCUT%" (
    echo Desktop shortcut created successfully!
) else (
    echo Failed to create desktop shortcut
)

echo.
echo ========================================
echo Process Complete
echo ========================================
echo.
echo Next steps:
echo 1. Try the desktop shortcut: "Akash Share"
echo 2. Search for "Akash Share" in Windows Start Menu
echo 3. If still not working, try running as Administrator
echo.
pause
