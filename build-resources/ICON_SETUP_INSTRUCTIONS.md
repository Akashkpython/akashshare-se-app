# Akash Share Icon Setup Instructions

## Issue Identified
The desktop shortcut icon is not loading because the `icon.ico` file in the `build-resources` directory is actually just a PNG file that has been renamed to `.ico`. Windows requires proper ICO format files with multiple resolutions for desktop icons.

## Solution Steps

### Option 1: Manual Online Conversion (Recommended)
1. Go to https://convertio.co/png-ico/
2. Upload `build-resources/icon.png`
3. Select multiple sizes: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
4. Download the converted ICO file
5. Save it as `build-resources/icon.ico` (replace the existing file)
6. Rebuild the application with `npm run build:win`

### Option 2: Using ImageMagick (If you have it installed)
```bash
magick convert build-resources/icon.png -define icon:auto-resize=256,128,64,48,32,16 build-resources/icon.ico
```

### Option 3: Using GIMP
1. Open `build-resources/icon.png` in GIMP
2. Go to File → Export As
3. Choose file name `icon.ico`
4. In export options, select multiple icon sizes
5. Export and save to `build-resources/icon.ico`

## Verification
After creating the proper ICO file, you can verify it's a real ICO by checking the file header:
- Real ICO files start with bytes: `00 00 01 00`
- Fake ICO files (renamed PNGs) start with bytes: `89 50 4E 47` (PNG signature)

## Rebuild Process
After replacing the icon file:
```bash
npm run build:win
```

The resulting installer in the `dist` folder should now create proper desktop shortcuts with the correct icon.