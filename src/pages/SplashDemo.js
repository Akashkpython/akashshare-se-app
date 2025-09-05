import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SplashScreen from '../components/splash/SplashScreen';

const SplashDemo = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4">
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-akash-400 to-purple-400 bg-clip-text text-transparent">
              Professional Splash Screen
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              This is a more subtle, professional loading indicator that appears as a small elegant box 
              rather than taking over the entire screen.
            </p>
            
            <div className="glass-card p-6 mb-8 text-left">
              <h2 className="text-2xl font-semibold mb-4 text-akash-300">Key Features:</h2>
              <ul className="space-y-2 text-gray-200">
                <li className="flex items-start">
                  <span className="text-akash-400 mr-2">•</span>
                  <span>Minimal, non-intrusive design</span>
                </li>
                <li className="flex items-start">
                  <span className="text-akash-400 mr-2">•</span>
                  <span>Elegant glass-morphism card with blur effect</span>
                </li>
                <li className="flex items-start">
                  <span className="text-akash-400 mr-2">•</span>
                  <span>Smooth animations and transitions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-akash-400 mr-2">•</span>
                  <span>Professional color scheme using brand colors</span>
                </li>
                <li className="flex items-start">
                  <span className="text-akash-400 mr-2">•</span>
                  <span>Fully responsive for all device sizes</span>
                </li>
              </ul>
            </div>
            
            <button 
              onClick={() => setShowSplash(true)}
              className="btn-primary px-8 py-3 rounded-full text-lg font-semibold"
            >
              Show Loading Indicator Again
            </button>
            
            <p className="mt-8 text-gray-400">
              This design follows modern UI/UX principles with subtle animations and a clean aesthetic 
              that professional applications use.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SplashDemo;