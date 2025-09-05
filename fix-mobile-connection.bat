@echo off
echo.
echo ================================================================
echo   AKASH SHARE - MOBILE CONNECTION FIX
echo ================================================================
echo.
echo This script will help fix mobile device connectivity issues.
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [INFO] Running as Administrator - Can configure firewall rules
    goto :admin_mode
) else (
    echo [WARNING] Not running as Administrator
    echo [INFO] Will provide alternative solutions
    goto :user_mode
)

:admin_mode
echo.
echo ================================================================
echo   CONFIGURING WINDOWS FIREWALL (Administrator Mode)
echo ================================================================
echo.

echo [1/4] Adding firewall rule for Frontend (port 3001)...
netsh advfirewall firewall add rule name="Akash Share Frontend" dir=in action=allow protocol=TCP localport=3001
if %errorLevel% == 0 (
    echo [SUCCESS] Frontend firewall rule added!
) else (
    echo [ERROR] Failed to add frontend firewall rule
)

echo.
echo [2/4] Adding firewall rule for Backend (port 5002)...
netsh advfirewall firewall add rule name="Akash Share Backend" dir=in action=allow protocol=TCP localport=5002
if %errorLevel% == 0 (
    echo [SUCCESS] Backend firewall rule added!
) else (
    echo [ERROR] Failed to add backend firewall rule
)

echo.
echo [3/4] Verifying firewall rules...
netsh advfirewall firewall show rule name="Akash Share Frontend"
netsh advfirewall firewall show rule name="Akash Share Backend"

echo.
echo [4/4] Testing network connectivity...
powershell "Test-NetConnection -ComputerName 192.168.0.185 -Port 3001"
powershell "Test-NetConnection -ComputerName 192.168.0.185 -Port 5002"

goto :test_mobile

:user_mode
echo.
echo ================================================================
echo   ALTERNATIVE SOLUTIONS (Non-Administrator Mode)
echo ================================================================
echo.
echo [OPTION 1] Temporarily disable Windows Firewall for testing:
echo    1. Press Win + R, type 'control', press Enter
echo    2. Go to System and Security ^> Windows Defender Firewall
echo    3. Click 'Turn Windows Defender Firewall on or off'
echo    4. Temporarily turn off firewall for Private networks
echo    5. Test mobile connection
echo    6. IMPORTANT: Turn firewall back on after testing!
echo.
echo [OPTION 2] Configure firewall via GUI:
echo    1. Search 'Windows Defender Firewall with Advanced Security'
echo    2. Click 'Inbound Rules' ^> 'New Rule...'
echo    3. Port ^> TCP ^> 3001 ^> Allow ^> All profiles ^> Name: 'Akash Share Frontend'
echo    4. Repeat for port 5002 with name 'Akash Share Backend'
echo.
echo [OPTION 3] Run this script as Administrator:
echo    1. Right-click this script file
echo    2. Select 'Run as administrator'
echo    3. Click 'Yes' when prompted
echo.

:test_mobile
echo.
echo ================================================================
echo   MOBILE DEVICE TESTING INSTRUCTIONS
echo ================================================================
echo.
echo 1. Ensure your mobile device is on the same WiFi network
echo 2. Open a web browser on your mobile device
echo 3. Navigate to: http://192.168.0.185:3001
echo 4. Go to Group Chat section
echo 5. Enter a username and join the chat
echo 6. Test real-time messaging with laptop user
echo.
echo Current server status:
echo   Frontend: http://192.168.0.185:3001
echo   Backend:  http://192.168.0.185:5002
echo   WebSocket: ws://192.168.0.185:5002/chat
echo.

echo ================================================================
echo   TROUBLESHOOTING TIPS
echo ================================================================
echo.
echo If mobile still can't connect:
echo   - Check WiFi network (both devices on same network)
echo   - Restart both backend and frontend servers
echo   - Try accessing from laptop browser first: http://192.168.0.185:3001
echo   - Check Windows Firewall settings
echo   - Contact IT support if on corporate network
echo.

pause
echo.
echo Script completed. Check results above.
pause