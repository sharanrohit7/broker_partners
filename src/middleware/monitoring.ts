import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { RequestWithContext } from './requestId';
import { logRequest, logError, morganStream } from '../core/monitoring';

// Morgan HTTP request logger middleware
export const httpLogger = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms',
  { stream: morganStream }
);

// Request timing middleware
export const requestTiming = (req: RequestWithContext, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: () => void) {
    const responseTime = Date.now() - startTime;
    
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    logRequest(req, res, responseTime);
    
    return originalEnd.call(this, chunk, encoding, cb);
  };
  
  next();
};

// Error logging middleware
export const errorLogging = (error: Error, req: RequestWithContext, res: Response, next: NextFunction) => {
  logError(error, req, {
    statusCode: res.statusCode,
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  next(error);
};

// Request body logging middleware (for debugging)
export const requestBodyLogging = (req: RequestWithContext, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'development' && req.body) {
    console.log(`[${req.context?.requestId}] Request Body:`, JSON.stringify(req.body, null, 2));
  }
  next();
};

// Response logging middleware (for debugging)
export const responseLogging = (req: RequestWithContext, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === 'development') {
    const originalSend = res.send;
    res.send = function(body: any) {
      console.log(`[${req.context?.requestId}] Response:`, JSON.stringify(body, null, 2));
      return originalSend.call(this, body);
    };
  }
  next();
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  next();
};

// Rate limiting headers
export const rateLimitHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Add rate limiting headers (you can implement actual rate limiting later)
  res.setHeader('X-RateLimit-Limit', '1000');
  res.setHeader('X-RateLimit-Remaining', '999');
  res.setHeader('X-RateLimit-Reset', new Date(Date.now() + 3600000).toISOString());
  
  next();
};
