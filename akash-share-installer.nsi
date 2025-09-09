; Akash Share Installer Script for NSIS
; This script creates a Windows installer for Akash Share - ALL USERS VERSION

!define APPNAME "Akash Share"
!define COMPANYNAME "Akash Share Team"
!define DESCRIPTION "Next-generation desktop application for fast and secure file sharing"
!define VERSIONMAJOR 1
!define VERSIONMINOR 0
!define VERSIONBUILD 5
!define HELPURL "https://github.com/Akashkpython/akashshare-se-app"
!define UPDATEURL "https://github.com/Akashkpython/akashshare-se-app/releases"
!define ABOUTURL "https://github.com/Akashkpython/akashshare-se-app"
!define INSTALLSIZE 250000

; Require administrator privileges for system-wide installation
RequestExecutionLevel admin

; Install to Program Files for all users
InstallDir "$PROGRAMFILES64\${APPNAME}"

; Installer metadata
Name "${APPNAME} - All Users"
Icon "public\Akashshareicon.png"
outFile "dist\Akash Share Setup - All Users.exe"

; Modern UI
!include "MUI2.nsh"
!include "Sections.nsh"
!include "LogicLib.nsh"

; Modern UI Configuration
!define MUI_ICON "public\Akashshareicon.png"
!define MUI_UNICON "public\Akashshareicon.png"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "public\Akashshareicon.png"
!define MUI_WELCOMEFINISHPAGE_BITMAP "public\Akashshareicon.png"

; Installer Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "README.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Uninstaller Pages
!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Languages
!insertmacro MUI_LANGUAGE "English"

; Verify administrator privileges
!macro VerifyUserIsAdmin
UserInfo::GetAccountType
pop $0
${If} $0 != "admin"
    messageBox mb_iconstop "Administrator rights required for system-wide installation!"
    setErrorLevel 740
    quit
${EndIf}
!macroend

function .onInit
    ; Set shell context to all users
    setShellVarContext all
    
    ; Verify administrator privileges
    !insertmacro VerifyUserIsAdmin
    
    ; Check if already installed
    ReadRegStr $R0 HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "UninstallString"
    StrCmp $R0 "" done
    
    MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION \
    "${APPNAME} is already installed. $\n$\nClick 'OK' to remove the \
    previous version or 'Cancel' to cancel this upgrade." \
    IDOK uninst
    Abort
    
    uninst:
        ClearErrors
        ExecWait '$R0 _?=$INSTDIR'
        
        IfErrors no_remove_uninstaller done
        no_remove_uninstaller:
    done:
functionEnd

