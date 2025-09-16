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
    // CRITICAL: Always use localhost:5004 for Electron (file:// protocol)
    // This ensures Electron app uses its own local backend, not Render
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
      console.log('🔧 Electron detected - using localhost:5004 for local backend');
      return 'http://localhost:5004';
    }

    // Always prefer localhost:5004 for local development
    if (this.isDevelopment) {
      console.log('🔧 Development mode - using localhost:5004');
      return 'http://localhost:5004';
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
    // CRITICAL: Always use localhost:5004 for Electron (file:// protocol)
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
      const wsUrl = `ws://localhost:5004/chat?username=${encodeURIComponent(username)}&room=${room}`;
      console.log('🔧 Electron WebSocket - using localhost:5004:', wsUrl);
      return wsUrl;
    }

    // Always prefer localhost:5004 for local development
    if (environment.isDevelopment) {
      const wsUrl = `ws://localhost:5004/chat?username=${encodeURIComponent(username)}&room=${room}`;
      console.log('🔧 Development WebSocket - using localhost:5004:', wsUrl);
      return wsUrl;
    }

    // Use explicit API URL if set
    if (environment.apiUrl) {
      const wsUrl = environment.apiUrl.replace(/^http/, 'ws');
      const fullWsUrl = `${wsUrl}/chat?username=${encodeURIComponent(username)}&room=${room}`;
      console.log('🔧 Custom WebSocket URL:', fullWsUrl);
      return fullWsUrl;
    }

    // Production web fallback (Render) - uses port 5003
    const renderWsUrl = `wss://akashshare-se-backend.onrender.com/chat?username=${encodeURIComponent(username)}&room=${room}`;
    console.log('🔧 Production WebSocket - using Render:', renderWsUrl);
    return renderWsUrl;
  }
};

// Add a helper function to get the correct API base URL
environment.getApiBaseUrl = () => {
  // If we have an explicit API URL, use it
  if (environment.apiUrl) {
    return environment.apiUrl;
  }
  
  // For Electron apps, always use localhost:5004
  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return 'http://localhost:5004';
  }
  
  // In development, use localhost:5004
  if (environment.isDevelopment) {
    return 'http://localhost:5004';
  }
  
  // Production fallback
  return 'http://localhost:5004';
};

export { environment };
export default environment;