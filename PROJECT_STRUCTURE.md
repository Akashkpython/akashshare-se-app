# Akash Share - Project Structure

## 📁 **Root Directory Structure**

```
akashshare-se/
├── 📁 backend/                    # Backend server (Node.js/Express)
├── 📁 build/                      # React production build
├── 📁 dist/                       # Electron distribution files
├── 📁 electron/                   # Electron main process files
├── 📁 node_modules/               # Dependencies (auto-generated)
├── 📁 public/                     # Static assets
├── 📁 scripts/                    # Build and utility scripts
├── 📁 src/                        # React frontend source code
├── 📁 uploads/                    # File upload storage
├── 📁 trash_review/               # Old files (can be cleaned up)
├── 📄 package.json                # Main project configuration
├── 📄 package-lock.json           # Dependency lock file
├── 📄 tailwind.config.js          # Tailwind CSS configuration
├── 📄 postcss.config.js           # PostCSS configuration
└── 📄 README.md                   # Project documentation
```

## 📁 **Backend Structure**

```
backend/
├── 📁 test/                       # Backend tests
│   ├── 📄 websocket.test.js       # WebSocket functionality tests
│   └── 📄 test-server.js          # Test server for WebSocket tests
├── 📁 utils/                      # Backend utility modules
│   ├── 📄 errorHandler.js         # Error handling utilities
│   ├── 📄 fileValidation.js       # File upload validation
│   ├── 📄 group.js                # WebSocket group chat logic
│   └── 📄 websocketRateLimit.js   # WebSocket rate limiting
├── 📄 server.js                   # Main backend server
├── 📄 mongo-connection.js         # MongoDB connection handler
├── 📄 package.json                # Backend dependencies
└── 📄 test-rate-limit.js          # Rate limiting test
```

## 📁 **Frontend Structure (src/)**

```
src/
├── 📁 components/                 # Reusable React components
│   ├── 📁 layout/                 # Layout components
│   │   ├── 📄 Header.js           # Application header
│   │   └── 📄 Sidebar.js          # Navigation sidebar
│   ├── 📁 splash/                 # Splash screen components
│   │   ├── 📄 SplashScreen.js     # Loading splash screen
│   │   ├── 📄 splash.css          # Splash screen styles
│   │   └── 📄 SplashScreen.test.js # Splash screen tests
│   ├── 📁 ui/                     # UI components
│   │   ├── 📄 NotificationContainer.js # Notification system
│   │   ├── 📄 UpdateManager.js    # Auto-update manager
│   │   ├── 📄 MouseLightingEffect.js # Visual effects
│   │   ├── 📄 NeonDraggableCard.js # Neon-themed cards
│   │   └── 📄 SimpleNeonCard.js   # Simple neon cards
│   ├── 📁 __tests__/              # Component tests
│   │   ├── 📄 ErrorBoundary.test.tsx
│   │   ├── 📄 FilePreview.test.js
│   │   └── 📄 SmokeTest.test.js
│   ├── 📄 ErrorBoundary.js        # Error boundary component
│   ├── 📄 FilePreview.js          # File preview component
│   └── 📄 LazyWrapper.js          # Lazy loading wrapper
├── 📁 pages/                      # Main application pages
│   ├── 📄 Dashboard.js            # Main dashboard
│   ├── 📄 SendFiles.js            # File sending interface
│   ├── 📄 ReceiveFiles.js         # File receiving interface
│   ├── 📄 GroupChat.js            # Group chat functionality
│   ├── 📄 History.js              # Transfer history
│   ├── 📄 Settings.js             # Application settings
│   ├── 📄 Developer.js            # Developer tools
│   ├── 📄 AppUpdates.js           # Update management
│   ├── 📄 ChatInterfaceCheck.js   # Chat interface verification
│   ├── 📄 SaReGaMaPa.js           # Special feature page
│   └── 📄 SplashDemo.js           # Splash screen demo
├── 📁 lib/                        # Utility libraries
│   ├── 📄 api.js                  # API communication
│   ├── 📄 performance.js          # Performance monitoring
│   ├── 📄 utils.js                # General utilities
│   └── 📄 utils.ts                # TypeScript utilities
├── 📁 config/                     # Configuration files
│   ├── 📄 environment.js          # Environment configuration
│   └── 📄 environment.ts          # TypeScript environment config
├── 📁 contexts/                   # React contexts
│   └── 📄 ThemeContext.js         # Theme management
├── 📁 store/                      # State management
│   └── 📄 useStore.js             # Zustand store
├── 📁 types/                      # TypeScript type definitions
│   ├── 📄 index.ts                # Main type definitions
│   └── 📄 jest.d.ts               # Jest type definitions
├── 📁 utils/                      # Frontend utilities
│   └── 📄 testUtils.tsx           # Testing utilities
├── 📄 App.js                      # Main React application
├── 📄 App.test.js                 # App component tests
├── 📄 index.js                    # Application entry point
├── 📄 index.css                   # Global styles
├── 📄 setupTests.js               # Test setup configuration
└── 📄 reportWebVitals.js          # Performance monitoring
```

