; Akash Share Uninstaller with "AkAsH" text input requirement
; Uses VBScript to create a real text input dialog

!macro customUnInstall
  ; First confirmation dialog
  MessageBox MB_YESNO|MB_ICONQUESTION "Are you sure you want to uninstall Akash Share?$\r$\n$\r$\nThis action cannot be undone." IDYES first_confirm IDNO cancel_uninstall
  
  first_confirm:
    ; Show instructions for text input
    MessageBox MB_OK|MB_ICONINFORMATION "To confirm uninstall, you must type 'AkAsH' exactly (case-sensitive).$\r$\n$\r$\nClick OK to open the text input dialog." IDOK proceed_to_vbs
    
  proceed_to_vbs:
    ; Create a VBScript to get text input
    FileOpen $0 "$TEMP\akash_input.vbs" w
    FileWrite $0 'Dim result'
    FileWrite $0 'result = InputBox("Type '\''AkAsH'\'' exactly to confirm uninstall:", "Akash Share - Uninstall Confirmation", "")'
    FileWrite $0 'If result <> "" Then'
    FileWrite $0 '    Dim fso, file'
    FileWrite $0 '    Set fso = CreateObject("Scripting.FileSystemObject")'
    FileWrite $0 '    Set file = fso.CreateTextFile("$TEMP\akash_input_result.txt", True)'
    FileWrite $0 '    file.Write result'
    FileWrite $0 '    file.Close'
    FileWrite $0 'End If'
    FileClose $0
    
    ; Run the VBScript
    ExecWait 'cscript.exe //NoLogo "$TEMP\akash_input.vbs"'
    
    ; Check the result
    IfFileExists "$TEMP\akash_input_result.txt" check_input_result input_failed
    
  check_input_result:
    ; Read the result file
    FileOpen $0 "$TEMP\akash_input_result.txt" r
    FileRead $0 $1
    FileClose $0
    
    ; Clean up temp files
    Delete "$TEMP\akash_input.vbs"
    Delete "$TEMP\akash_input_result.txt"
    
    ; Check if user typed "AkAsH"
    ${If} $1 == "AkAsH"
      ; Correct input - show final confirmation
      MessageBox MB_YESNO|MB_ICONEXCLAMATION "You typed 'AkAsH' correctly.$\r$\n$\r$\nAre you absolutely sure you want to uninstall Akash Share?$\r$\n$\r$\nThis will completely remove the application from your computer." IDYES final_confirm IDNO cancel_uninstall
    ${Else}
      ; Wrong input - ask to try again
      MessageBox MB_YESNO|MB_ICONEXCLAMATION "You did not type 'AkAsH' correctly.$\r$\n$\r$\nYou typed: '$1'$\r$\n$\r$\nDo you want to try again?$\r$\n$\r$\nClick YES to try again$\r$\nClick NO to cancel uninstall" IDYES proceed_to_vbs IDNO cancel_uninstall
    ${EndIf}
    
  input_failed:
    ; VBScript failed - fallback to simple confirmation
    MessageBox MB_OK|MB_ICONEXCLAMATION "Text input dialog failed.$\r$\n$\r$\nPlease type 'AkAsH' to confirm uninstall." IDOK manual_confirm
    
  manual_confirm:
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "Did you type 'AkAsH' to confirm uninstall?$\r$\n$\r$\nClick YES if you typed 'AkAsH'$\r$\nClick NO to cancel" IDYES final_confirm IDNO cancel_uninstall
    
  final_confirm:
    MessageBox MB_OK|MB_ICONINFORMATION "Uninstall confirmed. Proceeding with removal..." IDOK
    Goto end_macro
    
  cancel_uninstall:
    MessageBox MB_OK|MB_ICONINFORMATION "Uninstall cancelled." IDOK
    Abort
    
  end_macro:
!macroend
