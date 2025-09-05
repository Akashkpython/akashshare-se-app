import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Bell, 
  Shield,
  Globe,
  Upload,
  Info,
  RotateCcw,
  Zap
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import useStore from '../store/useStore';
import { AnimatePresence } from 'framer-motion';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, addNotification } = useStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading with a more realistic delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSettingChange = (key, value) => {
    updateSettings({ [key]: value });
    addNotification({
      type: 'success',
      title: 'Setting Updated',
      message: `${key} has been updated successfully`
    });
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      updateSettings({
        autoStart: true,
        notifications: true,
        language: 'en',
        maxFileSize: 100 * 1024 * 1024,
        codeExpiry: 24 * 60 * 60 * 1000,
      });
      addNotification({
        type: 'success',
        title: 'Settings Reset',
        message: 'All settings have been reset to default values'
      });
    }
  };

  const formatFileSize = (bytes) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100  } ${  sizes[i]}`;
  };

  const formatTime = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day(s)`;
    return `${hours} hour(s)`;
  };

  const settingSections = [
    {
      title: 'Appearance',
      icon: theme === 'dark' ? Moon : Sun,
      settings: [
        {
          key: 'theme',
          label: 'Theme',
          type: 'select',
          value: theme,
          options: [
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' }
          ],
          onChange: (value) => setTheme(value)
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      settings: [
        {
          key: 'notifications',
          label: 'Enable Notifications',
          type: 'toggle',
          value: settings.notifications,
          onChange: (value) => handleSettingChange('notifications', value)
        }
      ]
    },
    {
      title: 'File Transfer',
      icon: Upload,
      settings: [
        {
          key: 'maxFileSize',
          label: 'Maximum File Size',
          type: 'select',
          value: settings.maxFileSize,
          options: [
            { value: 10 * 1024 * 1024, label: '10 MB' },
            { value: 50 * 1024 * 1024, label: '50 MB' },
            { value: 100 * 1024 * 1024, label: '100 MB' },
            { value: 500 * 1024 * 1024, label: '500 MB' },
            { value: 1024 * 1024 * 1024, label: '1 GB' }
          ],
          onChange: (value) => handleSettingChange('maxFileSize', parseInt(value))
        },
        {
          key: 'codeExpiry',
          label: 'Code Expiry Time',
          type: 'select',
          value: settings.codeExpiry,
          options: [
            { value: 1 * 60 * 60 * 1000, label: '1 Hour' },
            { value: 6 * 60 * 60 * 1000, label: '6 Hours' },
            { value: 12 * 60 * 60 * 1000, label: '12 Hours' },
            { value: 24 * 60 * 60 * 1000, label: '24 Hours' },
            { value: 72 * 60 * 60 * 1000, label: '3 Days' }
          ],
          onChange: (value) => handleSettingChange('codeExpiry', parseInt(value))
        }
      ]
    },
    {
      title: 'Language',
      icon: Globe,
      settings: [
        {
          key: 'language',
          label: 'Language',
          type: 'select',
          value: settings.language,
          options: [
            { value: 'en', label: 'English' },
            { value: 'kn', label: 'ಕನ್ನಡ (Kannada)' }
          ],
          onChange: (value) => handleSettingChange('language', value)
        }
      ]
    }
  ];

  const advancedSettings = [
    {
      title: 'Security',
      icon: Shield,
      settings: [
        {
          key: 'autoStart',
          label: 'Auto-start with system',
          type: 'toggle',
          value: settings.autoStart,
          onChange: (value) => handleSettingChange('autoStart', value)
        }
      ]
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-10 bg-foreground/10 rounded-xl animate-pulse mb-4 w-1/4"></div>
            <div className="h-6 bg-foreground/10 rounded-lg animate-pulse w-1/2"></div>
          </div>
          <div className="h-10 w-24 bg-foreground/10 rounded-xl animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-foreground/10 rounded-2xl animate-pulse"></div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="h-40 bg-foreground/10 rounded-2xl animate-pulse"></div>
            <div className="h-32 bg-foreground/10 rounded-2xl animate-pulse"></div>
            <div className="h-48 bg-foreground/10 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Settings</h1>
          <p className="text-foreground/70">Configure your Akash Share preferences</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleResetSettings}
            className="btn-secondary flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4 text-white" />
            <span className="text-white">Reset</span>
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Settings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {settingSections.map((section, sectionIndex) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className="glass-card-enhanced p-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(59, 130, 246, 0.1)',
                  borderRadius: '1rem',
                  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Icon className="w-6 h-6 text-white" />
                  <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
                </div>
                
                <div className="space-y-4">
                  {section.settings.map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground font-medium">{setting.label}</p>
                        {setting.description && (
                          <p className="text-foreground/60 text-sm">{setting.description}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {setting.type === 'toggle' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setting.onChange(!setting.value)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              setting.value ? 'bg-akash-500' : 'bg-white/20'
                            }`}
                          >
                            <motion.span
                              layout
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                setting.value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </motion.button>
                        )}
                        
                        {setting.type === 'select' && (
                          <select
                            value={setting.value}
                            onChange={(e) => setting.onChange(e.target.value)}
                            className="input-field min-w-32"
                          >
                            {setting.options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Advanced Settings & Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Advanced Settings */}
          <div className="glass-card p-6" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            borderRadius: '1rem',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Zap className="w-6 h-6 text-white" />
                <h3 className="text-lg font-semibold text-foreground">Advanced Settings</h3>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="btn-secondary"
              >
                {showAdvanced ? 'Hide' : 'Show'}
              </motion.button>
            </div>
            
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {advancedSettings.map((section) => (
                    <div key={section.title}>
                      <div className="flex items-center space-x-3 mb-3">
                        <section.icon className="w-5 h-5 text-white" />
                        <h4 className="text-foreground font-medium">{section.title}</h4>
                      </div>
                      
                      <div className="space-y-3">
                        {section.settings.map((setting) => (
                          <div key={setting.key} className="flex items-center justify-between">
                            <div>
                              <p className="text-foreground font-medium">{setting.label}</p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {setting.type === 'toggle' && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setting.onChange(!setting.value)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    setting.value ? 'bg-akash-500' : 'bg-white/20'
                                  }`}
                                >
                                  <motion.span
                                    layout
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      setting.value ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </motion.button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* App Information */}
          <div className="glass-card p-6" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            borderRadius: '1rem',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <div className="flex items-center space-x-3 mb-4">
              <Info className="w-6 h-6 text-white" />
              <h3 className="text-lg font-semibold text-foreground">App Information</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground/60">Version</span>
                <span className="text-foreground font-medium">1.0.0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-foreground/60">Build</span>
                <span className="text-foreground font-medium">2024.1.0</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-foreground/60">Platform</span>
                <span className="text-foreground font-medium capitalize">
                  {window.electronAPI?.platform || 'web'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-foreground/60">Storage Used</span>
                <span className="text-foreground font-medium">2.4 GB</span>
              </div>
            </div>
          </div>

          {/* Current Settings Summary */}
          <div className="glass-card p-6" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))',
            backdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            borderRadius: '1rem',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            <div className="flex items-center space-x-3 mb-4">
              <SettingsIcon className="w-6 h-6 text-akash-400" />
              <h3 className="text-lg font-semibold text-foreground">Current Settings</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground/60">Theme</span>
                <span className="text-foreground font-medium capitalize">{theme}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-foreground/60">Max File Size</span>
                <span className="text-foreground font-medium">{formatFileSize(settings.maxFileSize)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-foreground/60">Code Expiry</span>
                <span className="text-foreground font-medium">{formatTime(settings.codeExpiry)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-foreground/60">Notifications</span>
                <span className="text-foreground font-medium">{settings.notifications ? 'Enabled' : 'Disabled'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-foreground/60">Language</span>
                <span className="text-foreground font-medium uppercase">{settings.language}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;