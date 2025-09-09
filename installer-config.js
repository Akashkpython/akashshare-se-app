/**
 * Enhanced Installer Configuration for Akash Share
 * Ensures all components are properly packaged
 */

export const installerConfig = {
  // Basic app information
  appId: 'com.akashshare.app',
  productName: 'Akash Share',
  version: '1.0.5',
  description: 'Next-generation desktop application for fast and secure file sharing',
  
  // Output directory
  directories: {
    output: 'dist',
    buildResources: 'build-resources'
  },
  
  // Files to include in the installer
  files: [
    // React build files
    'build/**/*',
    
    // Electron main process
    'electron/**/*',
    
    // Backend server files
    'backend/**/*',
    
    // Node modules (excluding dev dependencies)
    'node_modules/**/*',
    
    // Exclude unnecessary files
    '!backend/node_modules',
    '!backend/uploads/*',
    '!backend/test/**/*',
    '!**/*.test.js',
    '!**/*.spec.js',
    '!**/test/**/*',
    '!**/tests/**/*',
    '!**/__tests__/**/*',
    '!**/coverage/**/*',
    '!**/.git/**/*',
    '!**/.gitignore',
    '!**/README.md',
    '!**/CHANGELOG.md',
    '!**/LICENSE',
    '!**/package-lock.json',
    '!**/yarn.lock'
  ],
  
  // Extra metadata
  extraMetadata: {
    main: 'electron/main.js'
  },
  
  // Application icon
  icon: 'public/Akashshareicon.png',
  
  // Windows-specific configuration
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      },
      {
        target: 'portable',
        arch: ['x64']
      }
    ],
    icon: 'public/Akashshareicon.png',
    publisherName: 'Akash Share Team',
    verifyUpdateCodeSignature: false
  },
  
  // NSIS installer configuration
  nsis: {
    // Installer display name
    uninstallDisplayName: 'Akash Share',
    
    // Shortcuts
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    
    // Installation options
    allowToChangeInstallationDirectory: true,
    oneClick: false,
    allowElevation: true,
    
    // Installer appearance
    installerIcon: 'public/Akashshareicon.png',
    uninstallerIcon: 'public/Akashshareicon.png',
    
    // License and welcome pages
    license: 'LICENSE',
    welcomePage: 'build-resources/welcome.html',
    
    // Custom installer script
    include: 'build-resources/installer.nsh',
    
    // Registry entries
    registryKeys: [
      {
        root: 'HKCU',
        subkey: 'Software\\AkashShare',
        name: 'InstallPath',
        value: '$INSTDIR'
      }
    ]
  },
  
  // Extra resources (backend files)
  extraResources: [
    {
      from: 'backend/',
      to: 'backend/',
      filter: [
        '**/*',
        '!node_modules',
        '!uploads/*',
        '!test/**/*',
        '!**/*.test.js',
        '!**/*.spec.js'
      ]
    }
  ],
  
  // Publish configuration
  publish: [
    {
      provider: 'generic',
      url: 'http://192.168.0.185:3000/'
    }
  ],
  
  // Build hooks
  beforeBuild: async (context) => {
    console.log('🔨 Pre-build: Ensuring all dependencies are available...');
    
    // Check if backend dependencies are installed
    const backendNodeModules = 'backend/node_modules';
    if (!fs.existsSync(backendNodeModules)) {
      console.log('📦 Installing backend dependencies...');
      execSync('cd backend && npm install --production', { stdio: 'inherit' });
    }
    
    // Ensure build directory exists
    if (!fs.existsSync('build')) {
      throw new Error('Build directory not found. Run "npm run build" first.');
    }
    
    console.log('✅ Pre-build checks completed!');
  },
  
  afterBuild: async (context) => {
    console.log('🎉 Post-build: Setup.exe created successfully!');
    
    // List created files
    const distDir = 'dist';
    if (fs.existsSync(distDir)) {
      const files = fs.readdirSync(distDir);
      const exeFiles = files.filter(file => file.endsWith('.exe'));
      
      console.log('\n📁 Created files:');
      exeFiles.forEach(file => {
        const filePath = path.join(distDir, file);
        const stats = fs.statSync(filePath);
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        console.log(`   - ${file} (${sizeInMB} MB)`);
      });
    }
  }
};

export default installerConfig;
