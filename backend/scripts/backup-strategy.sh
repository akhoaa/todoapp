#!/bin/bash

# Todo Application Database Backup Strategy
# Production-ready MySQL backup and recovery system

# Configuration
DB_NAME="todoapp_db"
DB_USER="todoapp_backup"
DB_PASSWORD="REPLACE_WITH_BACKUP_PASSWORD"
BACKUP_DIR="/var/backups/todoapp"
LOG_FILE="/var/log/todoapp/backup.log"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Full database backup
full_backup() {
    log "Starting full database backup..."
    
    BACKUP_FILE="$BACKUP_DIR/todoapp_full_$DATE.sql"
    
    # Create compressed backup
    mysqldump \
        --user="$DB_USER" \
        --password="$DB_PASSWORD" \
        --single-transaction \
        --routines \
        --triggers \
        --events \
        --hex-blob \
        --opt \
        "$DB_NAME" | gzip > "$BACKUP_FILE.gz"
    
    if [ $? -eq 0 ]; then
        log "Full backup completed successfully: $BACKUP_FILE.gz"
        
        # Verify backup integrity
        gunzip -t "$BACKUP_FILE.gz"
        if [ $? -eq 0 ]; then
            log "Backup integrity verified"
        else
            log "ERROR: Backup integrity check failed"
            return 1
        fi
    else
        log "ERROR: Full backup failed"
        return 1
    fi
}

# Incremental backup (binary logs)
incremental_backup() {
    log "Starting incremental backup..."
    
    BINLOG_DIR="$BACKUP_DIR/binlogs"
    mkdir -p "$BINLOG_DIR"
    
    # Flush binary logs to create a new log file
    mysql --user="$DB_USER" --password="$DB_PASSWORD" -e "FLUSH BINARY LOGS;"
    
    # Copy binary logs
    cp /var/lib/mysql/mysql-bin.* "$BINLOG_DIR/" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        log "Incremental backup completed successfully"
    else
        log "WARNING: Incremental backup may have issues"
    fi
}

# Schema-only backup
schema_backup() {
    log "Starting schema backup..."
    
    SCHEMA_FILE="$BACKUP_DIR/todoapp_schema_$DATE.sql"
    
    mysqldump \
        --user="$DB_USER" \
        --password="$DB_PASSWORD" \
        --no-data \
        --routines \
        --triggers \
        --events \
        "$DB_NAME" > "$SCHEMA_FILE"
    
    if [ $? -eq 0 ]; then
        log "Schema backup completed successfully: $SCHEMA_FILE"
    else
        log "ERROR: Schema backup failed"
        return 1
    fi
}

# Data-only backup
data_backup() {
    log "Starting data backup..."
    
    DATA_FILE="$BACKUP_DIR/todoapp_data_$DATE.sql"
    
    mysqldump \
        --user="$DB_USER" \
        --password="$DB_PASSWORD" \
        --no-create-info \
        --single-transaction \
        --hex-blob \
        "$DB_NAME" | gzip > "$DATA_FILE.gz"
    
    if [ $? -eq 0 ]; then
        log "Data backup completed successfully: $DATA_FILE.gz"
    else
        log "ERROR: Data backup failed"
        return 1
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up backups older than $RETENTION_DAYS days..."
    
    find "$BACKUP_DIR" -name "todoapp_*.sql*" -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR/binlogs" -name "mysql-bin.*" -mtime +7 -delete 2>/dev/null
    
    log "Cleanup completed"
}

# Test backup restoration
test_restore() {
    log "Testing backup restoration..."
    
    # Find the latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/todoapp_full_*.sql.gz 2>/dev/null | head -1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        log "ERROR: No backup files found for testing"
        return 1
    fi
    
    # Create test database
    TEST_DB="todoapp_test_restore"
    mysql --user="$DB_USER" --password="$DB_PASSWORD" -e "DROP DATABASE IF EXISTS $TEST_DB; CREATE DATABASE $TEST_DB;"
    
    # Restore backup to test database
    gunzip -c "$LATEST_BACKUP" | mysql --user="$DB_USER" --password="$DB_PASSWORD" "$TEST_DB"
    
    if [ $? -eq 0 ]; then
        # Verify tables exist
        TABLE_COUNT=$(mysql --user="$DB_USER" --password="$DB_PASSWORD" -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$TEST_DB';" -s -N)
        
        if [ "$TABLE_COUNT" -gt 0 ]; then
            log "Backup restoration test successful ($TABLE_COUNT tables restored)"
        else
            log "ERROR: Backup restoration test failed (no tables found)"
            return 1
        fi
        
        # Cleanup test database
        mysql --user="$DB_USER" --password="$DB_PASSWORD" -e "DROP DATABASE $TEST_DB;"
    else
        log "ERROR: Backup restoration test failed"
        return 1
    fi
}

# Generate backup report
generate_report() {
    log "Generating backup report..."
    
    REPORT_FILE="$BACKUP_DIR/backup_report_$DATE.txt"
    
    cat > "$REPORT_FILE" << EOF
Todo Application Backup Report
Generated: $(date)

=== BACKUP SUMMARY ===
Backup Directory: $BACKUP_DIR
Retention Period: $RETENTION_DAYS days

=== BACKUP FILES ===
$(ls -lh "$BACKUP_DIR"/todoapp_*.sql* 2>/dev/null | tail -10)

=== DISK USAGE ===
$(du -sh "$BACKUP_DIR")

=== DATABASE STATISTICS ===
$(mysql --user="$DB_USER" --password="$DB_PASSWORD" -e "SELECT * FROM todoapp_db.app_stats;" 2>/dev/null)

=== RECENT LOG ENTRIES ===
$(tail -20 "$LOG_FILE")
EOF

    log "Backup report generated: $REPORT_FILE"
}

# Main backup function
main() {
    case "$1" in
        "full")
            full_backup
            ;;
        "incremental")
            incremental_backup
            ;;
        "schema")
            schema_backup
            ;;
        "data")
            data_backup
            ;;
        "cleanup")
            cleanup_old_backups
            ;;
        "test")
            test_restore
            ;;
        "report")
            generate_report
            ;;
        "daily")
            log "Starting daily backup routine..."
            full_backup
            cleanup_old_backups
            test_restore
            generate_report
            log "Daily backup routine completed"
            ;;
        *)
            echo "Usage: $0 {full|incremental|schema|data|cleanup|test|report|daily}"
            echo ""
            echo "Commands:"
            echo "  full        - Create full database backup"
            echo "  incremental - Create incremental backup using binary logs"
            echo "  schema      - Backup database schema only"
            echo "  data        - Backup data only"
            echo "  cleanup     - Remove old backup files"
            echo "  test        - Test backup restoration"
            echo "  report      - Generate backup status report"
            echo "  daily       - Run complete daily backup routine"
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"
