/**
 * TEMPORARY BRIDGE FILE - For backward compatibility during migration
 * This file provides imports from old paths to maintain compatibility
 * Remove this file after migration is complete
 */

// Logger imports
export { default as logger } from './utils/logger/logger';

// Middleware imports
export { authenticateToken, requireAdmin, requireSuperAdmin } from './middleware/authMiddleware';
export { requestLogger } from './middleware/requestLogger';

// Prisma client import
export { default as prismaClient } from './utils/prismaClient';

// API Response utilities (from shared)
import { createApiResponse, HttpStatus } from '@my-app/shared';
export { createApiResponse, HttpStatus };

// Re-export new architecture components for testing
export { Container, container } from './di/Container';
export { Injectable, Inject } from './di/decorators';
export { BaseEntity, AuditableEntity } from './core/domain/entities/base';
export { BaseController } from './infrastructure/api/controllers/base';
export { Result, Either, Pagination } from './utils/common';
export * from './core/shared/exceptions';