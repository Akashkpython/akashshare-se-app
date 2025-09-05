; Custom NSIS uninstaller with name confirmation for AkAsH Share
; This script extends the existing installer.nsh with name confirmation functionality

!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "nsDialogs.nsh"

; Variables for name confirmation dialog
Var Dialog
Var NameBox
Var NameLabel
Var ErrorLabel
Var NameAttempts

; Uninstaller initialization
Function un.onInit
  ; Initialize name attempts counter
  StrCpy $NameAttempts "0"
FunctionEnd

; Create the name confirmation dialog
Function un.NameConfirmationPage
  ; Create the custom dialog
  nsDialogs::Create 1018
  Pop $Dialog
  
  ${If} $Dialog == error
    Abort
  ${EndIf}
  
  ; Add title
  ${NSD_CreateLabel} 0 0 100% 20u "AkAsH Share - Uninstall Confirmation"
  Pop $0
  CreateFont $1 "$(^Font)" "12" "700"
  SendMessage $0 ${WM_SETFONT} $1 0
  
  ; Add instruction text
  ${NSD_CreateLabel} 0 30u 100% 20u "To uninstall AkAsH Share, please type the application name:"
  Pop $NameLabel
  
  ; Add name input box
  ${NSD_CreateText} 0 60u 200u 15u ""
  Pop $NameBox
  
  ; Add error label (initially hidden)
  ${NSD_CreateLabel} 0 85u 100% 20u ""
  Pop $ErrorLabel
  SetCtlColors $ErrorLabel 0xFF0000 transparent
  
  ; Add security note
  ${NSD_CreateLabel} 0 115u 100% 30u "Note: For security, you must type 'AkAsH' exactly to confirm uninstallation of this application."
  Pop $0
  CreateFont $2 "$(^Font)" "8" "400"
  SendMessage $0 ${WM_SETFONT} $2 0
  SetCtlColors $0 0x808080 transparent
  
  ; Set focus to name box
  ${NSD_SetFocus} $NameBox
  
  nsDialogs::Show
FunctionEnd

; Validate the name when leaving the page
Function un.NameConfirmationPageLeave
  ; Get the entered name
  ${NSD_GetText} $NameBox $0
  
  ; Check if name is correct
  ${If} $0 == "AkAsH"
    ; Name is correct, continue with uninstall
    Return
  ${Else}
    ; Name is incorrect
    IntOp $NameAttempts $NameAttempts + 1
    
    ${If} $NameAttempts >= 3
      ; Too many failed attempts
      ${NSD_SetText} $ErrorLabel "Too many failed attempts. Uninstall cancelled."
      MessageBox MB_OK|MB_ICONSTOP "Uninstall Failed$\n$\nToo many incorrect attempts. The uninstall process has been cancelled.$\n$\nPlease type 'AkAsH' to confirm uninstallation."
      Quit
    ${Else}
      ; Show error and allow retry
      IntOp $R0 3 - $NameAttempts
      ${NSD_SetText} $ErrorLabel "Incorrect name. Uninstall cancelled. $R0 attempts remaining."
      ${NSD_SetText} $NameBox ""
      ${NSD_SetFocus} $NameBox
      Abort ; Stay on the same page
    ${EndIf}
  ${EndIf}
FunctionEnd

; Custom uninstaller section
Section "Uninstall"
  ; The standard uninstall process will continue after name confirmation
SectionEnd

; Add the custom page to the uninstaller
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Override the default uninstall confirmation with our custom one
!define MUI_UNCONFIRMPAGE_CUSTOMFUNCTION_SHOW un.NameConfirmationPageShow
!define MUI_UNCONFIRMPAGE_CUSTOMFUNCTION_LEAVE un.NameConfirmationPageLeave

Function un.NameConfirmationPageShow
  Call un.NameConfirmationPage
FunctionEnd