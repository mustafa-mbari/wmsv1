import { Injectable, Inject } from '../../../../di/decorators';
import { IUserRepository, UserSearchCriteria, UserSortOptions } from '../../../domain/repositories/user/IUserRepository';
import { User } from '../../../domain/entities/user/User';
import { EntityId } from '../../../domain/valueObjects/common/EntityId';
import { PaginationParams, PaginatedResult } from '../../../domain/valueObjects/common/Pagination';
import { Result } from '../../../utils/common/Result';
import { IUseCase } from '../base/IUseCase';

export interface GetUsersWithPaginationRequest {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
    roleId?: string;
    createdAfter?: Date;
    createdBefore?: Date;
    sortBy?: 'username' | 'email' | 'firstName' | 'lastName' | 'createdAt' | 'updatedAt' | 'lastLoginAt';
    sortOrder?: 'asc' | 'desc';
}

export interface GetUsersWithPaginationResponse {
    result: PaginatedResult<User>;
    message: string;
}

/**
 * Use case for retrieving users with pagination and filtering
 */
@Injectable()
export class GetUsersWithPaginationUseCase implements IUseCase<GetUsersWithPaginationRequest, GetUsersWithPaginationResponse> {
    constructor(
        @Inject('IUserRepository') private userRepository: IUserRepository
    ) {}

    async execute(request: GetUsersWithPaginationRequest): Promise<Result<GetUsersWithPaginationResponse>> {
        try {
            // Validate input
            const validationResult = this.validateRequest(request);
            if (validationResult.isFailure) {
                return Result.fail(validationResult.error!);
            }

            // Build search criteria
            const criteria: UserSearchCriteria = {
                search: request.search?.trim(),
                isActive: request.isActive,
                isEmailVerified: request.isEmailVerified,
                roleId: request.roleId ? EntityId.create(request.roleId) : undefined,
                createdAfter: request.createdAfter,
                createdBefore: request.createdBefore
            };

            // Build pagination parameters
            const pagination: PaginationParams = {
                page: request.page || 1,
                limit: Math.min(request.limit || 10, 100), // Max 100 items per page
                offset: ((request.page || 1) - 1) * (request.limit || 10)
            };

            // Build sort options
            const sort: UserSortOptions = {
                field: request.sortBy || 'createdAt',
                direction: request.sortOrder || 'desc'
            };

            // Execute query
            const result = await this.userRepository.findWithPagination(criteria, pagination, sort);

            return Result.ok({
                result,
                message: `Retrieved ${result.data.length} users successfully`
            });

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            return Result.fail(`Failed to retrieve users: ${message}`);
        }
    }

    private validateRequest(request: GetUsersWithPaginationRequest): Result<void> {
        const errors: string[] = [];

        // Pagination validation
        if (request.page !== undefined && request.page < 1) {
            errors.push('Page number must be greater than 0');
        }

        if (request.limit !== undefined && (request.limit < 1 || request.limit > 100)) {
            errors.push('Limit must be between 1 and 100');
        }

        // Sort field validation
        if (request.sortBy) {
            const validSortFields = ['username', 'email', 'firstName', 'lastName', 'createdAt', 'updatedAt', 'lastLoginAt'];
            if (!validSortFields.includes(request.sortBy)) {
                errors.push(`Sort field must be one of: ${validSortFields.join(', ')}`);
            }
        }

        // Sort order validation
        if (request.sortOrder && !['asc', 'desc'].includes(request.sortOrder)) {
            errors.push('Sort order must be either "asc" or "desc"');
        }

        // Role ID validation
        if (request.roleId) {
            try {
                EntityId.create(request.roleId);
            } catch (error) {
                errors.push('Invalid role ID format');
            }
        }

        // Date validation
        if (request.createdAfter && request.createdBefore) {
            if (request.createdAfter >= request.createdBefore) {
                errors.push('createdAfter must be before createdBefore');
            }
        }

        if (request.createdAfter && request.createdAfter > new Date()) {
            errors.push('createdAfter cannot be in the future');
        }

        if (errors.length > 0) {
            return Result.fail(errors.join(', '));
        }

        return Result.ok();
    }
}