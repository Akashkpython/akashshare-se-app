; Custom NSIS Installer Script for Akash Share
; Professional Windows installer with custom branding

!include "MUI2.nsh"
!include "FileFunc.nsh"

; Installer information
Name "Akash Share"
OutFile "AkashShareSetup-x64-1.0.5.exe"
InstallDir "$LOCALAPPDATA\Programs\Akash Share"
InstallDirRegKey HKCU "Software\Akash Share" "Install_Dir"

; Request application privileges
RequestExecutionLevel user

; Installer attributes
SetCompressor /SOLID lzma
SetCompressorDictSize 32

; Modern UI configuration
!define MUI_ABORTWARNING
!define MUI_ICON "public\Akashshareicon.png"
!define MUI_UNICON "public\Akashshareicon.png"

; Installer pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN "$INSTDIR\Akash Share.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Launch Akash Share"
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Languages
!insertmacro MUI_LANGUAGE "English"

; Installer sections
Section "Akash Share" SecMain
  SetOutPath "$INSTDIR"
  
  ; Copy application files
  File /r "dist\Akash Share-win32-x64\*"
  
  ; Create shortcuts
  CreateDirectory "$SMPROGRAMS\Akash Share"
  CreateShortCut "$SMPROGRAMS\Akash Share\Akash Share.lnk" "$INSTDIR\Akash Share.exe"
  CreateShortCut "$SMPROGRAMS\Akash Share\Uninstall Akash Share.lnk" "$INSTDIR\Uninstall Akash Share.exe"
  CreateShortCut "$DESKTOP\Akash Share.lnk" "$INSTDIR\Akash Share.exe"
  
  ; Write registry entries
  WriteRegStr HKCU "Software\Akash Share" "Install_Dir" "$INSTDIR"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" "DisplayName" "Akash Share"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" "DisplayVersion" "1.0.5"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" "Publisher" "Akash Share Team"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" "UninstallString" "$INSTDIR\Uninstall Akash Share.exe"
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" "NoRepair" 1
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall Akash Share.exe"
SectionEnd

; Uninstaller section
Section "Uninstall"
  ; Remove files
  RMDir /r "$INSTDIR"
  
  ; Remove shortcuts
  Delete "$SMPROGRAMS\Akash Share\*"
  RMDir "$SMPROGRAMS\Akash Share"
  Delete "$DESKTOP\Akash Share.lnk"
  
  ; Remove registry entries
  DeleteRegKey HKCU "Software\Akash Share"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare"
SectionEnd
