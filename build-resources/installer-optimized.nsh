; Optimized NSIS installer script for Akash Share
; Focuses on speed and reliability

; Installer optimization settings
SetCompressor /SOLID lzma
SetCompressorDictSize 32

; Performance optimizations
SetDatablockOptimize on
SetDateSave on
SetOverwrite on

; Disable unnecessary operations for speed
SetDetailsPrint none

; Custom installer functions
!macro preInit
  ; Kill any existing processes to prevent conflicts
  nsExec::ExecToLog 'taskkill /F /IM "Akash Share.exe" 2>nul'
  nsExec::ExecToLog 'taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Akash Share*" 2>nul'
!macroend

!macro customInstall
  ; Ensure proper file permissions
  AccessControl::GrantOnFile "$INSTDIR" "(BU)" "FullAccess"
  AccessControl::GrantOnFile "$INSTDIR\backend" "(BU)" "FullAccess"
  
  ; Create backend directory structure
  CreateDirectory "$INSTDIR\backend\uploads"
  CreateDirectory "$INSTDIR\backend\logs"
!macroend

!macro customUnInstall
  ; Kill any running processes before uninstall
  nsExec::ExecToLog 'taskkill /F /IM "Akash Share.exe" 2>nul'
  nsExec::ExecToLog 'taskkill /F /IM "node.exe" /FI "WINDOWTITLE eq Akash Share*" 2>nul'
!macroend