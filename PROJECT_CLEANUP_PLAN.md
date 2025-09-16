# Akash Share Project Cleanup Plan

## Duplicate Files to Remove

### 1. NSIS Installer Scripts (.nsi files)
Keep only the essential ones:
- Keep: AkashShare-Minimal-Installer.nsi (our final working installer)
- Remove: All other .nsi files as they are duplicates or outdated versions

### 2. NSH Files (.nsh files)
Keep only essential ones:
- Keep: installer.nsh (if used in current installer)
- Remove: All other .nsh files that are not referenced

### 3. Duplicate BAT Files
Remove duplicates and outdated scripts:
- Keep: Essential build and start scripts
- Remove: Duplicate fix scripts, old installer scripts

### 4. Duplicate MD Files
Remove duplicate documentation:
- Keep: Essential documentation like README.md
- Remove: Duplicate summaries and fix reports

### 5. Duplicate ZIP Files
Remove duplicate packaged applications:
- Keep: Only the most recent and relevant ZIP files
- Remove: Old versions and duplicates

## Directory Cleanup

### 1. Remove Empty Directories
- Remove any empty directories that are no longer needed

### 2. Consolidate Similar Directories
- Merge directories with similar purposes

## Implementation Steps

1. Create a backup of the entire project
2. Identify and list all duplicate files
3. Move duplicates to trash_review directory with MANIFEST.json
4. Verify that the application still works after removal
5. Update documentation to reflect changes