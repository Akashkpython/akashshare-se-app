; Akash Share NSIS Installer Customizations
; This file contains custom NSIS script additions for the installer

!macro customInstall
  ; Custom installation steps
  DetailPrint "Installing Akash Share Professional Edition..."
  
  ; Create additional registry entries for better Windows integration
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "DisplayName" "Akash Share Professional"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "DisplayVersion" "${VERSION}"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "Publisher" "Akash Share Team"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "URLInfoAbout" "https://akashshare.com"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "HelpLink" "https://akashshare.com/support"
  WriteRegStr HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegDWORD HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "NoModify" 1
  WriteRegDWORD HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "NoRepair" 1
  
  ; Set file associations (optional)
  WriteRegStr HKCR "akashshare" "" "Akash Share File"
  WriteRegStr HKCR "akashshare\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME},0"
  WriteRegStr HKCR "akashshare\shell\open\command" "" '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" "%1"'
!macroend

!macro customUnInstall
  ; Custom uninstallation steps
  DetailPrint "Uninstalling Akash Share Professional Edition..."
  
  ; Remove file associations
  DeleteRegKey HKCR "akashshare"
  
  ; Remove additional registry entries
  DeleteRegKey HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}"
!macroend

; Custom installer pages
!macro customWelcomePage
  ; Add custom welcome page text
  !insertmacro MUI_PAGE_WELCOME
!macroend

; Custom finish page
!macro customFinishPage
  ; Add custom finish page with options
  !define MUI_FINISHPAGE_RUN "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
  !define MUI_FINISHPAGE_RUN_TEXT "Launch Akash Share"
  !define MUI_FINISHPAGE_SHOWREADME "$INSTDIR\README.txt"
  !define MUI_FINISHPAGE_SHOWREADME_TEXT "Show Release Notes"
  !insertmacro MUI_PAGE_FINISH
!macroend