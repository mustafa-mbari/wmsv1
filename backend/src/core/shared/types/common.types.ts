/**
 * Utility type for constructor functions
 */
export type Type<T = {}> = new (...args: any[]) => T;

/**
 * Utility type for class constructors with specific parameter types
 */
export type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Base ID type for entities
 */
export type EntityId = string | number;

/**
 * Audit fields interface
 */
export interface AuditFields {
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    createdBy?: number | null;
    updatedBy?: number | null;
    deletedBy?: number | null;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Pagination result
 */
export interface PaginationResult<T> {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNext: boolean;
        hasPrevious: boolean;
    };
}

/**
 * Filter base interface
 */
export interface BaseFilter {
    search?: string;
    isActive?: boolean;
    createdAfter?: Date;
    createdBefore?: Date;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
    timestamp: string;
}