## 📁 **Electron Structure**

```
electron/
├── 📄 main.js                     # Main Electron process
└── 📄 preload.js                  # Preload script for security
```

## 📁 **Public Assets**

```
public/
├── 📄 index.html                  # Main HTML template
├── 📄 manifest.json               # Web app manifest
├── 📄 robots.txt                  # Search engine directives
├── 📁 Images/                     # Application images
│   ├── 📄 Akashshareicon.png      # Main app icon
│   ├── 📄 Akashshareicon-backup.png # Backup icon
│   ├── 📄 akash.jpg               # Profile image
│   └── 📄 [other image files]     # Additional images
├── 📁 Test Pages/                 # Development test pages
│   ├── 📄 chat-test.html          # WebSocket chat test
│   ├── 📄 websocket-test.html     # WebSocket functionality test
│   └── 📄 chat-interface-check.html # Interface verification
└── 📄 music1.mp3                  # Audio assets
```

## 📁 **Scripts and Build Tools**

```
scripts/
├── 📄 copy-electron.js            # Electron file copying
└── 📄 install-backend-deps.js     # Backend dependency installer
```

## 📁 **Distribution and Build**

```
build/                             # React production build
├── 📁 static/                     # Static assets
│   ├── 📁 css/                    # Compiled CSS
│   ├── 📁 js/                     # Compiled JavaScript
│   └── 📁 media/                  # Media assets
└── 📄 index.html                  # Production HTML

dist/                              # Electron distribution
├── 📁 win-unpacked/               # Windows unpacked app
└── 📁 builder-effective-config.yaml # Build configuration
```

## 📁 **Documentation Files**

```
├── 📄 README.md                   # Main project documentation
├── 📄 PROJECT_AUDIT_REPORT.md     # Project audit results
├── 📄 WEBSOCKET_TESTING_GUIDE.md  # WebSocket testing guide
├── 📄 INSTALLATION_INSTRUCTIONS.md # Installation guide
├── 📄 DEPLOYMENT_GUIDE.md         # Deployment instructions
├── 📄 SECURITY_FIXES_SUMMARY.md   # Security improvements
└── 📄 [other documentation files] # Additional docs
```

## 📁 **Configuration Files**

```
├── 📄 package.json                # Main project configuration
├── 📄 tailwind.config.js          # Tailwind CSS configuration
├── 📄 postcss.config.js           # PostCSS configuration
├── 📄 render.yaml                 # Render deployment config
└── 📄 [build scripts]             # Various build scripts
```

## 🧹 **Cleanup Recommendations**

### Files/Folders to Remove:
```
trash_review/                      # Old files - can be deleted
uploads/                           # Test files - can be cleaned
coverage/                          # Test coverage - can be regenerated
```

### Files to Keep:
- All source code files
- Configuration files
- Documentation files
- Build scripts
- Test files

## 📊 **File Count Summary**

- **Backend Files**: ~15 files
- **Frontend Files**: ~50+ files
- **Electron Files**: 2 files
- **Configuration Files**: ~10 files
- **Documentation Files**: ~15 files
- **Test Files**: ~10 files
- **Build/Distribution**: Auto-generated

## 🎯 **Key Directories**

1. **`src/`** - Main development directory
2. **`backend/`** - Server-side code
3. **`electron/`** - Desktop app configuration
4. **`public/`** - Static assets
5. **`scripts/`** - Build and utility scripts

This structure follows modern React/Node.js/Electron best practices with clear separation of concerns and organized file placement.
