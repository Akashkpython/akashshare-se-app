import React, { useEffect, Suspense, lazy, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import useStore from './store/useStore';
import performanceMonitor from './lib/performance';

// Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import NotificationContainer from './components/ui/NotificationContainer';
import ErrorBoundary from './components/ErrorBoundary';
import SplashScreen from './components/splash/SplashScreen';
import Developer from './pages/Developer';
import UpdateManager from './components/ui/UpdateManager';

// Contexts
import { ThemeProvider } from './contexts/ThemeContext';

// Lazy load pages for code splitting with proper error handling
const Dashboard = lazy(() => {
  performanceMonitor.start('load-dashboard');
  return import('./pages/Dashboard').then(module => {
    performanceMonitor.end('load-dashboard');
    return module;
  }).catch(error => {
    console.error('Failed to load Dashboard:', error);
    return { default: () => <div>Error loading Dashboard</div> };
  });
});

const SendFiles = lazy(() => {
  performanceMonitor.start('load-sendfiles');
  return import('./pages/SendFiles').then(module => {
    performanceMonitor.end('load-sendfiles');
    return module;
  }).catch(error => {
    console.error('Failed to load SendFiles:', error);
    return { default: () => <div>Error loading Send Files</div> };
  });
});

const ReceiveFiles = lazy(() => {
  performanceMonitor.start('load-receivefiles');
  return import('./pages/ReceiveFiles').then(module => {
    performanceMonitor.end('load-receivefiles');
    return module;
  }).catch(error => {
    console.error('Failed to load ReceiveFiles:', error);
    return { default: () => <div>Error loading Receive Files</div> };
  });
});

const History = lazy(() => {
  performanceMonitor.start('load-history');
  return import('./pages/History').then(module => {
    performanceMonitor.end('load-history');
    return module;
  }).catch(error => {
    console.error('Failed to load History:', error);
    return { default: () => <div>Error loading History</div> };
  });
});

const GroupChat = lazy(() => {
  performanceMonitor.start('load-groupchat');
  return import('./pages/GroupChat').then(module => {
    performanceMonitor.end('load-groupchat');
    return module;
  }).catch(error => {
    console.error('Failed to load GroupChat:', error);
    return { default: () => <div>Error loading Group Chat</div> };
  });
});

const Settings = lazy(() => {
  performanceMonitor.start('load-settings');
  return import('./pages/Settings').then(module => {
    performanceMonitor.end('load-settings');
    return module;
  }).catch(error => {
    console.error('Failed to load Settings:', error);
    return { default: () => <div>Error loading Settings</div> };
  });
});

const SplashDemo = lazy(() => {
  performanceMonitor.start('load-splashdemo');
  return import('./pages/SplashDemo').then(module => {
    performanceMonitor.end('load-splashdemo');
    return module;
  }).catch(error => {
    console.error('Failed to load SplashDemo:', error);
    return { default: () => <div>Error loading Splash Demo</div> };
  });
});

const SaReGaMaPa = lazy(() => {
  performanceMonitor.start('load-sa-re-ga-ma-pa');
  return import('./pages/SaReGaMaPa').then(module => {
    performanceMonitor.end('load-sa-re-ga-ma-pa');
    return module;
  }).catch(error => {
    console.error('Failed to load SaReGaMaPa:', error);
    return { default: () => <div>Error loading Sa Re Ga Ma Pa</div> };
  });
});

const AppUpdates = lazy(() => {
  performanceMonitor.start('load-app-updates');
  return import('./pages/AppUpdates').then(module => {
    performanceMonitor.end('load-app-updates');
    return module;
  }).catch(error => {
    console.error('Failed to load AppUpdates:', error);
    return { default: () => <div>Error loading App Updates</div> };
  });
});

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

  useEffect(() => {
    // Clean up expired codes on app start
    cleanupExpiredCodes();
    
    // Set up periodic cleanup
    const interval = setInterval(cleanupExpiredCodes, 60000); // Every minute
    
    return () => clearInterval(interval);
  }, [cleanupExpiredCodes]);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Track route changes to help debug the navigation issue
  useEffect(() => {
    routeChangeCount.current += 1;
    console.log(`Route changed to: ${location.pathname}, change count: ${routeChangeCount.current}`);
  }, [location]);

  if (showSplash) {
    return <SplashScreen onSplashComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'dark' : ''}`}>
      {/* Apply the modern black gradient to the entire app */ }
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
                      <Route path="/developer" element={<Developer />} /> {/* Use Developer instead of DeveloperPage */}
                      <Route path="/splash-demo" element={<SplashDemo />} />
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