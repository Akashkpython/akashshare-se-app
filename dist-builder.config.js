/**
 * Simplified Electron Builder Configuration for Akash Share
 * Creates a professional installer similar to QoderUserSetup-x64
 */

export default {
  appId: "com.akashshare.app",
  productName: "Akash Share",
  copyright: "Copyright © 2024 Akash Share Team",
  
  // Build directories - using a different output directory to avoid locking issues
  directories: {
    output: "dist-final"
  },
  
  // ASAR packaging for better organization
  asar: true,
  
  // File inclusion - only what's necessary
  files: [
    "build/**/*",
    "electron/**/*",
    "package.json",
    "!node_modules/.cache/**/*",
    "!node_modules/electron/**/*",
    "!**/*.map",
    "!src/**/*"
  ],
  
  // Backend as extra resources
  extraResources: [
    {
      from: "backend",
      to: "backend",
      filter: [
        "**/*",
        "!node_modules",
        "!uploads/**/*",
        "!*.log",
        "!test/**/*"
      ]
    }
  ],
  
  // Windows-specific configuration
  win: {
    target: "nsis",
    icon: "build-resources/icon.ico",
    requestedExecutionLevel: "asInvoker",
    publisherName: "Akash Share Team"
  },

  // NSIS installer configuration - Professional setup
  nsis: {
    // Basic settings - User-friendly installation
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    allowElevation: false,
    
    // Icons
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
    language: "1033", // English
    
    // Professional installer name - Similar to Qoder/Cursor
    artifactName: "AkashShareUserSetup-x64.${ext}"
  },

  // Compression settings
  compression: "normal"
};