import { Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';
import { createApiResponse, HttpStatus } from '@my-app/shared';
import Joi from 'joi';

// Validation schema interface
export interface ValidationSchema {
  body?: Joi.Schema;
  query?: Joi.Schema;
  params?: Joi.Schema;
  headers?: Joi.Schema;
}

// Validation error interface
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Validation options interface
export interface ValidationOptions {
  abortEarly?: boolean;
  allowUnknown?: boolean;
  stripUnknown?: boolean;
  skipOnError?: boolean;
}

@injectable()
export class ValidationMiddleware {
  private readonly defaultOptions: ValidationOptions = {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true,
    skipOnError: false
  };

  /**
   * Validate request data against schema
   */
  validate = (schema: ValidationSchema, options?: ValidationOptions) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const validationOptions = { ...this.defaultOptions, ...options };
      const errors: ValidationError[] = [];

      try {
        // Validate request body
        if (schema.body && req.body) {
          const bodyResult = schema.body.validate(req.body, validationOptions);
          if (bodyResult.error) {
            errors.push(...this.formatJoiErrors(bodyResult.error, 'body'));
          } else if (validationOptions.stripUnknown) {
            req.body = bodyResult.value;
          }
        }

        // Validate query parameters
        if (schema.query && req.query) {
          const queryResult = schema.query.validate(req.query, validationOptions);
          if (queryResult.error) {
            errors.push(...this.formatJoiErrors(queryResult.error, 'query'));
          } else if (validationOptions.stripUnknown) {
            req.query = queryResult.value;
          }
        }

        // Validate URL parameters
        if (schema.params && req.params) {
          const paramsResult = schema.params.validate(req.params, validationOptions);
          if (paramsResult.error) {
            errors.push(...this.formatJoiErrors(paramsResult.error, 'params'));
          } else if (validationOptions.stripUnknown) {
            req.params = paramsResult.value;
          }
        }

        // Validate headers
        if (schema.headers && req.headers) {
          const headersResult = schema.headers.validate(req.headers, validationOptions);
          if (headersResult.error) {
            errors.push(...this.formatJoiErrors(headersResult.error, 'headers'));
          }
        }

        // Return validation errors if any
        if (errors.length > 0) {
          return res.status(HttpStatus.BAD_REQUEST).json(
            createApiResponse(false, null, 'Validation failed', {
              errors,
              timestamp: new Date().toISOString()
            })
          );
        }

        next();
      } catch (error) {
        console.error('Validation middleware error:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
          createApiResponse(false, null, 'Validation server error')
        );
      }
    };
  };

  /**
   * Validate pagination parameters
   */
  validatePagination = (maxLimit: number = 100) => {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(maxLimit).default(10),
      sort: Joi.string().optional(),
      order: Joi.string().valid('asc', 'desc').default('asc')
    });

    return this.validate({ query: schema });
  };

  /**
   * Validate file upload
   */
  validateFileUpload = (options: {
    required?: boolean;
    maxSize?: number;
    allowedTypes?: string[];
    maxFiles?: number;
  }) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { required = false, maxSize = 5 * 1024 * 1024, allowedTypes = [], maxFiles = 1 } = options;

      // Check if file is required
      if (required && (!req.files || Object.keys(req.files).length === 0)) {
        return res.status(HttpStatus.BAD_REQUEST).json(
          createApiResponse(false, null, 'File upload is required')
        );
      }

      // If no files and not required, continue
      if (!req.files || Object.keys(req.files).length === 0) {
        return next();
      }

      const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();

      // Check number of files
      if (files.length > maxFiles) {
        return res.status(HttpStatus.BAD_REQUEST).json(
          createApiResponse(false, null, `Maximum ${maxFiles} files allowed`)
        );
      }

      // Validate each file
      for (const file of files) {
        // Check file size
        if (file.size > maxSize) {
          return res.status(HttpStatus.BAD_REQUEST).json(
            createApiResponse(false, null, `File size exceeds maximum of ${maxSize} bytes`)
          );
        }

        // Check file type
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
          return res.status(HttpStatus.BAD_REQUEST).json(
            createApiResponse(false, null, `File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`)
          );
        }
      }

      next();
    };
  };

  /**
   * Sanitize input data
   */
  sanitize = (options: {
    trimStrings?: boolean;
    removeEmptyStrings?: boolean;
    normalizeEmail?: boolean;
  } = {}) => {
    const { trimStrings = true, removeEmptyStrings = true, normalizeEmail = true } = options;

    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        if (req.body) {
          req.body = this.sanitizeObject(req.body, { trimStrings, removeEmptyStrings, normalizeEmail });
        }

        if (req.query) {
          req.query = this.sanitizeObject(req.query, { trimStrings, removeEmptyStrings, normalizeEmail });
        }

        next();
      } catch (error) {
        console.error('Sanitization error:', error);
        next();
      }
    };
  };

  // Private helper methods
  private formatJoiErrors(error: Joi.ValidationError, location: string): ValidationError[] {
    return error.details.map(detail => ({
      field: `${location}.${detail.path.join('.')}`,
      message: detail.message,
      value: detail.context?.value
    }));
  }

  private sanitizeObject(obj: any, options: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, options));
    }

    const sanitized: any = {};

    for (const [key, value] of Object.entries(obj)) {
      let sanitizedValue = value;

      if (typeof value === 'string') {
        // Trim strings
        if (options.trimStrings) {
          sanitizedValue = value.trim();
        }

        // Remove empty strings
        if (options.removeEmptyStrings && sanitizedValue === '') {
          continue;
        }

        // Normalize email
        if (options.normalizeEmail && key.toLowerCase().includes('email')) {
          sanitizedValue = (sanitizedValue as string).toLowerCase();
        }
      } else if (typeof value === 'object') {
        sanitizedValue = this.sanitizeObject(value, options);
      }

      sanitized[key] = sanitizedValue;
    }

    return sanitized;
  }
}

// Common validation schemas
export const CommonSchemas = {
  id: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('asc')
  }),
  dateRange: Joi.object({
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso().min(Joi.ref('startDate'))
  })
};

// Factory functions
export const validate = (schema: ValidationSchema, options?: ValidationOptions) => {
  const middleware = new ValidationMiddleware();
  return middleware.validate(schema, options);
};

export const validatePagination = (maxLimit?: number) => {
  const middleware = new ValidationMiddleware();
  return middleware.validatePagination(maxLimit);
};

export const sanitizeInput = (options?: any) => {
  const middleware = new ValidationMiddleware();
  return middleware.sanitize(options);
};