section "install"
    setOutPath $INSTDIR
    
    ; Copy all files from the portable app
    file /r "dist\Akash Share-win32-x64\*"
    
    ; Create shortcuts for ALL USERS
    ; Start Menu shortcut (available to all users)
    createShortCut "$SMPROGRAMS\${APPNAME}.lnk" "$INSTDIR\Akash Share.exe" "" "$INSTDIR\Akash Share.exe" 0
    
    ; Desktop shortcut (available to all users)
    createShortCut "$DESKTOP\${APPNAME}.lnk" "$INSTDIR\Akash Share.exe" "" "$INSTDIR\Akash Share.exe" 0
    
    ; Create Quick Launch shortcut (Windows 7/8/10/11)
    createShortCut "$QUICKLAUNCH\${APPNAME}.lnk" "$INSTDIR\Akash Share.exe" "" "$INSTDIR\Akash Share.exe" 0
    
    ; Write uninstaller
    writeUninstaller "$INSTDIR\uninstall.exe"
    
    ; Add to Add/Remove Programs (HKLM for all users)
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayName" "${APPNAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "UninstallString" "$\"$INSTDIR\uninstall.exe$\""
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "QuietUninstallString" "$\"$INSTDIR\uninstall.exe$\" /S"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "InstallLocation" "$\"$INSTDIR$\""
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayIcon" "$\"$INSTDIR\Akash Share.exe$\""
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "Publisher" "${COMPANYNAME}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "HelpLink" "${HELPURL}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "URLUpdateInfo" "${UPDATEURL}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "URLInfoAbout" "${ABOUTURL}"
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "DisplayVersion" "${VERSIONMAJOR}.${VERSIONMINOR}.${VERSIONBUILD}"
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "VersionMajor" ${VERSIONMAJOR}
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "VersionMinor" ${VERSIONMINOR}
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "NoModify" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "NoRepair" 1
    WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}" "EstimatedSize" ${INSTALLSIZE}
    
    ; Create application data directories for all users
    ; Global application data (accessible by all users)
    CreateDirectory "$APPDATA\AkashShare"
    CreateDirectory "$APPDATA\AkashShare\logs"
    CreateDirectory "$APPDATA\AkashShare\uploads"
    
    ; Set permissions for all users to access application data
    AccessControl::GrantOnFile "$APPDATA\AkashShare" "(BU)" "FullAccess"
    
    ; Create shared application data directory
    CreateDirectory "$COMMONAPPDATA\AkashShare"
    CreateDirectory "$COMMONAPPDATA\AkashShare\shared"
    
    ; Set permissions for shared directory
    AccessControl::GrantOnFile "$COMMONAPPDATA\AkashShare" "(BU)" "FullAccess"
    
    ; Register file associations for all users
    WriteRegStr HKCR ".akash" "" "AkashShare.File"
    WriteRegStr HKCR "AkashShare.File" "" "Akash Share File"
    WriteRegStr HKCR "AkashShare.File\DefaultIcon" "" "$INSTDIR\Akash Share.exe,0"
    WriteRegStr HKCR "AkashShare.File\shell\open\command" "" '"$INSTDIR\Akash Share.exe" "%1"'
    
    ; Add to Windows Firewall exceptions (if needed)
    ; ExecWait 'netsh advfirewall firewall add rule name="Akash Share" dir=in action=allow program="$INSTDIR\Akash Share.exe"'
    
    ; Set up auto-start for all users (optional)
    WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "AkashShare" "$INSTDIR\Akash Share.exe"
    
    ; Create registry entries for application settings
    WriteRegStr HKLM "Software\${COMPANYNAME}\${APPNAME}" "InstallPath" "$INSTDIR"
    WriteRegStr HKLM "Software\${COMPANYNAME}\${APPNAME}" "Version" "${VERSIONMAJOR}.${VERSIONMINOR}.${VERSIONBUILD}"
    WriteRegStr HKLM "Software\${COMPANYNAME}\${APPNAME}" "InstallDate" "$(GetTime)"
sectionEnd

section "uninstall"
    ; Set shell context to all users for uninstallation
    setShellVarContext all
    
    ; Remove shortcuts for all users
    delete "$SMPROGRAMS\${APPNAME}.lnk"
    delete "$DESKTOP\${APPNAME}.lnk"
    delete "$QUICKLAUNCH\${APPNAME}.lnk"
    
    ; Remove files
    rmDir /r $INSTDIR
    
    ; Remove from Add/Remove Programs
    DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPNAME}"
    
    ; Remove application registry entries
    DeleteRegKey HKLM "Software\${COMPANYNAME}\${APPNAME}"
    
    ; Remove file associations
    DeleteRegKey HKCR ".akash"
    DeleteRegKey HKCR "AkashShare.File"
    
    ; Remove auto-start entry
    DeleteRegValue HKLM "Software\Microsoft\Windows\CurrentVersion\Run" "AkashShare"
    
    ; Ask about application data
    MessageBox MB_YESNO "Do you want to remove all Akash Share data and settings for all users?" IDYES remove_data IDNO keep_data
    remove_data:
        ; Remove user-specific data
        rmDir /r "$APPDATA\AkashShare"
        ; Remove shared data
        rmDir /r "$COMMONAPPDATA\AkashShare"
    keep_data:
    
    ; Remove Windows Firewall rule (if it was added)
    ; ExecWait 'netsh advfirewall firewall delete rule name="Akash Share"'
sectionEnd
