/**
 * Minimal Electron Builder Configuration for Akash Share
 * Optimized for fast builds with your updated configuration
 */

export default {
  appId: "com.akashshare.app",
  productName: "Akash Share",
  copyright: "Copyright © 2024 Akash Share Team",
  
  // Build directories
  directories: {
    output: "dist"
  },
  
  // ASAR packaging for better organization
  asar: true,
  
  // Minimal file inclusion
  files: [
    "build/**/*",
    "electron/**/*",
    "package.json"
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
    icon: "build-resources/icon.ico"
  },

  // NSIS installer configuration
  nsis: {
    // Basic settings
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    allowElevation: false,
    
    // Icons
    installerIcon: "build-resources/icon.ico",
    uninstallerIcon: "build-resources/icon.ico",
    
    // Shortcuts
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "Akash Share",
    
    // Uninstaller
    deleteAppDataOnUninstall: false,
    runAfterFinish: true,
    
    // Professional installer name
    artifactName: "AkashShareUserSetup-x64.${ext}"
  }
};