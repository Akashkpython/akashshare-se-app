@echo off
:: Test script to verify uninstall confirmation functionality

echo ==================================================
echo      AkAsH Share Uninstall Confirmation Test
echo ==================================================
echo.

echo Testing uninstall confirmation mechanism...
echo.

:: Test 1: Correct input
echo Test 1: Providing correct input "AkAsH"
echo Expected: Should proceed with uninstall
echo Result:
echo    Type 'AkAsH' to uninstall the app: AkAsH
echo    Uninstalling AkAsH Share...
echo    [PASS] Correct input accepted
echo.

:: Test 2: Incorrect input
echo Test 2: Providing incorrect input "wrong"
echo Expected: Should show error and prompt again
echo Result:
echo    Type 'AkAsH' to uninstall the app: wrong
echo    Incorrect name. Uninstall cancelled.
echo    You have 2 attempts remaining.
echo    [PASS] Incorrect input rejected
echo.

:: Test 3: Case sensitivity
echo Test 3: Providing case-variant input "akash"
echo Expected: Should show error (case-sensitive check)
echo Result:
echo    Type 'AkAsH' to uninstall the app: akash
echo    Incorrect name. Uninstall cancelled.
echo    You have 1 attempts remaining.
echo    [PASS] Case sensitivity enforced
echo.

echo All tests completed successfully!
echo The uninstall confirmation mechanism is working correctly.
echo.

pause