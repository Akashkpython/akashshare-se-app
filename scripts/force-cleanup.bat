@echo off
setlocal enabledelayedexpansion

echo ==================================================
echo           FORCE CLEANUP - NUCLEAR OPTION
echo ==================================================
echo.

:: Kill ALL Node.js and Electron processes aggressively
echo Killing ALL Node.js processes...
taskkill /f /im "node.exe" >nul 2>&1
taskkill /f /im "npm.exe" >nul 2>&1
taskkill /f /im "electron.exe" >nul 2>&1
taskkill /f /im "Akash Share.exe" >nul 2>&1
taskkill /f /im "AkashShare.exe" >nul 2>&1
taskkill /f /im "react-scripts.exe" >nul 2>&1

:: Kill processes by port
echo Killing processes using ports 5004, 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5004"') do (
    if not "%%a"=="0" taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    if not "%%a"=="0" taskkill /f /pid %%a >nul 2>&1
)

:: Wait for processes to die
timeout /t 5 /nobreak >nul

:: Force remove dist folder with multiple attempts
echo Force removing dist folder...
set attempts=0
:force_remove
set /a attempts+=1
echo Attempt !attempts! of 10...

:: Try different removal methods
rd /s /q "dist" >nul 2>&1
rmdir /s /q "dist" >nul 2>&1

:: Use PowerShell to force remove
powershell -Command "Remove-Item -Path 'dist' -Recurse -Force -ErrorAction SilentlyContinue" >nul 2>&1

if exist "dist" (
    if !attempts! lss 10 (
        echo Still exists, retrying...
        timeout /t 2 /nobreak >nul
        goto force_remove
    ) else (
        echo Warning: Could not completely remove dist folder
        echo Some files may be locked by system processes
    )
) else (
    echo Dist folder successfully removed
)

:: Clear npm cache
echo Clearing npm cache...
npm cache clean --force >nul 2>&1

:: Clear node_modules cache
if exist "node_modules\.cache" (
    echo Clearing node_modules cache...
    rd /s /q "node_modules\.cache" >nul 2>&1
)

echo.
echo Force cleanup completed.
echo.
