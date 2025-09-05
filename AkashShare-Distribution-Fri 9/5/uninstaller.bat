@echo off
setlocal enabledelayedexpansion

:: Set the title for the console window
title AkAsH Share Uninstaller

:: Clear the screen
cls

:: Display header
echo ==================================================
echo           AkAsH Share Uninstaller
echo ==================================================
echo.

:: Initialize attempt counter
set attempts=0
set max_attempts=3

:prompt
:: Check if maximum attempts reached
if %attempts% geq %max_attempts% (
    echo.
    echo Too many failed attempts. Uninstall cancelled.
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b
)

:: Prompt user for confirmation
set /p "user_input=Type 'AkAsH' to uninstall the app: "

:: Check if input matches required text (case-insensitive)
if /i "!user_input!"=="AkAsH" (
    echo.
    echo Uninstalling AkAsH Share...
    echo.
    
    :: Initialize counter for removed locations
    set removed_count=0
    
    :: Try to find installation directory from common locations
    set "install_dirs=!ProgramFiles!\AkAsH Share !ProgramFiles(x86)!\AkAsH Share !LOCALAPPDATA!\AkAsH Share !APPDATA!\AkAsH Share"
    
    :: Also check current directory if it contains the app
    if exist "resources\app.asar" (
        set "install_dirs=!install_dirs! ."
    )
    
    :: Loop through possible installation directories
    for %%d in (!install_dirs!) do (
        if exist "%%d" (
            echo Removing application files from "%%d"...
            rd /s /q "%%d" >nul 2>&1
            if !errorlevel! equ 0 (
                echo Successfully removed files from "%%d".
                set /a removed_count+=1
            ) else (
                echo Warning: Some files may not have been removed from "%%d".
            )
        )
    )
    
    :: Remove start menu shortcuts
    set "start_menu_dirs=!APPDATA!\Microsoft\Windows\Start Menu\Programs\AkAsH Share !PROGRAMDATA!\Microsoft\Windows\Start Menu\Programs\AkAsH Share"
    
    for %%d in (!start_menu_dirs!) do (
        if exist "%%d" (
            echo Removing start menu shortcuts from "%%d"...
            rd /s /q "%%d" >nul 2>&1
            if !errorlevel! equ 0 (
                echo Successfully removed start menu shortcuts.
            ) else (
                echo Warning: Could not remove start menu shortcuts from "%%d".
            )
        )
    )
    
    :: Remove desktop shortcut if it exists
    set "desktop_shortcut=!USERPROFILE!\Desktop\AkAsH Share.lnk"
    if exist "!desktop_shortcut!" (
        echo Removing desktop shortcut...
        del /q "!desktop_shortcut!" >nul 2>&1
        if !errorlevel! equ 0 (
            echo Successfully removed desktop shortcut.
        ) else (
            echo Warning: Could not remove desktop shortcut.
        )
    )
    
    :: Try to find and remove any remaining installation directories
    for /f "tokens=*" %%i in ('dir /ad /b /s 2^>nul ^| findstr /i "AkAsH.*Share"') do (
        if exist "%%i" (
            echo Removing additional installation files from "%%i"...
            rd /s /q "%%i" >nul 2>&1
            if !errorlevel! equ 0 (
                echo Successfully removed files from "%%i".
                set /a removed_count+=1
            ) else (
                echo Warning: Could not remove files from "%%i".
            )
        )
    )
    
    echo.
    if !removed_count! gtr 0 (
        echo Uninstall successful!
        echo All AkAsH Share files and shortcuts have been removed from your system.
    ) else (
        echo Uninstall completed.
        echo No AkAsH Share installation found on this system.
    )
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b
) else (
    :: Incorrect input
    set /a attempts+=1
    set /a remaining=!max_attempts!-!attempts!
    
    echo.
    echo Incorrect name. Uninstall cancelled.
    echo You have !remaining! attempts remaining.
    echo.
    goto prompt
)