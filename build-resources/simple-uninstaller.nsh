; Simple uninstaller confirmation for Akash Share

!macro customUnInstall
  MessageBox MB_YESNO|MB_ICONQUESTION "Are you sure you want to uninstall Akash Share?$\r$\n$\r$\nThis action cannot be undone." IDYES proceed IDNO cancel
  
  cancel:
    Abort
  
  proceed:
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "Final confirmation:$\r$\n$\r$\nThis will completely remove Akash Share from your computer.$\r$\n$\r$\nContinue with uninstall?" IDYES confirm IDNO cancel
    
  confirm:
    MessageBox MB_OK|MB_ICONINFORMATION "Proceeding with uninstall..." IDOK
!macroend
