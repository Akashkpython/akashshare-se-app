@echo off
echo ====================================================
echo    Akash Share - Create Round Desktop Icon
echo ====================================================
echo.

echo Step 1: Creating a round version of 9000_new.png
echo.

if not exist "public\9000_new.png" (
    echo Error: public\9000_new.png not found!
    echo Please ensure the file exists and try again.
    pause
    exit /b 1
)

echo Found public\9000_new.png
echo.

echo Step 2: Manual process to create round icon
echo.
echo Since ImageMagick is not installed, you'll need to:
echo 1. Go to https://www.photopea.com/
echo 2. File - Open - Select public\9000_new.png
echo 3. Select the image and cut it into a circle:
echo    - Use the Ellipse tool to draw a circle
echo    - Hold Shift to make it a perfect circle
echo    - Position it over the main part of your image
echo    - Right-click and select "Select All"
echo    - Invert selection (Select - Inverse)
echo    - Press Delete to remove everything outside the circle
echo    - Deselect (Select - Deselect)
echo 4. File - Export As - PNG
echo    - Save as: build-resources\icon-round.png
echo.

echo Step 3: Convert to ICO format
echo.
echo After creating the round PNG:
echo 1. Go to https://convertio.co/png-ico/
echo 2. Upload build-resources\icon-round.png (or public\9000_new.png if you prefer)
echo 3. Select sizes: 16, 32, 48, 64, 128, 256
echo 4. Click "Convert"
echo 5. Download the ICO file
echo 6. Save as: build-resources\icon.ico
echo.

echo Step 4: Verify the ICO file
echo.
echo After creating the ICO file:
echo 1. Run VERIFY_FIXES.bat to confirm everything is working
echo 2. Run "npm run build:win" to create the installer
echo 3. Test the installer - desktop shortcut should show your round icon
echo.

echo ====================================================
echo    Process Complete
echo ====================================================
echo.
echo Next steps:
echo 1. Follow the manual steps above to create your round icon
echo 2. Run VERIFY_FIXES.bat to verify the icon
echo 3. Run npm run build:win to create the installer
echo.
pause