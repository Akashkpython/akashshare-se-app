; Professional NSIS installer script for Akash Share
; Creates a setup similar to QoderUserSetup-x64 or CursorUserSetup-x64

; Installer name and file
Name "Akash Share"
OutFile "dist/AkashShareUserSetup-x64.exe"

; Default installation folder
InstallDir "$LOCALAPPDATA\Programs\AkashShare"

; Request application privileges for Windows Vista and higher
RequestExecutionLevel user

; Include Modern UI
!include "MUI2.nsh"

; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"

; Installer pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "..\LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Languages
!insertmacro MUI_LANGUAGE "English"

; Installer sections
Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  
  ; Main application files
  File "..\build\index.html"
  File "..\build\favicon.ico"
  File "..\build\icon.ico"
  
  ; Static assets
  SetOutPath "$INSTDIR\static"
  File /r "..\build\static\*.*"
  
  ; Electron files
  SetOutPath "$INSTDIR\electron"
  File "..\build\electron.js"
  
  ; Backend files
  SetOutPath "$INSTDIR\backend"
  File "..\build\backend\server.js"
  File "..\build\backend\package.json"
  
  ; Create backend directories
  CreateDirectory "$INSTDIR\backend\uploads"
  CreateDirectory "$INSTDIR\backend\logs"
  
  ; Store installation folder in registry
  WriteRegStr HKCU "Software\AkashShare" "" $INSTDIR
  WriteRegStr HKCU "Software\AkashShare" "InstallPath" $INSTDIR
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  ; Create shortcuts
  CreateDirectory "$SMPROGRAMS\Akash Share"
  CreateShortCut "$SMPROGRAMS\Akash Share\Akash Share.lnk" "$INSTDIR\Akash Share.exe"
  CreateShortCut "$SMPROGRAMS\Akash Share\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
  CreateShortCut "$DESKTOP\Akash Share.lnk" "$INSTDIR\Akash Share.exe"
SectionEnd

; Uninstaller section
Section "Uninstall"
  ; Remove files and directories
  Delete "$INSTDIR\Uninstall.exe"
  RMDir /r "$INSTDIR"
  
  ; Remove shortcuts
  Delete "$SMPROGRAMS\Akash Share\Akash Share.lnk"
  Delete "$SMPROGRAMS\Akash Share\Uninstall.lnk"
  Delete "$DESKTOP\Akash Share.lnk"
  RMDir "$SMPROGRAMS\Akash Share"
  
  ; Remove registry keys
  DeleteRegKey HKCU "Software\AkashShare"
SectionEnd

; Installer functions
Function .onInit
  ; Check if already installed
  ReadRegStr $0 HKCU "Software\AkashShare" ""
  StrCmp $0 "" +3
    MessageBox MB_YESNO "Akash Share is already installed. Do you want to overwrite it?" IDYES +2
      Abort
FunctionEnd