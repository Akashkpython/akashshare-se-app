; Akash Share Uninstaller with "AkAsH" text input requirement
; Uses Modern UI to create a real text input box

!include "MUI2.nsh"

; Define variables for the input
Var AkashInput

!macro customUnInstall
  ; Create a custom page with text input
  !insertmacro MUI_HEADER_TEXT "Uninstall Confirmation" "Type 'AkAsH' to confirm uninstall"
  
  ; Create the input page
  nsDialogs::Create 1018
  Pop $0
  
  ${NSD_CreateLabel} 0 10 100% 20u "To confirm uninstall, type 'AkAsH' exactly (case-sensitive):"
  Pop $0
  
  ${NSD_CreateText} 0 35 100% 12u ""
  Pop $AkashInput
  
  ${NSD_CreateLabel} 0 55 100% 20u "This action cannot be undone!"
  Pop $0
  
  nsDialogs::Show
!macroend

!macro customUnInstallPageLeave
  ; Get the text from the input field
  ${NSD_GetText} $AkashInput $0
  
  ; Check if the user typed "AkAsH" exactly
  ${If} $0 == "AkAsH"
    MessageBox MB_OK|MB_ICONINFORMATION "Confirmation accepted. Proceeding with uninstall..." IDOK
    Goto proceed_uninstall
  ${Else}
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "You did not type 'AkAsH' correctly.$\r$\n$\r$\nDo you want to try again?$\r$\n$\r$\nClick YES to try again$\r$\nClick NO to cancel uninstall" IDYES retry_input IDNO cancel_uninstall
  ${EndIf}
  
  retry_input:
    Abort ; Go back to the input page
  
  cancel_uninstall:
    Abort ; Cancel the uninstall
  
  proceed_uninstall:
    ; Continue with uninstall
!macroend
