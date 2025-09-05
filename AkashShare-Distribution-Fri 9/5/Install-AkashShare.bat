@echo off 
echo ================================================== 
echo      Akash Share Installation Script 
echo ================================================== 
echo. 
echo This script will install Akash Share to Program Files 
echo. 
echo Press any key to continue or Ctrl+C to cancel... 
pause >nul 
echo. 
echo Installing Akash Share... 
echo. 
xcopy "AkashShareApp" "C:\Program Files\AkAsH Share\" /E /I /H /Y >nul 2>&1 
echo. 
echo Installation complete! 
echo You can now launch Akash Share from the Start Menu or Desktop shortcut. 
echo. 
pause 
