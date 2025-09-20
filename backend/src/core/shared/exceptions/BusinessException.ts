import { BaseException } from './BaseException';

/**
 * Exception thrown when business rules are violated
 */
export class BusinessException extends BaseException {
    constructor(message: string, code: string = 'BUSINESS_RULE_VIOLATION') {
        super(message, code, 400);
    }
}

/**
 * Exception thrown when a resource is not found
 */
export class NotFoundException extends BaseException {
    constructor(resource: string, identifier?: string | number) {
        const message = identifier
            ? `${resource} with identifier '${identifier}' was not found`
            : `${resource} was not found`;

        super(message, 'NOT_FOUND', 404);
    }
}

/**
 * Exception thrown when user is not authorized
 */
export class UnauthorizedException extends BaseException {
    constructor(message: string = 'Authentication required') {
        super(message, 'UNAUTHORIZED', 401);
    }
}

/**
 * Exception thrown when user lacks permissions
 */
export class ForbiddenException extends BaseException {
    constructor(message: string = 'Insufficient permissions') {
        super(message, 'FORBIDDEN', 403);
    }
}

/**
 * Exception thrown when there's a conflict (e.g., duplicate key)
 */
export class ConflictException extends BaseException {
    constructor(message: string, code: string = 'CONFLICT') {
        super(message, code, 409);
    }
}

/**
 * Exception thrown for rate limiting
 */
export class TooManyRequestsException extends BaseException {
    constructor(message: string = 'Too many requests') {
        super(message, 'TOO_MANY_REQUESTS', 429);
    }
}

/**
 * Exception thrown for external service errors
 */
export class ExternalServiceException extends BaseException {
    public readonly serviceName: string;

    constructor(serviceName: string, message: string) {
        super(`External service '${serviceName}' error: ${message}`, 'EXTERNAL_SERVICE_ERROR', 502);
        this.serviceName = serviceName;
    }

    toJSON() {
        return {
            ...super.toJSON(),
            serviceName: this.serviceName
        };
    }
}