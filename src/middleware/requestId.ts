import { Request, Response, NextFunction } from 'express';
import { Logger } from '../core/logger';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface RequestWithContext extends Request {
  context?: {
    requestId: string;
    userId: string;
    brokerId?: string;
    logger: Logger;
  };
}

export const requestIdMiddleware = (prisma: PrismaClient) => {
  return (req: RequestWithContext, res: Response, next: NextFunction) => {
    // Extract or generate request ID
    let requestId = req.headers['x-basktre-request-id'] as string;
    
    if (!requestId) {
      requestId = Logger.generateRequestId();
    }

    // Extract user ID from headers or JWT token (you'll need to implement JWT extraction)
    const userId = req.headers['x-user-id'] as string || 'anonymous';
    
    // Extract broker ID if present
    const brokerId = req.headers['x-broker-id'] as string;

    // Create context
    const context = Logger.createContext(userId, brokerId);
    context.requestId = requestId; // Use the request ID from header or generated one

    // Create logger instance
    const logger = new Logger(prisma, context);

    // Add context to request
    req.context = {
      requestId,
      userId,
      brokerId,
      logger
    };

    // Add request ID to response headers
    res.setHeader('x-basktre-request-id', requestId);

    // Log the incoming request
    logger.logRequest(
      req.method,
      req.path,
      req.headers as Record<string, any>,
      req.body,
      brokerId
    ).catch(err => {
      console.error('Failed to log request:', err);
    });

    next();
  };
};
