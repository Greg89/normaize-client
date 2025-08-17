import { logger } from './logger';

// Environment configuration interface
interface AppConfig {
  // Auth0 Configuration
  auth0: {
    domain: string;
    clientId: string;
    audience: string;
  };
  
  // API Configuration
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
  };
  
  // Logging Configuration
  logging: {
    seqUrl: string;
    seqApiKey: string | undefined;
    environment: string;
    logLevel: string;
  };
  
  // Error Tracking
  sentry: {
    dsn: string | undefined;
    environment: string;
    release: string;
  };
  
  // App Configuration
  app: {
    name: string;
    version: string;
    description: string;
    isProduction: boolean;
    isDevelopment: boolean;
    isTest: boolean;
  };
  
  // Feature Flags
  features: {
    analytics: boolean;
    performanceMonitoring: boolean;
    errorTracking: boolean;
    logging: boolean;
  };
}

// Default configuration values
const DEFAULT_CONFIG: AppConfig = {
  auth0: {
    domain: '',
    clientId: '',
    audience: '',
  },
  api: {
    baseUrl: 'http://localhost:5000',
    timeout: 30000,
    retryAttempts: 3,
  },
  logging: {
    seqUrl: '',
    seqApiKey: undefined,
    environment: 'development',
    logLevel: 'info',
  },
  sentry: {
    dsn: undefined,
    environment: 'development',
    release: '1.0.0',
  },
  app: {
    name: 'Normaize',
    version: '1.0.0',
    description: 'Data Toolbox',
    isProduction: false,
    isDevelopment: true,
    isTest: false,
  },
  features: {
    analytics: false,
    performanceMonitoring: true,
    errorTracking: false,
    logging: true,
  },
};

// Environment variable validation
class ConfigValidator {
  private static validateRequired(value: string | undefined, name: string): string {
    if (!value) {
      throw new Error(`Required environment variable ${name} is not set`);
    }
    return value;
  }

  private static validateUrl(value: string, name: string): string {
    try {
      new URL(value);
      return value;
    } catch {
      throw new Error(`Invalid URL for environment variable ${name}: ${value}`);
    }
  }

  // This method is kept for future use but currently not used
  // private static validateBoolean(value: string | undefined, name: string, defaultValue: boolean): boolean {
  //   if (!value) return defaultValue;
  //   return value.toLowerCase() === 'true';
  // }

  private static validateNumber(value: string | undefined, name: string, defaultValue: number): number {
    if (!value) return defaultValue;
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`Invalid number for environment variable ${name}: ${value}`);
    }
    return num;
  }

  static validate(config: Partial<AppConfig>): AppConfig {
    const validated: AppConfig = { ...DEFAULT_CONFIG };

    // Validate Auth0 configuration
    if (config.auth0?.domain) {
      validated.auth0.domain = this.validateRequired(config.auth0.domain, 'VITE_AUTH0_DOMAIN');
    }
    if (config.auth0?.clientId) {
      validated.auth0.clientId = this.validateRequired(config.auth0.clientId, 'VITE_AUTH0_CLIENT_ID');
    }
    if (config.auth0?.audience) {
      validated.auth0.audience = this.validateRequired(config.auth0.audience, 'VITE_AUTH0_AUDIENCE');
    }

    // Validate API configuration
    if (config.api?.baseUrl) {
      validated.api.baseUrl = this.validateUrl(config.api.baseUrl, 'VITE_API_URL');
    }
    if (config.api?.timeout) {
      validated.api.timeout = this.validateNumber(config.api.timeout.toString(), 'VITE_API_TIMEOUT', 30000);
    }
    if (config.api?.retryAttempts) {
      validated.api.retryAttempts = this.validateNumber(config.api.retryAttempts.toString(), 'VITE_API_RETRY_ATTEMPTS', 3);
    }

    // Validate logging configuration
    if (config.logging?.seqUrl) {
      validated.logging.seqUrl = this.validateUrl(config.logging.seqUrl, 'VITE_SEQ_URL');
    }
    validated.logging.seqApiKey = config.logging?.seqApiKey;
    validated.logging.environment = config.logging?.environment || 'development';
    validated.logging.logLevel = config.logging?.logLevel || 'info';

    // Validate Sentry configuration
    validated.sentry.dsn = config.sentry?.dsn;
    validated.sentry.environment = config.sentry?.environment || 'development';
    validated.sentry.release = config.sentry?.release || '1.0.0';

    // Set environment flags
    validated.app.isProduction = validated.logging.environment === 'production';
    validated.app.isDevelopment = validated.logging.environment === 'development';
    validated.app.isTest = validated.logging.environment === 'test';

    // Set feature flags based on environment
    validated.features.analytics = validated.app.isProduction;
    validated.features.errorTracking = validated.app.isProduction || validated.app.isDevelopment;
    validated.features.performanceMonitoring = true;
    validated.features.logging = true;

    return validated;
  }
}

