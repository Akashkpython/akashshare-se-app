import React, { useState, useEffect } from 'react';
import './splash.css';

const SplashScreen = ({ onSplashComplete }) => {
  const [loadingDots, setLoadingDots] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSplashComplete) onSplashComplete();
    }, 6000); // 6 second splash screen duration

    return () => clearTimeout(timer);
  }, [onSplashComplete]);

  // Loading dots animation
  useEffect(() => {
    const dotsTimer = setInterval(() => {
      setLoadingDots(prev => {
        if (prev === '...') return '';
        return `${prev}.`;
      });
    }, 500);

    return () => clearInterval(dotsTimer);
  }, []);

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

  return (
    <div className="splash-container">
      <div className="splash-box">
        {/* 4cm Circular Logo */}
        <div className="splash-logo-container">
          <div className="splash-logo">
            <img 
              src={getAssetPath("./Akashshareicon.png")} 
              alt="Akash Share Logo" 
              className="splash-logo-img"
              onError={(e) => {
                console.error('Failed to load splash logo:', e);
                // Try alternative paths
                e.target.src = './public/Akashshareicon.png';
              }}
            />
            {/* Rotating ring animation */}
            <div className="splash-logo-ring"></div>
          </div>
        </div>

        {/* Loading Animation */}
        <div className="splash-loading-container">
          <div className="splash-loading-spinner">
            <div className="splash-spinner-dot"></div>
            <div className="splash-spinner-dot"></div>
            <div className="splash-spinner-dot"></div>
          </div>
          <div className="splash-loading-text">
            Loading{loadingDots}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;