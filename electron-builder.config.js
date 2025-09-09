/**
 * Electron Builder Configuration for Akash Share
 * Professional Windows Installer with NSIS
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
  
  // Files to include in the build
  files: [
    "build/**/*",
    "electron/**/*",
    "node_modules/**/*",
    "package.json",
    "!node_modules/.cache",
    "!node_modules/electron/**/*",
    "!**/*.map",
    "!src/**/*",
    "!public/**/*",
    "!backend/**/*"
  ],
  
  // Extra resources (backend files)
  extraResources: [
    {
      from: "build/backend",
      to: "backend",
      filter: ["**/*"]
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
  
  // NSIS installer configuration
  nsis: {
    // Basic settings
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    allowElevation: true,
    installerIcon: "build-resources/icon.ico",
    uninstallerIcon: "build-resources/icon.ico",
    installerHeaderIcon: "build-resources/icon.ico",
    
    // Installation directory
    installDir: "${LOCALAPPDATA}\\Programs\\${productName}",
    
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
    
    // License and other files
    license: "LICENSE",
    
    // Custom installer script
    include: "build-resources/installer.nsh",
    
    // Compression
    compression: "maximum",
    
    // Additional NSIS options
    warningsAsErrors: false,
    artifactName: "${productName} Setup ${version}.${ext}"
  },
  
  // Compression settings
  compression: "maximum",
  removePackageScripts: true,
  
  // Build options
  buildDependenciesFromSource: false,
  nodeGypRebuild: false,
  
  // Publish configuration (optional)
  publish: null
};