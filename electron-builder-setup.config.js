const path = require('path');

module.exports = {
  appId: 'com.akashshare.app',
  productName: 'Akash Share',
  copyright: 'Copyright © 2024 Akash Share Team',
  
  directories: {
    output: 'dist',
    buildResources: 'build-resources'
  },

  // Build configuration for Windows
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      }
    ],
    icon: 'build-resources/icon.ico',
    requestedExecutionLevel: 'asInvoker'
  },

  // NSIS installer configuration
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: true,
    installerIcon: 'build-resources/icon.ico',
    uninstallerIcon: 'build-resources/icon.ico',
    installerHeaderIcon: 'build-resources/icon.ico',
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: 'Akash Share',
    include: 'build-resources/installer.nsh',
    script: 'build-resources/installer.nsh'
  },

  // Files to include in the build
  files: [
    'build/**/*',
    'electron/**/*',
    'node_modules/**/*',
    'package.json',
    '!node_modules/.cache',
    '!node_modules/electron/**/*',
    '!**/*.map',
    '!dist/**/*',
    '!coverage/**/*',
    '!tests/**/*'
  ],

  // Extra resources to include
  extraResources: [
    {
      from: 'backend',
      to: 'backend',
      filter: ['**/*']
    },
    {
      from: 'start-backend.bat',
      to: 'start-backend.bat'
    },
    {
      from: 'start-electron.bat', 
      to: 'start-electron.bat'
    },
    {
      from: 'start-akash-share.bat',
      to: 'start-akash-share.bat'
    }
  ],

  // Extra files to include in the app
  extraFiles: [
    {
      from: 'build/preload.js',
      to: 'preload.js'
    },
    {
      from: 'start-backend.bat',
      to: 'start-backend.bat'
    },
    {
      from: 'start-electron.bat',
      to: 'start-electron.bat'
    },
    {
      from: 'start-akash-share.bat',
      to: 'start-akash-share.bat'
    }
  ],

  // Compression settings
  compression: 'maximum',
  
  // Publish configuration
  publish: null
};
