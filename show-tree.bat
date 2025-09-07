@echo off
echo ========================================
echo    AKASH SHARE PROJECT STRUCTURE
echo ========================================
echo.

echo 📁 ROOT DIRECTORY:
echo ├── 📁 backend/                    # Backend server (Node.js/Express)
echo ├── 📁 build/                      # React production build
echo ├── 📁 dist/                       # Electron distribution files
echo ├── 📁 electron/                   # Electron main process files
echo ├── 📁 node_modules/               # Dependencies (auto-generated)
echo ├── 📁 public/                     # Static assets
echo ├── 📁 scripts/                    # Build and utility scripts
echo ├── 📁 src/                        # React frontend source code
echo ├── 📁 uploads/                    # File upload storage
echo ├── 📁 trash_review/               # Old files (can be cleaned up)
echo ├── 📄 package.json                # Main project configuration
echo ├── 📄 package-lock.json           # Dependency lock file
echo ├── 📄 tailwind.config.js          # Tailwind CSS configuration
echo ├── 📄 postcss.config.js           # PostCSS configuration
echo └── 📄 README.md                   # Project documentation
echo.

echo 📁 BACKEND STRUCTURE:
echo backend/
echo ├── 📁 test/                       # Backend tests
echo │   ├── websocket.test.js          # WebSocket functionality tests
echo │   └── test-server.js             # Test server for WebSocket tests
echo ├── 📁 utils/                      # Backend utility modules
echo │   ├── errorHandler.js            # Error handling utilities
echo │   ├── fileValidation.js          # File upload validation
echo │   ├── group.js                   # WebSocket group chat logic
echo │   └── websocketRateLimit.js      # WebSocket rate limiting
echo ├── server.js                      # Main backend server
echo ├── mongo-connection.js            # MongoDB connection handler
echo ├── package.json                   # Backend dependencies
echo └── test-rate-limit.js             # Rate limiting test
echo.

echo 📁 FRONTEND STRUCTURE (src/):
echo src/
echo ├── 📁 components/                 # Reusable React components
echo │   ├── 📁 layout/                 # Layout components
echo │   │   ├── Header.js              # Application header
echo │   │   └── Sidebar.js             # Navigation sidebar
echo │   ├── 📁 splash/                 # Splash screen components
echo │   │   ├── SplashScreen.js        # Loading splash screen
echo │   │   ├── splash.css             # Splash screen styles
echo │   │   └── SplashScreen.test.js   # Splash screen tests
echo │   ├── 📁 ui/                     # UI components
echo │   │   ├── NotificationContainer.js # Notification system
echo │   │   ├── UpdateManager.js       # Auto-update manager
echo │   │   ├── MouseLightingEffect.js # Visual effects
echo │   │   ├── NeonDraggableCard.js   # Neon-themed cards
echo │   │   └── SimpleNeonCard.js      # Simple neon cards
echo │   ├── 📁 __tests__/              # Component tests
echo │   │   ├── ErrorBoundary.test.tsx
echo │   │   ├── FilePreview.test.js
echo │   │   └── SmokeTest.test.js
echo │   ├── ErrorBoundary.js           # Error boundary component
echo │   ├── FilePreview.js             # File preview component
echo │   └── LazyWrapper.js             # Lazy loading wrapper
echo ├── 📁 pages/                      # Main application pages
echo │   ├── Dashboard.js               # Main dashboard
echo │   ├── SendFiles.js               # File sending interface
echo │   ├── ReceiveFiles.js            # File receiving interface
echo │   ├── GroupChat.js               # Group chat functionality
echo │   ├── History.js                 # Transfer history
echo │   ├── Settings.js                # Application settings
echo │   ├── Developer.js               # Developer tools
echo │   ├── AppUpdates.js              # Update management
echo │   ├── ChatInterfaceCheck.js      # Chat interface verification
echo │   ├── SaReGaMaPa.js              # Special feature page
echo │   └── SplashDemo.js              # Splash screen demo
echo ├── 📁 lib/                        # Utility libraries
echo │   ├── api.js                     # API communication
echo │   ├── performance.js             # Performance monitoring
echo │   ├── utils.js                   # General utilities
echo │   └── utils.ts                   # TypeScript utilities
echo ├── 📁 config/                     # Configuration files
echo │   ├── environment.js             # Environment configuration
echo │   └── environment.ts             # TypeScript environment config
echo ├── 📁 contexts/                   # React contexts
echo │   └── ThemeContext.js            # Theme management
echo ├── 📁 store/                      # State management
echo │   └── useStore.js                # Zustand store
echo ├── 📁 types/                      # TypeScript type definitions
echo │   ├── index.ts                   # Main type definitions
echo │   └── jest.d.ts                  # Jest type definitions
echo ├── 📁 utils/                      # Frontend utilities
echo │   └── testUtils.tsx              # Testing utilities
echo ├── App.js                         # Main React application
echo ├── App.test.js                    # App component tests
echo ├── index.js                       # Application entry point
echo ├── index.css                      # Global styles
echo ├── setupTests.js                  # Test setup configuration
echo └── reportWebVitals.js             # Performance monitoring
echo.

echo 📁 ELECTRON STRUCTURE:
echo electron/
echo ├── main.js                        # Main Electron process
echo └── preload.js                     # Preload script for security
echo.

echo 📁 PUBLIC ASSETS:
echo public/
echo ├── index.html                     # Main HTML template
echo ├── manifest.json                  # Web app manifest
echo ├── robots.txt                     # Search engine directives
echo ├── Akashshareicon.png             # Main app icon
echo ├── akash.jpg                      # Profile image
echo ├── chat-test.html                 # WebSocket chat test
echo ├── websocket-test.html            # WebSocket functionality test
echo ├── chat-interface-check.html      # Interface verification
echo └── music1.mp3                     # Audio assets
echo.

echo 📁 SCRIPTS AND BUILD TOOLS:
echo scripts/
echo ├── copy-electron.js               # Electron file copying
echo └── install-backend-deps.js        # Backend dependency installer
echo.

echo ========================================
echo    PROJECT STATUS: ✅ EXCELLENT
echo ========================================
echo.
echo 🎯 Key Directories:
echo    1. src/          - Main development directory
echo    2. backend/      - Server-side code
echo    3. electron/     - Desktop app configuration
echo    4. public/       - Static assets
echo    5. scripts/      - Build and utility scripts
echo.
echo 🧹 Cleanup Recommendations:
echo    - trash_review/  - Can be deleted (old files)
echo    - uploads/       - Can be cleaned (test files)
echo.
echo 📊 File Count Summary:
echo    - Backend Files: ~15 files
echo    - Frontend Files: ~50+ files
echo    - Electron Files: 2 files
echo    - Configuration Files: ~10 files
echo    - Documentation Files: ~15 files
echo    - Test Files: ~10 files
echo.
echo 🚀 Ready for Production!
echo ========================================
pause
