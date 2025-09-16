; Akash Share Post-Install Script
; This script runs after the application is installed to ensure backend dependencies are installed

!include "LogicLib.nsh"

; Custom installer code to run after installation
!macro customInstall
  ; Run the post-install script to install backend dependencies
  DetailPrint "Installing backend dependencies..."
  nsExec::ExecToLog '"$INSTDIR\resources\install-backend-deps.js"'
  Pop $0
  ${If} $0 != 0
    MessageBox MB_OK|MB_ICONEXCLAMATION "Warning: Failed to install backend dependencies automatically.$\r$\n$\r$\nPlease run 'npm install' in the backend directory manually after installation.$\r$\n$\r$\nBackend directory: $INSTDIR\resources\backend"
  ${EndIf}
  DetailPrint "Backend dependencies installation completed."
!macroend