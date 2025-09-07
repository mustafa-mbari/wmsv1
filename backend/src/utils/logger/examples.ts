/**
 * Logger Usage Examples
 * 
 * This file demonstrates various ways to use the Logger class
 * across different scenarios in your TypeScript application.
 */

import logger, { Logger, LogLevel, LogMetadata } from './logger';

// === Basic Usage Examples ===

// 1. Simple logging (replaces all console.* calls)
logger.info('Application started successfully');
logger.error('Database connection failed');
logger.warn('Deprecated API endpoint used');
logger.debug('Processing user data', { userId: '12345' });

// 2. Logging with metadata
logger.info('User login attempt', {
  source: 'AuthController',
  method: 'login',
  userId: 'user123',
  correlationId: 'req-abc-123'
});

// 3. Logging errors with stack traces
try {
  throw new Error('Something went wrong');
} catch (error) {
  logger.error('Caught an error', {
    source: 'ExampleService',
    method: 'processData',
    error: error instanceof Error ? error.stack : error
  });
}

// === Advanced Usage Examples ===

// 4. Create a child logger with default metadata for a specific class/service
class UserService {
  private logger = logger.createChildLogger({
    source: 'UserService'
  });

  async createUser(userData: any) {
    this.logger.info('Creating new user', { 
      method: 'createUser',
      userId: userData.id 
    });
    
    try {
      // Simulate user creation logic
      this.logger.debug('Validating user data', { 
        method: 'createUser',
        dataFields: Object.keys(userData) 
      });
      
      // Success
      this.logger.info('User created successfully', {
        method: 'createUser',
        userId: userData.id,
        success: true
      });
      
    } catch (error) {
      this.logger.error('Failed to create user', {
        method: 'createUser',
        userId: userData.id,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  async getUserById(id: string) {
    this.logger.debug('Fetching user by ID', { 
      method: 'getUserById', 
      userId: id 
    });
    
    // Simulate database call
    const user = { id, name: 'John Doe' };
    
    this.logger.info('User retrieved', { 
      method: 'getUserById', 
      userId: id,
      found: !!user 
    });
    
    return user;
  }
}

// 5. Express middleware usage example
export function createRequestLogger() {
  return (req: any, res: any, next: any) => {
    const correlationId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const requestLogger = logger.createChildLogger({
      correlationId,
      requestId: correlationId
    });

    // Log incoming request
    requestLogger.http('Incoming request', {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Add logger to request object for use in route handlers
    req.logger = requestLogger;

    // Log response
    res.on('finish', () => {
      requestLogger.http('Request completed', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: Date.now() - req.startTime
      });
    });

    req.startTime = Date.now();
    next();
  };
}

// 6. Database service example with detailed logging
class DatabaseService {
  private logger = logger.createChildLogger({
    source: 'DatabaseService'
  });

  async query(sql: string, params?: any[], userId?: string) {
    const queryId = Math.random().toString(36).substr(2, 9);
    
    this.logger.debug('Executing database query', {
      method: 'query',
      queryId,
      sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
      paramCount: params?.length || 0,
      userId
    });

    const startTime = Date.now();
    
    try {
      // Simulate database query
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      const duration = Date.now() - startTime;
      this.logger.info('Query executed successfully', {
        method: 'query',
        queryId,
        duration,
        userId,
        performance: duration > 1000 ? 'slow' : 'normal'
      });
      
      return []; // Mock result
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Database query failed', {
        method: 'query',
        queryId,
        duration,
        userId,
        sql: sql.substring(0, 200),
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }
}

// 7. Background job/worker example
class BackgroundWorker {
  private logger = logger.createChildLogger({
    source: 'BackgroundWorker'
  });

  async processJob(jobId: string, jobData: any) {
    const jobLogger = logger.createChildLogger({
      jobId,
      jobType: jobData.type
    });

    jobLogger.info('Job processing started', {
      method: 'processJob',
      priority: jobData.priority
    });

    try {
      // Simulate job processing steps
      jobLogger.debug('Validating job data', { method: 'processJob' });
      await this.validateJobData(jobData, jobLogger);
      
      jobLogger.debug('Processing job logic', { method: 'processJob' });
      await this.executeJobLogic(jobData, jobLogger);
      
      jobLogger.info('Job completed successfully', {
        method: 'processJob',
        status: 'completed',
        processingTime: '2.5s'
      });
      
    } catch (error) {
      jobLogger.error('Job processing failed', {
        method: 'processJob',
        status: 'failed',
        error: error instanceof Error ? error.message : error,
        retry: true
      });
      
      // Re-queue the job
      jobLogger.warn('Job queued for retry', {
        method: 'processJob',
        retryCount: 1
      });
    }
  }

  private async validateJobData(jobData: any, logger: any) {
    logger.silly('Validating required fields', { method: 'validateJobData' });
    // Validation logic
  }

  private async executeJobLogic(jobData: any, logger: any) {
    logger.verbose('Executing job-specific logic', { method: 'executeJobLogic' });
    // Job execution logic
  }
}

// 8. Error handling and monitoring example
class ErrorHandler {
  private logger = logger.createChildLogger({
    source: 'ErrorHandler'
  });

  handleError(error: Error, context?: LogMetadata) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...context
    };

    // Log different types of errors appropriately
    if (error.name === 'ValidationError') {
      this.logger.warn('Validation error occurred', {
        method: 'handleError',
        type: 'validation',
        ...errorInfo
      });
    } else if (error.name === 'UnauthorizedError') {
      this.logger.warn('Unauthorized access attempt', {
        method: 'handleError',
        type: 'security',
        ...errorInfo
      });
    } else {
      this.logger.error('Unexpected error occurred', {
        method: 'handleError',
        type: 'system',
        ...errorInfo
      });
    }
  }
}

// 9. Performance monitoring example
class PerformanceMonitor {
  private logger = logger.createChildLogger({
    source: 'PerformanceMonitor'
  });

  async measureExecutionTime<T>(
    operation: string, 
    fn: () => Promise<T>, 
    context?: LogMetadata
  ): Promise<T> {
    const startTime = Date.now();
    const operationId = Math.random().toString(36).substr(2, 9);

    this.logger.debug('Operation started', {
      method: 'measureExecutionTime',
      operation,
      operationId,
      ...context
    });

    try {
      const result = await fn();
      const duration = Date.now() - startTime;

      this.logger.info('Operation completed', {
        method: 'measureExecutionTime',
        operation,
        operationId,
        duration,
        status: 'success',
        performance: this.categorizePerformance(duration),
        ...context
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error('Operation failed', {
        method: 'measureExecutionTime',
        operation,
        operationId,
        duration,
        status: 'error',
        error: error instanceof Error ? error.message : error,
        ...context
      });

      throw error;
    }
  }

  private categorizePerformance(duration: number): string {
    if (duration < 100) return 'excellent';
    if (duration < 500) return 'good';
    if (duration < 1000) return 'acceptable';
    if (duration < 3000) return 'slow';
    return 'critical';
  }
}

// 10. Example of changing log level dynamically
export function demonstrateLogLevels() {
  console.log('\n=== Demonstrating Different Log Levels ===');
  
  // Set to different levels to see what gets logged
  logger.setLevel(LogLevel.DEBUG);
  console.log('Current log level:', logger.getLevel());

  logger.error('This is an error message');     // Always visible
  logger.warn('This is a warning message');    // Visible at warn level and above
  logger.info('This is an info message');      // Visible at info level and above
  logger.http('This is an HTTP message');      // Visible at http level and above
  logger.verbose('This is a verbose message'); // Visible at verbose level and above
  logger.debug('This is a debug message');     // Visible at debug level and above
  logger.silly('This is a silly message');     // Only visible at silly level

  // Change log level
  logger.setLevel(LogLevel.WARN);
  console.log('\nChanged log level to WARN - only errors and warnings will show:');
  
  logger.error('Error: still visible');
  logger.warn('Warning: still visible');
  logger.info('Info: not visible anymore');
  logger.debug('Debug: not visible anymore');
}

// Export examples for use in other files
export {
  UserService,
  DatabaseService,
  BackgroundWorker,
  ErrorHandler,
  PerformanceMonitor
};