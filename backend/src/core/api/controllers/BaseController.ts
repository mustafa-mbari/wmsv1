import { Request, Response } from 'express';
import { injectable } from 'inversify';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import { EntityId } from '../../domain/valueObjects/common/EntityId';

// Base response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
  meta?: {
    timestamp: string;
    correlationId?: string;
    pagination?: PaginationMeta;
    [key: string]: any;
  };
}

// Pagination metadata interface
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Query options interface
export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// Base use case result interface
export interface UseCaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: any[];
}

@injectable()
export abstract class BaseController {
  /**
   * Send successful response
   */
  protected ok<T>(res: Response, data?: T, message?: string): void {
    this.sendResponse(res, HttpStatus.OK, true, data, message);
  }

  /**
   * Send created response
   */
  protected created<T>(res: Response, data?: T, message?: string): void {
    this.sendResponse(res, HttpStatus.CREATED, true, data, message || 'Resource created successfully');
  }

  /**
   * Send no content response
   */
  protected noContent(res: Response): void {
    res.status(HttpStatus.NO_CONTENT).send();
  }

  /**
   * Send bad request response
   */
  protected badRequest(res: Response, message?: string, errors?: any): void {
    this.sendResponse(res, HttpStatus.BAD_REQUEST, false, null, message || 'Bad request', errors);
  }

  /**
   * Send unauthorized response
   */
  protected unauthorized(res: Response, message?: string): void {
    this.sendResponse(res, HttpStatus.UNAUTHORIZED, false, null, message || 'Unauthorized');
  }

  /**
   * Send forbidden response
   */
  protected forbidden(res: Response, message?: string): void {
    this.sendResponse(res, HttpStatus.FORBIDDEN, false, null, message || 'Forbidden');
  }

  /**
   * Send not found response
   */
  protected notFound(res: Response, message?: string): void {
    this.sendResponse(res, HttpStatus.NOT_FOUND, false, null, message || 'Resource not found');
  }

  /**
   * Send conflict response
   */
  protected conflict(res: Response, message?: string): void {
    this.sendResponse(res, HttpStatus.CONFLICT, false, null, message || 'Resource conflict');
  }

  /**
   * Send unprocessable entity response
   */
  protected unprocessableEntity(res: Response, message?: string, errors?: any): void {
    this.sendResponse(res, HttpStatus.UNPROCESSABLE_ENTITY, false, null, message || 'Validation failed', errors);
  }

  /**
   * Send too many requests response
   */
  protected tooManyRequests(res: Response, message?: string, retryAfter?: number): void {
    if (retryAfter) {
      res.setHeader('Retry-After', retryAfter);
    }
    this.sendResponse(res, HttpStatus.TOO_MANY_REQUESTS, false, null, message || 'Too many requests');
  }

  /**
   * Send internal server error response
   */
  protected internalServerError(res: Response, message?: string, error?: any): void {
    // Log error for debugging
    if (error) {
      console.error('Internal server error:', error);
    }

    this.sendResponse(
      res,
      HttpStatus.INTERNAL_SERVER_ERROR,
      false,
      null,
      message || 'Internal server error'
    );
  }

