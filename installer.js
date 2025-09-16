const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Installing Akash Share...');
console.log('');

// Define variables
const appName = 'Akash Share';
const installDir = path.join(process.env.PROGRAMFILES, appName);
const sourceDir = path.join(__dirname, 'dist-final', 'Akash Share-win32-x64');

console.log('Creating installation directory...');
if (!fs.existsSync(installDir)) {
    fs.mkdirSync(installDir, { recursive: true });
}

console.log('Copying files...');
// Copy files using xcopy
try {
    execSync(`xcopy "${sourceDir}" "${installDir}" /E /I /H /Y`, { stdio: 'inherit' });
} catch (error) {
    console.error('Error copying files:', error.message);
    process.exit(1);
}

console.log('Creating shortcuts...');
// Create desktop shortcut using PowerShell
const desktopShortcut = path.join(process.env.USERPROFILE, 'Desktop', `${appName}.lnk`);
const startMenuShortcut = path.join(process.env.APPDATA, 'Microsoft', 'Windows', 'Start Menu', 'Programs', `${appName}.lnk`);

try {
    execSync(`powershell.exe -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('${desktopShortcut}'); $Shortcut.TargetPath = '${path.join(installDir, `${appName}.exe`)}'; $Shortcut.Save()"`, { stdio: 'inherit' });
    
    execSync(`powershell.exe -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('${startMenuShortcut}'); $Shortcut.TargetPath = '${path.join(installDir, `${appName}.exe`)}'; $Shortcut.Save()"`, { stdio: 'inherit' });
} catch (error) {
    console.error('Error creating shortcuts:', error.message);
}

console.log('');
console.log('Installation complete!');
console.log('You can now launch Akash Share from the desktop shortcut or Start Menu.');

// Ask user if they want to launch the application
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Do you want to launch Akash Share now? (Y/N) ', (answer) => {
    if (answer.toLowerCase() === 'y') {
        try {
            execSync(`"${path.join(installDir, `${appName}.exe`)}"`, { stdio: 'inherit' });
        } catch (error) {
            console.error('Error launching application:', error.message);
        }
    }
    rl.close();
});