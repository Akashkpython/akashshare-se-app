import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Upload, 
  Download, 
  History, 
  Settings, 
  Share2,
  User,
  MessageCircle
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

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

  const menuItems = [
    {
      path: '/send',
      icon: Upload,
      label: 'Send Files',
      description: 'Upload & Share Files'
    },
    {
      path: '/receive',
      icon: Download,
      label: 'Receive Files',
      description: 'Download with Code'
    },
    {
      path: '/history',
      icon: History,
      label: 'History',
      description: 'Transfer Records'
    },
    {
      path: '/chat',
      icon: MessageCircle,
      label: 'Bca Group Chat',
      description: 'Community Discussion',
      danceEffect: true // Add dancing effect flag for Bca Group Chat item
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'Settings',
      description: 'App Configuration'
    }
  ];

  // Add a handler for navigation to help debug issues
  const handleNavigation = useCallback((path) => {
    console.log(`Navigating to: ${path}`);
  }, []);

  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="h-full flex flex-col border-r border-gray-800"
      style={{
        background: 'linear-gradient(180deg, #000000 0%, #121212 50%, #1C1C1C 100%)'
      }}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-800">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center space-x-3"
        >
          <img 
            src={getAssetPath('/Akashshareicon.png')} 
            alt="Akash Share Logo" 
            className="w-10 h-10 object-contain rounded-full"
            onError={(e) => {
              console.error('Failed to load logo:', e);
              // Fallback to gradient icon if image fails to load
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center" style={{ display: 'none' }}>
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              Akash Share
            </h1>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <motion.div
              key={item.path}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`group flex items-center space-x-3 p-3 rounded-2xl transition-all duration-300 sidebar-menu-item ${
                  isActive ? 'sidebar-menu-item-active text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'group-hover:text-white'}`} />
                <div className="flex-1">
                  <div className={`font-medium ${item.specialEffect ? 'neon-developer-text' : ''} ${item.danceEffect ? 'dance-text' : ''}`}>{item.label}</div>
                  <div className="text-xs text-gray-400">{item.description}</div>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-2 h-2 bg-white rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Dev Section at the very bottom */}
      <div className="p-4 border-t border-gray-800 mt-auto">
        <Link
          to="/developer"
          onClick={() => handleNavigation('/developer')}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300 group"
        >
          <User className="w-4 h-4 text-white" />
          <div className="flex-1">
            <div className="text-xs font-medium neon-developer-text">Dev</div>
            <div className="text-xs text-gray-500">Developer Profile</div>
          </div>
        </Link>
      </div>

      {/* Version */}
      <div className="p-4 text-center">
        <p className="text-xs text-gray-600">v1.0.0</p>
      </div>
    </motion.div>
  );
};

export default Sidebar;