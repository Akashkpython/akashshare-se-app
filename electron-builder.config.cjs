/**
 * Electron Builder Configuration for Akash Share
 * Optimized for Fast Installation and Reliable Launch
 */

module.exports = {
  appId: "com.akashshare.app",
  productName: "Akash Share",
  copyright: "Copyright © 2024 Akash Share Team",
  
  // Build directories
  directories: {
    output: "dist-final",
    buildResources: "build-resources"
  },
  
  // Build options optimized for speed
  buildDependenciesFromSource: false,
  nodeGypRebuild: false,
  removePackageScripts: true,
  
  // ASAR options - Enable ASAR for better performance but unpack build files
  asar: true,
  asarUnpack: [
    "build/**/*",
    "backend/**/*"
  ],
  
  // Ensure frontend build files are included
  files: [
    "build/**/*",
    "electron/**/*",
    "node_modules/**/*",
    "package.json",
    "!node_modules/.cache",
    "!node_modules/electron/**/*",
    "!**/*.map"
  ],
  
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
        "!test/**/*"
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
    verifyUpdateCodeSignature: false
  },

  // NSIS installer configuration - Simplified for reliability
  nsis: {
    // Basic settings
    oneClick: true,
    perMachine: false,
    allowToChangeInstallationDirectory: false,
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
    
    // Custom installer and uninstaller scripts
    include: "build-resources/akash-mandatory-uninstaller.nsh",
    script: "build-resources/post-install.nsh",
    
    // Additional NSIS options
    warningsAsErrors: false,
    artifactName: "AkashShareUserSetup-x64.${ext}"
  },

  // Compression settings - minimal compression to avoid memory issues
  compression: "store", // Fastest compression for development
  
  // Publish configuration (optional)
  publish: null
};