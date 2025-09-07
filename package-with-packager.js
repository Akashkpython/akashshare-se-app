const packager = require('electron-packager');
const path = require('path');

async function packageApp() {
  try {
    console.log('Packaging Akash Share application...');
    
    const appPaths = await packager({
      dir: '.',
      out: 'dist-packager',
      appCopyright: 'Copyright (C) 2025 Akash Share',
      appVersion: '1.0.5',
      arch: 'x64',
      asar: true,
      derefSymlinks: false,
      download: {
        cache: false
      },
      icon: path.join(__dirname, 'public', 'Akashshareicon.png'),
      ignore: [
        '^/dist($|/)',
        '^/dist-packager($|/)',
        '^/node_modules/.cache($|/)',
        '^/test($|/)',
        '^/scripts($|/)',
        '^/.git($|/)',
        '^/.github($|/)',
        '^/.vscode($|/)',
        '^/.idea($|/)',
        '^/.*\\.md$',
        '^/.*\\.log$',
        '^/package-lock\\.json$',
        '^/yarn\\.lock$',
        '^/.*\\.env.*$'
      ],
      name: 'Akash Share',
      overwrite: true,
      platform: 'win32',
      prune: true,
      quiet: false
    });
    
    console.log(`Application packaged successfully! Output paths: ${appPaths.join(', ')}`);
  } catch (error) {
    console.error('Error packaging application:', error);
  }
}

packageApp();