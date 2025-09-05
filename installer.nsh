; Custom NSIS installer script for AkAsH Share
; Adds password protection during uninstallation

!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "nsDialogs.nsh"

; Variables for password dialog
Var Dialog
Var PasswordBox
Var PasswordLabel
Var ErrorLabel
Var PasswordAttempts

; MUI Settings
!define MUI_WELCOMEPAGE_TITLE "Welcome to AkAsH Share Setup"
!define MUI_WELCOMEPAGE_TEXT "This wizard will guide you through the installation of AkAsH Share - a secure file sharing application.$\r$\n$\r$\nAkAsH Share allows you to quickly and securely share files using simple share codes.$\r$\n$\r$\nClick Next to continue."

!define MUI_DIRECTORYPAGE_TEXT_TOP "Setup will install AkAsH Share in the following folder. To install in a different folder, click Browse and select another folder."

!define MUI_INSTFILESPAGE_FINISHHEADER_TEXT "Installation Complete"
!define MUI_INSTFILESPAGE_ABORTHEADER_TEXT "Installation Aborted"

; Finish page customization
!define MUI_FINISHPAGE_TITLE "AkAsH Share Installation Complete"
!define MUI_FINISHPAGE_TEXT "AkAsH Share has been successfully installed on your computer.$\r$\n$\r$\nClick Finish to close this wizard."

; Languages MUST come after page definitions
!insertmacro MUI_LANGUAGE "English"

; Pages - ORDER IS IMPORTANT!
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Uninstall pages
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

; Initialize password attempts counter
Function .onInit
  StrCpy $PasswordAttempts "0"
FunctionEnd

; Uninstaller initialization
Function un.onInit
  ; Initialize password attempts for uninstaller
  StrCpy $PasswordAttempts "0"
FunctionEnd

; Override the default uninstall confirmation with our custom one
!define MUI_UNCONFIRMPAGE_CUSTOMFUNCTION_SHOW un.ConfirmationPageShow
!define MUI_UNCONFIRMPAGE_CUSTOMFUNCTION_LEAVE un.ConfirmationPageLeave

; Create the confirmation input dialog
Function un.ConfirmationPageShow
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
  Pop $PasswordLabel
  
  ; Add confirmation input box
  ${NSD_CreateText} 0 60u 200u 15u ""
  Pop $PasswordBox
  
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
  
  ; Set focus to confirmation box
  ${NSD_SetFocus} $PasswordBox
  
  nsDialogs::Show
FunctionEnd

; Validate the confirmation when leaving the page
Function un.ConfirmationPageLeave
  ; Get the entered text
  ${NSD_GetText} $PasswordBox $0
  
  ; Check if text matches required confirmation
  ${If} $0 == "AkAsH"
    ; Confirmation is correct, continue with uninstall
    Return
  ${Else}
    ; Confirmation is incorrect
    IntOp $PasswordAttempts $PasswordAttempts + 1
    
    ${If} $PasswordAttempts >= 3
      ; Too many failed attempts
      ${NSD_SetText} $ErrorLabel "Too many failed attempts. Uninstall cancelled."
      MessageBox MB_OK|MB_ICONSTOP "Uninstall Failed$\n$\nToo many incorrect attempts. The uninstall process has been cancelled.$\n$\nPlease type 'AkAsH' to confirm uninstallation."
      Quit
    ${Else}
      ; Show error and allow retry
      IntOp $R0 3 - $PasswordAttempts
      ${NSD_SetText} $ErrorLabel "Incorrect name. Uninstall cancelled. $R0 attempts remaining."
      ${NSD_SetText} $PasswordBox ""
      ${NSD_SetFocus} $PasswordBox
      Abort ; Stay on the same page
    ${EndIf}
  ${EndIf}
FunctionEnd

; Custom uninstaller section
Section "Uninstall"
  ; Add any custom uninstall logic here if needed
  ; The standard uninstall process will continue after confirmation
SectionEnd