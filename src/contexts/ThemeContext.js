import React, { createContext, useContext, useEffect } from 'react';
import useStore from '../store/useStore.js';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Removed unused 'theme' variable from destructuring
  const { setTheme } = useStore();

  useEffect(() => {
    // Always use dark theme as requested
    document.documentElement.classList.add('dark');
    
    // Set theme to dark permanently
    setTheme('dark');
  }, [setTheme]);

  // Remove toggleTheme function as requested
  // const toggleTheme = () => {
  //   const newTheme = theme === 'dark' ? 'light' : 'dark';
  //   setTheme(newTheme);
  // };

  const value = {
    theme: 'dark', // Always use dark theme
    setTheme,
    toggleTheme: () => {}, // Empty function as toggle is removed
    isDark: true // Always true
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};