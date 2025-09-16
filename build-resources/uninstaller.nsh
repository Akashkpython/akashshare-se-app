; Custom uninstaller script for Akash Share
; Includes the "AkAsH" confirmation requirement

!macro customUnInstall
  ; Custom uninstall confirmation function
  MessageBox MB_YESNO|MB_ICONQUESTION "Are you sure you want to uninstall Akash Share?$\r$\n$\r$\nClick YES to proceed with uninstall." IDYES proceed IDNO cancel
  
  cancel:
    Abort
  
  proceed:
    ; Show final confirmation
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "Final Confirmation:$\r$\n$\r$\nThis will completely remove Akash Share from your computer.$\r$\n$\r$\nAre you absolutely sure you want to continue?" IDYES confirm_proceed IDNO cancel
    
  confirm_proceed:
    ; Valid confirmation - proceed with uninstall
    MessageBox MB_OK|MB_ICONINFORMATION "Uninstall confirmation accepted.$\r$\nProceeding with uninstall..." IDOK
!macroend
