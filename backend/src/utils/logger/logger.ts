import fs from 'fs';
import path from 'path';
import winston, { format, transports, Logger as WinstonLogger } from 'winston';
import { TransformableInfo } from 'logform';

const { combine, timestamp, printf, colorize, align, json, errors } = format;

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  HTTP = 'http',
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  SILLY = 'silly'
}

export interface LogMetadata {
  source?: string;
  method?: string;
  correlationId?: string;
  userId?: string;
  requestId?: string;
  [key: string]: any;
}

interface LogInfo extends TransformableInfo {
  source?: string;
  method?: string;
  correlationId?: string;
  userId?: string;
  requestId?: string;
}

export class Logger {
  private static instance: Logger;
  private winstonLogger!: WinstonLogger;
  private logsDir: string;
  private readonly logLevelEmojis = {
    error: '❌',
    warn: '⚠️',
    info: 'ℹ️',
    http: '🌐',
    verbose: '📝',
    debug: '🐛',
    silly: '🔍'
  };

  private readonly logLevelColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    verbose: 'cyan',
    debug: 'blue',
    silly: 'gray'
  };

  constructor(logsDirectory?: string) {
    // Determine logs directory
    this.logsDir = logsDirectory || path.resolve(process.cwd(), '..', 'shared', 'logs');
    
    // Ensure logs directory exists
    this.ensureLogsDirectory();
    
    // Initialize Winston logger
    this.initializeLogger();
  }

  public static getInstance(logsDirectory?: string): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(logsDirectory);
    }
    return Logger.instance;
  }

  private ensureLogsDirectory(): void {
    try {
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
        console.log(`📁 Created logs directory: ${this.logsDir}`);
      }
    } catch (error) {
      console.error('Failed to create logs directory:', error);
      // Fallback to local logs directory
      this.logsDir = path.resolve(process.cwd(), 'logs');
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
      }
    }
  }

  private attachMeta = format((info: LogInfo) => {
    const splat = info[Symbol.for('splat')] as unknown[];
    const meta = splat?.[0] as LogMetadata;
    if (meta && typeof meta === 'object') {
      Object.assign(info, meta);
    }
    return info;
  });

  private consoleFormat = printf((info: LogInfo) => {
    const { timestamp, level, message, source, method, correlationId, userId, requestId } = info;
    const emoji = this.logLevelEmojis[level as keyof typeof this.logLevelEmojis] || '';
    
    let sourceInfo = '';
    if (source) {
      sourceInfo = `[${source}${method ? `::${method}` : ''}]`;
    }
    
    let contextInfo = '';
    const contextParts: string[] = [];
    if (correlationId) contextParts.push(`CID:${correlationId}`);
    if (userId) contextParts.push(`UID:${userId}`);
    if (requestId) contextParts.push(`RID:${requestId}`);
    if (contextParts.length > 0) {
      contextInfo = ` {${contextParts.join(' | ')}}`;
    }

    return `${timestamp} ${emoji} [${level.toUpperCase()}] ${sourceInfo}${contextInfo}: ${message}`;
  });

  private fileFormat = printf((info: LogInfo) => {
    const { timestamp, level, message, source, method, correlationId, userId, requestId, ...meta } = info;
    
    let sourceInfo = '';
    if (source) {
      sourceInfo = `[${source}${method ? `::${method}` : ''}]`;
    }
    
    let contextInfo = '';
    const contextParts: string[] = [];
    if (correlationId) contextParts.push(`CID:${correlationId}`);
    if (userId) contextParts.push(`UID:${userId}`);
    if (requestId) contextParts.push(`RID:${requestId}`);
    if (contextParts.length > 0) {
      contextInfo = ` {${contextParts.join(' | ')}}`;
    }

    let metaStr = '';
    const relevantMeta = { ...meta };
    delete relevantMeta[Symbol.for('splat')];
    delete relevantMeta[Symbol.for('level')];
    delete relevantMeta[Symbol.for('message')];
    
    if (Object.keys(relevantMeta).length > 0) {
      metaStr = ` | ${JSON.stringify(relevantMeta)}`;
    }

    return `${timestamp} [${level.toUpperCase()}] ${sourceInfo}${contextInfo}: ${message}${metaStr}`;
  });

  private initializeLogger(): void {
    // Create transports with error handling
    const appFileTransport = new transports.File({
      filename: path.join(this.logsDir, 'app.log'),
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        errors({ stack: true }),
        this.attachMeta(),
        this.fileFormat
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    });

    const errorFileTransport = new transports.File({
      filename: path.join(this.logsDir, 'error.log'),
      level: LogLevel.ERROR,
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        errors({ stack: true }),
        this.attachMeta(),
        this.fileFormat
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    });

    const debugFileTransport = new transports.File({
      filename: path.join(this.logsDir, 'debug.log'),
      level: LogLevel.DEBUG,
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        errors({ stack: true }),
        this.attachMeta(),
        this.fileFormat
      ),
      maxsize: 5242880, // 5MB
      maxFiles: 3,
    });

    const consoleTransport = new transports.Console({
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        colorize({ all: false, level: true }),
        errors({ stack: true }),
        this.attachMeta(),
        this.consoleFormat
      ),
    });

    // Add error handlers
    [appFileTransport, errorFileTransport, debugFileTransport].forEach(transport => {
      transport.on('error', (err) => {
        console.error(`📝 Winston ${transport.filename} transport error:`, err);
      });
    });

    this.winstonLogger = winston.createLogger({
      level: process.env.LOG_LEVEL || LogLevel.DEBUG,
      format: combine(
        timestamp(),
        errors({ stack: true })
      ),
      transports: [
        appFileTransport,
        errorFileTransport,
        debugFileTransport,
        consoleTransport,
      ],
      exitOnError: false,
    });

    // Handle unhandled exceptions and rejections
    this.winstonLogger.exceptions.handle(
      new transports.File({
        filename: path.join(this.logsDir, 'exceptions.log'),
        format: combine(timestamp(), json()),
        maxsize: 5242880,
        maxFiles: 5,
      })
    );

    this.winstonLogger.rejections.handle(
      new transports.File({
        filename: path.join(this.logsDir, 'rejections.log'),
        format: combine(timestamp(), json()),
        maxsize: 5242880,
        maxFiles: 5,
      })
    );
  }

  // Logging methods with metadata support
  public error(message: string, meta?: LogMetadata): void {
    this.winstonLogger.error(message, meta);
  }

  public warn(message: string, meta?: LogMetadata): void {
    this.winstonLogger.warn(message, meta);
  }

  public info(message: string, meta?: LogMetadata): void {
    this.winstonLogger.info(message, meta);
  }

  public http(message: string, meta?: LogMetadata): void {
    this.winstonLogger.http(message, meta);
  }

  public verbose(message: string, meta?: LogMetadata): void {
    this.winstonLogger.verbose(message, meta);
  }

  public debug(message: string, meta?: LogMetadata): void {
    this.winstonLogger.debug(message, meta);
  }

  public silly(message: string, meta?: LogMetadata): void {
    this.winstonLogger.silly(message, meta);
  }

  // Convenience methods that replace console methods
  public log(message: string, meta?: LogMetadata): void {
    this.info(message, meta);
  }

  // Method to create a child logger with preset metadata
  public createChildLogger(defaultMeta: LogMetadata): ChildLogger {
    return new ChildLogger(this, defaultMeta);
  }

  // Method to set log level dynamically
  public setLevel(level: LogLevel): void {
    this.winstonLogger.level = level;
  }

  // Method to get current log level
  public getLevel(): string {
    return this.winstonLogger.level;
  }

  // Method to flush logs (useful for testing)
  public async flush(): Promise<void> {
    return new Promise((resolve) => {
      this.winstonLogger.on('finish', resolve);
      this.winstonLogger.end();
    });
  }

  // Get the Winston instance for advanced usage
  public getWinstonInstance(): WinstonLogger {
    return this.winstonLogger;
  }
}

