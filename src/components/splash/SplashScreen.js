import React, { useState, useEffect } from 'react';
import './splash.css';

const SplashScreen = ({ onSplashComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          // Add a small delay before completing to ensure smooth animation
          setTimeout(() => {
            if (onSplashComplete) onSplashComplete();
          }, 300);
          return 100;
        }
        return prev + 2; // Faster progress for quicker loading
      });
    }, 50); // Faster interval for smoother animation

    return () => clearInterval(timer);
  }, [onSplashComplete]);

  return (
    <div className="splash-container">
      <div className="splash-box">
        {/* Logo */}
        <div className="splash-logo-container">
          <div className="splash-logo">
            <img 
              src="/Akashshareicon.png" 
              alt="Akash Share Logo" 
              className="splash-logo-img"
            />
          </div>
        </div>

        {/* Content */}
        <div className="splash-content">
          <h1 className="splash-app-name">
            Akash Share
          </h1>
          
          <p className="splash-tagline">
            Share Instantly. Chat Freely.
          </p>
          
          {/* Loading bar */}
          <div className="splash-loading-container">
            <div 
              className="splash-loading-bar" 
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="splash-version">
            Version 1.0.0
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;