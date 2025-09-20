import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import { Container } from '../../../../di/Container';
import { Injectable } from '../../../../di/decorators';
import { BaseSeed, SeedOptions, SeedResult } from '../base/BaseSeed';
import { Result } from '../../../../utils/common/Result';

/**
 * Seeding summary
 */
export interface SeedingSummary {
    totalSeeders: number;
    successfulSeeders: number;
    failedSeeders: number;
    skippedSeeders: number;
    totalRecordsCreated: number;
    totalRecordsUpdated: number;
    totalRecordsSkipped: number;
    totalDuration: number;
    results: { [seederName: string]: SeedResult };
    errors: string[];
}

/**
 * Seeder registration
 */
interface SeederRegistration {
    name: string;
    domain: string;
    factory: () => BaseSeed;
    dependencies: string[];
}

/**
 * Main seed runner with dependency injection and orchestration
 */
@Injectable({ singleton: true })
export class SeedRunner {
    private container: Container;
    private seeders: Map<string, SeederRegistration> = new Map();
    private logger: any;

    constructor() {
        this.container = Container.getInstance();
        this.logger = console; // Will be replaced with proper logger
    }

    /**
     * Register a seeder
     */
    registerSeeder(
        name: string,
        domain: string,
        factory: () => BaseSeed,
        dependencies: string[] = []
    ): void {
        this.seeders.set(name, {
            name,
            domain,
            factory,
            dependencies
        });
    }

    /**
     * Register multiple seeders
     */
    registerSeeders(seeders: { [name: string]: { domain: string; factory: () => BaseSeed; dependencies?: string[] } }): void {
        Object.entries(seeders).forEach(([name, config]) => {
            this.registerSeeder(name, config.domain, config.factory, config.dependencies || []);
        });
    }

