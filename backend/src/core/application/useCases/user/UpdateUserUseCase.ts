import { Injectable, Inject } from '../../../../di/decorators';
import { IUserRepository } from '../../../domain/repositories/user/IUserRepository';
import { User } from '../../../domain/entities/user/User';
import { UserProfile } from '../../../domain/valueObjects/user/UserProfile';
import { Password } from '../../../domain/valueObjects/user/Password';
import { EntityId } from '../../../domain/valueObjects/common/EntityId';
import { Result } from '../../../utils/common/Result';
import { IUseCase } from '../base/IUseCase';

export interface UpdateUserRequest {
    userId: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    birthDate?: Date;
    gender?: string;
    language?: string;
    timeZone?: string;
    isActive?: boolean;
    password?: string;
    updatedBy?: string;
}

export interface UpdateUserResponse {
    user: User;
    message: string;
}

/**
 * Use case for updating an existing user
 */
@Injectable()
export class UpdateUserUseCase implements IUseCase<UpdateUserRequest, UpdateUserResponse> {
    constructor(
        @Inject('IUserRepository') private userRepository: IUserRepository
    ) {}

    async execute(request: UpdateUserRequest): Promise<Result<UpdateUserResponse>> {
        try {
            // Validate input
            const validationResult = await this.validateRequest(request);
            if (validationResult.isFailure) {
                return Result.fail(validationResult.error!);
            }

            // Create entity ID
            const userId = EntityId.create(request.userId);
            const updatedBy = request.updatedBy ? EntityId.create(request.updatedBy) : undefined;

            // Find existing user
            const existingUser = await this.userRepository.findById(userId);
            if (!existingUser) {
                return Result.fail('User not found');
            }

            // Update profile if profile fields are provided
            if (this.hasProfileUpdates(request)) {
                const updatedProfile = existingUser.profile.update({
                    firstName: request.firstName || existingUser.profile.firstName,
                    lastName: request.lastName || existingUser.profile.lastName,
                    phone: request.phone !== undefined ? request.phone : existingUser.profile.phone,
                    address: request.address !== undefined ? request.address : existingUser.profile.address,
                    birthDate: request.birthDate !== undefined ? request.birthDate : existingUser.profile.birthDate,
                    gender: request.gender !== undefined ? request.gender : existingUser.profile.gender,
                    language: request.language || existingUser.profile.language,
                    timeZone: request.timeZone || existingUser.profile.timeZone
                });

                existingUser.updateProfile(updatedProfile, updatedBy);
            }

            // Update password if provided
            if (request.password) {
                const newPassword = await Password.create(request.password);
                existingUser.changePassword(newPassword, updatedBy);
            }

            // Update status if provided
            if (request.isActive !== undefined) {
                if (request.isActive) {
                    existingUser.activate(updatedBy);
                } else {
                    existingUser.deactivate(updatedBy);
                }
            }

            // Validate updated user
            existingUser.validate();

            // Save to repository
            const savedUser = await this.userRepository.save(existingUser);

            return Result.ok({
                user: savedUser,
                message: 'User updated successfully'
            });

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            return Result.fail(`Failed to update user: ${message}`);
        }
    }

    private async validateRequest(request: UpdateUserRequest): Promise<Result<void>> {
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

        // Profile validation (if any profile fields are provided)
        if (this.hasProfileUpdates(request)) {
            try {
                // Create temporary profile to validate
                UserProfile.create({
                    firstName: request.firstName || 'temp',
                    lastName: request.lastName || 'temp',
                    phone: request.phone,
                    address: request.address,
                    birthDate: request.birthDate,
                    gender: request.gender,
                    language: request.language,
                    timeZone: request.timeZone
                });
            } catch (error) {
                errors.push(error instanceof Error ? error.message : 'Invalid profile data');
            }
        }

        // Password validation
        if (request.password) {
            const passwordValidation = Password.validateMinimumRequirements(request.password);
            if (!passwordValidation.isValid) {
                errors.push(...passwordValidation.errors);
            }
        }

        // At least one field should be provided for update
        if (!this.hasAnyUpdates(request)) {
            errors.push('At least one field must be provided for update');
        }

        if (errors.length > 0) {
            return Result.fail(errors.join(', '));
        }

        return Result.ok();
    }

    private hasProfileUpdates(request: UpdateUserRequest): boolean {
        return !!(
            request.firstName ||
            request.lastName ||
            request.phone !== undefined ||
            request.address !== undefined ||
            request.birthDate !== undefined ||
            request.gender !== undefined ||
            request.language ||
            request.timeZone
        );
    }

    private hasAnyUpdates(request: UpdateUserRequest): boolean {
        return !!(
            this.hasProfileUpdates(request) ||
            request.password ||
            request.isActive !== undefined
        );
    }
}