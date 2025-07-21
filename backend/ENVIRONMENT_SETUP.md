# Environment Variables Setup

## Overview
This project uses environment variables to manage configuration securely. All sensitive information like JWT secrets, database credentials, and API keys should be stored in environment variables rather than hardcoded in the source code.

## Environment Files

### `.env` (Development)
Main environment file for development. Copy from `.env.example` and update with your values.

### `.env.test` (Testing)
Environment file for testing. Used when running tests.

### `.env.example` (Template)
Template file showing all required environment variables. **Never put real secrets here.**

## Required Environment Variables

### Database Configuration
```bash
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
```

### JWT Configuration
```bash
# Main JWT secret for access tokens
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# JWT access token expiration
JWT_EXPIRES_IN=1d

# JWT refresh token secret (should be different from JWT_SECRET)
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_change_this_in_production

# JWT refresh token expiration
JWT_REFRESH_EXPIRES_IN=7d
```

### Application Configuration
```bash
# Application environment
NODE_ENV=development

# Port to run the application
PORT=3000

# API configuration
API_PREFIX=api
API_VERSION=1.0
```

## Security Best Practices

### 1. Strong Secrets
- Use long, random strings for JWT secrets (minimum 32 characters)
- Use different secrets for access and refresh tokens
- Never use default values in production

### 2. Environment Separation
- Use different secrets for development, testing, and production
- Never commit `.env` files to version control
- Use `.env.example` as a template

### 3. Secret Generation
Generate strong secrets using:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the values:**
   - Replace all placeholder values with real configuration
   - Generate strong secrets for JWT_SECRET and JWT_REFRESH_SECRET
   - Update database connection string

3. **Verify configuration:**
   ```bash
   npm run start:dev
   ```

## Configuration Validation

The application validates that all required environment variables are present at startup. If any required variables are missing, the application will fail to start with a clear error message.

## Production Deployment

For production deployment:

1. **Never use default values**
2. **Use environment-specific secrets**
3. **Enable HTTPS**
4. **Use secure database connections**
5. **Consider using secret management services** (AWS Secrets Manager, Azure Key Vault, etc.)

## Troubleshooting

### Common Issues

1. **Application fails to start:**
   - Check that all required environment variables are set
   - Verify database connection string
   - Ensure JWT secrets are not empty

2. **Authentication errors:**
   - Verify JWT_SECRET is consistent
   - Check JWT_EXPIRES_IN format (e.g., '1d', '1h', '30m')

3. **Database connection errors:**
   - Verify DATABASE_URL format
   - Check database server is running
   - Verify credentials and database exists
