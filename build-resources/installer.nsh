; Custom NSIS installer script for Akash Share
; Professional installer with advanced features

!macro preInit
  ; Set default installation directory
  StrCpy $INSTDIR "C:\Program Files\Akash Share"
  
  ; Check for existing installation
  ReadRegStr $R0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${UNINSTALL_APP_KEY}" "InstallLocation"
  StrCmp $R0 "" done
  
  ; If already installed, ask user what to do
  MessageBox MB_YESNO|MB_ICONQUESTION "Akash Share is already installed at:$\r$\n$R0$\r$\n$\r$\nDo you want to reinstall it?" IDYES done
  Abort
  
  done:
!macroend

!macro customInstall
  ; Create additional directories
  CreateDirectory "$INSTDIR\logs"
  CreateDirectory "$INSTDIR\data"
  CreateDirectory "$INSTDIR\backend"
  CreateDirectory "$INSTDIR\backend\uploads"
  
  ; Set proper permissions (simplified for compatibility)
  ; Note: File permissions will be set by the system during installation
  
  ; Create Windows Firewall rules for the application
  ExecWait 'netsh advfirewall firewall add rule name="Akash Share Backend" dir=in action=allow program="$INSTDIR\resources\backend\server.js" enable=yes'
  ExecWait 'netsh advfirewall firewall add rule name="Akash Share WebSocket" dir=in action=allow protocol=TCP localport=5004 enable=yes'
!macroend

!macro customUnInstall
  ; Remove Windows Firewall rules
  ExecWait 'netsh advfirewall firewall delete rule name="Akash Share Backend"'
  ExecWait 'netsh advfirewall firewall delete rule name="Akash Share WebSocket"'
  
  ; Clean up additional directories
  RMDir /r "$INSTDIR\logs"
  RMDir /r "$INSTDIR\data"
  RMDir /r "$INSTDIR\backend\uploads"
  RMDir "$INSTDIR\backend"
!macroend

!macro customFinishPage
  !insertmacro MUI_PAGE_FINISH
!macroend

!macro customUnFinishPage
  !insertmacro MUI_UNPAGE_FINISH
!macroend

Function .onInstSuccess
  ; Show success message with additional information
  MessageBox MB_OK|MB_ICONINFORMATION "🎉 Akash Share has been successfully installed!$\r$\n$\r$\n📁 Installation Directory: $INSTDIR$\r$\n$\r$\n✨ Features included:$\r$\n• File sharing and transfer$\r$\n• Real-time group chat$\r$\n• WebSocket communication$\r$\n• Auto-update system$\r$\n• Professional interface$\r$\n$\r$\n🚀 The application will start automatically."
  
  ; Launch the application
  ExecShell "open" "$INSTDIR\Akash Share.exe"
FunctionEnd

Function .onInstFailed
  ; Show detailed error message
  MessageBox MB_OK|MB_ICONEXCLAMATION "❌ Installation failed!$\r$\n$\r$\nPossible causes:$\r$\n• Insufficient permissions$\r$\n• Antivirus blocking installation$\r$\n• Corrupted installer file$\r$\n$\r$\nPlease try running as administrator or contact support."
FunctionEnd

; System requirements check removed to avoid conflicts with electron-builder's built-in .onInit