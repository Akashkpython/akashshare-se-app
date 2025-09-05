@echo off
echo Verifying uninstaller updates...

echo [1/8] Checking installer.nsh...
if exist "installer.nsh" (
    findstr /C:"AkAsH" installer.nsh >nul
    if %errorlevel% equ 0 (
        echo [PASS] installer.nsh contains AkAsH confirmation
    ) else (
        echo [FAIL] installer.nsh missing AkAsH confirmation
    )
) else (
    echo [FAIL] installer.nsh not found
)

echo [2/8] Checking custom-uninstaller.nsh...
if exist "custom-uninstaller.nsh" (
    findstr /C:"AkAsH" custom-uninstaller.nsh >nul
    if %errorlevel% equ 0 (
        echo [PASS] custom-uninstaller.nsh contains AkAsH confirmation
    ) else (
        echo [FAIL] custom-uninstaller.nsh missing AkAsH confirmation
    )
) else (
    echo [FAIL] custom-uninstaller.nsh not found
)

echo [3/8] Checking package.json NSIS config...
findstr /C:"nsis" package.json >nul
if %errorlevel% equ 0 (
    echo [PASS] package.json contains NSIS configuration
) else (
    echo [FAIL] package.json missing NSIS configuration
)

echo [4/8] Checking uninstaller.bat...
if exist "uninstaller.bat" (
    findstr /C:"AkAsH" uninstaller.bat >nul
    if %errorlevel% equ 0 (
        echo [PASS] uninstaller.bat contains AkAsH confirmation
    ) else (
        echo [FAIL] uninstaller.bat missing AkAsH confirmation
    )
) else (
    echo [FAIL] uninstaller.bat not found
)

echo [5/8] Checking uninstaller.ps1...
if exist "uninstaller.ps1" (
    findstr /C:"AkAsH" uninstaller.ps1 >nul
    if %errorlevel% equ 0 (
        echo [PASS] uninstaller.ps1 contains AkAsH confirmation
    ) else (
        echo [FAIL] uninstaller.ps1 missing AkAsH confirmation
    )
) else (
    echo [FAIL] uninstaller.ps1 not found
)

echo [6/8] Checking Uninstaller.cs...
if exist "Uninstaller.cs" (
    findstr /C:"AkAsH" Uninstaller.cs >nul
    if %errorlevel% equ 0 (
        echo [PASS] Uninstaller.cs contains AkAsH confirmation
    ) else (
        echo [FAIL] Uninstaller.cs missing AkAsH confirmation
    )
) else (
    echo [FAIL] Uninstaller.cs not found
)

echo [7/8] Checking compile script...
if exist "compile-uninstaller.bat" (
    echo [PASS] compile-uninstaller.bat exists
) else (
    echo [FAIL] compile-uninstaller.bat not found
)

echo [8/8] Checking test script...
if exist "test-electron-uninstaller.bat" (
    echo [PASS] test-electron-uninstaller.bat exists
) else (
    echo [FAIL] test-electron-uninstaller.bat not found
)

echo.
echo Verification complete!
pause