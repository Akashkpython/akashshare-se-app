; AkAsH Share Uninstaller Script for Inno Setup
; This script can be used to create an installer that includes the custom uninstaller

[Setup]
AppName=AkAsH Share
AppVersion=1.0
DefaultDirName={pf}\AkAsH Share
DefaultGroupName=AkAsH Share
UninstallDisplayIcon={app}\Akashshareicon.png
Compression=lzma2
SolidCompression=yes
OutputDir=.
OutputBaseFilename=AkAsH Share Setup
SetupIconFile=public\Akashshareicon.ico

[Files]
; Add your application files here
; Source: "dist\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\AkAsH Share"; Filename: "{app}\AkAsH Share.exe"
Name: "{group}\Uninstall AkAsH Share"; Filename: "{uninstallexe}"

[Code]
var
  NamePage: TInputQueryWizardPage;

function InitializeSetup(): Boolean;
begin
  Result := True;
end;

function InitializeUninstall(): Boolean;
var
  ResultCode: Integer;
begin
  Result := True;
  
  // Show confirmation dialog
  if MsgBox('Are you sure you want to uninstall AkAsH Share?' + #13#10 +
            'Type "AkAsH" in the next dialog to confirm.', mbConfirmation, MB_OKCANCEL) = IDCANCEL then
  begin
    Result := False;
    Exit;
  end;
  
  // Create the name confirmation page
  NamePage := CreateInputQueryPage(wpWelcome, 'Uninstall AkAsH Share', 
    'Please confirm the application name', 
    'To uninstall AkAsH Share, please type the application name exactly as shown below.' + #13#10 +
    'This is to prevent accidental uninstallation.');
  
  NamePage.Add('Type "AkAsH" to confirm:', False);
  
  // Show the page and check the result
  if NamePage.ShowModal() = mrOk then
  begin
    if Uppercase(NamePage.Values[0]) <> 'AKASH' then
    begin
      MsgBox('Incorrect name. Uninstall cancelled.', mbError, MB_OK);
      Result := False;
    end;
  end
  else
  begin
    Result := False;
  end;
end;