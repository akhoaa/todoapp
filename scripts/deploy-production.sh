#!/bin/bash

# Production Deployment Script for Todo Application
# Comprehensive deployment automation with safety checks

set -e  # Exit on any error

# Configuration
APP_NAME="todoapp"
DEPLOY_USER="todoapp"
DEPLOY_DIR="/opt/todoapp"
BACKUP_DIR="/var/backups/todoapp"
LOG_FILE="/var/log/todoapp/deploy.log"
NODE_VERSION="18"
PM2_APP_NAME="todoapp-backend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check if running as correct user
    if [ "$USER" != "$DEPLOY_USER" ]; then
        error "Must run as $DEPLOY_USER user"
    fi
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_CURRENT" -lt "$NODE_VERSION" ]; then
        error "Node.js version $NODE_VERSION or higher required (current: $NODE_CURRENT)"
    fi
    
    # Check PM2
    if ! command -v pm2 &> /dev/null; then
        error "PM2 is not installed"
    fi
    
    # Check MySQL connection
    if ! mysql -u todoapp_user -p"$DB_PASSWORD" -e "SELECT 1;" &> /dev/null; then
        error "Cannot connect to MySQL database"
    fi
    
    # Check disk space
    DISK_USAGE=$(df "$DEPLOY_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 80 ]; then
        warning "Disk usage is high: ${DISK_USAGE}%"
    fi
    
    success "Pre-deployment checks passed"
}

# Backup current deployment
backup_current_deployment() {
    log "Creating backup of current deployment..."
    
    BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_PATH="$BACKUP_DIR/deployment_$BACKUP_TIMESTAMP"
    
    mkdir -p "$BACKUP_PATH"
    
    # Backup application files
    if [ -d "$DEPLOY_DIR/backend" ]; then
        cp -r "$DEPLOY_DIR/backend" "$BACKUP_PATH/"
    fi
    
    if [ -d "$DEPLOY_DIR/frontend" ]; then
        cp -r "$DEPLOY_DIR/frontend" "$BACKUP_PATH/"
    fi
    
    # Backup database
    mysqldump -u todoapp_backup -p"$BACKUP_PASSWORD" todoapp_db | gzip > "$BACKUP_PATH/database_backup.sql.gz"
    
    # Backup PM2 configuration
    pm2 save
    cp ~/.pm2/dump.pm2 "$BACKUP_PATH/"
    
    success "Backup created at $BACKUP_PATH"
    echo "$BACKUP_PATH" > /tmp/todoapp_last_backup
}

# Deploy backend
deploy_backend() {
    log "Deploying backend..."
    
    cd "$DEPLOY_DIR"
    
    # Stop current backend
    pm2 stop "$PM2_APP_NAME" || true
    
    # Update backend code
    if [ -d "backend" ]; then
        cd backend
        git pull origin main
    else
        git clone https://github.com/yourusername/todoapp.git .
        cd backend
    fi
    
    # Install dependencies
    npm ci --production
    
    # Run database migrations
    npx prisma generate
    npx prisma migrate deploy
    
    # Build application
    npm run build
    
    # Update PM2 configuration
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '$PM2_APP_NAME',
    script: 'dist/src/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/todoapp/backend-error.log',
    out_file: '/var/log/todoapp/backend-out.log',
    log_file: '/var/log/todoapp/backend.log',
    time: true,
    max_memory_restart: '500M',
    node_args: '--max-old-space-size=512'
  }]
};
EOF
    
    # Start backend with PM2
    pm2 start ecosystem.config.js
    pm2 save
    
    success "Backend deployed successfully"
}

# Deploy frontend
deploy_frontend() {
    log "Deploying frontend..."
    
    cd "$DEPLOY_DIR"
    
    # Update frontend code
    if [ -d "frontend" ]; then
        cd frontend
        git pull origin main
    else
        mkdir -p frontend
        cd frontend
        git clone https://github.com/yourusername/todoapp-frontend.git .
    fi
    
    # Install dependencies
    npm ci
    
    # Build for production
    npm run build
    
    # Deploy to web server (nginx)
    sudo rm -rf /var/www/todoapp/*
    sudo cp -r dist/* /var/www/todoapp/
    sudo chown -R www-data:www-data /var/www/todoapp
    
    # Reload nginx
    sudo nginx -t && sudo systemctl reload nginx
    
    success "Frontend deployed successfully"
}

# Health checks
post_deployment_health_checks() {
    log "Running post-deployment health checks..."
    
    # Wait for services to start
    sleep 10
    
    # Check backend health
    BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health || echo "000")
    if [ "$BACKEND_HEALTH" != "200" ]; then
        error "Backend health check failed (HTTP $BACKEND_HEALTH)"
    fi
    
    # Check frontend
    FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost || echo "000")
    if [ "$FRONTEND_HEALTH" != "200" ]; then
        error "Frontend health check failed (HTTP $FRONTEND_HEALTH)"
    fi
    
    # Check database connectivity
    if ! curl -s http://localhost:3000/health/ready | grep -q "ready"; then
        error "Database connectivity check failed"
    fi
    
    # Check PM2 status
    if ! pm2 list | grep -q "$PM2_APP_NAME.*online"; then
        error "PM2 process is not running"
    fi
    
    success "All health checks passed"
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    if [ ! -f "/tmp/todoapp_last_backup" ]; then
        error "No backup found for rollback"
    fi
    
    BACKUP_PATH=$(cat /tmp/todoapp_last_backup)
    
    if [ ! -d "$BACKUP_PATH" ]; then
        error "Backup directory not found: $BACKUP_PATH"
    fi
    
    # Stop current services
    pm2 stop "$PM2_APP_NAME" || true
    
    # Restore backend
    if [ -d "$BACKUP_PATH/backend" ]; then
        rm -rf "$DEPLOY_DIR/backend"
        cp -r "$BACKUP_PATH/backend" "$DEPLOY_DIR/"
    fi
    
    # Restore frontend
    if [ -d "$BACKUP_PATH/frontend" ]; then
        sudo rm -rf /var/www/todoapp/*
        sudo cp -r "$BACKUP_PATH/frontend/dist/*" /var/www/todoapp/
        sudo chown -R www-data:www-data /var/www/todoapp
    fi
    
    # Restore database
    if [ -f "$BACKUP_PATH/database_backup.sql.gz" ]; then
        gunzip -c "$BACKUP_PATH/database_backup.sql.gz" | mysql -u todoapp_user -p"$DB_PASSWORD" todoapp_db
    fi
    
    # Restore PM2
    if [ -f "$BACKUP_PATH/dump.pm2" ]; then
        cp "$BACKUP_PATH/dump.pm2" ~/.pm2/
        pm2 resurrect
    fi
    
    success "Rollback completed"
}

# Main deployment function
main() {
    case "$1" in
        "deploy")
            log "Starting production deployment..."
            pre_deployment_checks
            backup_current_deployment
            deploy_backend
            deploy_frontend
            post_deployment_health_checks
            success "Deployment completed successfully!"
            ;;
        "rollback")
            rollback
            ;;
        "health")
            post_deployment_health_checks
            ;;
        *)
            echo "Usage: $0 {deploy|rollback|health}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Deploy application to production"
            echo "  rollback - Rollback to previous deployment"
            echo "  health   - Run health checks"
            exit 1
            ;;
    esac
}

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

# Execute main function
main "$@"
