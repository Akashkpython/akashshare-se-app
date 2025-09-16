/**
 * Simplified Electron Builder Configuration for Akash Share
 */

module.exports = {
  appId: "com.akashshare.app",
  productName: "Akash Share",
  copyright: "Copyright © 2024 Akash Share Team",
  
  // Build directories
  directories: {
    output: "dist-new",
    buildResources: "build-resources"
  },
  
  // ASAR options
  asar: true,
  
  // File inclusion - simple and direct
  files: [
    "build/**/*",
    "electron/**/*",
    "package.json"
  ],
  
  // Windows-specific configuration
  win: {
    target: [
      {
        target: "nsis",
        arch: ["x64"]
      }
    ],
    icon: "build-resources/icon.ico"
  },

  // NSIS installer configuration
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "Akash Share",
    artifactName: "AkashShareUserSetup-x64.${ext}"
  }
};