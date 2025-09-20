// Monitoring configuration for cloud services
export const monitoringConfig = {
  // Log levels for different environments
  logLevels: {
    development: 'debug',
    staging: 'info',
    production: 'warn'
  },

  // Cloud service configurations
  cloudServices: {
    // Azure Monitor configuration
    azure: {
      connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
      instrumentationKey: process.env.APPINSIGHTS_INSTRUMENTATIONKEY,
      enableAutoCollection: true,
      enableDependencyTracking: true,
      enablePerformanceCounters: true
    },

    // AWS CloudWatch configuration
    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      logGroupName: process.env.CLOUDWATCH_LOG_GROUP || 'basktre-trading-api',
      logStreamName: process.env.CLOUDWATCH_LOG_STREAM || 'api-logs',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },

    // Google Cloud Monitoring
    gcp: {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      logName: process.env.GCP_LOG_NAME || 'basktre-trading-api'
    }
  },

  // Alert thresholds
  alerts: {
    responseTime: {
      warning: 1000, // 1 second
      critical: 5000  // 5 seconds
    },
    errorRate: {
      warning: 0.05, // 5%
      critical: 0.10  // 10%
    },
    memoryUsage: {
      warning: 0.80, // 80%
      critical: 0.90  // 90%
    },
    diskUsage: {
      warning: 0.80, // 80%
      critical: 0.90  // 90%
    }
  },

  // Metrics collection intervals
  metrics: {
    healthCheckInterval: 30000, // 30 seconds
    performanceMetricsInterval: 60000, // 1 minute
    systemMetricsInterval: 300000 // 5 minutes
  },

  // Log retention policies
  retention: {
    application: '14d',
    error: '30d',
    requests: '7d',
    security: '90d'
  }
};

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  return {
    logLevel: monitoringConfig.logLevels[env as keyof typeof monitoringConfig.logLevels] || 'info',
    enableConsoleLogging: env === 'development',
    enableFileLogging: true,
    enableCloudLogging: env === 'production' || env === 'staging',
    enableMetrics: true,
    enableAlerts: env === 'production'
  };
};

// Cloud service detection
export const detectCloudService = () => {
  if (process.env.AWS_EXECUTION_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return 'aws';
  }
  if (process.env.WEBSITE_SITE_NAME || process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    return 'azure';
  }
  if (process.env.GOOGLE_CLOUD_PROJECT || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return 'gcp';
  }
  return 'local';
};

// Export current configuration
export const currentConfig = {
  environment: process.env.NODE_ENV || 'development',
  cloudService: detectCloudService(),
  ...getEnvironmentConfig()
};
