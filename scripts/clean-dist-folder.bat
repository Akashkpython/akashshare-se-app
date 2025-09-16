@echo off

echo ==================================================
echo           Cleaning Dist Folder
echo ==================================================
echo.

:: Check if dist folder exists
if exist "dist" (
    echo Dist folder found. Cleaning...
    
    :: Try to remove dist folder
    rd /s /q "dist" >nul 2>&1
    
    if exist "dist" (
        echo Warning: Could not completely remove dist folder.
        echo Some files may be in use. Continuing with build...
    ) else (
        echo Dist folder successfully removed.
    )
) else (
    echo Dist folder does not exist. Nothing to clean.
)

echo.
echo Dist folder cleanup completed.
echo.
