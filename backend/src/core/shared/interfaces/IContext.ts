import { Request, Response } from 'express';

/**
 * Request context interface
 */
export interface IRequestContext {
    // User information
    userId?: number;
    userEmail?: string;
    userRoles?: string[];
    userPermissions?: string[];

    // Request information
    requestId: string;
    correlationId?: string;
    clientIp?: string;
    userAgent?: string;

    // Timing
    startTime: Date;

    // Express objects
    req: Request;
    res: Response;

    // Additional metadata
    metadata?: Record<string, any>;
}

/**
 * Application context interface
 */
export interface IApplicationContext {
    // Configuration
    config: any;

    // Services
    container: any;

    // Request context
    request?: IRequestContext;

    // Logging context
    logger: any;

    // Metrics context
    metrics?: any;
}

/**
 * Domain context interface
 */
export interface IDomainContext {
    // Current user performing the operation
    currentUserId?: number;

    // Tenant/organization context
    tenantId?: string;

    // Operation metadata
    operation: string;
    operationId: string;
    timestamp: Date;

    // Additional context data
    data?: Record<string, any>;
}