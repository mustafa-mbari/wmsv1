import { Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';

// Request context interface
export interface RequestContext {
  correlationId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  userId?: string;
  userAgent?: string;
  ip: string;
  method: string;
  url: string;
  statusCode?: number;
  contentLength?: number;
  error?: any;
}

// Logger interface for dependency injection
export interface ILogger {
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, context?: any): void;
  debug(message: string, context?: any): void;
}

// Enhanced request logging options
export interface RequestLoggerOptions {
  excludePaths?: string[];
  excludeHealthCheck?: boolean;
  logRequestBody?: boolean;
  logResponseBody?: boolean;
  sensitiveHeaders?: string[];
  maxBodySize?: number;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

@injectable()
export class EnhancedRequestLogger {
  private readonly defaultOptions: RequestLoggerOptions = {
    excludePaths: ['/health', '/metrics', '/favicon.ico'],
    excludeHealthCheck: true,
    logRequestBody: false,
    logResponseBody: false,
    sensitiveHeaders: ['authorization', 'cookie', 'x-api-key'],
    maxBodySize: 1024 * 10, // 10KB
    logLevel: 'info'
  };

  constructor(
    private logger: ILogger,
    private options: RequestLoggerOptions = {}
  ) {
    this.options = { ...this.defaultOptions, ...options };
  }

  /**
   * Main request logging middleware
   */
  middleware = (req: Request, res: Response, next: NextFunction): void => {
    // Skip logging for excluded paths
    if (this.shouldSkipLogging(req)) {
      return next();
    }

    const context = this.createRequestContext(req);

    // Add correlation ID to request
    req.correlationId = context.correlationId;

    // Set response headers
    res.setHeader('X-Correlation-ID', context.correlationId);
    res.setHeader('X-Request-Start', context.startTime);

    // Log incoming request
    this.logIncomingRequest(req, context);

    // Capture response
    this.captureResponse(req, res, context);

    next();
  };

  /**
   * Error logging middleware
   */
  errorMiddleware = (error: Error, req: Request, res: Response, next: NextFunction): void => {
    const context: RequestContext = {
      correlationId: req.correlationId || uuidv4(),
      startTime: Date.now(),
      userId: req.user?.id.value,
      userAgent: req.get('User-Agent'),
      ip: this.getClientIp(req),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    };

    this.logger.error('Request error', {
      ...context,
      source: 'requestLogger',
      type: 'error'
    });

    next(error);
  };

  /**
   * Security logging middleware
   */
  securityMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    // Log suspicious activities
    const suspiciousPatterns = [
      /\.\./,           // Path traversal
      /<script/i,       // XSS attempts
      /union.*select/i, // SQL injection
      /\{.*\}/          // JSON injection attempts
    ];

    const url = req.originalUrl;
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(url));

    if (isSuspicious) {
      this.logger.warn('Suspicious request detected', {
        correlationId: req.correlationId,
        method: req.method,
        url: req.originalUrl,
        ip: this.getClientIp(req),
        userAgent: req.get('User-Agent'),
        type: 'security'
      });
    }

    // Log failed authentication attempts
    if (req.path.includes('/auth') && req.method === 'POST') {
      const originalJson = res.json;
      res.json = (body: any) => {
        if (res.statusCode === 401 || res.statusCode === 403) {
          this.logger.warn('Authentication failure', {
            correlationId: req.correlationId,
            method: req.method,
            url: req.originalUrl,
            ip: this.getClientIp(req),
            statusCode: res.statusCode,
            type: 'auth_failure'
          });
        }
        return originalJson.call(res, body);
      };
    }

