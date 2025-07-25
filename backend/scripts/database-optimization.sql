-- Database Optimization Script for Todo Application
-- Production-ready MySQL optimization and indexing

-- =====================================================
-- 1. PERFORMANCE INDEXES
-- =====================================================

-- Users table optimization
-- Email index already exists (unique constraint), but let's ensure it's optimal
-- Add index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_roles ON users(roles);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(createdAt);

-- Tasks table optimization
-- UserId index already exists, but let's add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(userId, status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(createdAt);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updatedAt);

-- Composite index for user tasks with status filtering
CREATE INDEX IF NOT EXISTS idx_tasks_user_created ON tasks(userId, createdAt DESC);

-- RefreshTokens table optimization
-- UserId index already exists, add expiration index for cleanup
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expiresAt);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_expires ON refresh_tokens(userId, expiresAt);

-- =====================================================
-- 2. DATABASE CONFIGURATION OPTIMIZATION
-- =====================================================

-- Optimize MySQL settings for production
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB, adjust based on available RAM
SET GLOBAL innodb_log_file_size = 268435456; -- 256MB
SET GLOBAL innodb_flush_log_at_trx_commit = 2; -- Better performance, slight durability trade-off
SET GLOBAL query_cache_size = 67108864; -- 64MB
SET GLOBAL query_cache_type = 1;
SET GLOBAL max_connections = 200; -- Adjust based on expected load

-- =====================================================
-- 3. SECURITY ENHANCEMENTS
-- =====================================================

-- Create dedicated application user with minimal privileges
-- Run these commands as root user

-- Create application database user
CREATE USER IF NOT EXISTS 'todoapp_user'@'localhost' IDENTIFIED BY 'REPLACE_WITH_STRONG_PASSWORD';

-- Grant only necessary privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON todoapp_db.users TO 'todoapp_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON todoapp_db.tasks TO 'todoapp_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON todoapp_db.refresh_tokens TO 'todoapp_user'@'localhost';

-- Grant schema modification privileges (for migrations)
GRANT CREATE, ALTER, DROP, INDEX ON todoapp_db.* TO 'todoapp_user'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;

-- =====================================================
-- 4. DATA CLEANUP AND MAINTENANCE
-- =====================================================

-- Create procedure to clean up expired refresh tokens
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS CleanupExpiredTokens()
BEGIN
    DELETE FROM refresh_tokens WHERE expiresAt < NOW();
    SELECT ROW_COUNT() as deleted_tokens;
END //
DELIMITER ;

-- Create event to automatically cleanup expired tokens daily
SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS cleanup_expired_tokens
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  CALL CleanupExpiredTokens();

-- =====================================================
-- 5. BACKUP PREPARATION
-- =====================================================

-- Create backup user with read-only access
CREATE USER IF NOT EXISTS 'todoapp_backup'@'localhost' IDENTIFIED BY 'REPLACE_WITH_BACKUP_PASSWORD';
GRANT SELECT, LOCK TABLES ON todoapp_db.* TO 'todoapp_backup'@'localhost';
FLUSH PRIVILEGES;

-- =====================================================
-- 6. MONITORING VIEWS
-- =====================================================

-- Create view for application monitoring
CREATE OR REPLACE VIEW app_stats AS
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM users WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as new_users_24h,
    (SELECT COUNT(*) FROM tasks) as total_tasks,
    (SELECT COUNT(*) FROM tasks WHERE status = 'PENDING') as pending_tasks,
    (SELECT COUNT(*) FROM tasks WHERE status = 'IN_PROGRESS') as in_progress_tasks,
    (SELECT COUNT(*) FROM tasks WHERE status = 'COMPLETED') as completed_tasks,
    (SELECT COUNT(*) FROM refresh_tokens WHERE expiresAt > NOW()) as active_sessions,
    (SELECT COUNT(*) FROM refresh_tokens WHERE expiresAt <= NOW()) as expired_sessions;

-- Create view for performance monitoring
CREATE OR REPLACE VIEW performance_stats AS
SELECT 
    table_name,
    table_rows,
    data_length,
    index_length,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables 
WHERE table_schema = 'todoapp_db'
ORDER BY (data_length + index_length) DESC;

-- =====================================================
-- 7. ANALYZE TABLES FOR OPTIMIZATION
-- =====================================================

ANALYZE TABLE users;
ANALYZE TABLE tasks;
ANALYZE TABLE refresh_tokens;

-- =====================================================
-- 8. SHOW OPTIMIZATION RESULTS
-- =====================================================

-- Show current indexes
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    CARDINALITY
FROM information_schema.statistics 
WHERE table_schema = 'todoapp_db'
ORDER BY TABLE_NAME, INDEX_NAME;

-- Show table sizes
SELECT * FROM performance_stats;

-- Show application statistics
SELECT * FROM app_stats;
