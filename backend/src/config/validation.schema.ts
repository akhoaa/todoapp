import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application Configuration
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  
  PORT: Joi.number()
    .port()
    .default(3000),

  // Database Configuration
  DATABASE_URL: Joi.string()
    .required()
    .description('Database connection string'),

  // JWT Configuration
  JWT_SECRET: Joi.string()
    .min(32)
    .required()
    .description('JWT secret key (minimum 32 characters)'),
  
  JWT_EXPIRES_IN: Joi.string()
    .pattern(/^(\d+[smhd]|\d+)$/)
    .default('1d')
    .description('JWT expiration time (e.g., 1d, 1h, 30m)'),
  
  JWT_REFRESH_SECRET: Joi.string()
    .min(32)
    .required()
    .description('JWT refresh secret key (minimum 32 characters)'),
  
  JWT_REFRESH_EXPIRES_IN: Joi.string()
    .pattern(/^(\d+[smhd]|\d+)$/)
    .default('7d')
    .description('JWT refresh token expiration time'),

  // API Configuration
  API_PREFIX: Joi.string()
    .default('api')
    .description('API route prefix'),
  
  API_VERSION: Joi.string()
    .default('1.0')
    .description('API version'),
});
