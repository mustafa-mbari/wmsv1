import { Injectable, Inject } from '../../../../di/decorators';
import { IUserRepository } from '../../../domain/repositories/user/IUserRepository';
import { User } from '../../../domain/entities/user/User';
import { Username } from '../../../domain/valueObjects/user/Username';
import { Email } from '../../../domain/valueObjects/user/Email';
import { UserProfile } from '../../../domain/valueObjects/user/UserProfile';
import { Password } from '../../../domain/valueObjects/user/Password';
import { EntityId } from '../../../domain/valueObjects/common/EntityId';
import { Result } from '../../../utils/common/Result';
import { IUseCase } from '../base/IUseCase';

export interface CreateUserRequest {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    password: string;
    isActive?: boolean;
    createdBy?: string;
}

export interface CreateUserResponse {
    user: User;
    message: string;
}

/**
 * Use case for creating a new user
 */
@Injectable()
export class CreateUserUseCase implements IUseCase<CreateUserRequest, CreateUserResponse> {
    constructor(
        @Inject('IUserRepository') private userRepository: IUserRepository
    ) {}

    async execute(request: CreateUserRequest): Promise<Result<CreateUserResponse>> {
        try {
            // Validate input
            const validationResult = await this.validateRequest(request);
            if (validationResult.isFailure) {
                return Result.fail(validationResult.error!);
            }

            // Create value objects
            const username = Username.create(request.username);
            const email = Email.create(request.email);
            const profile = UserProfile.create({
                firstName: request.firstName,
                lastName: request.lastName,
                phone: request.phone,
                address: request.address
            });
            const password = await Password.create(request.password);

            const createdBy = request.createdBy ? EntityId.create(request.createdBy) : undefined;

            // Check if user already exists
            const existingUser = await this.userRepository.findByUsernameOrEmail(
                request.username.toLowerCase()
            );

            if (existingUser) {
                return Result.fail('User with this username or email already exists');
            }

            // Create user entity
            const user = User.create(username, email, profile, password, createdBy);

            // Save to repository
            const savedUser = await this.userRepository.save(user);

            return Result.ok({
                user: savedUser,
                message: 'User created successfully'
            });

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            return Result.fail(`Failed to create user: ${message}`);
        }
    }

    private async validateRequest(request: CreateUserRequest): Promise<Result<void>> {
        const errors: string[] = [];

        // Required fields validation
        if (!request.username?.trim()) {
            errors.push('Username is required');
        }

        if (!request.email?.trim()) {
            errors.push('Email is required');
        }

        if (!request.firstName?.trim()) {
            errors.push('First name is required');
        }

        if (!request.lastName?.trim()) {
            errors.push('Last name is required');
        }

        if (!request.password?.trim()) {
            errors.push('Password is required');
        }

        // Username validation
        if (request.username) {
            try {
                Username.create(request.username);
            } catch (error) {
                errors.push(error instanceof Error ? error.message : 'Invalid username');
            }
        }

        // Email validation
        if (request.email) {
            try {
                Email.create(request.email);
            } catch (error) {
                errors.push(error instanceof Error ? error.message : 'Invalid email');
            }
        }

        // Profile validation
        if (request.firstName && request.lastName) {
            try {
                UserProfile.create({
                    firstName: request.firstName,
                    lastName: request.lastName,
                    phone: request.phone,
                    address: request.address
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

        // Check for duplicates
        if (request.username && request.email) {
            try {
                const username = Username.create(request.username);
                const email = Email.create(request.email);

                const usernameExists = await this.userRepository.existsByUsername(username);
                if (usernameExists) {
                    errors.push('Username already exists');
                }

                const emailExists = await this.userRepository.existsByEmail(email);
                if (emailExists) {
                    errors.push('Email already exists');
                }
            } catch (error) {
                // Validation errors already handled above
            }
        }

        if (errors.length > 0) {
            return Result.fail(errors.join(', '));
        }

        return Result.ok();
    }
}