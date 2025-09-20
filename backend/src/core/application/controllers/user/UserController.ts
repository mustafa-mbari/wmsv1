import { Request, Response } from 'express';
import { Injectable, Inject } from '../../../../di/decorators';
import { BaseController } from '../base/BaseController';
import { CreateUserUseCase } from '../../useCases/user/CreateUserUseCase';
import { GetUserByIdUseCase } from '../../useCases/user/GetUserByIdUseCase';
import { UpdateUserUseCase } from '../../useCases/user/UpdateUserUseCase';
import { GetUsersWithPaginationUseCase } from '../../useCases/user/GetUsersWithPaginationUseCase';
import { HttpStatus } from '../../../utils/common/HttpStatus';

/**
 * User controller with clean architecture
 * Handles HTTP requests and delegates to use cases
 */
@Injectable()
export class UserController extends BaseController {
    constructor(
        @Inject('CreateUserUseCase') private createUserUseCase: CreateUserUseCase,
        @Inject('GetUserByIdUseCase') private getUserByIdUseCase: GetUserByIdUseCase,
        @Inject('UpdateUserUseCase') private updateUserUseCase: UpdateUserUseCase,
        @Inject('GetUsersWithPaginationUseCase') private getUsersWithPaginationUseCase: GetUsersWithPaginationUseCase
    ) {
        super();
    }

    /**
     * Create new user
     */
    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.createUserUseCase.execute({
                username: req.body.username,
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                phone: req.body.phone,
                address: req.body.address,
                password: req.body.password,
                isActive: req.body.isActive,
                createdBy: this.getCurrentUserId(req)
            });

            if (result.isFailure) {
                this.badRequest(res, result.error!);
                return;
            }

            const { user, message } = result.getValue();

            // Transform to response DTO
            const userDto = this.transformUserToDto(user);

            this.created(res, userDto, message);

        } catch (error) {
            this.handleError(res, error, 'Failed to create user');
        }
    }

    /**
     * Get user by ID
     */
    async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.getUserByIdUseCase.execute({
                userId: req.params.id,
                includeRoles: req.query.includeRoles === 'true',
                includePermissions: req.query.includePermissions === 'true'
            });

            if (result.isFailure) {
                if (result.error === 'User not found') {
                    this.notFound(res, result.error);
                } else {
                    this.badRequest(res, result.error!);
                }
                return;
            }

            const { user, message } = result.getValue();

            // Transform to response DTO
            const userDto = this.transformUserToDto(user);

            this.ok(res, userDto, message);

        } catch (error) {
            this.handleError(res, error, 'Failed to retrieve user');
        }
    }

    /**
     * Update user
     */
    async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.updateUserUseCase.execute({
                userId: req.params.id,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                phone: req.body.phone,
                address: req.body.address,
                birthDate: req.body.birthDate ? new Date(req.body.birthDate) : undefined,
                gender: req.body.gender,
                language: req.body.language,
                timeZone: req.body.timeZone,
                isActive: req.body.isActive,
                password: req.body.password,
                updatedBy: this.getCurrentUserId(req)
            });

            if (result.isFailure) {
                if (result.error === 'User not found') {
                    this.notFound(res, result.error);
                } else {
                    this.badRequest(res, result.error!);
                }
                return;
            }

            const { user, message } = result.getValue();

            // Transform to response DTO
            const userDto = this.transformUserToDto(user);

            this.ok(res, userDto, message);

        } catch (error) {
            this.handleError(res, error, 'Failed to update user');
        }
    }

    /**
     * Get users with pagination
     */
    async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.getUsersWithPaginationUseCase.execute({
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                search: req.query.search as string,
                isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
                isEmailVerified: req.query.isEmailVerified ? req.query.isEmailVerified === 'true' : undefined,
                roleId: req.query.roleId as string,
                createdAfter: req.query.createdAfter ? new Date(req.query.createdAfter as string) : undefined,
                createdBefore: req.query.createdBefore ? new Date(req.query.createdBefore as string) : undefined,
                sortBy: req.query.sortBy as any,
                sortOrder: req.query.sortOrder as any
            });

            if (result.isFailure) {
                this.badRequest(res, result.error!);
                return;
            }

            const { result: paginatedResult, message } = result.getValue();

            // Transform users to DTOs
            const usersDto = paginatedResult.data.map(user => this.transformUserToDto(user));

            const response = {
                users: usersDto,
                pagination: {
                    page: paginatedResult.pagination.page,
                    limit: paginatedResult.pagination.limit,
                    total: paginatedResult.pagination.total,
                    totalPages: paginatedResult.pagination.totalPages,
                    hasNextPage: paginatedResult.pagination.hasNextPage,
                    hasPrevPage: paginatedResult.pagination.hasPrevPage
                }
            };

            this.ok(res, response, message);

        } catch (error) {
            this.handleError(res, error, 'Failed to retrieve users');
        }
    }

    /**
     * Transform User entity to DTO for API response
     */
    private transformUserToDto(user: any): any {
        return {
            id: user.id.value,
            username: user.username.value,
            email: user.email.value,
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            phone: user.profile.phone,
            address: user.profile.address,
            birthDate: user.profile.birthDate?.toISOString() || null,
            gender: user.profile.gender,
            avatarUrl: user.profile.avatarUrl,
            language: user.profile.language,
            timeZone: user.profile.timeZone,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            emailVerifiedAt: user.emailVerifiedAt?.toISOString() || null,
            lastLoginAt: user.lastLoginAt?.toISOString() || null,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            fullName: user.getFullName(),
            displayName: user.getDisplayName()
        };
    }

    /**
     * Get current user ID from request (from auth middleware)
     */
    private getCurrentUserId(req: Request): string | undefined {
        // Assuming auth middleware sets user info in req.user
        return (req as any).user?.id;
    }
}