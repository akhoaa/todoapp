/**
 * Environment Variable Validation for Production Deployment
 * Ensures all required environment variables are properly configured
 */

import * as Joi from 'joi';

// Environment validation schema
export const envValidationSchema = Joi.object({
  // Environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // Server Configuration
  PORT: Joi.number()
    .port()
    .default(3000),

  // Database Configuration
  DATABASE_URL: Joi.string()
    .required()
    .pattern(/^mysql:\/\//)
    .messages({
      'string.pattern.base': 'DATABASE_URL must be a valid MySQL connection string',
      'any.required': 'DATABASE_URL is required'
    }),

  // JWT Configuration
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .messages({
      'string.min': 'JWT_SECRET must be at least 32 characters long',
      'any.required': 'JWT_SECRET is required'
    }),

  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .required()
    .messages({
      'string.min': 'JWT_REFRESH_SECRET must be at least 32 characters long',
      'any.required': 'JWT_REFRESH_SECRET is required'
    }),

  JWT_EXPIRES_IN: Joi.string()
    .pattern(/^(\d+[smhd]|never)$/)
    .default('15m')
    .messages({
      'string.pattern.base': 'JWT_EXPIRES_IN must be in format like "15m", "1h", "1d"'
    }),

  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .pattern(/^(\d+[smhd]|never)$/)
    .default('7d')
    .messages({
      'string.pattern.base': 'JWT_REFRESH_EXPIRES_IN must be in format like "7d", "30d"'
    }),

  // CORS Configuration
  FRONTEND_URL: Joi.string()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.required().messages({
        'any.required': 'FRONTEND_URL is required in production'
      }),
      otherwise: Joi.optional()
    }),

  // Rate Limiting
  THROTTLE_SHORT_TTL: Joi.number()
    .integer()
    .min(100)
    .default(1000),

  THROTTLE_SHORT_LIMIT: Joi.number()
    .integer()
    .min(1)
    .default(5),

  THROTTLE_MEDIUM_TTL: Joi.number()
    .integer()
    .min(1000)
    .default(10000),

  THROTTLE_MEDIUM_LIMIT: Joi.number()
    .integer()
    .min(1)
    .default(50),

  THROTTLE_LONG_TTL: Joi.number()
    .integer()
    .min(10000)
    .default(60000),

  THROTTLE_LONG_LIMIT: Joi.number()
    .integer()
    .min(1)
    .default(200),

  // Security
  HELMET_ENABLED: Joi.boolean()
    .default(true),

  CSRF_PROTECTION: Joi.boolean()
    .default(false), // Disabled for API-only applications

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),

  LOG_FILE_PATH: Joi.string()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.required().messages({
        'any.required': 'LOG_FILE_PATH is required in production'
      }),
      otherwise: Joi.optional()
    }),

  // Health Check
  HEALTH_CHECK_ENABLED: Joi.boolean()
    .default(true),

  // Monitoring
  METRICS_ENABLED: Joi.boolean()
    .default(false),

  METRICS_PORT: Joi.number()
    .port()
    .default(9090),

  // SSL/TLS (for production)
  SSL_CERT_PATH: Joi.string()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.optional(),
      otherwise: Joi.optional()
    }),

  SSL_KEY_PATH: Joi.string()
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.optional(),
      otherwise: Joi.optional()
    }),

  // Backup Configuration
  BACKUP_ENABLED: Joi.boolean()
    .default(false),

  BACKUP_SCHEDULE: Joi.string()
    .pattern(/^(\*|[0-5]?\d) (\*|[01]?\d|2[0-3]) (\*|[0-2]?\d|3[01]) (\*|[0]?\d|1[0-2]) (\*|[0-6])$/)
    .default('0 2 * * *')
    .messages({
      'string.pattern.base': 'BACKUP_SCHEDULE must be a valid cron expression'
    }),

  BACKUP_RETENTION_DAYS: Joi.number()
    .integer()
    .min(1)
    .default(30),

  // API Configuration
  API_PREFIX: Joi.string()
    .default('api'),

  API_VERSION: Joi.string()
    .pattern(/^\d+\.\d+$/)
    .default('1.0')
    .messages({
      'string.pattern.base': 'API_VERSION must be in format "1.0"'
    }),
});

// Custom validation for production environment
export function validateProductionConfig(config: any): string[] {
  const errors: string[] = [];

  // Production-specific validations
  if (config.NODE_ENV === 'production') {
    // Check for default/weak secrets
    if (config.JWT_SECRET.includes('default') || config.JWT_SECRET.includes('change-this')) {
      errors.push('JWT_SECRET contains default values - must be changed for production');
    }

    if (config.JWT_REFRESH_SECRET.includes('default') || config.JWT_REFRESH_SECRET.includes('change-this')) {
      errors.push('JWT_REFRESH_SECRET contains default values - must be changed for production');
    }

    // Check database URL for production readiness
    if (config.DATABASE_URL.includes('root:123456')) {
      errors.push('DATABASE_URL uses weak credentials - create dedicated database user');
    }

    if (!config.DATABASE_URL.includes('ssl_mode=REQUIRED')) {
      errors.push('DATABASE_URL should enforce SSL in production');
    }

    // Check JWT expiration times
    if (config.JWT_EXPIRES_IN === '1d' || config.JWT_EXPIRES_IN.includes('h')) {
      errors.push('JWT_EXPIRES_IN should be shorter in production (recommended: 15m)');
    }

    // Check CORS configuration
    if (!config.FRONTEND_URL || config.FRONTEND_URL.includes('localhost')) {
      errors.push('FRONTEND_URL must be set to production domain(s)');
    }

    // Check logging configuration
    if (!config.LOG_FILE_PATH) {
      errors.push('LOG_FILE_PATH must be configured for production logging');
    }

    if (config.LOG_LEVEL === 'debug' || config.LOG_LEVEL === 'verbose') {
      errors.push('LOG_LEVEL should be "warn" or "error" in production for performance');
    }
  }

  return errors;
}

// Environment configuration validator
export function validateEnvironment(config: Record<string, unknown>) {
  // Joi validation
  const { error, value } = envValidationSchema.validate(config, {
    allowUnknown: true,
    abortEarly: false,
  });

  if (error) {
    const joiErrors = error.details.map(detail => detail.message);
    throw new Error(`Environment validation failed:\n${joiErrors.join('\n')}`);
  }

  // Production-specific validation
  const productionErrors = validateProductionConfig(value);
  if (productionErrors.length > 0) {
    console.warn('Production configuration warnings:');
    productionErrors.forEach(err => console.warn(`⚠️ ${err}`));
  }

  return value;
}
