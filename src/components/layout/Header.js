import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';

const Header = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [lastHealthCheck, setLastHealthCheck] = useState(null);
  const [isGroupChatPage, setIsGroupChatPage] = useState(false);
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  // Function to get the correct path for static assets in Electron
  const getAssetPath = (assetPath) => {
    // In Electron, we need to use the proper path for static assets
    if (window.location.protocol === 'file:') {
      // In Electron production build, we need to adjust the path
      // Remove leading slash and add ./ prefix
      const cleanPath = assetPath.startsWith('/') ? assetPath.substring(1) : assetPath;
      return `./${cleanPath}`;
    }
    // In development or web deployment
    return assetPath;
  };

  // Using standard Windows title bar - no custom window controls needed

  // Check if we're in an Electron environment
  useEffect(() => {
    const checkElectron = () => {
      // Simple and reliable Electron detection
      const isElectronEnv = !!(window.electronAPI && 
                               typeof window.electronAPI.minimize === 'function' && 
                               typeof window.electronAPI.maximize === 'function' && 
                               typeof window.electronAPI.close === 'function');
      
      console.log('🪟 Electron detection:', {
        hasElectronAPI: !!window.electronAPI,
        hasMinimize: !!(window.electronAPI && typeof window.electronAPI.minimize === 'function'),
        hasMaximize: !!(window.electronAPI && typeof window.electronAPI.maximize === 'function'),
        hasClose: !!(window.electronAPI && typeof window.electronAPI.close === 'function'),
        isElectronEnv
      });
      
      setIsElectron(isElectronEnv);
    };
    
    // Check immediately
    checkElectron();
    
    // Also check after a short delay to ensure everything is loaded
    const timer = setTimeout(checkElectron, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Add a useEffect to log when the component renders and the isElectron state changes
  useEffect(() => {
    console.log('Header component rendered. isElectron state:', isElectron);
  }, [isElectron]);

  // Check if we're on group chat page and listen for group chat updates
  useEffect(() => {
    const checkGroupChatPage = () => {
      const isGroupChat = window.location.hash.includes('/group-chat') || 
                         window.location.pathname.includes('group-chat') ||
                         document.title.includes('Group Chat');
      setIsGroupChatPage(isGroupChat);
    };

    checkGroupChatPage();
    
    // Listen for hash changes
    const handleHashChange = () => {
      checkGroupChatPage();
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Listen for group chat updates from the chat component
  useEffect(() => {
    const handleGroupChatUpdate = (event) => {
      if (event.detail && event.detail.type === 'groupChatUpdate') {
        setOnlineMembers(event.detail.onlineMembers || []);
        setIsConnected(event.detail.isConnected || false);
      }
    };

    window.addEventListener('groupChatUpdate', handleGroupChatUpdate);
    return () => window.removeEventListener('groupChatUpdate', handleGroupChatUpdate);
  }, []);

  // Backend health monitoring
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        // Always use localhost for Electron app
        const apiBaseUrl = 'http://localhost:5004';

        console.log('🔍 Backend health check debug info:');
        console.log('  - Window protocol:', typeof window !== 'undefined' ? window.location.protocol : 'undefined');
        console.log('  - NODE_ENV:', process.env.NODE_ENV);
        console.log('  - API Base URL:', apiBaseUrl);
        console.log('  - Full URL:', `${apiBaseUrl}/health`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${apiBaseUrl}/`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
        
        clearTimeout(timeoutId);
        
        console.log('  - Response status:', response.status);
        console.log('  - Response ok:', response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('  - Response data:', data);
          setBackendStatus('online');
          setLastHealthCheck(new Date());
          console.log('✅ Backend is online');
        } else {
          setBackendStatus('offline');
          console.log('❌ Backend response not ok');
        }
      } catch (error) {
        console.log('❌ Backend health check failed:', error.message);
        console.log('❌ Error details:', error);
        setBackendStatus('offline');
      }
    };

    // Initial check
    checkBackendHealth();

    // Additional check after 1 second for faster detection
    const initialRetry = setTimeout(checkBackendHealth, 1000);

    // Check every 5 seconds for faster detection
    const interval = setInterval(checkBackendHealth, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialRetry);
    };
  }, []);

  const handleRetryBackend = async () => {
    setBackendStatus('checking');
    // Trigger immediate health check
    const checkBackendHealth = async () => {
      try {
        const apiBaseUrl = 'http://localhost:5004';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${apiBaseUrl}/`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setBackendStatus('online');
          setLastHealthCheck(new Date());
        } else {
          setBackendStatus('offline');
        }
      } catch (error) {
        console.log('Backend health check failed:', error.message);
        setBackendStatus('offline');
      }
    };
    
    await checkBackendHealth();
  };

  // Show the header with backend status
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between h-16 px-4 border-b border-gray-800"
      style={{
        background: 'linear-gradient(90deg, #000000 0%, #121212 50%, #1C1C1C 100%)'
      }}
    >
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Menu Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 transition-colors rounded-xl hover:bg-white/10"
          // Using standard Windows title bar
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>

        {/* Logo with Image and App Title */}
        <div className="flex items-center space-x-2">
          <img 
            src={getAssetPath('/Akashshareicon.png')} 
            alt="Akash Share Logo" 
            className="object-contain w-8 h-8 rounded-full"
            onError={(e) => {
              console.error('Failed to load header logo:', e);
              // Fallback to text if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {isGroupChatPage ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg shadow-lg bg-gradient-to-br from-blue-500 to-purple-500">
                <span className="text-sm font-bold text-white">AS</span>
              </div>
              <div>
                <span className="text-lg font-bold text-white">Group Chat</span>
                <p className="text-xs text-slate-400">
                  {isConnected ? (
                    `${onlineMembers.length} members online`
                  ) : (
                    'Disconnected'
                  )}
                </p>
              </div>
            </div>
          ) : (
            <span className="text-xl font-bold text-white">Akash Share</span>
          )}
        </div>

        <div className="items-center hidden space-x-2 md:flex">
          <Search className="w-4 h-4 text-white" />
          <input
            type="text"
            placeholder="Search files, codes..."
            className="w-64 text-sm bg-transparent border-none outline-none text-foreground placeholder-foreground/60"
            // Using standard Windows title bar
          />
        </div>
      </div>

      {/* Center Section - Page Title - Removed to avoid duplication */}
      {/* <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="hidden lg:block"
      >
        <h2 className="text-lg font-semibold gradient-text">Akash Share</h2>
      </motion.div> */}

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        {/* Backend Status Indicator */}
        <div className="flex items-center mr-2 space-x-2">
          <div className="flex items-center space-x-1">
            {backendStatus === 'online' && <Wifi className="w-4 h-4 text-green-400" />}
            {backendStatus === 'offline' && <WifiOff className="w-4 h-4 text-red-400" />}
            {backendStatus === 'checking' && <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />}
            
            <span className={`text-xs font-medium ${
              backendStatus === 'online' ? 'text-green-400' :
              backendStatus === 'offline' ? 'text-red-400' :
              'text-yellow-400'
            }`}>
              Backend {backendStatus === 'online' ? 'Online' : backendStatus === 'offline' ? 'Offline' : 'Checking...'}
            </span>
          </div>
          
          {backendStatus === 'offline' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetryBackend}
              className="flex items-center px-2 py-1 space-x-1 text-xs text-white transition-colors border rounded-md bg-red-600/20 hover:bg-red-600/30 border-red-600/30"
              title="Retry backend connection"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </motion.button>
          )}
          
          {lastHealthCheck && backendStatus === 'online' && (
            <div className="text-xs text-green-400/70">
              {new Date(lastHealthCheck).toLocaleTimeString()}
            </div>
          )}
        </div>

        
        {/* Using standard Windows title bar - no custom window controls needed */}
      </div>
    </motion.header>
  );
};

export default Header;