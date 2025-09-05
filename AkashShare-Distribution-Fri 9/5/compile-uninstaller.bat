@echo off
:: Simple compile script for AkAsH Share Uninstaller

echo ==================================================
echo      AkAsH Share Uninstaller Compiler
echo ==================================================
echo.

:: Check if csc is available
where csc >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: C# compiler (csc) not found.
    echo.
    echo Please install one of the following:
    echo  - .NET SDK: https://dotnet.microsoft.com/download
    echo  - Visual Studio with .NET desktop development workload
    echo  - .NET Framework SDK
    echo.
    echo Alternatively, you can use the batch or PowerShell uninstallers directly.
    echo.
    pause
    exit /b 1
)

:: Create dist directory if it doesn't exist
if not exist "dist" mkdir "dist"

:: Compile the uninstaller
echo Compiling Uninstaller.cs to Uninstaller.exe...
csc /target:exe /out:dist\Uninstaller.exe Uninstaller.cs

:: Check if compilation was successful
if %errorlevel% equ 0 (
    echo.
    echo ==================================================
    echo Compilation successful!
    echo ==================================================
    echo.
    echo The standalone uninstaller is now available at:
    echo   dist\Uninstaller.exe
    echo.
    echo This executable can be run directly on any Windows machine
    echo without requiring additional dependencies.
    echo.
    echo To use the uninstaller:
    echo 1. Right-click on Uninstaller.exe
    echo 2. Select "Run as administrator"
    echo 3. Type 'AkAsH' when prompted
    echo.
) else (
    echo.
    echo ==================================================
    echo Compilation failed!
    echo ==================================================
    echo.
    echo Please check the error messages above.
    echo.
)

pause