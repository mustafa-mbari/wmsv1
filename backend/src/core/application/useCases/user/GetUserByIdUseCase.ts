import { Injectable, Inject } from '../../../../di/decorators';
import { IUserRepository } from '../../../domain/repositories/user/IUserRepository';
import { User } from '../../../domain/entities/user/User';
import { EntityId } from '../../../domain/valueObjects/common/EntityId';
import { Result } from '../../../utils/common/Result';
import { IUseCase } from '../base/IUseCase';

export interface GetUserByIdRequest {
    userId: string;
    includeRoles?: boolean;
    includePermissions?: boolean;
}

export interface GetUserByIdResponse {
    user: User;
    message: string;
}

/**
 * Use case for retrieving a user by ID
 */
@Injectable()
export class GetUserByIdUseCase implements IUseCase<GetUserByIdRequest, GetUserByIdResponse> {
    constructor(
        @Inject('IUserRepository') private userRepository: IUserRepository
    ) {}

    async execute(request: GetUserByIdRequest): Promise<Result<GetUserByIdResponse>> {
        try {
            // Validate input
            const validationResult = this.validateRequest(request);
            if (validationResult.isFailure) {
                return Result.fail(validationResult.error!);
            }

            // Create entity ID
            const userId = EntityId.create(request.userId);

            // Find user
            let user: User | null;

            if (request.includeRoles || request.includePermissions) {
                user = await this.userRepository.findWithRolesAndPermissions(userId);
            } else {
                user = await this.userRepository.findById(userId);
            }

            if (!user) {
                return Result.fail('User not found');
            }

            return Result.ok({
                user,
                message: 'User retrieved successfully'
            });

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            return Result.fail(`Failed to retrieve user: ${message}`);
        }
    }

    private validateRequest(request: GetUserByIdRequest): Result<void> {
        const errors: string[] = [];

        // Required fields validation
        if (!request.userId?.trim()) {
            errors.push('User ID is required');
        }

        // EntityId validation
        if (request.userId) {
            try {
                EntityId.create(request.userId);
            } catch (error) {
                errors.push('Invalid user ID format');
            }
        }

        if (errors.length > 0) {
            return Result.fail(errors.join(', '));
        }

        return Result.ok();
    }
}