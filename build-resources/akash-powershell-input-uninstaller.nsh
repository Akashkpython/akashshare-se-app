; Akash Share Uninstaller with "AkAsH" text input requirement
; Uses PowerShell to create a real text input dialog

!macro customUnInstall
  ; First confirmation dialog
  MessageBox MB_YESNO|MB_ICONQUESTION "Are you sure you want to uninstall Akash Share?$\r$\n$\r$\nThis action cannot be undone." IDYES first_confirm IDNO cancel_uninstall
  
  first_confirm:
    ; Show instructions for text input
    MessageBox MB_OK|MB_ICONINFORMATION "To confirm uninstall, you must type 'AkAsH' exactly (case-sensitive).$\r$\n$\r$\nClick OK to open the text input dialog." IDOK proceed_to_powershell
    
  proceed_to_powershell:
    ; Create a PowerShell script to get text input
    FileOpen $0 "$TEMP\akash_input.ps1" w
    FileWrite $0 'Add-Type -AssemblyName System.Windows.Forms$\r$\n'
    FileWrite $0 'Add-Type -AssemblyName System.Drawing$\r$\n'
    FileWrite $0 '$\r$\n'
    FileWrite $0 '$form = New-Object System.Windows.Forms.Form$\r$\n'
    FileWrite $0 '$form.Text = "Akash Share - Uninstall Confirmation"$\r$\n'
    FileWrite $0 '$form.Size = New-Object System.Drawing.Size(400,200)$\r$\n'
    FileWrite $0 '$form.StartPosition = "CenterScreen"$\r$\n'
    FileWrite $0 '$form.FormBorderStyle = "FixedDialog"$\r$\n'
    FileWrite $0 '$form.MaximizeBox = $false$\r$\n'
    FileWrite $0 '$form.MinimizeBox = $false$\r$\n'
    FileWrite $0 '$\r$\n'
    FileWrite $0 '$label = New-Object System.Windows.Forms.Label$\r$\n'
    FileWrite $0 '$label.Text = "Type '\''AkAsH'\'' exactly to confirm uninstall:"$\r$\n'
    FileWrite $0 '$label.Location = New-Object System.Drawing.Point(20,20)$\r$\n'
    FileWrite $0 '$label.Size = New-Object System.Drawing.Size(350,20)$\r$\n'
    FileWrite $0 '$form.Controls.Add($label)$\r$\n'
    FileWrite $0 '$\r$\n'
    FileWrite $0 '$textBox = New-Object System.Windows.Forms.TextBox$\r$\n'
    FileWrite $0 '$textBox.Location = New-Object System.Drawing.Point(20,50)$\r$\n'
    FileWrite $0 '$textBox.Size = New-Object System.Drawing.Size(350,20)$\r$\n'
    FileWrite $0 '$form.Controls.Add($textBox)$\r$\n'
    FileWrite $0 '$\r$\n'
    FileWrite $0 '$button = New-Object System.Windows.Forms.Button$\r$\n'
    FileWrite $0 '$button.Text = "Confirm"$\r$\n'
    FileWrite $0 '$button.Location = New-Object System.Drawing.Point(150,90)$\r$\n'
    FileWrite $0 '$button.Size = New-Object System.Drawing.Size(100,30)$\r$\n'
    FileWrite $0 '$button.DialogResult = [System.Windows.Forms.DialogResult]::OK$\r$\n'
    FileWrite $0 '$form.Controls.Add($button)$\r$\n'
    FileWrite $0 '$\r$\n'
    FileWrite $0 '$form.AcceptButton = $button$\r$\n'
    FileWrite $0 '$\r$\n'
    FileWrite $0 '$result = $form.ShowDialog()$\r$\n'
    FileWrite $0 'if ($result -eq [System.Windows.Forms.DialogResult]::OK) {$\r$\n'
    FileWrite $0 '    $textBox.Text | Out-File -FilePath "$TEMP\akash_input_result.txt" -Encoding ASCII$\r$\n'
    FileWrite $0 '}$\r$\n'
    FileClose $0
    
    ; Run the PowerShell script
    ExecWait 'powershell.exe -ExecutionPolicy Bypass -File "$TEMP\akash_input.ps1"'
    
    ; Check the result
    IfFileExists "$TEMP\akash_input_result.txt" check_input_result input_failed
    
  check_input_result:
    ; Read the result file
    FileOpen $0 "$TEMP\akash_input_result.txt" r
    FileRead $0 $1
    FileClose $0
    
    ; Clean up temp files
    Delete "$TEMP\akash_input.ps1"
    Delete "$TEMP\akash_input_result.txt"
    
    ; Check if user typed "AkAsH"
    ${If} $1 == "AkAsH"
      ; Correct input - show final confirmation
      MessageBox MB_YESNO|MB_ICONEXCLAMATION "You typed 'AkAsH' correctly.$\r$\n$\r$\nAre you absolutely sure you want to uninstall Akash Share?$\r$\n$\r$\nThis will completely remove the application from your computer." IDYES final_confirm IDNO cancel_uninstall
    ${Else}
      ; Wrong input - ask to try again
      MessageBox MB_YESNO|MB_ICONEXCLAMATION "You did not type 'AkAsH' correctly.$\r$\n$\r$\nYou typed: '$1'$\r$\n$\r$\nDo you want to try again?$\r$\n$\r$\nClick YES to try again$\r$\nClick NO to cancel uninstall" IDYES proceed_to_powershell IDNO cancel_uninstall
    ${EndIf}
    
  input_failed:
    ; PowerShell script failed - fallback to simple confirmation
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
