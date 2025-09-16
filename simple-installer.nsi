!define APP_NAME "Akash Share"
!define COMPANY_NAME "Akash Share Team"
!define VERSION "1.0.5"
!define INSTALLER_NAME "AkashShareUserSetup-x64.exe"

; Use the modern UI
!include "MUI2.nsh"

; General
Name "${APP_NAME}"
OutFile "dist\${INSTALLER_NAME}"
InstallDir "$LOCALAPPDATA\Programs\${APP_NAME}"
RequestExecutionLevel user

; Interface settings
!define MUI_ABORTWARNING

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Languages
!insertmacro MUI_LANGUAGE "English"

; Installer sections
Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  
  ; Copy the main executable and required files
  File "dist-final\Akash Share-win32-x64\Akash Share.exe"
  File "dist-final\Akash Share-win32-x64\chrome_100_percent.pak"
  File "dist-final\Akash Share-win32-x64\chrome_200_percent.pak"
  File "dist-final\Akash Share-win32-x64\d3dcompiler_47.dll"
  File "dist-final\Akash Share-win32-x64\ffmpeg.dll"
  File "dist-final\Akash Share-win32-x64\icudtl.dat"
  File "dist-final\Akash Share-win32-x64\libEGL.dll"
  File "dist-final\Akash Share-win32-x64\libGLESv2.dll"
  File "dist-final\Akash Share-win32-x64\LICENSE"
  File "dist-final\Akash Share-win32-x64\LICENSES.chromium.html"
  File "dist-final\Akash Share-win32-x64\resources.pak"
  File "dist-final\Akash Share-win32-x64\snapshot_blob.bin"
  File "dist-final\Akash Share-win32-x64\v8_context_snapshot.bin"
  File "dist-final\Akash Share-win32-x64\version"
  File "dist-final\Akash Share-win32-x64\vk_swiftshader.dll"
  File "dist-final\Akash Share-win32-x64\vk_swiftshader_icd.json"
  File "dist-final\Akash Share-win32-x64\vulkan-1.dll"
  
  ; Copy directories
  File /r "dist-final\Akash Share-win32-x64\locales\*.*"
  File /r "dist-final\Akash Share-win32-x64\resources\*.*"
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  ; Registry information for add/remove programs
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayName" "${APP_NAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayIcon" "$INSTDIR\Akash Share.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "Publisher" "${COMPANY_NAME}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}" "DisplayVersion" "${VERSION}"
SectionEnd

; Create shortcuts
Section -AdditionalIcons
  CreateDirectory "$SMPROGRAMS\${APP_NAME}"
  CreateShortCut "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk" "$INSTDIR\Akash Share.exe"
  CreateShortCut "$SMPROGRAMS\${APP_NAME}\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
  CreateShortCut "$DESKTOP\${APP_NAME}.lnk" "$INSTDIR\Akash Share.exe"
SectionEnd

; Uninstaller section
Section "Uninstall"
  ; Remove files
  RMDir /r "$INSTDIR"
  
  ; Remove shortcuts
  Delete "$SMPROGRAMS\${APP_NAME}\${APP_NAME}.lnk"
  Delete "$SMPROGRAMS\${APP_NAME}\Uninstall.lnk"
  RMDir "$SMPROGRAMS\${APP_NAME}"
  Delete "$DESKTOP\${APP_NAME}.lnk"
  
  ; Remove registry keys
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"
  DeleteRegKey HKCU "Software\${APP_NAME}"
SectionEnd