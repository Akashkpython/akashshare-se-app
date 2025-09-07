import React, { useEffect, Suspense, lazy, useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import useStore from './store/useStore.js';
import performanceMonitor from './lib/performance.js';
import errorHandler from './lib/errorHandler.js';
import securityManager from './lib/security.js';
import optimizationManager from './lib/optimization.js';

// Components
import Sidebar from './components/layout/Sidebar.js';
import Header from './components/layout/Header.js';
import NotificationContainer from './components/ui/NotificationContainer.js';
import ErrorBoundary from './components/ErrorBoundary.js';
import SplashScreen from './components/splash/SplashScreen.js';
import Developer from './pages/Developer.js';
import UpdateManager from './components/ui/UpdateManager.js';
import ChatInterfaceCheck from './pages/ChatInterfaceCheck.js';

// Contexts
import { ThemeProvider } from './contexts/ThemeContext.js';

// Ultra-Powerful Lazy Loading with Advanced Error Handling and Security
const createSecureLazyComponent = (importPath, componentName) => {
  return lazy(() => {
    performanceMonitor.start(`load-${componentName}`);
    // eslint-disable-next-line import/no-dynamic-require
    return import(/* webpackChunkName: "[request]" */ importPath)
      .then(module => {
        performanceMonitor.end(`load-${componentName}`, { 
          component: componentName,
          success: true 
        });
        return module;
      })
      .catch(error => {
        errorHandler.handleError(error, {
          type: 'lazyLoadError',
          component: componentName,
          importPath
        });
        performanceMonitor.end(`load-${componentName}`, { 
          component: componentName,
          success: false,
          error: error.message
        });
        return { 
          default: () => (
            <div className="error-boundary p-6">
              <div className="glass-card p-8 text-center">
                <h3 className="text-red-400 mb-4">Failed to load {componentName}</h3>
                <p className="text-gray-400 mb-4">There was an error loading this component.</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="btn-primary"
                >
                  Reload Page
                </button>
              </div>
            </div>
          )
        };
      });
  });
};

// Lazy load pages with ultra-powerful error handling
const Dashboard = lazy(() => import('./pages/Dashboard.js'));

const SendFiles = lazy(() => import('./pages/SendFiles.js'));
const ReceiveFiles = lazy(() => import('./pages/ReceiveFiles.js'));
const History = lazy(() => import('./pages/History.js'));
const GroupChat = lazy(() => import('./pages/GroupChat.js'));
const Settings = lazy(() => import('./pages/Settings.js'));
const SplashDemo = lazy(() => import('./pages/SplashDemo.js'));
const SaReGaMaPa = lazy(() => import('./pages/SaReGaMaPa.js'));
const AppUpdates = lazy(() => import('./pages/AppUpdates.js'));

// Loading component with better error handling and timeout
const LoadingSpinner = ({ error, retry, timedOut }) => {
  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="glass-card p-8 flex flex-col items-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              ⚠️
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-foreground font-medium mb-2">Failed to load page</p>
            <p className="text-foreground/60 text-sm mb-4">There was an error loading this page</p>
            {retry && (
              <button
                onClick={retry}
                className="btn-primary text-sm"
              >
                Try Again
              </button>
            )}
          </motion.div>
        </div>
      </div>
    );
  }
  
  if (timedOut) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="glass-card p-8 flex flex-col items-center space-y-4">
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center"
          >
            ⏱️
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <p className="text-foreground font-medium mb-2">Loading timeout</p>
            <p className="text-foreground/60 text-sm mb-4">The page is taking longer than expected to load</p>
            {retry && (
              <button
                onClick={retry}
                className="btn-primary text-sm"
              >
                Retry
              </button>
            )}
          </motion.div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="glass-card p-8 flex flex-col items-center space-y-4">
        <motion.div
          className="w-12 h-12 border-2 border-akash-400/30 border-t-akash-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.p
          className="text-foreground/70 text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Loading...
        </motion.p>
        <motion.p
          className="text-foreground/50 text-xs mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
        >
          Initializing components...
        </motion.p>
      </div>
    </div>
  );
};

