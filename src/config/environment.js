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
const environment = {
  // API Settings
  apiUrl: config.REACT_APP_API_URL,

  // App Settings
  isDevelopment: config.NODE_ENV === 'development',
  isProduction: config.NODE_ENV === 'production',
  isTest: config.NODE_ENV === 'test',
  debugMode: config.REACT_APP_DEBUG === 'true',

  // Computed values
  get baseApiUrl() {
    // CRITICAL: Always use 127.0.0.1:5005 for Electron (file:// protocol)
    // This ensures Electron app uses its own local backend, not Render
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
      console.log('🔧 Electron detected - using 127.0.0.1:5005 for local backend');
      return 'http://127.0.0.1:5005';
    }

    // Always prefer 127.0.0.1:5005 for local development
    if (this.isDevelopment) {
      console.log('🔧 Development mode - using 127.0.0.1:5005');
      return 'http://127.0.0.1:5005';
    }

    // Use explicit API URL if set (but not for Electron)
    if (this.apiUrl) {
      console.log('🔧 Using explicit API URL:', this.apiUrl);
      return this.apiUrl;
    }

    // Production web deployment fallback (Render) - uses port 5003
    console.log('🔧 Production web mode - using Render backend');
    return 'https://akashshare-se-backend.onrender.com';
  },

  // Get dynamic WebSocket URL based on current context
  getWebSocketUrl: (username, room) => {
    // ALWAYS use 127.0.0.1:5005 for local development
    const wsUrl = `ws://127.0.0.1:5005/chat?username=${encodeURIComponent(username)}&room=${room}`;
    console.log('🔧 WebSocket - using 127.0.0.1:5005:', wsUrl);
    return wsUrl;
  }
};

// Add a helper function to get the correct API base URL
environment.getApiBaseUrl = () => {
  // If we have an explicit API URL, use it
  if (environment.apiUrl) {
    return environment.apiUrl;
  }
  
  // For Electron apps, always use localhost:5005
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return 'http://localhost:5005';
  }
  
  // In development, use localhost:5005
  if (environment.isDevelopment) {
    return 'http://localhost:5005';
  }
  
  // Production fallback
  return 'http://localhost:5005';
};

export { environment };
export default environment;