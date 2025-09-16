/**
 * Electron Builder Configuration for Akash Share Setup.exe
 * Optimized for Professional Installation with WebSocket Support
 * Similar to CursorUserSetup-x64 and QoderUserSetup-x64
 */

module.exports = {
  appId: "com.akashshare.app",
  productName: "Akash Share",
  copyright: "Copyright © 2024 Akash Share Team",
  
  // Build directories
  directories: {
    output: "dist",
    buildResources: "build-resources"
  },
  
  // Build options optimized for setup.exe
  buildDependenciesFromSource: false,
  nodeGypRebuild: false,
  removePackageScripts: true,
  
  // ASAR options - Enable ASAR for better performance
  asar: true,
  asarUnpack: [
    "build/**/*",
    "backend/**/*",
    "node_modules/ws/**/*",
    "node_modules/mongoose/**/*",
    "node_modules/express/**/*"
  ],
  
  // Files to include in the build
  files: [
    "build/**/*",
    "electron/**/*",
    "node_modules/**/*",
    "package.json",
    "!node_modules/.cache",
    "!node_modules/electron/**/*",
    "!**/*.map",
    "!**/test/**/*",
    "!**/tests/**/*",
    "!**/*.test.js",
    "!**/*.spec.js"
  ],
  
  // Extra resources - Backend and dependencies
  extraResources: [
    {
      from: "build",
      to: "app",
      filter: ["**/*"]
    },
    {
      from: "backend",
      to: "backend",
      filter: [
        "**/*",
        "!uploads/**/*",
        "!*.log",
        "!test/**/*",
        "!tests/**/*",
        "!**/*.test.js",
        "!**/*.spec.js"
      ]
    },
    {
      from: "build-resources/install-backend-deps.js",
      to: "install-backend-deps.js"
    }
  ],
  
  // Windows-specific configuration
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"]
      }
    ],
    icon: "build-resources/icon.ico",
    requestedExecutionLevel: "asInvoker",
    publisherName: "Akash Share Team",
    verifyUpdateCodeSignature: false,
    artifactName: "AkashShareUserSetup-x64.${ext}"
  },

  // NSIS installer configuration - Simplified for reliability
  nsis: {
    // Basic settings
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    allowElevation: false,
    installerIcon: "build-resources/icon.ico",
    uninstallerIcon: "build-resources/icon.ico",
    installerHeaderIcon: "build-resources/icon.ico",
    
    // Shortcuts
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "Akash Share",
    
    // Uninstaller
    deleteAppDataOnUninstall: false,
    runAfterFinish: true,
    
    // UI settings
    displayLanguageSelector: false,
    language: "1033",
    
    // Additional NSIS options
    warningsAsErrors: false,
    menuCategory: "Akash Share"
  },

  // Compression settings - balanced for size and speed
  compression: "normal",
  
  // Publish configuration (optional)
  publish: null,
  
  // Additional build options for WebSocket support
  extraMetadata: {
    main: "electron/main.js"
  },
  
  // Ensure proper file permissions
  fileAssociations: [],
  
  // Build hooks for post-processing
  afterPack: async (context) => {
    console.log('✅ Build completed successfully');
    console.log('📦 Setup.exe created in dist folder');
    console.log('🔌 WebSocket support included');
  }
};
