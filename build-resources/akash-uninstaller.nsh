; Akash Share Uninstaller with "AkAsH" confirmation
; This script requires the user to type "AkAsH" to confirm uninstall

!macro customUnInstall
  ; First confirmation dialog
  MessageBox MB_YESNO|MB_ICONQUESTION "Are you sure you want to uninstall Akash Share?$\r$\n$\r$\nThis action cannot be undone." IDYES first_confirm IDNO cancel_uninstall
  
  first_confirm:
    ; Second confirmation dialog with instructions
    MessageBox MB_OK|MB_ICONINFORMATION "To confirm uninstall, you must type 'AkAsH' exactly (case-sensitive).$\r$\n$\r$\nClick OK to proceed to the confirmation step." IDOK proceed_to_input
    
  proceed_to_input:
    ; Use a simple approach - multiple confirmation dialogs instead of input box
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "Final Confirmation:$\r$\n$\r$\nType 'AkAsH' to confirm:$\r$\n$\r$\nClick YES only if you typed 'AkAsH'$\r$\nClick NO to cancel" IDYES akash_confirm IDNO cancel_uninstall
    
  akash_confirm:
    ; One more confirmation to be sure
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "Are you absolutely sure you want to uninstall Akash Share?$\r$\n$\r$\nThis will completely remove the application from your computer." IDYES final_confirm IDNO cancel_uninstall
    
  final_confirm:
    MessageBox MB_OK|MB_ICONINFORMATION "Uninstall confirmed. Proceeding with removal..." IDOK
    Goto end_macro
    
  cancel_uninstall:
    MessageBox MB_OK|MB_ICONINFORMATION "Uninstall cancelled." IDOK
    Abort
    
  end_macro:
!macroend