    next();
  };

  /**
   * Performance monitoring middleware
   */
  performanceMiddleware = (threshold: number = 1000) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const startTime = Date.now();

      const originalSend = res.send;
      res.send = function(body: any) {
        const duration = Date.now() - startTime;

        if (duration > threshold) {
          const logger = (this as any).logger;
          if (logger) {
            logger.warn('Slow request detected', {
              correlationId: req.correlationId,
              method: req.method,
              url: req.originalUrl,
              duration: `${duration}ms`,
              threshold: `${threshold}ms`,
              type: 'performance'
            });
          }
        }

        return originalSend.call(this, body);
      };

      next();
    };
  };

  // Private helper methods
  private shouldSkipLogging(req: Request): boolean {
    const { excludePaths, excludeHealthCheck } = this.options;

    if (excludeHealthCheck && this.isHealthCheck(req)) {
      return true;
    }

    if (excludePaths && excludePaths.some(path => req.path.includes(path))) {
      return true;
    }

    return false;
  }

  private isHealthCheck(req: Request): boolean {
    return req.path === '/health' ||
           req.path === '/healthz' ||
           req.path === '/ping' ||
           req.path === '/metrics';
  }

  private createRequestContext(req: Request): RequestContext {
    return {
      correlationId: req.correlationId || uuidv4(),
      startTime: Date.now(),
      userId: req.user?.id.value,
      userAgent: req.get('User-Agent'),
      ip: this.getClientIp(req),
      method: req.method,
      url: req.originalUrl
    };
  }

  private getClientIp(req: Request): string {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
           req.headers['x-real-ip'] as string ||
           req.connection.remoteAddress ||
           req.socket.remoteAddress ||
           req.ip ||
           'unknown';
  }

  private logIncomingRequest(req: Request, context: RequestContext): void {
    const logData = {
      ...context,
      headers: this.sanitizeHeaders(req.headers),
      query: req.query,
      source: 'requestLogger',
      type: 'incoming'
    };

    // Add request body if enabled and appropriate
    if (this.options.logRequestBody && this.shouldLogBody(req)) {
      logData.body = this.sanitizeBody(req.body);
    }

    this.logger.info('Incoming request', logData);
  }

  private captureResponse(req: Request, res: Response, context: RequestContext): void {
    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function(body: any) {
      context.endTime = Date.now();
      context.duration = context.endTime - context.startTime;
      context.statusCode = res.statusCode;
      context.contentLength = Buffer.byteLength(body);

      const logger = (this as any).logger || console;

      const logData = {
        ...context,
        source: 'requestLogger',
        type: 'outgoing'
      };

      // Add response body if enabled
      if ((this as any).options?.logResponseBody && (this as any).shouldLogResponseBody(res)) {
        logData.responseBody = body;
      }

      // Choose log level based on status code
      if (res.statusCode >= 500) {
        logger.error('Request completed with server error', logData);
      } else if (res.statusCode >= 400) {
        logger.warn('Request completed with client error', logData);
      } else {
        logger.info('Request completed successfully', logData);
      }

      return originalSend.call(this, body);
    };

    res.json = function(body: any) {
      return res.send(JSON.stringify(body));
    };
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };

    this.options.sensitiveHeaders?.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private shouldLogBody(req: Request): boolean {
    const contentLength = parseInt(req.get('content-length') || '0');
    const maxSize = this.options.maxBodySize || 1024 * 10;

    return contentLength <= maxSize &&
           req.get('content-type')?.includes('application/json');
  }

  private shouldLogResponseBody(res: Response): boolean {
    return res.get('content-type')?.includes('application/json') || false;
  }
}

// Factory function for creating configured middleware
export const createRequestLogger = (
  logger: ILogger,
  options?: RequestLoggerOptions
): EnhancedRequestLogger => {
  return new EnhancedRequestLogger(logger, options);
};

// Convenience middleware exports
export const requestLogger = (logger: ILogger, options?: RequestLoggerOptions) => {
  const enhancedLogger = new EnhancedRequestLogger(logger, options);
  return enhancedLogger.middleware;
};

export const errorLogger = (logger: ILogger) => {
  const enhancedLogger = new EnhancedRequestLogger(logger);
  return enhancedLogger.errorMiddleware;
};

export const securityLogger = (logger: ILogger) => {
  const enhancedLogger = new EnhancedRequestLogger(logger);
  return enhancedLogger.securityMiddleware;
};

export const performanceLogger = (logger: ILogger, threshold?: number) => {
  const enhancedLogger = new EnhancedRequestLogger(logger);
  return enhancedLogger.performanceMiddleware(threshold);
};