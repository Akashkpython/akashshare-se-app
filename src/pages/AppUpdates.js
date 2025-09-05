import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Info } from 'lucide-react';

const AppUpdates = () => {
  // In a real implementation, this would connect to the update system
  // For now, we'll show a static page with update information
  
  const updateInfo = {
    currentVersion: '1.0.4',
    latestVersion: '1.0.4',
    lastChecked: new Date().toLocaleString(),
    updateAvailable: false
  };

  return (
    <div className="p-6 h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-foreground mb-2"
          >
            App Updates
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-foreground/70"
          >
            Manage and check for application updates
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">Current Version</h2>
              <p className="text-foreground/70">v{updateInfo.currentVersion}</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-foreground/10">
              <span className="text-foreground/70">Latest Version</span>
              <span className="font-medium text-foreground">v{updateInfo.latestVersion}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-foreground/10">
              <span className="text-foreground/70">Last Checked</span>
              <span className="font-medium text-foreground">{updateInfo.lastChecked}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-foreground/70">Status</span>
              <span className={`font-medium ${updateInfo.updateAvailable ? 'text-orange-400' : 'text-green-400'}`}>
                {updateInfo.updateAvailable ? 'Update Available' : 'Up to Date'}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-akash-400 to-blue-500 flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">How Updates Work</h3>
              <p className="text-foreground/70 mb-4">
                When an update is available, you&apos;ll be notified and can choose when to install it.
              </p>
              <div className="flex flex-wrap gap-2">
                <button 
                  className="btn-primary flex items-center"
                  onClick={() => {
                    // In a real implementation, this would trigger an update check
                    alert('Checking for updates... This would connect to the update system in a real implementation.');
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check for Updates
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AppUpdates;