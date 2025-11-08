import prisma from '../../lib/prisma.js';
import { cacheService } from '../cache/cacheService.js';
import { logError, logInfo } from '../../lib/logger.js';

/**
 * Health Check Service
 *
 * Monitors the health status of all critical application dependencies
 * including database, cache, and external services.
 */

/**
 * Check database health
 */
async function checkDatabase() {
  const start = Date.now();
  try {
    // Simple query to verify database connectivity
    await prisma.$queryRaw`SELECT 1`;

    const duration = Date.now() - start;

    return {
      status: 'healthy',
      responseTime: duration,
      message: 'Database connection successful',
    };
  } catch (error) {
    logError('Database health check failed', error);
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      message: error.message,
      error: {
        type: 'DatabaseError',
        message: error.message,
      },
    };
  }
}

/**
 * Check Redis/Cache health
 */
async function checkCache() {
  const start = Date.now();
  try {
    // Test cache connectivity
    const testKey = 'health:check:test';
    const testValue = Date.now().toString();

    await cacheService.set(testKey, testValue, 10);
    const retrieved = await cacheService.get(testKey);

    if (retrieved !== testValue) {
      throw new Error('Cache read/write verification failed');
    }

    const duration = Date.now() - start;

    return {
      status: 'healthy',
      responseTime: duration,
      message: 'Cache connection successful',
    };
  } catch (error) {
    logError('Cache health check failed', error);
    return {
      status: 'unhealthy',
      responseTime: Date.now() - start,
      message: error.message,
      error: {
        type: 'CacheError',
        message: error.message,
      },
    };
  }
}

/**
 * Check application memory usage
 */
function checkMemory() {
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const heapUsagePercent = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);

  const status = heapUsagePercent > 90 ? 'unhealthy' : heapUsagePercent > 75 ? 'degraded' : 'healthy';

  return {
    status,
    heapUsed: `${heapUsedMB}MB`,
    heapTotal: `${heapTotalMB}MB`,
    heapUsagePercent: `${heapUsagePercent}%`,
    message: status === 'healthy'
      ? 'Memory usage is normal'
      : status === 'degraded'
      ? 'Memory usage is elevated'
      : 'Memory usage is critical',
  };
}

/**
 * Check system uptime
 */
function checkUptime() {
  const uptimeSeconds = process.uptime();
  const uptimeMinutes = Math.floor(uptimeSeconds / 60);
  const uptimeHours = Math.floor(uptimeMinutes / 60);
  const uptimeDays = Math.floor(uptimeHours / 24);

  return {
    status: 'healthy',
    uptime: {
      seconds: Math.round(uptimeSeconds),
      minutes: uptimeMinutes,
      hours: uptimeHours,
      days: uptimeDays,
      formatted: uptimeDays > 0
        ? `${uptimeDays}d ${uptimeHours % 24}h ${uptimeMinutes % 60}m`
        : uptimeHours > 0
        ? `${uptimeHours}h ${uptimeMinutes % 60}m`
        : `${uptimeMinutes}m ${Math.round(uptimeSeconds % 60)}s`,
    },
    message: 'Application is running',
  };
}

/**
 * Check environment configuration
 */
function checkEnvironment() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'REDIS_URL',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  const status = missingVars.length === 0 ? 'healthy' : 'unhealthy';

  return {
    status,
    nodeEnv: process.env.NODE_ENV || 'development',
    missingVariables: missingVars,
    message: status === 'healthy'
      ? 'All required environment variables are set'
      : `Missing required environment variables: ${missingVars.join(', ')}`,
  };
}

/**
 * Perform comprehensive health check
 */
export async function performHealthCheck(detailed = false) {
  const start = Date.now();

  try {
    // Run all health checks
    const [database, cache, memory, uptime, environment] = await Promise.all([
      checkDatabase(),
      checkCache(),
      Promise.resolve(checkMemory()),
      Promise.resolve(checkUptime()),
      Promise.resolve(checkEnvironment()),
    ]);

    // Determine overall status
    const checks = { database, cache, memory, environment };
    const statuses = Object.values(checks).map(check => check.status);

    const overallStatus = statuses.includes('unhealthy')
      ? 'unhealthy'
      : statuses.includes('degraded')
      ? 'degraded'
      : 'healthy';

    const totalDuration = Date.now() - start;

    const healthReport = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      duration: `${totalDuration}ms`,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: uptime.uptime,
      checks: detailed
        ? checks
        : {
            database: { status: database.status },
            cache: { status: cache.status },
            memory: { status: memory.status },
            environment: { status: environment.status },
          },
    };

    if (overallStatus === 'healthy') {
      logInfo('Health check passed', { duration: totalDuration });
    } else {
      logError('Health check failed', null, { status: overallStatus, healthReport });
    }

    return healthReport;
  } catch (error) {
    logError('Health check error', error);
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      duration: `${Date.now() - start}ms`,
      error: {
        message: error.message,
        type: 'HealthCheckError',
      },
    };
  }
}

/**
 * Simple liveness check (for Kubernetes/Docker)
 */
export async function livenessCheck() {
  return {
    status: 'alive',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Readiness check (for Kubernetes/Docker)
 */
export async function readinessCheck() {
  try {
    const database = await checkDatabase();

    if (database.status !== 'healthy') {
      return {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        reason: 'Database is not available',
      };
    }

    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      reason: error.message,
    };
  }
}

export default {
  performHealthCheck,
  livenessCheck,
  readinessCheck,
  checkDatabase,
  checkCache,
  checkMemory,
  checkUptime,
  checkEnvironment,
};
