/**
 * Security Audit Script for Todo Application
 * Analyzes current security configuration and provides recommendations
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Security audit results
const auditResults = {
  critical: [],
  high: [],
  medium: [],
  low: [],
  passed: []
};

// Utility functions
function addIssue(severity, category, issue, recommendation) {
  auditResults[severity].push({
    category,
    issue,
    recommendation
  });
}

function addPass(category, check) {
  auditResults.passed.push({
    category,
    check
  });
}

// Check environment configuration
function auditEnvironmentConfig() {
  console.log('🔍 Auditing Environment Configuration...');
  
  const envPath = path.join(__dirname, '../.env');
  
  if (!fs.existsSync(envPath)) {
    addIssue('critical', 'Environment', 'No .env file found', 'Create .env file with proper configuration');
    return;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  // Check JWT secrets
  const jwtSecret = envLines.find(line => line.startsWith('JWT_SECRET='));
  const jwtRefreshSecret = envLines.find(line => line.startsWith('JWT_REFRESH_SECRET='));
  
  if (!jwtSecret || jwtSecret.includes('your-super-secret') || jwtSecret.includes('default')) {
    addIssue('critical', 'JWT Security', 'Weak or default JWT secret detected', 'Generate strong random JWT secret using: openssl rand -base64 64');
  } else if (jwtSecret.split('=')[1].length < 32) {
    addIssue('high', 'JWT Security', 'JWT secret too short', 'Use at least 32 character JWT secret');
  } else {
    addPass('JWT Security', 'JWT secret is strong');
  }
  
  if (!jwtRefreshSecret || jwtRefreshSecret.includes('your-super-secret') || jwtRefreshSecret.includes('default')) {
    addIssue('critical', 'JWT Security', 'Weak or default JWT refresh secret detected', 'Generate strong random JWT refresh secret');
  } else {
    addPass('JWT Security', 'JWT refresh secret is configured');
  }
  
  // Check database configuration
  const dbUrl = envLines.find(line => line.startsWith('DATABASE_URL='));
  if (dbUrl && dbUrl.includes('root:123456')) {
    addIssue('critical', 'Database Security', 'Using root database user with weak password', 'Create dedicated database user with minimal privileges');
  }
  
  if (dbUrl && !dbUrl.includes('ssl_mode=REQUIRED')) {
    addIssue('medium', 'Database Security', 'SSL not enforced for database connection', 'Add ssl_mode=REQUIRED to DATABASE_URL');
  }
  
  // Check NODE_ENV
  const nodeEnv = envLines.find(line => line.startsWith('NODE_ENV='));
  if (!nodeEnv) {
    addIssue('medium', 'Environment', 'NODE_ENV not set', 'Set NODE_ENV=production for production deployment');
  }
}

// Check password hashing configuration
function auditPasswordSecurity() {
  console.log('🔍 Auditing Password Security...');
  
  const userServicePath = path.join(__dirname, '../src/users/users.service.ts');
  
  if (!fs.existsSync(userServicePath)) {
    addIssue('high', 'Password Security', 'Cannot find users service file', 'Verify users service exists');
    return;
  }
  
  const serviceContent = fs.readFileSync(userServicePath, 'utf8');
  
  // Check bcrypt usage
  if (serviceContent.includes('bcrypt.hash') && serviceContent.includes(', 10)')) {
    addPass('Password Security', 'Using bcrypt with salt rounds 10');
  } else if (serviceContent.includes('bcrypt.hash')) {
    addIssue('medium', 'Password Security', 'bcrypt salt rounds not verified', 'Ensure using at least 10 salt rounds');
  } else {
    addIssue('critical', 'Password Security', 'No password hashing detected', 'Implement bcrypt password hashing');
  }
  
  // Check password validation
  if (serviceContent.includes('bcrypt.compare')) {
    addPass('Password Security', 'Password comparison using bcrypt');
  } else {
    addIssue('high', 'Password Security', 'No secure password comparison', 'Use bcrypt.compare for password verification');
  }
}

// Check rate limiting configuration
function auditRateLimiting() {
  console.log('🔍 Auditing Rate Limiting Configuration...');
  
  const appModulePath = path.join(__dirname, '../src/app.module.ts');
  
  if (!fs.existsSync(appModulePath)) {
    addIssue('high', 'Rate Limiting', 'Cannot find app module file', 'Verify app module exists');
    return;
  }
  
  const moduleContent = fs.readFileSync(appModulePath, 'utf8');
  
  if (moduleContent.includes('ThrottlerModule')) {
    addPass('Rate Limiting', 'Rate limiting is configured');
    
    // Check if limits are reasonable for production
    if (moduleContent.includes('limit: 3') && moduleContent.includes('ttl: 1000')) {
      addIssue('medium', 'Rate Limiting', 'Rate limits may be too restrictive for production', 'Consider increasing limits for production environment');
    }
  } else {
    addIssue('high', 'Rate Limiting', 'No rate limiting configured', 'Implement rate limiting to prevent abuse');
  }
}

// Check CORS configuration
function auditCORSConfig() {
  console.log('🔍 Auditing CORS Configuration...');
  
  const mainPath = path.join(__dirname, '../src/main.ts');
  
  if (!fs.existsSync(mainPath)) {
    addIssue('high', 'CORS', 'Cannot find main.ts file', 'Verify main.ts exists');
    return;
  }
  
  const mainContent = fs.readFileSync(mainPath, 'utf8');
  
  if (mainContent.includes('enableCors')) {
    addPass('CORS', 'CORS is configured');
    
    if (mainContent.includes('localhost') && !mainContent.includes('configService.isDevelopment')) {
      addIssue('high', 'CORS', 'Localhost origins may be enabled in production', 'Ensure localhost origins are only enabled in development');
    }
    
    if (mainContent.includes('credentials: true')) {
      addPass('CORS', 'Credentials properly configured');
    }
  } else {
    addIssue('medium', 'CORS', 'CORS not explicitly configured', 'Configure CORS for frontend integration');
  }
}

// Check for sensitive information exposure
function auditSensitiveInfoExposure() {
  console.log('🔍 Auditing Sensitive Information Exposure...');
  
  // Check for hardcoded secrets in source files
  const srcPath = path.join(__dirname, '../src');
  
  function scanDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for hardcoded secrets
        const suspiciousPatterns = [
          /password\s*[:=]\s*['"][^'"]{1,20}['"]/i,
          /secret\s*[:=]\s*['"][^'"]{1,50}['"]/i,
          /api[_-]?key\s*[:=]\s*['"][^'"]{1,50}['"]/i,
          /token\s*[:=]\s*['"][^'"]{1,100}['"]/i
        ];
        
        suspiciousPatterns.forEach(pattern => {
          if (pattern.test(content)) {
            addIssue('high', 'Information Exposure', `Potential hardcoded secret in ${file}`, 'Move secrets to environment variables');
          }
        });
      }
    });
  }
  
  if (fs.existsSync(srcPath)) {
    scanDirectory(srcPath);
  }
  
  // If no issues found
  if (auditResults.high.filter(issue => issue.category === 'Information Exposure').length === 0) {
    addPass('Information Exposure', 'No hardcoded secrets detected in source code');
  }
}

// Generate security recommendations
function generateSecurityRecommendations() {
  console.log('\n🔒 SECURITY AUDIT RESULTS');
  console.log('=' .repeat(60));
  
  // Critical issues
  if (auditResults.critical.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES (Fix Immediately):');
    auditResults.critical.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.category}] ${issue.issue}`);
      console.log(`   → ${issue.recommendation}\n`);
    });
  }
  
  // High priority issues
  if (auditResults.high.length > 0) {
    console.log('\n⚠️ HIGH PRIORITY ISSUES:');
    auditResults.high.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.category}] ${issue.issue}`);
      console.log(`   → ${issue.recommendation}\n`);
    });
  }
  
  // Medium priority issues
  if (auditResults.medium.length > 0) {
    console.log('\n📋 MEDIUM PRIORITY ISSUES:');
    auditResults.medium.forEach((issue, index) => {
      console.log(`${index + 1}. [${issue.category}] ${issue.issue}`);
      console.log(`   → ${issue.recommendation}\n`);
    });
  }
  
  // Passed checks
  if (auditResults.passed.length > 0) {
    console.log('\n✅ SECURITY CHECKS PASSED:');
    auditResults.passed.forEach((pass, index) => {
      console.log(`${index + 1}. [${pass.category}] ${pass.check}`);
    });
  }
  
  // Overall security score
  const totalIssues = auditResults.critical.length + auditResults.high.length + auditResults.medium.length;
  const totalChecks = totalIssues + auditResults.passed.length;
  const securityScore = totalChecks > 0 ? Math.round((auditResults.passed.length / totalChecks) * 100) : 0;
  
  console.log('\n🎯 SECURITY ASSESSMENT:');
  console.log(`Security Score: ${securityScore}%`);
  console.log(`Critical Issues: ${auditResults.critical.length}`);
  console.log(`High Priority Issues: ${auditResults.high.length}`);
  console.log(`Medium Priority Issues: ${auditResults.medium.length}`);
  console.log(`Passed Checks: ${auditResults.passed.length}`);
  
  if (auditResults.critical.length === 0 && auditResults.high.length === 0) {
    console.log('\n🎉 PRODUCTION READY: No critical or high priority security issues detected!');
  } else {
    console.log('\n⚠️ NOT PRODUCTION READY: Critical or high priority issues must be resolved first.');
  }
  
  console.log('=' .repeat(60));
}

// Main audit execution
function runSecurityAudit() {
  console.log('🛡️ Starting Security Audit for Todo Application');
  console.log('');
  
  auditEnvironmentConfig();
  auditPasswordSecurity();
  auditRateLimiting();
  auditCORSConfig();
  auditSensitiveInfoExposure();
  
  generateSecurityRecommendations();
}

// Execute security audit
runSecurityAudit();
