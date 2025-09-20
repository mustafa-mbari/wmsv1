import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import { Injectable, Inject } from '../../../../di/decorators';
import { BaseSeed, SeedOptions, SeedResult } from '../base/BaseSeed';
import { JsonReader } from '../utils/JsonReader';
import { SeedValidator, ValidationRule } from '../utils/SeedValidator';
import { Result } from '../../../../utils/common/Result';

/**
 * User seeder with dependency injection
 */
@Injectable()
export class UserSeeder extends BaseSeed {
    constructor(
        @Inject('PrismaClient') prisma: PrismaClient,
        @Inject('Logger') logger?: any
    ) {
        super(prisma, logger);
    }

    getName(): string {
        return 'UserSeeder';
    }

    getDomain(): string {
        return 'user';
    }

    getDependencies(): string[] {
        return ['RoleSeeder']; // Users depend on roles
    }

    async seed(options?: SeedOptions): Promise<Result<SeedResult>> {
        try {
            // Load user data
            const dataResult = await JsonReader.read('user/users.json');
            if (dataResult.isFailure) {
                return Result.fail(dataResult.error!);
            }

            const userData = dataResult.getValue();

            // Validate data
            const validationResult = await this.validateUserData(userData);
            if (validationResult.isFailure) {
                return Result.fail(validationResult.error!);
            }

            // Execute seeding
            return await this.executeSeed(
                userData,
                this.seedUsers.bind(this),
                options
            );

        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return Result.fail(`UserSeeder failed: ${message}`);
        }
    }

    protected async hasExistingData(): Promise<boolean> {
        const count = await this.prisma.users.count();
        return count > 0;
    }

    private async validateUserData(data: any[]): Promise<Result<void>> {
        const rules: ValidationRule[] = [
            { field: 'username', required: true, type: 'string', minLength: 3, maxLength: 50, unique: true },
            { field: 'email', required: true, type: 'email', unique: true },
            { field: 'first_name', required: true, type: 'string', minLength: 1, maxLength: 100 },
            { field: 'last_name', required: true, type: 'string', minLength: 1, maxLength: 100 },
            { field: 'phone', type: 'string', maxLength: 20 },
            { field: 'is_active', type: 'boolean' },
            ...SeedValidator.getAuditFieldRules()
        ];

        const validationResult = await SeedValidator.validateData(data, rules);
        if (validationResult.isFailure) {
            return Result.fail(validationResult.error!);
        }

        const validation = validationResult.getValue();
        if (!validation.valid) {
            const errorMessage = SeedValidator.formatValidationResult(validation);
            this.logger.error(errorMessage);
            return Result.fail('User data validation failed');
        }

        this.logger.info(`✅ User data validation passed: ${validation.recordCount} records`);
        return Result.ok();
    }

    private async seedUsers(users: any[], options?: SeedOptions): Promise<{ created: number; updated: number; skipped: number }> {
        let created = 0;
        let updated = 0;
        let skipped = 0;

        for (let i = 0; i < users.length; i++) {
            const userData = users[i];

            try {
                // Check if user already exists
                const existingUser = await this.prisma.users.findFirst({
                    where: {
                        OR: [
                            { username: userData.username },
                            { email: userData.email }
                        ]
                    }
                });

                if (existingUser) {
                    if (options?.force) {
                        // Update existing user
                        await this.prisma.users.update({
                            where: { user_id: existingUser.user_id },
                            data: {
                                ...userData,
                                updated_at: new Date()
                            }
                        });
                        updated++;
                        this.logger.info(`  ↻ Updated user: ${userData.username}`);
                    } else {
                        skipped++;
                        this.logger.info(`  ⏭ Skipped existing user: ${userData.username}`);
                    }
                } else {
                    // Create new user
                    await this.prisma.users.create({
                        data: {
                            ...userData,
                            created_at: new Date(),
                            updated_at: new Date()
                        }
                    });
                    created++;
                    this.logger.info(`  ✅ Created user: ${userData.username}`);
                }

                // Log progress
                if ((i + 1) % 10 === 0 || i === users.length - 1) {
                    this.logProgress({
                        total: users.length,
                        current: i + 1,
                        message: `Processing users`,
                        percentage: ((i + 1) / users.length) * 100
                    });
                }

            } catch (error) {
                this.logger.error(`❌ Failed to process user ${userData.username}:`, error);
                throw error;
            }
        }

        return { created, updated, skipped };
    }
}