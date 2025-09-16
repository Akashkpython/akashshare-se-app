@echo off
echo Organizing dist-final folder...

REM Create a clean directory structure
mkdir "dist-final\portable" 2>nul
mkdir "dist-final\installer" 2>nul

REM Move portable versions to the portable folder
move "dist-final\AkashShare-Complete-Portable.zip" "dist-final\portable\" >nul 2>&1
move "dist-final\AkashShare-Portable-v1.0.5-final.zip" "dist-final\portable\" >nul 2>&1

REM Move the original portable files
move "dist-final\AkashShare-Portable-v1.0.5.zip" "dist-final\portable\" >nul 2>&1
move "dist-final\AkashShare-Portable.zip" "dist-final\portable\" >nul 2>&1

REM Move installer-related files to the installer folder
move "dist-final\AkashShareUserSetup-x64.exe.blockmap" "dist-final\installer\" >nul 2>&1
move "dist-final\builder-debug.yml" "dist-final\installer\" >nul 2>&1
move "dist-final\builder-effective-config.yaml" "dist-final\installer\" >nul 2>&1

REM Copy the summary file to both folders
copy "DIST_FINAL_SUMMARY.md" "dist-final\portable\" >nul 2>&1
copy "DIST_FINAL_SUMMARY.md" "dist-final\installer\" >nul 2>&1

echo.
echo Organization complete!
echo.
echo Portable versions are in: dist-final\portable\
echo Installer files are in: dist-final\installer\
echo.
pause