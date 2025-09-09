# App Icon Setup Instructions

## Required Icon Files

To create a professional Windows installer, you need to provide the following icon files in the `build-resources/` directory:

### 1. Main App Icon (Required)
- **File**: `build-resources/icon.ico`
- **Format**: Windows ICO format
- **Sizes**: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256 pixels
- **Usage**: Main application icon, installer icon, uninstaller icon

### 2. Optional: Additional Icons
- **File**: `build-resources/icon.png` (for other platforms)
- **Format**: PNG format
- **Size**: 512x512 pixels minimum
- **Usage**: Fallback icon, documentation

## How to Create the ICO File

### Option 1: Using Online Converters
1. Go to https://convertio.co/png-ico/ or https://www.icoconverter.com/
2. Upload your PNG image (512x512 or larger)
3. Select multiple sizes (16, 32, 48, 64, 128, 256)
4. Download the generated ICO file
5. Save it as `build-resources/icon.ico`

### Option 2: Using GIMP (Free)
1. Open GIMP
2. Create a new image (512x512 pixels)
3. Design your icon
4. Export as PNG
5. Use an online converter to create ICO

### Option 3: Using Photoshop
1. Create a new document (512x512 pixels)
2. Design your icon
3. Go to File > Export > Export As
4. Choose ICO format
5. Select multiple sizes
6. Save as `build-resources/icon.ico`

### Option 4: Using IconWorkshop or similar tools
1. Open your icon creation software
2. Create a new icon project
3. Add your design
4. Export as ICO with multiple sizes
5. Save as `build-resources/icon.ico`

## Current Icon Status

If you already have an icon file, you can:

1. **Copy existing icon**: If you have `public/Akashshareicon.png`, convert it to ICO format
2. **Use existing ICO**: If you have an ICO file, copy it to `build-resources/icon.ico`

## Quick Setup (if you have public/Akashshareicon.png)

```bash
# Copy the existing PNG icon
copy "public\Akashshareicon.png" "build-resources\icon.png"

# Then convert PNG to ICO using an online converter
# Or use PowerShell to create a basic ICO (limited functionality)
```

## Verification

After placing the icon file, verify it exists:
```bash
dir build-resources\icon.ico
```

The installer will use this icon for:
- Application executable
- Desktop shortcut
- Start Menu shortcut
- Installer window
- Uninstaller window
- Add/Remove Programs entry

## Troubleshooting

If the icon doesn't appear:
1. Ensure the ICO file is in the correct location (`build-resources/icon.ico`)
2. Verify the ICO file contains multiple sizes
3. Check that the file is not corrupted
4. Try recreating the ICO file with a different tool

## Default Fallback

If no icon is provided, electron-builder will use a default Electron icon.
