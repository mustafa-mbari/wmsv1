import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import { Injectable, Inject } from '../../../../di/decorators';
import { BaseSeed, SeedOptions, SeedResult } from '../base/BaseSeed';
import { JsonReader } from '../utils/JsonReader';
import { SeedValidator, ValidationRule } from '../utils/SeedValidator';
import { Result } from '../../../../utils/common/Result';

/**
 * Role seeder with dependency injection
 */
@Injectable()
export class RoleSeeder extends BaseSeed {
    constructor(
        @Inject('PrismaClient') prisma: PrismaClient,
        @Inject('Logger') logger?: any
    ) {
        super(prisma, logger);
    }

    getName(): string {
        return 'RoleSeeder';
    }

    getDomain(): string {
        return 'user';
    }

    getDependencies(): string[] {
        return []; // Roles have no dependencies
    }

    async seed(options?: SeedOptions): Promise<Result<SeedResult>> {
        try {
            // Load role data
            const dataResult = await JsonReader.read('user/roles.json');
            if (dataResult.isFailure) {
                return Result.fail(dataResult.error!);
            }

            const roleData = dataResult.getValue();

            // Validate data
            const validationResult = await this.validateRoleData(roleData);
            if (validationResult.isFailure) {
                return Result.fail(validationResult.error!);
            }

            // Execute seeding
            return await this.executeSeed(
                roleData,
                this.seedRoles.bind(this),
                options
            );

        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return Result.fail(`RoleSeeder failed: ${message}`);
        }
    }

    protected async hasExistingData(): Promise<boolean> {
        const count = await this.prisma.roles.count();
        return count > 0;
    }

    private async validateRoleData(data: any[]): Promise<Result<void>> {
        const rules: ValidationRule[] = [
            { field: 'name', required: true, type: 'string', minLength: 2, maxLength: 100, unique: true },
            { field: 'slug', required: true, type: 'string', minLength: 2, maxLength: 100, unique: true },
            { field: 'description', type: 'string' },
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
            return Result.fail('Role data validation failed');
        }

        this.logger.info(`✅ Role data validation passed: ${validation.recordCount} records`);
        return Result.ok();
    }

    private async seedRoles(roles: any[], options?: SeedOptions): Promise<{ created: number; updated: number; skipped: number }> {
        let created = 0;
        let updated = 0;
        let skipped = 0;

        for (let i = 0; i < roles.length; i++) {
            const roleData = roles[i];

            try {
                // Check if role already exists
                const existingRole = await this.prisma.roles.findFirst({
                    where: { name: roleData.name }
                });

                if (existingRole) {
                    if (options?.force) {
                        // Update existing role
                        await this.prisma.roles.update({
                            where: { id: existingRole.id },
                            data: {
                                ...roleData,
                                updated_at: new Date()
                            }
                        });
                        updated++;
                        this.logger.info(`  ↻ Updated role: ${roleData.name}`);
                    } else {
                        skipped++;
                        this.logger.info(`  ⏭ Skipped existing role: ${roleData.name}`);
                    }
                } else {
                    // Create new role
                    await this.prisma.roles.create({
                        data: {
                            ...roleData,
                            created_at: new Date(),
                            updated_at: new Date()
                        }
                    });
                    created++;
                    this.logger.info(`  ✅ Created role: ${roleData.name}`);
                }

                // Log progress
                if ((i + 1) % 10 === 0 || i === roles.length - 1) {
                    this.logProgress({
                        total: roles.length,
                        current: i + 1,
                        message: `Processing roles`,
                        percentage: ((i + 1) / roles.length) * 100
                    });
                }

            } catch (error) {
                this.logger.error(`❌ Failed to process role ${roleData.name}:`, error);
                throw error;
            }
        }

        return { created, updated, skipped };
    }
}