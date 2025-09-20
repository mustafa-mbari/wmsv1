import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger/logger';

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log incoming request
  logger.info('Incoming request', {
    source: 'middleware',
    method: 'requestLogger',
    httpMethod: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(body) {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      source: 'middleware',
      method: 'requestLogger',
      httpMethod: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
    return originalJson.call(this, body);
  };

  next();
};
