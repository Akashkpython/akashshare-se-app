; Akash Share Manual NSIS Installer Script
; This script creates a setup.exe for Akash Share application

;--------------------------------
; Include Modern UI
!include "MUI2.nsh"

;--------------------------------
; General
Name "Akash Share"
OutFile "Akash-Share-Setup.exe"
Unicode True

; Request application privileges
RequestExecutionLevel user

; Default installation folder
InstallDir "$LOCALAPPDATA\Programs\Akash Share"

; Get installation folder from registry if available
InstallDirRegKey HKCU "Software\AkashShare" ""

;--------------------------------
; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "build-resources\icon.ico"
!define MUI_UNICON "build-resources\icon.ico"

;--------------------------------
; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

;--------------------------------
; Languages
!insertmacro MUI_LANGUAGE "English"

;--------------------------------
; Installer Sections
Section "MainSection" SEC01

    SetOutPath "$INSTDIR"
    
    ; Copy build files
    File /r "build\*.*"
    
    ; Copy backend files
    CreateDirectory "$INSTDIR\backend"
    File /r "backend\*.*"
    
    ; Copy electron files
    File /r "electron\*.*"
    
    ; Copy node_modules (this will be large)
    File /r "node_modules\*.*"
    
    ; Copy package.json and other config files
    File "package.json"
    File "electron-builder.config.js"
    
    ; Create shortcuts
    CreateDirectory "$SMPROGRAMS\Akash Share"
    CreateShortcut "$SMPROGRAMS\Akash Share\Akash Share.lnk" "$INSTDIR\node_modules\electron\dist\electron.exe" "$INSTDIR" "$INSTDIR\build-resources\icon.ico"
    CreateShortcut "$DESKTOP\Akash Share.lnk" "$INSTDIR\node_modules\electron\dist\electron.exe" "$INSTDIR" "$INSTDIR\build-resources\icon.ico"
    
    ; Store installation folder
    WriteRegStr HKCU "Software\AkashShare" "" $INSTDIR
    
    ; Create uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"
    CreateShortcut "$SMPROGRAMS\Akash Share\Uninstall.lnk" "$INSTDIR\Uninstall.exe"

SectionEnd

;--------------------------------
; Uninstaller Section
Section "Uninstall"

    ; Remove files and uninstaller
    Delete "$INSTDIR\Uninstall.exe"
    RMDir /r "$INSTDIR"
    
    ; Remove shortcuts
    Delete "$DESKTOP\Akash Share.lnk"
    RMDir /r "$SMPROGRAMS\Akash Share"
    
    ; Remove registry keys
    DeleteRegKey HKCU "Software\AkashShare"

SectionEnd
