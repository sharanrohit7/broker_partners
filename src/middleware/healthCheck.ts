import { Request, Response } from 'express';

import { logHealthCheck } from '../core/monitoring';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime: number;
      error?: string;
    };
    memory: {
      status: 'healthy' | 'unhealthy';
      used: number;
      total: number;
      percentage: number;
    };
    disk: {
      status: 'healthy' | 'unhealthy';
      free: number;
      total: number;
      percentage: number;
    };
  };
}

export const healthCheck = async (req: Request, res: Response) => {
  const startTime = Date.now();
  const healthResult: HealthCheckResult = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: { status: 'unhealthy', responseTime: 0 },
      memory: { status: 'unhealthy', used: 0, total: 0, percentage: 0 },
      disk: { status: 'unhealthy', free: 0, total: 0, percentage: 0 }
    }
  };

  try {
    // Database health check
    const dbStartTime = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      healthResult.checks.database = {
        status: 'healthy',
        responseTime: Date.now() - dbStartTime
      };
    } catch (error) {
      healthResult.checks.database = {
        status: 'unhealthy',
        responseTime: Date.now() - dbStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      healthResult.status = 'unhealthy';
    }

    // Memory health check
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal + memUsage.external;
    const usedMemory = memUsage.heapUsed;
    const memoryPercentage = (usedMemory / totalMemory) * 100;

    healthResult.checks.memory = {
      status: memoryPercentage > 90 ? 'unhealthy' : 'healthy',
      used: Math.round(usedMemory / 1024 / 1024), // MB
      total: Math.round(totalMemory / 1024 / 1024), // MB
      percentage: Math.round(memoryPercentage)
    };

    if (memoryPercentage > 90) {
      healthResult.status = 'unhealthy';
    }

    // Disk health check (simplified)
    try {
      const fs = require('fs');
      const stats = fs.statSync('.');
      // This is a simplified check - in production, use a proper disk usage library
      healthResult.checks.disk = {
        status: 'healthy',
        free: 1000000, // Placeholder
        total: 1000000, // Placeholder
        percentage: 50 // Placeholder
      };
    } catch (error) {
      healthResult.checks.disk = {
        status: 'unhealthy',
        free: 0,
        total: 0,
        percentage: 100
      };
      healthResult.status = 'unhealthy';
    }

    // Log health check result
    logHealthCheck(healthResult.status, {
      responseTime: Date.now() - startTime,
      checks: healthResult.checks
    });

    // Return appropriate status code
    const statusCode = healthResult.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthResult);

  } catch (error) {
    healthResult.status = 'unhealthy';
    healthResult.checks.database.error = error instanceof Error ? error.message : 'Unknown error';
    
    logHealthCheck('unhealthy', {
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    });

    res.status(503).json(healthResult);
  }
};

// Detailed health check for monitoring systems
export const detailedHealthCheck = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Get system information
    const systemInfo = {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      pid: process.pid,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      loadAverage: require('os').loadavg(),
      timestamp: new Date().toISOString()
    };

    // Get database statistics
    const dbStats = await prisma.$queryRaw`
      SELECT 
        (SELECT COUNT(*) FROM brokers) as broker_count,
        (SELECT COUNT(*) FROM orders) as order_count,
        (SELECT COUNT(*) FROM request_logs) as log_count
    `;

    const response = {
      status: 'healthy',
      system: systemInfo,
      database: dbStats,
      responseTime: Date.now() - startTime
    };

    logHealthCheck('healthy', response);
    res.json(response);

  } catch (error) {
    const response = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime: Date.now() - startTime
    };

    logHealthCheck('unhealthy', response);
    res.status(503).json(response);
  }
};