  /**
   * Send paginated response
   */
  protected okPaginated<T>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message?: string
  ): void {
    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    };

    const response: ApiResponse<T[]> = {
      success: true,
      data,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        pagination
      }
    };

    res.status(HttpStatus.OK).json(response);
  }

  /**
   * Handle use case result
   */
  protected handleUseCaseResult<T>(res: Response, result: UseCaseResult<T>): void {
    if (result.success) {
      this.ok(res, result.data);
    } else {
      if (result.errors) {
        this.badRequest(res, result.error, result.errors);
      } else {
        this.badRequest(res, result.error);
      }
    }
  }

  /**
   * Extract query options from request
   */
  protected getQueryOptions(req: Request): QueryOptions {
    const {
      page = 1,
      limit = 10,
      sort,
      order = 'asc',
      search,
      ...filters
    } = req.query;

    return {
      page: parseInt(page as string, 10),
      limit: Math.min(parseInt(limit as string, 10), 100), // Max 100 items per page
      sort: sort as string,
      order: order as 'asc' | 'desc',
      search: search as string,
      filters
    };
  }

  /**
   * Extract entity ID from request params
   */
  protected getEntityId(req: Request, paramName: string = 'id'): EntityId {
    const id = req.params[paramName];
    if (!id) {
      throw new Error(`Parameter '${paramName}' is required`);
    }
    return EntityId.fromString(id);
  }

  /**
   * Extract current user from request
   */
  protected getCurrentUser(req: Request): { id: EntityId; email: string; username: string; roles: string[] } {
    if (!req.user) {
      throw new Error('User not authenticated');
    }

    return {
      id: req.user.id,
      email: req.user.email,
      username: req.user.username,
      roles: req.user.roles
    };
  }

  /**
   * Check if user has required role
   */
  protected requireRole(req: Request, role: string): boolean {
    const user = this.getCurrentUser(req);
    return user.roles.some(userRole => userRole.toLowerCase() === role.toLowerCase());
  }

  /**
   * Validate required fields in request body
   */
  protected validateRequired(body: any, fields: string[]): void {
    const missingFields = fields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Async error handler wrapper
   */
  protected asyncHandler(fn: Function) {
    return (req: Request, res: Response, next: Function) => {
      Promise.resolve(fn(req, res, next)).catch((error) => {
        console.error('Controller error:', error);

        // Handle specific error types
        if (error.message.includes('not found')) {
          this.notFound(res, error.message);
        } else if (error.message.includes('unauthorized') || error.message.includes('not authenticated')) {
          this.unauthorized(res, error.message);
        } else if (error.message.includes('forbidden')) {
          this.forbidden(res, error.message);
        } else if (error.message.includes('required') || error.message.includes('validation')) {
          this.badRequest(res, error.message);
        } else {
          this.internalServerError(res, 'An unexpected error occurred', error);
        }
      });
    };
  }

  /**
   * Create standard CRUD operations
   */
  protected createCrudOperations<T>(useCase: any) {
    return {
      getAll: this.asyncHandler(async (req: Request, res: Response) => {
        const options = this.getQueryOptions(req);
        const result = await useCase.getAll(options);

        if (result.pagination) {
          this.okPaginated(
            res,
            result.data,
            result.pagination.total,
            result.pagination.page,
            result.pagination.limit
          );
        } else {
          this.ok(res, result.data);
        }
      }),

      getById: this.asyncHandler(async (req: Request, res: Response) => {
        const id = this.getEntityId(req);
        const result = await useCase.getById(id);

        if (!result.success) {
          this.notFound(res, result.error);
          return;
        }

        this.ok(res, result.data);
      }),

      create: this.asyncHandler(async (req: Request, res: Response) => {
        const user = this.getCurrentUser(req);
        const result = await useCase.create(req.body, user.id);

        if (!result.success) {
          this.badRequest(res, result.error, result.errors);
          return;
        }

        this.created(res, result.data);
      }),

      update: this.asyncHandler(async (req: Request, res: Response) => {
        const id = this.getEntityId(req);
        const user = this.getCurrentUser(req);
        const result = await useCase.update(id, req.body, user.id);

        if (!result.success) {
          if (result.error?.includes('not found')) {
            this.notFound(res, result.error);
          } else {
            this.badRequest(res, result.error, result.errors);
          }
          return;
        }

        this.ok(res, result.data);
      }),

      delete: this.asyncHandler(async (req: Request, res: Response) => {
        const id = this.getEntityId(req);
        const user = this.getCurrentUser(req);
        const result = await useCase.delete(id, user.id);

        if (!result.success) {
          if (result.error?.includes('not found')) {
            this.notFound(res, result.error);
          } else {
            this.badRequest(res, result.error);
          }
          return;
        }

        this.noContent(res);
      })
    };
  }

  // Private helper method
  private sendResponse<T>(
    res: Response,
    statusCode: number,
    success: boolean,
    data?: T,
    message?: string,
    errors?: any
  ): void {
    const response: ApiResponse<T> = {
      success,
      data,
      message,
      errors,
      meta: {
        timestamp: new Date().toISOString(),
        correlationId: (res.locals as any).correlationId
      }
    };

    res.status(statusCode).json(response);
  }
}