// Child logger class for context-specific logging
export class ChildLogger {
  constructor(
    private parentLogger: Logger,
    private defaultMeta: LogMetadata
  ) {}

  private mergeMetadata(meta?: LogMetadata): LogMetadata {
    return { ...this.defaultMeta, ...meta };
  }

  public error(message: string, meta?: LogMetadata): void {
    this.parentLogger.error(message, this.mergeMetadata(meta));
  }

  public warn(message: string, meta?: LogMetadata): void {
    this.parentLogger.warn(message, this.mergeMetadata(meta));
  }

  public info(message: string, meta?: LogMetadata): void {
    this.parentLogger.info(message, this.mergeMetadata(meta));
  }

  public http(message: string, meta?: LogMetadata): void {
    this.parentLogger.http(message, this.mergeMetadata(meta));
  }

  public verbose(message: string, meta?: LogMetadata): void {
    this.parentLogger.verbose(message, this.mergeMetadata(meta));
  }

  public debug(message: string, meta?: LogMetadata): void {
    this.parentLogger.debug(message, this.mergeMetadata(meta));
  }

  public silly(message: string, meta?: LogMetadata): void {
    this.parentLogger.silly(message, this.mergeMetadata(meta));
  }

  public log(message: string, meta?: LogMetadata): void {
    this.parentLogger.info(message, this.mergeMetadata(meta));
  }
}

// Create and export singleton instance
const logger = Logger.getInstance();

// Export both the singleton instance and the class
export { logger };
export default logger;
