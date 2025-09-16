# Creating a Round Desktop Icon for Akash Share

## Overview
This guide explains how to create a round desktop icon for your Akash Share application using the 9000_new.png image you mentioned.

## Prerequisites
- The file `public\9000_new.png` should exist in your project
- For automated processing, ImageMagick should be installed (optional)

## Method 1: Automated Creation (Requires ImageMagick)

If you have ImageMagick installed:

1. Run the PowerShell script:
   ```bash
   powershell -ExecutionPolicy Bypass -File "create-round-icon.ps1"
   ```

2. The script will:
   - Create a round version of your 9000_new.png image
   - Convert it to proper ICO format with multiple resolutions
   - Save it as `build-resources\icon.ico`

## Method 2: Manual Creation (Recommended)

If you don't have ImageMagick installed, follow these steps:

### Step 1: Create a Round PNG

1. Go to https://www.photopea.com/ (free online image editor)
2. File → Open → Select `public\9000_new.png`
3. Create a circular crop:
   - Select the Ellipse tool from the toolbar
   - Hold Shift while dragging to create a perfect circle
   - Position the circle over the main part of your image
   - Right-click the circle and select "Select All"
   - Go to Select → Inverse
   - Press Delete to remove everything outside the circle
   - Go to Select → Deselect
4. File → Export As → PNG
   - Save as: `build-resources\icon-round.png`

### Step 2: Convert to ICO Format

1. Go to https://convertio.co/png-ico/
2. Upload your round PNG file (`build-resources\icon-round.png`)
3. Select the following sizes: 16, 32, 48, 64, 128, 256
4. Click "Convert"
5. Download the ICO file
6. Save as: `build-resources\icon.ico`

## Verification

Run the verification script to ensure everything is set up correctly:

```bash
VERIFY_ROUND_ICON.bat
```

## Building the Application

After creating your round icon:

1. Run the build process:
   ```bash
   npm run build:win
   ```

2. Check the `dist` folder for the installer
3. Test the installer - the desktop shortcut should show your round icon

## Troubleshooting

### ICO File Not Proper Format
If the verification script reports that the ICO file is not in proper format:
- Make sure you downloaded the actual ICO file from the converter
- Don't just rename a PNG file to .ico

### Desktop Icon Still Not Round
If the desktop icon appears square:
- Ensure you're using the latest installer
- Uninstall the previous version before installing the new one
- Check that `build-resources\icon.ico` is the round version

## Files Created

- `build-resources\icon-round.png` - Round PNG version of your icon
- `build-resources\icon.ico` - Multi-resolution ICO file for desktop shortcuts
- `build\icon.ico` - Copied version used in the build

## Next Steps

1. Follow the manual steps above to create your round icon
2. Run `VERIFY_ROUND_ICON.bat` to verify the icon
3. Run `npm run build:win` to create the installer
4. Test the installer to confirm the desktop shortcut shows your round icon