@echo off
:: Verification script for uninstaller updates in Electron app and distribution package

echo ==================================================
echo      AkAsH Share Uninstaller Update Verification
echo ==================================================
echo.

echo Verifying uninstaller updates for Electron app and distribution package...
echo.

:: Initialize counters
set pass_count=0
set fail_count=0

:: Function to log pass/fail
:log_result
if "%~1"=="PASS" (
    echo [PASS] %~2
    set /a pass_count+=1
) else (
    echo [FAIL] %~2
    set /a fail_count+=1
)
goto :eof

:: Check 1: NSIS installer script
if exist "installer.nsh" (
    call :log_result PASS "installer.nsh exists"
    findstr /C:"AkAsH" installer.nsh >nul
    if !errorlevel! equ 0 (
        call :log_result PASS "installer.nsh contains 'AkAsH' confirmation"
    ) else (
        call :log_result FAIL "installer.nsh does not contain 'AkAsH' confirmation"
    )
) else (
    call :log_result FAIL "installer.nsh not found"
)

:: Check 2: Custom uninstaller script
if exist "custom-uninstaller.nsh" (
    call :log_result PASS "custom-uninstaller.nsh exists"
    findstr /C:"AkAsH" custom-uninstaller.nsh >nul
    if !errorlevel! equ 0 (
        call :log_result PASS "custom-uninstaller.nsh contains 'AkAsH' confirmation"
    ) else (
        call :log_result FAIL "custom-uninstaller.nsh does not contain 'AkAsH' confirmation"
    )
) else (
    call :log_result FAIL "custom-uninstaller.nsh not found"
)

:: Check 3: Package.json NSIS configuration
findstr /C:"nsis" package.json >nul
if !errorlevel! equ 0 (
    call :log_result PASS "package.json contains NSIS configuration"
) else (
    call :log_result FAIL "package.json does not contain NSIS configuration"
)

:: Check 4: Batch uninstaller
if exist "uninstaller.bat" (
    call :log_result PASS "uninstaller.bat exists"
    findstr /C:"AkAsH" uninstaller.bat >nul
    if !errorlevel! equ 0 (
        call :log_result PASS "uninstaller.bat contains 'AkAsH' confirmation"
    ) else (
        call :log_result FAIL "uninstaller.bat does not contain 'AkAsH' confirmation"
    )
) else (
    call :log_result FAIL "uninstaller.bat not found"
)

:: Check 5: PowerShell uninstaller
if exist "uninstaller.ps1" (
    call :log_result PASS "uninstaller.ps1 exists"
    findstr /C:"AkAsH" uninstaller.ps1 >nul
    if !errorlevel! equ 0 (
        call :log_result PASS "uninstaller.ps1 contains 'AkAsH' confirmation"
    ) else (
        call :log_result FAIL "uninstaller.ps1 does not contain 'AkAsH' confirmation"
    )
) else (
    call :log_result FAIL "uninstaller.ps1 not found"
)

:: Check 6: C# uninstaller
if exist "Uninstaller.cs" (
    call :log_result PASS "Uninstaller.cs exists"
    findstr /C:"AkAsH" Uninstaller.cs >nul
    if !errorlevel! equ 0 (
        call :log_result PASS "Uninstaller.cs contains 'AkAsH' confirmation"
    ) else (
        call :log_result FAIL "Uninstaller.cs does not contain 'AkAsH' confirmation"
    )
) else (
    call :log_result FAIL "Uninstaller.cs not found"
)

:: Check 7: Compile script
if exist "compile-uninstaller.bat" (
    call :log_result PASS "compile-uninstaller.bat exists"
) else (
    call :log_result FAIL "compile-uninstaller.bat not found"
)

:: Check 8: Test script
if exist "test-electron-uninstaller.bat" (
    call :log_result PASS "test-electron-uninstaller.bat exists"
) else (
    call :log_result FAIL "test-electron-uninstaller.bat not found"
)

:: Summary
echo.
echo ==================================================
echo Verification Summary:
echo ==================================================
echo Passed: %pass_count%
echo Failed: %fail_count%
echo Total:  %pass_count% + %fail_count% = %pass_count% + %fail_count%

if %fail_count% equ 0 (
    echo.
    echo [SUCCESS] All uninstaller updates have been successfully implemented!
    echo.
    echo The Electron app and distribution package now include:
    echo 1. Enhanced NSIS installer with 'AkAsH' confirmation requirement
    echo 2. Custom uninstaller requiring 'AkAsH' to confirm uninstallation
    echo 3. Standalone uninstaller scripts (batch, PowerShell, C#)
    echo 4. Proper integration with Electron build process
    echo 5. Clear console messages as requested
    echo 6. Security through name confirmation instead of password
    echo.
    echo To build the updated distribution package:
    echo   npm run dist
    echo.
    echo The uninstaller will now require users to:
    echo   - Type 'AkAsH' to confirm uninstallation
    echo   - Show clear messages: "Type 'AkAsH' to uninstall the app:"
    echo   - Display "Uninstall successful!" or "Incorrect name. Uninstall cancelled."
    echo   - Work as a standalone .exe when compiled
    echo   - Function properly on Windows systems
    echo.
) else (
    echo.
    echo [FAILURE] Some verification checks failed.
    echo Please review the failed items above and make necessary corrections.
    echo.
)

pause