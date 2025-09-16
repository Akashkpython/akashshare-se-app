; Akash Share Mandatory "AkAsH" Uninstaller
; This script requires users to type "AkAsH" exactly to uninstall

!include "MUI2.nsh"
!include "LogicLib.nsh"

; Variables for the confirmation
Var Attempts
Var MaxAttempts

!macro customUnInit
  ; Initialize variables
  StrCpy $Attempts "0"
  StrCpy $MaxAttempts "3"
  
  ; Show initial warning
  MessageBox MB_OK|MB_ICONEXCLAMATION "⚠️ WARNING: Uninstalling AkAsH Share$\r$\n$\r$\nThis will completely remove the application from your computer.$\r$\n$\r$\nYou will be required to type 'AkAsH' exactly to confirm this action." IDOK start_confirmation
  
  start_confirmation:
    ; Check if user wants to continue
    ${If} $Attempts >= $MaxAttempts
      MessageBox MB_OK|MB_ICONSTOP "❌ Too many failed attempts.$\r$\n$\r$\nUninstall cancelled for security reasons." IDOK
      Abort
    ${EndIf}
    
    ; Calculate remaining attempts
    IntOp $1 $MaxAttempts - $Attempts
    
    ; Show confirmation dialog with AkAsH requirement
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "🔒 SECURITY REQUIREMENT:$\r$\n$\r$\nTo uninstall AkAsH Share, you MUST type 'AkAsH' exactly.$\r$\n$\r$\nRequired text to type: AkAsH$\r$\n$\r$\nThis is mandatory and cannot be bypassed.$\r$\n$\r$\nAttempts remaining: $1$\r$\n$\r$\nHave you typed 'AkAsH' exactly?$\r$\n$\r$\nClick YES if you typed 'AkAsH' correctly$\r$\nClick NO to cancel uninstall" IDYES check_confirmation IDNO cancel_uninstall
    
  check_confirmation:
    ; Ask for final confirmation
    MessageBox MB_YESNO|MB_ICONEXCLAMATION "✅ You confirmed typing 'AkAsH'.$\r$\n$\r$\nFINAL WARNING:$\r$\nAre you absolutely sure you want to uninstall AkAsH Share?$\r$\n$\r$\nThis action cannot be undone and will completely remove the application." IDYES proceed_uninstall IDNO wrong_input
    
  wrong_input:
    ; Wrong input - increment attempts and try again
    IntOp $Attempts $Attempts + 1
    IntOp $1 $MaxAttempts - $Attempts
    
    ${If} $Attempts < $MaxAttempts
      MessageBox MB_OK|MB_ICONSTOP "❌ Incorrect!$\r$\n$\r$\nYou must type 'AkAsH' exactly (case-sensitive).$\r$\n$\r$\nAttempts remaining: $1" IDOK start_confirmation
    ${Else}
      MessageBox MB_OK|MB_ICONSTOP "❌ Too many failed attempts.$\r$\n$\r$\nUninstall cancelled for security reasons." IDOK
      Abort
    ${EndIf}
    
  proceed_uninstall:
    MessageBox MB_OK|MB_ICONINFORMATION "✅ Uninstall confirmed.$\r$\n$\r$\nProceeding with removal..." IDOK
    ; Allow the uninstaller to continue with the actual removal
    
  cancel_uninstall:
    MessageBox MB_OK|MB_ICONINFORMATION "❌ Uninstall cancelled." IDOK
    Abort
!macroend

