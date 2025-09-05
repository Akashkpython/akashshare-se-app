// Environment configuration with validation and defaults
const requiredEnvVars = {
  // API Configuration
  REACT_APP_API_URL: {
    required: false,
    default: null,
    validate: (value) => !value || value.startsWith('http'),
    description: 'API server URL'
  }
};

const optionalEnvVars = {
  NODE_ENV: {
    default: 'development',
    validate: (value) => ['development', 'production', 'test'].includes(value),
    description: 'Application environment'
  },
  REACT_APP_DEBUG: {
    default: 'false',
    validate: (value) => ['true', 'false'].includes(value),
    description: 'Enable debug mode'
  }
};

// Validate environment variables
function validateEnvironment() {
  const errors = [];
  const config = {};

  // Check required variables
  Object.entries(requiredEnvVars).forEach(([key, settings]) => {
    const value = process.env[key];
    
    if (settings.required && !value) {
      errors.push(`Missing required environment variable: ${key} - ${settings.description}`);
    }
    
    const finalValue = value || settings.default;
    
    if (finalValue && settings.validate && !settings.validate(finalValue)) {
      errors.push(`Invalid value for ${key}: ${finalValue}`);
    }
    
    config[key] = finalValue;
  });

  // Check optional variables
  Object.entries(optionalEnvVars).forEach(([key, settings]) => {
    const value = process.env[key] || settings.default;
    
    if (settings.validate && !settings.validate(value)) {
      errors.push(`Invalid value for ${key}: ${value}`);
    }
    
    config[key] = value;
  });

  if (errors.length > 0) {
    console.error('Environment validation errors:', errors);
    // In development, log warnings; in production, might want to throw
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Environment validation failed: ${errors.join(', ')}`);
    }
  }

  return config;
}

// Create validated config
const config = validateEnvironment();

// Export configuration with proper typing hints
export const environment = {
  // API Settings
  apiUrl: config.REACT_APP_API_URL,
  
  // App Settings
  isDevelopment: config.NODE_ENV === 'development',
  isProduction: config.NODE_ENV === 'production',
  isTest: config.NODE_ENV === 'test',
  debugMode: config.REACT_APP_DEBUG === 'true',
  
  // Computed values
  get baseApiUrl() {
    if (this.apiUrl) {
      return this.apiUrl;
    }
    
    // In Electron/Production mode, use localhost for the backend
    if (this.isProduction || window.location.protocol === 'file:') {
      return 'http://localhost:5002';
    }
    
    // Development fallback - use localhost:5002
    return 'http://localhost:5002';
  },
  
  // Get dynamic WebSocket URL based on current context
  getWebSocketUrl: (username, room) => {
    // If we have an explicit API URL, use it
    if (environment.apiUrl) {
      const wsUrl = environment.apiUrl.replace(/^http/, 'ws');
      return `${wsUrl}/chat?username=${encodeURIComponent(username)}&room=${room}`;
    }
    
    // In Electron or production, use localhost:5002
    if (environment.isProduction || window.location.protocol === 'file:') {
      // For Electron apps, we need to ensure we're using the correct localhost address
      // Always use localhost:5002 for Electron apps
      return `ws://localhost:5002/chat?username=${encodeURIComponent(username)}&room=${room}`;
    }
    
    // Fallback to localhost
    return `ws://localhost:5002/chat?username=${encodeURIComponent(username)}&room=${room}`;
  }
};

export default environment;