// Configuration manager
class ConfigManager {
  private static instance: ConfigManager;
  private config: AppConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private loadConfig(): AppConfig {
    try {
      const envConfig: Partial<AppConfig> = {
        auth0: {
          domain: import.meta.env['VITE_AUTH0_DOMAIN'],
          clientId: import.meta.env['VITE_AUTH0_CLIENT_ID'],
          audience: import.meta.env['VITE_AUTH0_AUDIENCE'],
        },
        api: {
          baseUrl: import.meta.env['VITE_API_URL'] || 'http://localhost:5000',
          timeout: import.meta.env['VITE_API_TIMEOUT'] ? Number(import.meta.env['VITE_API_TIMEOUT']) : 30000,
          retryAttempts: import.meta.env['VITE_API_RETRY_ATTEMPTS'] ? Number(import.meta.env['VITE_API_RETRY_ATTEMPTS']) : 3,
        },
        logging: {
          seqUrl: import.meta.env['VITE_SEQ_URL'],
          seqApiKey: import.meta.env['VITE_SEQ_API_KEY'],
          environment: import.meta.env['VITE_NODE_ENV'],
          logLevel: import.meta.env['VITE_LOG_LEVEL'],
        },
        sentry: {
          dsn: import.meta.env['VITE_SENTRY_DSN'],
          environment: import.meta.env['VITE_NODE_ENV'],
          release: import.meta.env['VITE_APP_VERSION'],
        },
        app: {
          name: import.meta.env['VITE_APP_NAME'] || 'Normaize',
          version: import.meta.env['VITE_APP_VERSION'] || '1.0.0',
          description: import.meta.env['VITE_APP_DESCRIPTION'] || 'Data Toolbox',
          isProduction: false,
          isDevelopment: true,
          isTest: false,
        },
      };

      const validatedConfig = ConfigValidator.validate(envConfig);
      
      logger.info('Configuration loaded successfully', {
        environment: validatedConfig.logging.environment,
        apiUrl: validatedConfig.api.baseUrl,
        hasAuth0: !!validatedConfig.auth0.domain,
        hasSeq: !!validatedConfig.logging.seqUrl,
        hasSentry: !!validatedConfig.sentry.dsn,
      });

      return validatedConfig;
    } catch (error) {
      logger.error('Failed to load configuration', { error: error instanceof Error ? error.message : String(error) });
      
      // Return default config with warnings
      logger.warn('Using default configuration - some features may not work properly');
      return DEFAULT_CONFIG;
    }
  }

  getConfig(): AppConfig {
    return this.config;
  }

  // Convenience getters
  get auth0() { return this.config.auth0; }
  get api() { return this.config.api; }
  get logging() { return this.config.logging; }
  get sentry() { return this.config.sentry; }
  get app() { return this.config.app; }
  get features() { return this.config.features; }

  // Check if feature is enabled
  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature];
  }

  // Reload configuration (useful for testing)
  reload(): void {
    this.config = this.loadConfig();
  }
}

// Export singleton instance
export const config = ConfigManager.getInstance();

// Export types and default config for testing
export type { AppConfig };
export { DEFAULT_CONFIG, ConfigValidator, ConfigManager };
