@echo off
:: Build script for AkAsH Share Uninstaller

setlocal

:: Check if .NET is installed
dotnet --version >nul 2>&1
if %errorlevel% neq 0 (
    echo .NET SDK is not installed. Please install .NET SDK to compile the uninstaller.
    echo Download from: https://dotnet.microsoft.com/download
    echo.
    echo Using alternative build method with csc (if available)...
    
    :: Check if csc is available
    where csc >nul 2>&1
    if %errorlevel% neq 0 (
        echo C# compiler (csc) not found. Please install Visual Studio or .NET SDK.
        pause
        exit /b
    )
    
    :: Build with csc
    echo Building uninstaller with csc...
    csc /target:exe /out:Uninstaller.exe Uninstaller.cs
    if %errorlevel% equ 0 (
        echo.
        echo Build successful!
        echo Uninstaller.exe has been created.
        echo.
    ) else (
        echo.
        echo Build failed. Please check the errors above.
        echo.
    )
    pause
    exit /b
)

:: Create a temporary directory for building
set "temp_dir=%temp%\AkAsHUninstallerBuild"
rd /s /q "%temp_dir%" >nul 2>&1
md "%temp_dir%"

:: Copy the source file
copy "Uninstaller.cs" "%temp_dir%\Uninstaller.cs" >nul

:: Create a minimal project file
echo ^<?xml version="1.0" encoding="utf-8"?^> > "%temp_dir%\Uninstaller.csproj"
echo ^<Project Sdk="Microsoft.NET.Sdk"^> >> "%temp_dir%\Uninstaller.csproj"
echo   ^<PropertyGroup^> >> "%temp_dir%\Uninstaller.csproj"
echo     ^<OutputType^>Exe^</OutputType^> >> "%temp_dir%\Uninstaller.csproj"
echo     ^<TargetFramework^>net6.0^</TargetFramework^> >> "%temp_dir%\Uninstaller.csproj"
echo     ^<PublishSingleFile^>true^</PublishSingleFile^> >> "%temp_dir%\Uninstaller.csproj"
echo     ^<SelfContained^>true^</SelfContained^> >> "%temp_dir%\Uninstaller.csproj"
echo     ^<RuntimeIdentifier^>win-x64^</RuntimeIdentifier^> >> "%temp_dir%\Uninstaller.csproj"
echo     ^<IncludeNativeLibrariesForSelfExtract^>true^</IncludeNativeLibrariesForSelfExtract^> >> "%temp_dir%\Uninstaller.csproj"
echo     ^<AssemblyName^>Uninstaller^</AssemblyName^> >> "%temp_dir%\Uninstaller.csproj"
echo     ^<ApplicationIcon^>public\Akashshareicon.ico^</ApplicationIcon^> >> "%temp_dir%\Uninstaller.csproj"
echo   ^</PropertyGroup^> >> "%temp_dir%\Uninstaller.csproj"
echo ^</Project^> >> "%temp_dir%\Uninstaller.csproj"

:: Build the project
cd /d "%temp_dir%"
echo Building uninstaller...
dotnet publish -c Release -o "%~dp0dist"

:: Check if build was successful
if %errorlevel% equ 0 (
    echo.
    echo Build successful!
    echo Uninstaller executable created in dist folder.
    echo.
) else (
    echo.
    echo Build failed. Please check the errors above.
    echo.
)

:: Clean up
cd /d "%~dp0"
rd /s /q "%temp_dir%" >nul 2>&1

pause