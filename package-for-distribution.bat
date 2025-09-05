@echo off
:: Package Akash Share for distribution to another PC
:: This script creates a distribution package with all necessary files

echo ==================================================
echo      Akash Share Distribution Package Creator
echo ==================================================
echo.

:: Check if required directories exist
if not exist "dist\win-unpacked" (
    echo Error: dist\win-unpacked directory not found.
    echo Please run 'npm run dist' to build the application first.
    echo.
    pause
    exit /b 1
)

echo [INFO] Found application files in dist\win-unpacked
echo.

:: Create distribution directory
set "dist_dir=AkashShare-Distribution-%date:~0,4%%date:~5,2%%date:~8,2%"
echo [INFO] Creating distribution directory: %dist_dir%
if exist "%dist_dir%" (
    echo [INFO] Removing existing distribution directory...
    rd /s /q "%dist_dir%" >nul 2>&1
)
md "%dist_dir%"

:: Copy application files
echo [INFO] Copying application files...
xcopy "dist\win-unpacked" "%dist_dir%\AkashShareApp\" /E /I /H /Y >nul 2>&1

:: Copy uninstaller scripts
echo [INFO] Copying uninstaller scripts...
copy "uninstaller.bat" "%dist_dir%\" >nul 2>&1
copy "uninstaller.ps1" "%dist_dir%\" >nul 2>&1
copy "Uninstaller.cs" "%dist_dir%\" >nul 2>&1
copy "compile-uninstaller.bat" "%dist_dir%\" >nul 2>&1

:: Copy documentation
echo [INFO] Copying documentation...
copy "INSTALLATION_INSTRUCTIONS.md" "%dist_dir%\" >nul 2>&1
copy "README.md" "%dist_dir%\" >nul 2>&1
copy "LICENSE" "%dist_dir%\" >nul 2>&1

:: Create a simple launcher script
echo [INFO] Creating launcher script...
echo @echo off > "%dist_dir%\Launch-AkashShare.bat"
echo cd /d "%%~dp0\AkashShareApp" >> "%dist_dir%\Launch-AkashShare.bat"
echo start "" "Akash Share.exe" >> "%dist_dir%\Launch-AkashShare.bat"

:: Create installation script
echo [INFO] Creating installation script...
echo @echo off > "%dist_dir%\Install-AkashShare.bat"
echo echo ================================================== >> "%dist_dir%\Install-AkashShare.bat"
echo echo      Akash Share Installation Script >> "%dist_dir%\Install-AkashShare.bat"
echo echo ================================================== >> "%dist_dir%\Install-AkashShare.bat"
echo echo. >> "%dist_dir%\Install-AkashShare.bat"
echo echo This script will install Akash Share to Program Files >> "%dist_dir%\Install-AkashShare.bat"
echo echo. >> "%dist_dir%\Install-AkashShare.bat"
echo echo Press any key to continue or Ctrl+C to cancel... >> "%dist_dir%\Install-AkashShare.bat"
echo pause ^>nul >> "%dist_dir%\Install-AkashShare.bat"
echo echo. >> "%dist_dir%\Install-AkashShare.bat"
echo echo Installing Akash Share... >> "%dist_dir%\Install-AkashShare.bat"
echo echo. >> "%dist_dir%\Install-AkashShare.bat"
echo xcopy "AkashShareApp" "C:\Program Files\AkAsH Share\" /E /I /H /Y ^>nul 2^>^&1 >> "%dist_dir%\Install-AkashShare.bat"
echo echo. >> "%dist_dir%\Install-AkashShare.bat"
echo echo Installation complete! >> "%dist_dir%\Install-AkashShare.bat"
echo echo You can now launch Akash Share from the Start Menu or Desktop shortcut. >> "%dist_dir%\Install-AkashShare.bat"
echo echo. >> "%dist_dir%\Install-AkashShare.bat"
echo pause >> "%dist_dir%\Install-AkashShare.bat"

echo.
echo [SUCCESS] Distribution package created successfully!
echo Distribution files are located in: %dist_dir%
echo.
echo Package contents:
echo  - AkashShareApp\           (Main application files)
echo  - uninstaller.bat          (Batch uninstaller)
echo  - uninstaller.ps1          (PowerShell uninstaller)
echo  - Uninstaller.cs           (C# uninstaller source)
echo  - compile-uninstaller.bat  (Script to compile C# uninstaller)
echo  - INSTALLATION_INSTRUCTIONS.md (Installation guide)
echo  - Launch-AkashShare.bat    (Application launcher)
echo  - Install-AkashShare.bat   (Simple installation script)
echo.
echo To distribute to another PC:
echo 1. Copy the entire %dist_dir% folder to the target PC
echo 2. Run Install-AkashShare.bat as Administrator to install
echo 3. Or simply run Launch-AkashShare.bat to run directly
echo.
pause