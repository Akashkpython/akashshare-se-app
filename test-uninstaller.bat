@echo off
:: Test script for AkAsH Share uninstallers

echo ==================================================
echo      AkAsH Share Uninstaller Test Script
echo ==================================================
echo.

echo Testing uninstaller files...
echo.

:: Check if uninstaller files exist
if exist "uninstaller.bat" (
    echo [PASS] uninstaller.bat found
) else (
    echo [FAIL] uninstaller.bat not found
)

if exist "uninstaller.ps1" (
    echo [PASS] uninstaller.ps1 found
) else (
    echo [FAIL] uninstaller.ps1 not found
)

if exist "Uninstaller.cs" (
    echo [PASS] Uninstaller.cs found
) else (
    echo [FAIL] Uninstaller.cs not found
)

if exist "build-uninstaller.bat" (
    echo [PASS] build-uninstaller.bat found
) else (
    echo [FAIL] build-uninstaller.bat not found
)

if exist "compile-uninstaller.bat" (
    echo [PASS] compile-uninstaller.bat found
) else (
    echo [FAIL] compile-uninstaller.bat not found
)

if exist "uninstaller.iss" (
    echo [PASS] uninstaller.iss found
) else (
    echo [FAIL] uninstaller.iss not found
)

if exist "UNINSTALLER_README.md" (
    echo [PASS] UNINSTALLER_README.md found
) else (
    echo [FAIL] UNINSTALLER_README.md not found
)

if exist "UNINSTALLER_SUMMARY.md" (
    echo [PASS] UNINSTALLER_SUMMARY.md found
) else (
    echo [FAIL] UNINSTALLER_SUMMARY.md not found
)

echo.
echo Testing uninstaller.bat syntax...
echo.

:: Test batch file syntax
call uninstaller.bat /?
if %errorlevel% equ 0 (
    echo [PASS] uninstaller.bat syntax is valid
) else (
    echo [FAIL] uninstaller.bat syntax error
)

echo.
echo Testing PowerShell script syntax...
echo.

:: Test PowerShell script syntax
powershell -Command "& { $ErrorActionPreference = 'Stop'; . .\uninstaller.ps1; exit 0 }" >nul 2>&1
if %errorlevel% equ 0 (
    echo [PASS] uninstaller.ps1 syntax is valid
) else (
    echo [FAIL] uninstaller.ps1 syntax error
)

echo.
echo Testing compile script...
echo.

:: Test compile script syntax
call compile-uninstaller.bat /?
if %errorlevel% equ 0 (
    echo [PASS] compile-uninstaller.bat syntax is valid
) else (
    echo [FAIL] compile-uninstaller.bat syntax error
)

echo.
echo All tests completed.
echo.
echo To actually test the uninstall functionality:
echo 1. Install AkAsH Share first
echo 2. Run one of the uninstallers as Administrator
echo 3. Type 'AkAsH' when prompted
echo.
echo To compile the standalone uninstaller:
echo 1. Run compile-uninstaller.bat
echo 2. Find the compiled Uninstaller.exe in the dist folder
echo.
pause