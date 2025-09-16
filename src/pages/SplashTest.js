import React, { useState } from 'react';
import SplashScreen from '../components/splash/SplashScreen.js';

const SplashTest = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {showSplash ? (
        <SplashScreen onSplashComplete={handleSplashComplete} />
      ) : (
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Splash Screen Test Complete!
          </h1>
          <p className="text-gray-600 mb-6">
            The new minimal black splash screen with 4cm circular logo and loading animation has been displayed.
          </p>
          <button 
            onClick={() => setShowSplash(true)}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Show Splash Screen Again
          </button>
        </div>
      )}
    </div>
  );
};

export default SplashTest;
