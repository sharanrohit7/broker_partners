import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Request, Response } from 'express';
import { RequestWithContext } from '../middleware/requestId';

// Custom log format for cloud monitoring
const cloudLogFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, requestId, userId, brokerId, method, url, statusCode, responseTime, error, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      requestId,
      userId,
      brokerId,
      method,
      url,
      statusCode,
      responseTime,
      error: error ? {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      } : undefined,
      ...meta
    });
  })
);

// Create Winston logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: cloudLogFormat,
  defaultMeta: {
    service: 'basktre-trading-api',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File transport for all logs
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    }),
    
    // Error logs only
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      zippedArchive: true
    }),
    
    // Request logs only
    new DailyRotateFile({
      filename: 'logs/requests-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      maxSize: '20m',
      maxFiles: '7d',
      zippedArchive: true
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

// Add custom log levels for better categorization
(logger as any).addColors({
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
});

// Request logging function
export const logRequest = (req: RequestWithContext, res: Response, responseTime: number) => {
  const logData = {
    requestId: req.context?.requestId,
    userId: req.context?.userId,
    brokerId: req.context?.brokerId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    statusCode: res.statusCode,
    responseTime,
    contentLength: res.get('Content-Length'),
    referer: req.get('Referer')
  };

  // Log based on status code
  if (res.statusCode >= 500) {
    logger.error('Server Error', logData);
  } else if (res.statusCode >= 400) {
    logger.warn('Client Error', logData);
  } else {
    logger.http('Request Completed', logData);
  }
};

// Error logging function
export const logError = (error: Error, req: RequestWithContext, additionalData?: any) => {
  const logData = {
    requestId: req.context?.requestId,
    userId: req.context?.userId,
    brokerId: req.context?.brokerId,
    method: req.method,
    url: req.originalUrl,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    ...additionalData
  };

  logger.error('Request Error', logData);
};

// Performance metrics logging
export const logPerformance = (operation: string, duration: number, metadata?: any) => {
  logger.info('Performance Metric', {
    operation,
    duration,
    ...metadata
  });
};

// Business event logging
export const logBusinessEvent = (event: string, data: any, req?: RequestWithContext) => {
  logger.info('Business Event', {
    event,
    requestId: req?.context?.requestId,
    userId: req?.context?.userId,
    brokerId: req?.context?.brokerId,
    ...data
  });
};

// Health check logging
export const logHealthCheck = (status: 'healthy' | 'unhealthy', details?: any) => {
  logger.info('Health Check', {
    status,
    ...details
  });
};

// Database operation logging
export const logDatabaseOperation = (operation: string, table: string, duration: number, success: boolean, error?: Error) => {
  const level = success ? 'info' : 'error';
  logger.log(level, 'Database Operation', {
    operation,
    table,
    duration,
    success,
    error: error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : undefined
  });
};

// Broker API call logging
export const logBrokerApiCall = (brokerId: string, endpoint: string, method: string, statusCode: number, duration: number, error?: Error) => {
  const level = statusCode >= 400 ? 'error' : 'info';
  logger.log(level, 'Broker API Call', {
    brokerId,
    endpoint,
    method,
    statusCode,
    duration,
    error: error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : undefined
  });
};

// Security event logging
export const logSecurityEvent = (event: string, severity: 'low' | 'medium' | 'high' | 'critical', data: any) => {
  const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
  logger.log(level, 'Security Event', {
    event,
    severity,
    ...data
  });
};

// Custom stream for Morgan HTTP logger
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  }
};

// Export logger instance for direct use
export default logger;
