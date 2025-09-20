import { Request, Response } from 'express';
import { ApiResponse } from '../../../../core/shared/types/common.types';
import { Injectable } from '../../../../di/decorators';

export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    INTERNAL_SERVER_ERROR = 500
}

/**
 * Base controller class with common functionality
 */
export abstract class BaseController {
    protected req!: Request;
    protected res!: Response;

    /**
     * Create success response
     */
    protected success<T>(
        data?: T,
        message?: string,
        statusCode: number = HttpStatus.OK
    ): ApiResponse<T> {
        const response: ApiResponse<T> = {
            success: true,
            data,
            message,
            timestamp: new Date().toISOString()
        };

        this.res.status(statusCode).json(response);
        return response;
    }

    /**
     * Create error response
     */
    protected error(
        message: string,
        statusCode: number = HttpStatus.BAD_REQUEST,
        errors?: string[]
    ): ApiResponse {
        const response: ApiResponse = {
            success: false,
            message,
            errors,
            timestamp: new Date().toISOString()
        };

        this.res.status(statusCode).json(response);
        return response;
    }

    /**
     * Handle application errors
     */
    protected handleError(error: any): ApiResponse {
        console.error('Controller Error:', error);

        if (error.name === 'ValidationException') {
            return this.error(error.message, HttpStatus.BAD_REQUEST, error.errors);
        }

        if (error.name === 'NotFoundException') {
            return this.error(error.message, HttpStatus.NOT_FOUND);
        }

        if (error.name === 'UnauthorizedException') {
            return this.error(error.message, HttpStatus.UNAUTHORIZED);
        }

        if (error.name === 'ForbiddenException') {
            return this.error(error.message, HttpStatus.FORBIDDEN);
        }

        if (error.name === 'ConflictException') {
            return this.error(error.message, HttpStatus.CONFLICT);
        }

        // Default to internal server error
        return this.error(
            'An internal server error occurred',
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    /**
     * Get user ID from request (after authentication)
     */
    protected getUserId(): number | null {
        return (this.req as any).user?.id || null;
    }

    /**
     * Get pagination parameters from query
     */
    protected getPaginationParams() {
        const page = parseInt(this.req.query.page as string) || 1;
        const limit = Math.min(parseInt(this.req.query.limit as string) || 10, 100);
        const sortBy = this.req.query.sortBy as string;
        const sortOrder = (this.req.query.sortOrder as string) === 'desc' ? 'desc' : 'asc';

        return {
            page: Math.max(1, page),
            limit: Math.max(1, limit),
            sortBy,
            sortOrder
        };
    }

    /**
     * Get search parameter from query
     */
    protected getSearchParam(): string | undefined {
        return this.req.query.search as string;
    }

    /**
     * Validate required parameters
     */
    protected validateRequired(obj: any, fields: string[]): void {
        const missing = fields.filter(field =>
            obj[field] === undefined || obj[field] === null || obj[field] === ''
        );

        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
    }
}