; Akash Share Uninstaller with REAL "AkAsH" text input box
; Uses Modern UI to create an actual text input field

!include "MUI2.nsh"
!include "nsDialogs.nsh"

; Define variables
Var AkashInputBox
Var AkashInputText

!macro customUnInstall
  ; First confirmation
  MessageBox MB_YESNO|MB_ICONQUESTION "Are you sure you want to uninstall Akash Share?$\r$\n$\r$\nThis action cannot be undone." IDYES proceed_to_input IDNO cancel_uninstall
  
  proceed_to_input:
    ; Create custom page with text input
    !insertmacro MUI_HEADER_TEXT "Uninstall Confirmation" "Type 'AkAsH' to confirm uninstall"
    
    nsDialogs::Create 1018
    Pop $0
    
    ; Create instruction label
    ${NSD_CreateLabel} 0 10 100% 30u "To confirm uninstall, type 'AkAsH' exactly (case-sensitive) in the text box below:"
    Pop $0
    
    ; Create the actual text input box
    ${NSD_CreateText} 0 50 100% 12u ""
    Pop $AkashInputBox
    
    ; Create warning label
    ${NSD_CreateLabel} 0 70 100% 20u "⚠️ This action cannot be undone!"
    Pop $0
    
    ; Set focus to input box
    ${NSD_SetFocus} $AkashInputBox
    
    nsDialogs::Show
!macroend

!macro customUnInstallPageLeave
  ; Get the text from the input box
  ${NSD_GetText} $AkashInputBox $AkashInputText
  
  ; Check if user typed "AkAsH" exactly
  ${If} $AkashInputText == "AkAsH"
    ; Correct input - show final confirmation
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "You typed 'AkAsH' correctly.$\r$\n$\r$\nAre you absolutely sure you want to uninstall Akash Share?$\r$\n$\r$\nThis will completely remove the application from your computer." IDYES final_confirm IDNO cancel_uninstall
  ${Else}
    ; Wrong input - ask to try again
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "You did not type 'AkAsH' correctly.$\r$\n$\r$\nYou typed: '$AkashInputText'$\r$\n$\r$\nDo you want to try again?$\r$\n$\r$\nClick YES to try again$\r$\nClick NO to cancel uninstall" IDYES retry_input IDNO cancel_uninstall
  ${EndIf}
  
  retry_input:
    ; Clear the input box and go back
    ${NSD_SetText} $AkashInputBox ""
    Abort ; Go back to the input page
  
  cancel_uninstall:
    MessageBox MB_OK|MB_ICONINFORMATION "Uninstall cancelled." IDOK
    Abort ; Cancel the uninstall
  
  final_confirm:
    MessageBox MB_OK|MB_ICONINFORMATION "Uninstall confirmed. Proceeding with removal..." IDOK
    ; Continue with uninstall
!macroend
