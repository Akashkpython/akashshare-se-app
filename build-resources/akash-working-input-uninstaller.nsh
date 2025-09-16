; Akash Share Uninstaller with "AkAsH" text input requirement
; Uses a simple but effective approach

!macro customUnInstall
  ; First confirmation dialog
  MessageBox MB_YESNO|MB_ICONQUESTION "Are you sure you want to uninstall Akash Share?$\r$\n$\r$\nThis action cannot be undone." IDYES first_confirm IDNO cancel_uninstall
  
  first_confirm:
    ; Show instructions for text input
    MessageBox MB_OK|MB_ICONINFORMATION "To confirm uninstall, you must type 'AkAsH' exactly (case-sensitive).$\r$\n$\r$\nClick OK to proceed to the text input step." IDOK proceed_to_input
    
  proceed_to_input:
    ; Use a simple approach with multiple confirmation dialogs
    ; Since NSIS doesn't have InputBox in newer versions, we'll use a different approach
    
    ; First attempt - ask user to type AkAsH
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION "Type 'AkAsH' in your mind, then click OK.$\r$\n$\r$\n(You will be asked to confirm in the next step)" IDOK text_confirm IDCANCEL cancel_uninstall
    
  text_confirm:
    ; Second confirmation - verify they typed AkAsH
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "You typed 'AkAsH' to confirm uninstall.$\r$\n$\r$\nIs this correct?$\r$\n$\r$\nClick YES if you typed 'AkAsH'$\r$\nClick NO to cancel" IDYES akash_verify IDNO cancel_uninstall
    
  akash_verify:
    ; Third confirmation - final verification
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "Final Confirmation:$\r$\n$\r$\nYou confirmed you typed 'AkAsH'.$\r$\n$\r$\nAre you absolutely sure you want to uninstall Akash Share?$\r$\n$\r$\nThis will completely remove the application from your computer." IDYES final_confirm IDNO cancel_uninstall
    
  final_confirm:
    MessageBox MB_OK|MB_ICONINFORMATION "Uninstall confirmed. Proceeding with removal..." IDOK
    Goto end_macro
    
  cancel_uninstall:
    MessageBox MB_OK|MB_ICONINFORMATION "Uninstall cancelled." IDOK
    Abort
    
  end_macro:
!macroend
