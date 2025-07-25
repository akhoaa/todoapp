/**
 * Health Check Controller for Production Monitoring
 * Provides comprehensive system health and readiness checks
 */

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config/config.service';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheck;
    memory: HealthCheck;
    disk?: HealthCheck;
  };
}

interface HealthCheck {
  status: 'pass' | 'fail' | 'warn';
  responseTime?: number;
  details?: any;
  error?: string;
}

interface ReadinessStatus {
  status: 'ready' | 'not_ready';
  timestamp: string;
  checks: {
    database: HealthCheck;
    dependencies: HealthCheck;
  };
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async getHealth(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check with system metrics' })
  @ApiResponse({ status: 200, description: 'Detailed health information' })
  async getDetailedHealth(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    // Database health check
    const databaseCheck = await this.checkDatabase();
    
    // Memory health check
    const memoryCheck = this.checkMemory();
    
    // Determine overall status
    const checks = { database: databaseCheck, memory: memoryCheck };
    const overallStatus = this.determineOverallStatus(checks);
    
    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: this.configService.api.version,
      environment: this.configService.nodeEnv,
      checks,
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check for load balancers' })
  @ApiResponse({ status: 200, description: 'Service is ready to accept traffic' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async getReadiness(): Promise<ReadinessStatus> {
    // Database readiness check
    const databaseCheck = await this.checkDatabase();
    
    // Dependencies readiness check
    const dependenciesCheck = await this.checkDependencies();
    
    const checks = { database: databaseCheck, dependencies: dependenciesCheck };
    const isReady = Object.values(checks).every(check => check.status === 'pass');
    
    return {
      status: isReady ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check for container orchestration' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  async getLiveness(): Promise<{ status: string; timestamp: string }> {
    // Simple liveness check - if this endpoint responds, the service is alive
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Application metrics for monitoring' })
  @ApiResponse({ status: 200, description: 'Application metrics' })
  async getMetrics() {
    const memoryUsage = process.memoryUsage();
    
    // Get database statistics
    const dbStats = await this.getDatabaseStats();
    
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      },
      cpu: {
        usage: process.cpuUsage(),
      },
      database: dbStats,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };
  }

  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Simple database connectivity check
      await this.prisma.$queryRaw`SELECT 1`;
      
      const responseTime = Date.now() - startTime;
      
      // Check if response time is acceptable
      if (responseTime > 1000) {
        return {
          status: 'warn',
          responseTime,
          details: 'Database response time is slow',
        };
      }
      
      return {
        status: 'pass',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'fail',
        responseTime: Date.now() - startTime,
        error: error.message,
      };
    }
  }

  private checkMemory(): HealthCheck {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
    const memoryUsagePercent = (heapUsedMB / heapTotalMB) * 100;
    
    if (memoryUsagePercent > 90) {
      return {
        status: 'fail',
        details: {
          heapUsedMB: Math.round(heapUsedMB),
          heapTotalMB: Math.round(heapTotalMB),
          usagePercent: Math.round(memoryUsagePercent),
        },
        error: 'Memory usage is critically high',
      };
    } else if (memoryUsagePercent > 75) {
      return {
        status: 'warn',
        details: {
          heapUsedMB: Math.round(heapUsedMB),
          heapTotalMB: Math.round(heapTotalMB),
          usagePercent: Math.round(memoryUsagePercent),
        },
      };
    }
    
    return {
      status: 'pass',
      details: {
        heapUsedMB: Math.round(heapUsedMB),
        heapTotalMB: Math.round(heapTotalMB),
        usagePercent: Math.round(memoryUsagePercent),
      },
    };
  }

  private async checkDependencies(): Promise<HealthCheck> {
    try {
      // Check if all required tables exist
      const tables = await this.prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
      `;
      
      const requiredTables = ['users', 'tasks', 'refresh_tokens'];
      const existingTables = (tables as any[]).map(t => t.table_name);
      const missingTables = requiredTables.filter(table => !existingTables.includes(table));
      
      if (missingTables.length > 0) {
        return {
          status: 'fail',
          error: `Missing required tables: ${missingTables.join(', ')}`,
        };
      }
      
      return {
        status: 'pass',
        details: {
          tablesFound: existingTables.length,
          requiredTables: requiredTables.length,
        },
      };
    } catch (error) {
      return {
        status: 'fail',
        error: error.message,
      };
    }
  }

  private async getDatabaseStats() {
    try {
      const [userCount, taskCount, activeSessionCount] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.task.count(),
        this.prisma.refreshToken.count({
          where: {
            expiresAt: {
              gt: new Date(),
            },
          },
        }),
      ]);
      
      return {
        users: userCount,
        tasks: taskCount,
        activeSessions: activeSessionCount,
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }

  private determineOverallStatus(checks: Record<string, HealthCheck>): 'healthy' | 'unhealthy' | 'degraded' {
    const statuses = Object.values(checks).map(check => check.status);
    
    if (statuses.includes('fail')) {
      return 'unhealthy';
    } else if (statuses.includes('warn')) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }
}
