; Akash Share Uninstaller with "AkAsH" confirmation
; Uses multiple confirmation dialogs to ensure user really wants to uninstall

!macro customUnInstall
  ; First confirmation dialog
  MessageBox MB_YESNO|MB_ICONQUESTION "Are you sure you want to uninstall Akash Share?$\r$\n$\r$\nThis action cannot be undone." IDYES first_confirm IDNO cancel_uninstall
  
  first_confirm:
    ; Second confirmation with AkAsH requirement
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "To confirm uninstall, you must type 'AkAsH' in your mind.$\r$\n$\r$\nDid you type 'AkAsH'?$\r$\n$\r$\nClick YES only if you typed 'AkAsH'$\r$\nClick NO to cancel" IDYES akash_confirm IDNO cancel_uninstall
    
  akash_confirm:
    ; Third confirmation to be absolutely sure
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "Final Confirmation:$\r$\n$\r$\nYou confirmed you typed 'AkAsH'.$\r$\n$\r$\nAre you absolutely sure you want to uninstall Akash Share?$\r$\n$\r$\nThis will completely remove the application from your computer." IDYES final_confirm IDNO cancel_uninstall
    
  final_confirm:
    MessageBox MB_OK|MB_ICONINFORMATION "Uninstall confirmed. Proceeding with removal..." IDOK
    Goto end_macro
    
  cancel_uninstall:
    MessageBox MB_OK|MB_ICONINFORMATION "Uninstall cancelled." IDOK
    Abort
    
  end_macro:
!macroend
