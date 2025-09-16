; Akash Share Uninstaller with "AkAsH" text input requirement
; Opens a web page with a text input field

!macro customUnInstall
  ; First confirmation dialog
  MessageBox MB_YESNO|MB_ICONQUESTION "Are you sure you want to uninstall Akash Share?$\r$\n$\r$\nThis action cannot be undone." IDYES first_confirm IDNO cancel_uninstall
  
  first_confirm:
    ; Show instructions
    MessageBox MB_OK|MB_ICONINFORMATION "To confirm uninstall, you must type 'AkAsH' in the text input field.$\r$\n$\r$\nClick OK to open the confirmation page." IDOK proceed_to_web_input
    
  proceed_to_web_input:
    ; Get the path to the HTML file
    StrCpy $0 "$INSTDIR\build-resources\uninstall-confirm.html"
    
    ; Check if the HTML file exists
    IfFileExists "$0" open_html_file html_not_found
    
  open_html_file:
    ; Open the HTML file in the default browser
    ExecShell "open" "$0"
    
    ; Wait for user to complete the confirmation
    MessageBox MB_OK|MB_ICONINFORMATION "A confirmation page has been opened in your browser.$\r$\n$\r$\nPlease type 'AkAsH' in the text field and click 'Confirm Uninstall'.$\r$\n$\r$\nClick OK when you have completed the confirmation." IDOK check_confirmation
    
  check_confirmation:
    ; Check if the confirmation file was created
    IfFileExists "$TEMP\uninstall_confirmed.txt" confirmation_received confirmation_failed
    
  confirmation_received:
    ; Delete the confirmation file
    Delete "$TEMP\uninstall_confirmed.txt"
    
    ; Final confirmation
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "You have confirmed the uninstall by typing 'AkAsH'.$\r$\n$\r$\nAre you absolutely sure you want to uninstall Akash Share?$\r$\n$\r$\nThis will completely remove the application from your computer." IDYES final_confirm IDNO cancel_uninstall
    
  final_confirm:
    MessageBox MB_OK|MB_ICONINFORMATION "Uninstall confirmed. Proceeding with removal..." IDOK
    Goto end_macro
    
  confirmation_failed:
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "You did not complete the 'AkAsH' confirmation.$\r$\n$\r$\nDo you want to try again?$\r$\n$\r$\nClick YES to try again$\r$\nClick NO to cancel uninstall" IDYES proceed_to_web_input IDNO cancel_uninstall
    
  html_not_found:
    MessageBox MB_OK|MB_ICONEXCLAMATION "Confirmation page not found.$\r$\n$\r$\nPlease type 'AkAsH' to confirm uninstall." IDOK manual_confirm
    
  manual_confirm:
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "Did you type 'AkAsH' to confirm uninstall?$\r$\n$\r$\nClick YES if you typed 'AkAsH'$\r$\nClick NO to cancel" IDYES final_confirm IDNO cancel_uninstall
    
  cancel_uninstall:
    MessageBox MB_OK|MB_ICONINFORMATION "Uninstall cancelled." IDOK
    Abort
    
  end_macro:
!macroend
