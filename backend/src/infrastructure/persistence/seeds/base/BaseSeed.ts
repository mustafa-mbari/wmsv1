import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import { Injectable, Inject } from '../../../../di/decorators';
import { Result } from '../../../../utils/common/Result';

/**
 * Seeding progress interface
 */
export interface SeedProgress {
    total: number;
    current: number;
    message: string;
    percentage: number;
}

/**
 * Seeding options
 */
export interface SeedOptions {
    force?: boolean;
    domain?: string;
    tables?: string[];
    dryRun?: boolean;
    verbose?: boolean;
}

/**
 * Seeding result
 */
export interface SeedResult {
    success: boolean;
    recordsCreated: number;
    recordsSkipped: number;
    recordsUpdated: number;
    duration: number;
    message: string;
    errors?: string[];
}

/**
 * Base seeder class with dependency injection support
 */
@Injectable()
export abstract class BaseSeed {
    protected prisma: PrismaClient;
    protected logger: any; // Will be replaced with proper logger interface

    constructor(
        @Inject('PrismaClient') prisma: PrismaClient,
        @Inject('Logger') logger?: any
    ) {
        this.prisma = prisma;
        this.logger = logger || console;
    }

    /**
     * Abstract method to be implemented by concrete seeders
     */
    abstract seed(options?: SeedOptions): Promise<Result<SeedResult>>;

    /**
     * Get the name of the seeder
     */
    abstract getName(): string;

    /**
     * Get the domain of the seeder
     */
    abstract getDomain(): string;

    /**
     * Get dependencies (other seeders that must run first)
     */
    getDependencies(): string[] {
        return [];
    }

    /**
     * Check if seeding should be skipped
     */
    async shouldSkip(options?: SeedOptions): Promise<boolean> {
        if (options?.force) {
            return false;
        }

        return await this.hasExistingData();
    }

    /**
     * Check if the seeder has existing data
     */
    protected abstract hasExistingData(): Promise<boolean>;

    /**
     * Validate data before seeding
     */
    protected async validateData(data: any[]): Promise<Result<void>> {
        if (!Array.isArray(data)) {
            return Result.fail('Data must be an array');
        }

        if (data.length === 0) {
            return Result.fail('Data array is empty');
        }

        // Override in concrete seeders for specific validation
        return Result.ok();
    }

    /**
     * Log progress during seeding
     */
    protected logProgress(progress: SeedProgress): void {
        const percentage = Math.round(progress.percentage);
        this.logger.info(`[${this.getName()}] ${percentage}% - ${progress.message} (${progress.current}/${progress.total})`);
    }

    /**
     * Log error during seeding
     */
    protected logError(error: string | Error): void {
        const message = error instanceof Error ? error.message : error;
        this.logger.error(`[${this.getName()}] Error: ${message}`);
    }

    /**
     * Log success message
     */
    protected logSuccess(result: SeedResult): void {
        this.logger.info(`[${this.getName()}] Completed: ${result.recordsCreated} created, ${result.recordsSkipped} skipped, ${result.recordsUpdated} updated in ${result.duration}ms`);
    }

    /**
     * Create a seed result
     */
    protected createResult(
        success: boolean,
        recordsCreated: number = 0,
        recordsSkipped: number = 0,
        recordsUpdated: number = 0,
        duration: number = 0,
        message: string = '',
        errors: string[] = []
    ): SeedResult {
        return {
            success,
            recordsCreated,
            recordsSkipped,
            recordsUpdated,
            duration,
            message,
            errors: errors.length > 0 ? errors : undefined
        };
    }

    /**
     * Execute seeding with error handling and timing
     */
    protected async executeSeed<T>(
        data: T[],
        seedFunction: (items: T[], options?: SeedOptions) => Promise<{ created: number; updated: number; skipped: number }>,
        options?: SeedOptions
    ): Promise<Result<SeedResult>> {
        const startTime = Date.now();
        let result: SeedResult;

        try {
            // Validate data
            const validationResult = await this.validateData(data);
            if (validationResult.isFailure) {
                return Result.fail(validationResult.error!);
            }

            // Check if should skip
            if (await this.shouldSkip(options)) {
                result = this.createResult(
                    true,
                    0,
                    data.length,
                    0,
                    Date.now() - startTime,
                    'Skipped - data already exists'
                );
                this.logSuccess(result);
                return Result.ok(result);
            }

            // Execute seeding
            this.logger.info(`[${this.getName()}] Starting to seed ${data.length} records...`);

            const counts = await seedFunction(data, options);

            result = this.createResult(
                true,
                counts.created,
                counts.skipped,
                counts.updated,
                Date.now() - startTime,
                'Seeding completed successfully'
            );

            this.logSuccess(result);
            return Result.ok(result);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logError(error);

            result = this.createResult(
                false,
                0,
                0,
                0,
                Date.now() - startTime,
                `Seeding failed: ${errorMessage}`,
                [errorMessage]
            );

            return Result.fail(errorMessage);
        }
    }

    /**
     * Clean up resources (override if needed)
     */
    async cleanup(): Promise<void> {
        // Override in concrete seeders if cleanup is needed
    }
}