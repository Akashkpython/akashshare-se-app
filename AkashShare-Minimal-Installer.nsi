; NSIS Installer Script for Akash Share - Minimal 64-bit Version
; This script creates a professional Windows installer that properly targets 64-bit systems

; Ensure we're targeting 64-bit architecture
ManifestDPIAware true
ManifestSupportedOS all

!include "MUI2.nsh"
!include "FileFunc.nsh"
!include "LogicLib.nsh"
!include "x64.nsh"

; General installer attributes
Name "Akash Share"
OutFile "FINAL-SETUP-EXE\AkashShareUserSetup-x64-Minimal.exe"
InstallDir "$PROGRAMFILES64\Akash Share"
InstallDirRegKey HKLM "Software\Akash Share" "Install_Dir"
RequestExecutionLevel admin

; Set compression
SetCompressor /SOLID lzma

; Modern UI settings
!define MUI_ABORTWARNING
!define MUI_ICON "build\favicon.ico"
!define MUI_UNICON "build\favicon.ico"

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

; Version information
VIProductVersion "1.0.5.0"
VIAddVersionKey /LANG=${LANG_ENGLISH} "ProductName" "Akash Share"
VIAddVersionKey /LANG=${LANG_ENGLISH} "CompanyName" "Akash Share Team"
VIAddVersionKey /LANG=${LANG_ENGLISH} "FileVersion" "1.0.5"
VIAddVersionKey /LANG=${LANG_ENGLISH} "FileDescription" "Akash Share Installer"
VIAddVersionKey /LANG=${LANG_ENGLISH} "LegalCopyright" "Copyright © 2024 Akash Share Team"

; Check if we're on 64-bit Windows
Function .onInit
  ${If} ${RunningX64}
    ; We're on 64-bit Windows, ensure we use 64-bit paths
    SetRegView 64
  ${Else}
    ; We're on 32-bit Windows, show error and quit
    MessageBox MB_OK|MB_ICONSTOP "This installer is for 64-bit Windows only. Please download the 32-bit version or install on a 64-bit system."
    Quit
  ${EndIf}
FunctionEnd

; Installer sections
Section "MainSection" SEC01
  ; Ensure we're using 64-bit registry and file system
  SetRegView 64
  SetShellVarContext all
  
  ; Set the output path to the installation directory
  SetOutPath "$INSTDIR"
  
  ; Copy main executable
  File "minimal-dist\Akash Share-win32-x64\Akash Share.exe"
  
  ; Copy required DLLs and resources
  File "minimal-dist\Akash Share-win32-x64\chrome_100_percent.pak"
  File "minimal-dist\Akash Share-win32-x64\chrome_200_percent.pak"
  File "minimal-dist\Akash Share-win32-x64\d3dcompiler_47.dll"
  File "minimal-dist\Akash Share-win32-x64\ffmpeg.dll"
  File "minimal-dist\Akash Share-win32-x64\icudtl.dat"
  File "minimal-dist\Akash Share-win32-x64\libEGL.dll"
  File "minimal-dist\Akash Share-win32-x64\libGLESv2.dll"
  File "minimal-dist\Akash Share-win32-x64\resources.pak"
  File "minimal-dist\Akash Share-win32-x64\snapshot_blob.bin"
  File "minimal-dist\Akash Share-win32-x64\v8_context_snapshot.bin"
  File "minimal-dist\Akash Share-win32-x64\vk_swiftshader.dll"
  File "minimal-dist\Akash Share-win32-x64\vk_swiftshader_icd.json"
  File "minimal-dist\Akash Share-win32-x64\vulkan-1.dll"
  File "minimal-dist\Akash Share-win32-x64\version"
  File "minimal-dist\Akash Share-win32-x64\LICENSE"
  File "minimal-dist\Akash Share-win32-x64\LICENSES.chromium.html"
  
  ; Copy locales directory
  SetOutPath "$INSTDIR\locales"
  File /r "minimal-dist\Akash Share-win32-x64\locales\*"
  
  ; Create shortcuts
  CreateDirectory "$SMPROGRAMS\Akash Share"
  CreateShortCut "$SMPROGRAMS\Akash Share\Akash Share.lnk" "$INSTDIR\Akash Share.exe"
  CreateShortCut "$DESKTOP\Akash Share.lnk" "$INSTDIR\Akash Share.exe"
  
  ; Write uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  ; Registry entries for uninstall
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" "DisplayName" "Akash Share"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" "DisplayVersion" "1.0.5"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" "Publisher" "Akash Share Team"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" "InstallLocation" "$INSTDIR"
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare" "NoRepair" 1
SectionEnd

; Uninstaller section
Section "Uninstall"
  ; Ensure we're using 64-bit registry and file system
  SetRegView 64
  SetShellVarContext all
  
  ; Remove files
  Delete "$INSTDIR\Akash Share.exe"
  Delete "$INSTDIR\chrome_100_percent.pak"
  Delete "$INSTDIR\chrome_200_percent.pak"
  Delete "$INSTDIR\d3dcompiler_47.dll"
  Delete "$INSTDIR\ffmpeg.dll"
  Delete "$INSTDIR\icudtl.dat"
  Delete "$INSTDIR\libEGL.dll"
  Delete "$INSTDIR\libGLESv2.dll"
  Delete "$INSTDIR\resources.pak"
  Delete "$INSTDIR\snapshot_blob.bin"
  Delete "$INSTDIR\v8_context_snapshot.bin"
  Delete "$INSTDIR\vk_swiftshader.dll"
  Delete "$INSTDIR\vk_swiftshader_icd.json"
  Delete "$INSTDIR\vulkan-1.dll"
  Delete "$INSTDIR\version"
  Delete "$INSTDIR\LICENSE"
  Delete "$INSTDIR\LICENSES.chromium.html"
  Delete "$INSTDIR\Uninstall.exe"
  
  ; Remove directories
  RMDir /r "$INSTDIR\locales"
  
  ; Remove shortcuts
  Delete "$SMPROGRAMS\Akash Share\Akash Share.lnk"
  RMDir "$SMPROGRAMS\Akash Share"
  Delete "$DESKTOP\Akash Share.lnk"
  
  ; Remove registry entries
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AkashShare"
  
  ; Remove installation directory
  RMDir "$INSTDIR"
SectionEnd