    /**
     * Run all seeders or specific domain/seeders
     */
    async runSeeders(options: SeedOptions = {}): Promise<Result<SeedingSummary>> {
        const startTime = Date.now();
        this.logger.info('🌱 Starting seeding process...');

        try {
            // Get seeders to run
            const seedersToRun = this.getSeedersToRun(options);

            if (seedersToRun.length === 0) {
                return Result.fail('No seeders found to run');
            }

            // Sort seeders by dependencies
            const sortedSeeders = this.sortSeedersByDependencies(seedersToRun);

            // Initialize summary
            const summary: SeedingSummary = {
                totalSeeders: sortedSeeders.length,
                successfulSeeders: 0,
                failedSeeders: 0,
                skippedSeeders: 0,
                totalRecordsCreated: 0,
                totalRecordsUpdated: 0,
                totalRecordsSkipped: 0,
                totalDuration: 0,
                results: {},
                errors: []
            };

            // Run seeders in order
            for (const seederReg of sortedSeeders) {
                this.logger.info(`\n📦 Running seeder: ${seederReg.name} (${seederReg.domain})`);

                try {
                    const seeder = seederReg.factory();
                    const result = await seeder.seed(options);

                    if (result.isSuccess) {
                        const seedResult = result.getValue();
                        summary.results[seederReg.name] = seedResult;

                        if (seedResult.recordsCreated > 0 || seedResult.recordsUpdated > 0) {
                            summary.successfulSeeders++;
                            summary.totalRecordsCreated += seedResult.recordsCreated;
                            summary.totalRecordsUpdated += seedResult.recordsUpdated;
                        } else {
                            summary.skippedSeeders++;
                        }
                        summary.totalRecordsSkipped += seedResult.recordsSkipped;
                    } else {
                        summary.failedSeeders++;
                        summary.errors.push(`${seederReg.name}: ${result.error}`);
                        this.logger.error(`❌ Seeder ${seederReg.name} failed: ${result.error}`);

                        // Stop on first failure unless force option is set
                        if (!options.force) {
                            break;
                        }
                    }

                    // Cleanup seeder
                    await seeder.cleanup();

                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    summary.failedSeeders++;
                    summary.errors.push(`${seederReg.name}: ${errorMessage}`);
                    this.logger.error(`❌ Seeder ${seederReg.name} threw exception: ${errorMessage}`);

                    if (!options.force) {
                        break;
                    }
                }
            }

            summary.totalDuration = Date.now() - startTime;

            // Log summary
            this.logSummary(summary);

            if (summary.failedSeeders > 0 && !options.force) {
                return Result.fail(`Seeding failed: ${summary.errors.join(', ')}`);
            }

            return Result.ok(summary);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`💥 Seeding process failed: ${errorMessage}`);
            return Result.fail(`Seeding process failed: ${errorMessage}`);
        }
    }

    /**
     * Get list of seeders to run based on options
     */
    private getSeedersToRun(options: SeedOptions): SeederRegistration[] {
        let seedersToRun = Array.from(this.seeders.values());

        // Filter by domain
        if (options.domain) {
            seedersToRun = seedersToRun.filter(s => s.domain === options.domain);
        }

        // Filter by specific tables/seeders
        if (options.tables && options.tables.length > 0) {
            seedersToRun = seedersToRun.filter(s => options.tables!.includes(s.name));
        }

        return seedersToRun;
    }

    /**
     * Sort seeders by their dependencies using topological sort
     */
    private sortSeedersByDependencies(seeders: SeederRegistration[]): SeederRegistration[] {
        const sorted: SeederRegistration[] = [];
        const visited = new Set<string>();
        const visiting = new Set<string>();

        const visit = (seederName: string) => {
            if (visiting.has(seederName)) {
                throw new Error(`Circular dependency detected involving ${seederName}`);
            }

            if (!visited.has(seederName)) {
                visiting.add(seederName);

                const seeder = seeders.find(s => s.name === seederName);
                if (seeder) {
                    // Visit dependencies first
                    seeder.dependencies.forEach(dep => {
                        visit(dep);
                    });

                    visiting.delete(seederName);
                    visited.add(seederName);
                    sorted.push(seeder);
                }
            }
        };

        // Visit all seeders
        seeders.forEach(seeder => {
            if (!visited.has(seeder.name)) {
                visit(seeder.name);
            }
        });

        return sorted;
    }

    /**
     * Log seeding summary
     */
    private logSummary(summary: SeedingSummary): void {
        this.logger.info(`
╔════════════════════════════════════════════════════════════╗
║                     Seeding Summary                        ║
╠════════════════════════════════════════════════════════════╣
║ Total Seeders: ${summary.totalSeeders.toString().padEnd(6)} | Duration: ${(summary.totalDuration + 'ms').padEnd(10)} ║
║ Successful: ${summary.successfulSeeders.toString().padEnd(9)} | Failed: ${summary.failedSeeders.toString().padEnd(13)} ║
║ Skipped: ${summary.skippedSeeders.toString().padEnd(12)} | Records Created: ${summary.totalRecordsCreated.toString().padEnd(4)} ║
║ Records Updated: ${summary.totalRecordsUpdated.toString().padEnd(3)} | Records Skipped: ${summary.totalRecordsSkipped.toString().padEnd(4)} ║
╚════════════════════════════════════════════════════════════╝
        `);

        if (summary.errors.length > 0) {
            this.logger.error('Errors encountered:');
            summary.errors.forEach(error => this.logger.error(`  • ${error}`));
        }
    }

    /**
     * Get registered seeders
     */
    getRegisteredSeeders(): string[] {
        return Array.from(this.seeders.keys());
    }

    /**
     * Get seeders by domain
     */
    getSeedersByDomain(domain: string): string[] {
        return Array.from(this.seeders.values())
            .filter(s => s.domain === domain)
            .map(s => s.name);
    }

    /**
     * Clear all registered seeders (for testing)
     */
    clear(): void {
        this.seeders.clear();
    }
}