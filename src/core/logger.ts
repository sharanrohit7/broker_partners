import { v4 as uuidv4 } from 'uuid';
import { PrismaClient } from '@prisma/client';
import { LogLevelType, RequestContext } from '../types';
import { logger as winstonLogger } from './monitoring';

export class Logger {
  private prisma: PrismaClient;
  private requestId: string;
  private context: RequestContext;

  constructor(prisma: PrismaClient, context: RequestContext) {
    this.prisma = prisma;
    this.context = context;
    this.requestId = context.requestId;
  }

  static generateRequestId(): string {
    return uuidv4();
  }

  static createContext(userId: string, brokerId?: string): RequestContext {
    return {
      requestId: Logger.generateRequestId(),
      userId,
      brokerId,
      timestamp: new Date()
    };
  }

  async info(message: string, data?: any): Promise<void> {
    await this.log('info', message, data);
  }

  async error(message: string, error?: any, data?: any): Promise<void> {
    await this.log('error', message, { error, ...data });
  }

  async warn(message: string, data?: any): Promise<void> {
    await this.log('warn', message, data);
  }

  async debug(message: string, data?: any): Promise<void> {
    await this.log('debug', message, data);
  }

  async logRequest(
    method: string,
    endpoint: string,
    headers?: Record<string, any>,
    payload?: any,
    brokerId?: string,
    orderId?: string
  ): Promise<void> {
    try {
      await this.prisma.requestLog.create({
        data: {
          requestId: this.requestId,
          brokerId: brokerId || null,
          orderId: orderId || null,
          method,
          endpoint,
          headers,
          payload,
          level: 'info',
          message: `Request: ${method} ${endpoint}`
        }
      });
    } catch (error) {
      console.error('Failed to log request to database:', error);
    }

    // Also log to Winston logger
    const logData = {
      requestId: this.requestId,
      brokerId,
      orderId,
      method,
      endpoint,
      headers,
      payload,
      level: 'info',
      message: `Request: ${method} ${endpoint}`,
      timestamp: new Date().toISOString()
    };

    winstonLogger.http('Request', logData);
  }

  async logResponse(
    statusCode: number,
    response: any,
    responseTime: number,
    brokerId?: string,
    orderId?: string
  ): Promise<void> {
    const level = statusCode >= 400 ? 'error' : 'info';
    
    try {
      await this.prisma.requestLog.create({
        data: {
          requestId: this.requestId,
          brokerId: brokerId || null,
          orderId: orderId || null,
          method: 'RESPONSE',
          endpoint: 'internal',
          statusCode,
          response,
          responseTime,
          level,
          message: `Response: ${statusCode}`
        }
      });
    } catch (error) {
      console.error('Failed to log response to database:', error);
    }

    // Also log to Winston logger
    const logData = {
      requestId: this.requestId,
      brokerId,
      orderId,
      statusCode,
      response,
      responseTime,
      level,
      message: `Response: ${statusCode}`,
      timestamp: new Date().toISOString()
    };

    winstonLogger.log(level, 'Response', logData);
  }

  private async log(level: LogLevelType, message: string, data?: any): Promise<void> {
    try {
      await this.prisma.requestLog.create({
        data: {
          requestId: this.requestId,
          brokerId: this.context.brokerId || null,
          orderId: null,
          method: 'LOG',
          endpoint: 'internal',
          level,
          message,
          payload: data,
          error: level === 'error' ? data : null
        }
      });

      // Also log to Winston logger
      const logData = {
        requestId: this.requestId,
        brokerId: this.context.brokerId,
        method: 'LOG',
        endpoint: 'internal',
        level,
        message,
        payload: data,
        error: level === 'error' ? data : null,
        timestamp: new Date().toISOString()
      };

      winstonLogger.log(level, message, logData);

      // Also log to console for development
      if (process.env.NODE_ENV === 'development') {
        const logMessage = `[${this.requestId}] ${level.toUpperCase()}: ${message}`;
        const logDataStr = data ? `\nData: ${JSON.stringify(data, null, 2)}` : '';
        
        switch (level) {
          case 'error':
            console.error(logMessage, logDataStr);
            break;
          case 'warn':
            console.warn(logMessage, logDataStr);
            break;
          case 'debug':
            console.debug(logMessage, logDataStr);
            break;
          default:
            console.log(logMessage, logDataStr);
        }
      }
    } catch (error) {
      console.error('Failed to write log to database:', error);
    }
  }

  getRequestId(): string {
    return this.requestId;
  }

  getContext(): RequestContext {
    return this.context;
  }
}
