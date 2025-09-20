import { PaginationParams, PaginationResult } from '../../core/shared/types/common.types';

/**
 * Utility class for handling pagination logic
 */
export class Pagination {
    /**
     * Calculate pagination metadata
     */
    static calculatePagination(
        totalItems: number,
        currentPage: number,
        itemsPerPage: number
    ) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const hasNext = currentPage < totalPages;
        const hasPrevious = currentPage > 1;

        return {
            currentPage,
            totalPages,
            totalItems,
            itemsPerPage,
            hasNext,
            hasPrevious
        };
    }

    /**
     * Calculate offset for database queries
     */
    static calculateOffset(page: number, limit: number): number {
        return (page - 1) * limit;
    }

    /**
     * Validate pagination parameters
     */
    static validateParams(params: PaginationParams): PaginationParams {
        const page = Math.max(1, params.page || 1);
        const limit = Math.min(Math.max(1, params.limit || 10), 100); // Max 100 items per page

        return {
            ...params,
            page,
            limit
        };
    }

    /**
     * Create a paginated result
     */
    static createResult<T>(
        data: T[],
        totalItems: number,
        params: PaginationParams
    ): PaginationResult<T> {
        const validatedParams = this.validateParams(params);
        const pagination = this.calculatePagination(
            totalItems,
            validatedParams.page!,
            validatedParams.limit!
        );

        return {
            data,
            pagination
        };
    }

    /**
     * Extract pagination info from database result
     */
    static fromDatabaseResult<T>(
        items: T[],
        totalCount: number,
        page: number = 1,
        limit: number = 10
    ): PaginationResult<T> {
        return this.createResult(items, totalCount, { page, limit });
    }

    /**
     * Get default pagination parameters
     */
    static getDefaults(): Required<Pick<PaginationParams, 'page' | 'limit'>> {
        return {
            page: 1,
            limit: 10
        };
    }
}

/**
 * Helper function to create paginated results
 */
export function paginate<T>(
    data: T[],
    totalItems: number,
    params: PaginationParams
): PaginationResult<T> {
    return Pagination.createResult(data, totalItems, params);
}