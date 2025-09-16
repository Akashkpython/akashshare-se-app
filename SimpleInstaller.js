const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Akash Share Installer');
console.log('====================');
console.log('');

// Define variables
const appName = 'Akash Share';
const installDir = path.join(process.env.PROGRAMFILES, appName);
const sourceDir = path.join(__dirname, 'dist-final', 'Akash Share-win32-x64');

console.log('This installer will install Akash Share on your computer.');
console.log('');

// Check if running as administrator
try {
    execSync('net session', { stdio: 'ignore' });
} catch (error) {
    console.log('This installer requires administrator privileges.');
    console.log('Please run this installer as an administrator.');
    console.log('');
    console.log('Press any key to exit...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
    return;

}

console.log('Installing to:', installDir);
console.log('');

// Create installation directory
console.log('Creating installation directory...');
if (!fs.existsSync(installDir)) {
    fs.mkdirSync(installDir, { recursive: true });
}

// Copy files (in a real implementation, this would extract from embedded resources)
console.log('Copying application files...');
console.log('Note: In a complete implementation, this would extract the embedded application files.');
console.log('For now, please manually copy the application files to the installation directory.');
console.log('');

// Create desktop shortcut
console.log('Creating desktop shortcut...');
try {
    execSync(`powershell.exe -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('${path.join(process.env.USERPROFILE, 'Desktop', `${appName}.lnk`)}'); $Shortcut.TargetPath = '${path.join(installDir, `${appName}.exe`)}'; $Shortcut.Save()"`, { stdio: 'ignore' });
    console.log('Desktop shortcut created.');
} catch (error) {
    console.log('Warning: Could not create desktop shortcut.');
}

// Create Start Menu shortcut
console.log('Creating Start Menu shortcut...');
try {
    const startMenuPath = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', appName);
    if (!fs.existsSync(startMenuPath)) {
        fs.mkdirSync(startMenuPath, { recursive: true });
    }
    execSync(`powershell.exe -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('${path.join(startMenuPath, `${appName}.lnk`)}'); $Shortcut.TargetPath = '${path.join(installDir, `${appName}.exe`)}'; $Shortcut.Save()"`, { stdio: 'ignore' });
    console.log('Start Menu shortcut created.');
} catch (error) {
    console.log('Warning: Could not create Start Menu shortcut.');
}

console.log('');
console.log('Installation completed!');
console.log('');
console.log('Please manually copy the application files to:');
console.log(installDir);
console.log('');
console.log('Then you can launch Akash Share from the desktop shortcut or Start Menu.');

// Ask user if they want to launch the application
console.log('');
console.log('Press any key to exit...');
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', process.exit.bind(process, 0));