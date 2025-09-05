import React from 'react';
import { motion } from 'framer-motion';
import useStore from '../../store/useStore';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Minimize2, 
  Maximize2, 
  X 
} from 'lucide-react';

const Header = () => {
  const { notifications } = useStore();
  const { theme, toggleTheme } = useTheme();

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

  const handleWindowControl = (action) => {
    if (window.electronAPI) {
      switch (action) {
        case 'minimize':
          window.electronAPI.minimize();
          break;
        case 'maximize':
          window.electronAPI.maximize();
          break;
        case 'close':
          window.electronAPI.close();
          break;
        default:
          break;
      }
    }
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 border-b border-gray-800 flex items-center justify-between px-4"
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
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>

        {/* Logo with Image - Only the image, no text */}
        <div className="flex items-center">
          <img 
            src={getAssetPath('/Akashshareicon.png')} 
            alt="Akash Share Logo" 
            className="w-8 h-8 object-contain rounded-full"
            onError={(e) => {
              console.error('Failed to load header logo:', e);
              // Fallback to text if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden md:flex flex-col" style={{ display: 'none' }}>
            <h2 className="text-lg font-bold gradient-text">Akash Share</h2>
            <p className="text-xs text-foreground/60 -mt-1">Next-Gen File Sharing</p>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-2">
          <Search className="w-4 h-4 text-white" />
          <input
            type="text"
            placeholder="Search files, codes..."
            className="bg-transparent border-none outline-none text-foreground placeholder-foreground/60 text-sm w-64"
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
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors relative"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-white" />
          ) : (
            <Moon className="w-5 h-5 text-white" />
          )}
        </motion.button>

        {/* Notifications */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors relative"
        >
          <Bell className="w-5 h-5 text-white" />
          {notifications.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
            >
              <span className="text-xs text-white font-bold">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            </motion.div>
          )}
        </motion.button>

        {/* Window Controls (Electron) */}
        {window.electronAPI && (
          <div className="flex items-center space-x-1 ml-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleWindowControl('minimize')}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <Minimize2 className="w-4 h-4 text-white" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleWindowControl('maximize')}
              className="p-1 rounded hover:bg-white/10 transition-colors"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleWindowControl('close')}
              className="p-1 rounded hover:bg-red-500/20 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;