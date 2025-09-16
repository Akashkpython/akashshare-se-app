/**
 * Electron Builder Configuration for Akash Share
 * Optimized for Fast Installation and Reliable Launch
 */

export default {
  appId: "com.akashshare.app",
  productName: "Akash Share",
  copyright: "Copyright © 2024 Akash Share Team",
  
  // Build directories
  directories: {
    output: "dist-new",
    buildResources: "build-resources"
  },
  
  // Build options optimized for speed
  buildDependenciesFromSource: false,
  nodeGypRebuild: false,
  removePackageScripts: true,
  
  // ASAR options - Optimized for faster installation
  asar: true,
  
  // Minimize ASAR unpacking - only unpack what's absolutely necessary
  asarUnpack: [
    "**/backend/server.js",
    "**/backend/package.json",
    "**/backend/mongo-connection.js",
    "**/backend/utils/**/*",
    "**/backend/middleware/**/*",
    "**/backend/routes/**/*",
    "**/backend/services/**/*",
    "**/*.node"
  ],
  
  // Optimized file inclusion - exclude unnecessary files
  files: [
    "build/**/*",
    "electron/**/*",
    "package.json",
    "!node_modules/.cache/**/*",
    "!node_modules/electron/**/*",
    "!node_modules/**/test/**/*",
    "!node_modules/**/tests/**/*",
    "!node_modules/**/*.md",
    "!node_modules/**/*.txt",
    "!node_modules/**/docs/**/*",
    "!node_modules/**/example/**/*",
    "!node_modules/**/examples/**/*",
    "!node_modules/**/sample/**/*",
    "!node_modules/**/samples/**/*",
    "!**/*.map",
    "!**/*.d.ts",
    "!src/**/*",
    "!backend/test/**/*",
    "!backend/uploads/**/*",
    "!backend/*.log"
  ],
  
  // Backend as extra resources - optimized
  extraResources: [
    {
      from: "backend",
      to: "backend",
      filter: [
        "**/*",
        "!uploads/**/*",
        "!*.log",
        "!test/**/*",
        "!**/*.md",
        "!**/*.txt"
      ]
    },
    // Explicitly include .env file for backend configuration
    {
      from: "backend/.env",
      to: "backend/.env"
    }
  ],
  
  // Windows-specific configuration
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"]
      },
      {
        target: "inno",
        arch: ["x64"]
      }
    ],
    icon: "build-resources/icon.ico", // Re-enabled with proper ICO format
    requestedExecutionLevel: "asInvoker",
    publisherName: "Akash Share Team",
    verifyUpdateCodeSignature: false,
    // Splash screen configuration
    splashScreen: {
      image: "build/Akashshareicon.png",
      backgroundColor: "#000000",
      fullScreen: false
    }
  },

  // NSIS installer configuration - Optimized for speed and reliability
  nsis: {
    // Basic settings
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    allowElevation: false, // Disable elevation for faster installation
    installerIcon: "build-resources/icon.ico",
    uninstallerIcon: "build-resources/icon.ico",
    installerHeaderIcon: "build-resources/icon.ico",
    
    // Installation directory - use user directory for faster access
    installDir: "${LOCALAPPDATA}\\Programs\\${productName}",
    
    // Shortcuts
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "Akash Share",
    
    // Uninstaller
    deleteAppDataOnUninstall: false,
    runAfterFinish: false, // Don't auto-run to prevent launch issues
    
    // UI settings
    displayLanguageSelector: false,
    language: "1033", // English
    
    // License and other files
    license: "build/LICENSE",
    
    // Custom installer and uninstaller scripts - optimized for speed
    include: "build-resources/installer-optimized.nsh",
    
    // Compression - use fast compression for speed
    compression: "normal", // Changed from maximum to normal for speed
    
    // Additional NSIS options
    warningsAsErrors: false,
    // Professional installer name
    artifactName: "AkashShareUserSetup-x64.${ext}"
  },
  
  // Inno Setup installer configuration
  inno: {
    // Basic settings
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    allowElevation: true,
    installerIcon: "build-resources/icon.ico",
    uninstallerIcon: "build-resources/icon.ico",
    
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
    
    // License and other files
    license: "build/LICENSE",
    
    // Custom installer script
    script: "build-resources/uninstaller.iss",
    
    // Compression
    compression: "maximum",
    
    // Professional installer name
    artifactName: "AkashShareUserSetup-Inno-x64.${ext}"
  },

  // Compression settings
  compression: "maximum",
  
  // Publish configuration (optional)
  publish: null
};