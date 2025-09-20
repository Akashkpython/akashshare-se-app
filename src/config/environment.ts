import type { EnvironmentConfig } from '../types';

// Environment variable validation configuration
interface EnvVarConfig {
  required: boolean;
  default: string | null;
  validate: (value: string) => boolean;
  description: string;
}

type RequiredEnvVars = {
  REACT_APP_API_URL: EnvVarConfig;
};

type OptionalEnvVars = {
  NODE_ENV: EnvVarConfig;
  REACT_APP_DEBUG: EnvVarConfig;
};

const requiredEnvVars: RequiredEnvVars = {
  // API Configuration
  REACT_APP_API_URL: {
    required: false,
    default: null,
    validate: (value: string) => !value || value.startsWith('http'),
    description: 'API server URL'
  }
};

const optionalEnvVars: OptionalEnvVars = {
  NODE_ENV: {
    required: false,
    default: 'development',
    validate: (value: string) => ['development', 'production', 'test'].includes(value),
    description: 'Application environment'
  },
  REACT_APP_DEBUG: {
    required: false,
    default: 'false',
    validate: (value: string) => ['true', 'false'].includes(value),
    description: 'Enable debug mode'
  }
};

// Validate environment variables
function validateEnvironment(): Record<string, string | null> {
  const errors: string[] = [];
  const config: Record<string, string | null> = {};

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
    
    if (value && settings.validate && !settings.validate(value)) {
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

// Create and export typed configuration
class Environment implements EnvironmentConfig {
  public readonly apiUrl: string | null;
  public readonly isDevelopment: boolean;
  public readonly isProduction: boolean;
  public readonly isTest: boolean;
  public readonly debugMode: boolean;

  constructor(config: Record<string, string | null>) {
    this.apiUrl = config.REACT_APP_API_URL;
    this.isDevelopment = config.NODE_ENV === 'development';
    this.isProduction = config.NODE_ENV === 'production';
    this.isTest = config.NODE_ENV === 'test';
    this.debugMode = config.REACT_APP_DEBUG === 'true';
  }

  get baseApiUrl(): string {
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
  }
}

export const environment = new Environment(config);
export default environment;