function AppContent() {
  const location = useLocation();
  const { theme, sidebarOpen, cleanupExpiredCodes } = useStore();
  const [showSplash, setShowSplash] = useState(true);
  const routeChangeCount = useRef(0);
  const appInitialized = useRef(false);

  // Ultra-Powerful App Initialization
  useEffect(() => {
    if (appInitialized.current) return;
    
    performanceMonitor.start('app-initialization');
    
    // Initialize security policies
    const csp = securityManager.createCSP({
      allowInline: process.env.NODE_ENV === 'development',
      allowedDomains: ['localhost:5002', 'localhost:3000']
    });
    
    // Apply CSP to document
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = csp;
    document.head.appendChild(meta);
    
    // Initialize optimization systems
    optimizationManager.lazyLoadImages();
    
    // Clean up expired codes on app start
    cleanupExpiredCodes();
    
    // Set up periodic cleanup with optimization
    const cleanupInterval = setInterval(() => {
      cleanupExpiredCodes();
      optimizationManager.clearExpiredCache();
    }, 60000); // Every minute
    
    appInitialized.current = true;
    performanceMonitor.end('app-initialization', { 
      theme,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
    
    return () => {
      clearInterval(cleanupInterval);
      optimizationManager.cleanup();
    };
  }, [cleanupExpiredCodes, theme]);

  // Optimized theme application with memoization
  const themeClasses = useMemo(() => {
    return theme === 'dark' ? 'dark' : '';
  }, [theme]);

  useEffect(() => {
    // Apply theme to document with optimization
    optimizationManager.batchDOMUpdates(() => {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    });
  }, [theme]);

  // Enhanced route change tracking with performance monitoring
  const handleRouteChange = useCallback(() => {
    routeChangeCount.current += 1;
    performanceMonitor.start(`route-${location.pathname}`, {
      pathname: location.pathname,
      changeCount: routeChangeCount.current
    });
    
    // Log route change with security validation
    const sanitizedPath = securityManager.sanitize(location.pathname, 'pathTraversal');
    console.log(`🔄 Route changed to: ${sanitizedPath}, change count: ${routeChangeCount.current}`);
    
    // End previous route timing if exists
    performanceMonitor.end(`route-${location.pathname}`, {
      pathname: location.pathname,
      changeCount: routeChangeCount.current
    });
  }, [location.pathname]);

  useEffect(() => {
    handleRouteChange();
  }, [handleRouteChange]);

  if (showSplash) {
    return <SplashScreen onSplashComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${themeClasses}`}>
      {/* Ultra-Powerful Background with Performance Optimization */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, #000000 0%, #121212 50%, #1C1C1C 100%)',
          minHeight: '100vh'
        }}
      />
      <div className="relative z-10 flex h-screen overflow-hidden">
          {/* Sidebar */ }
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex-shrink-0 w-80"
              >
                <Sidebar />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */ }
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header />
            
            <main className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait" presenceAffectsLayout>
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="h-full overflow-auto"
                >
                  <Suspense 
                    fallback={
                      <div className="p-6">
                        <LoadingSpinner />
                      </div>
                    }
                  >
                    <Routes location={location}>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/send" element={<SendFiles />} />
                      <Route path="/receive" element={<ReceiveFiles />} />
                      <Route path="/history" element={<History />} />
                      <Route path="/chat" element={<GroupChat />} />
                      <Route path="/sa-re-ga-ma-pa" element={<SaReGaMaPa />} />
                      <Route path="/app-updates" element={<AppUpdates />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/developer" element={<Developer />} />
                      <Route path="/splash-demo" element={<SplashDemo />} />
                      <Route path="/chat-interface-check" element={<ChatInterfaceCheck />} />
                    </Routes>
                  </Suspense>
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>

      {/* Notifications */ }
      <NotificationContainer />
      
      {/* Update Manager */}
      <UpdateManager />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;