// prisma/seeds/utils/SeedRunner.ts
// Main utility for running seeds in correct order with dependency management

import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions, SeedResult } from '../classes/BaseSeed';
import logger from '../../../src/utils/logger/logger';

export interface RunnerOptions extends SeedOptions {
  runAll?: boolean;           // Run all available seeders
  runOnly?: string[];         // Run only specific seeders
  skipSeeders?: string[];     // Skip specific seeders
  continueOnError?: boolean;  // Continue running other seeders if one fails
  dryRun?: boolean;          // Show what would be run without executing
}

export interface RunnerResult {
  success: boolean;
  totalSeeders: number;
  successfulSeeders: number;
  failedSeeders: number;
  skippedSeeders: number;
  results: { [seederName: string]: SeedResult };
  duration: number;
  errors: string[];
}

export class SeedRunner {
  private prisma: PrismaClient;
  private seeders: Map<string, () => BaseSeed> = new Map();
  private dependencies: Map<string, string[]> = new Map();
  private options: RunnerOptions;

  constructor(prisma: PrismaClient, options: RunnerOptions = {}) {
    this.prisma = prisma;
    this.options = {
      runAll: true,
      continueOnError: false,
      dryRun: false,
      force: false,
      validate: true,
      batchSize: 100,
      systemUserId: 1,
      ...options
    };
  }

  /**
   * Register a seeder
   */
  registerSeeder(name: string, seederFactory: () => BaseSeed): void {
    this.seeders.set(name, seederFactory);
    
    // Get dependencies from seeder instance
    const seederInstance = seederFactory();
    this.dependencies.set(name, seederInstance.getDependencies());
    
    logger.info(`Registered seeder: ${name}`, {
      source: 'SeedRunner',
      method: 'registerSeeder',
      seeder: name,
      dependencies: seederInstance.getDependencies()
    });
  }

  /**
   * Run seeders based on options
   */
  async run(): Promise<RunnerResult> {
    const startTime = Date.now();
    const result: RunnerResult = {
      success: false,
      totalSeeders: 0,
      successfulSeeders: 0,
      failedSeeders: 0,
      skippedSeeders: 0,
      results: {},
      duration: 0,
      errors: []
    };

    try {
      logger.info('Starting WMS Database Seeding', {
        source: 'SeedRunner',
        method: 'run'
      });

      // Determine which seeders to run
      const seedersToRun = this.determineSeedersToRun();
      
      if (seedersToRun.length === 0) {
        logger.info('No seeders to run', {
          source: 'SeedRunner',
          method: 'run'
        });
        result.success = true;
        result.duration = Date.now() - startTime;
        return result;
      }

      // Sort seeders by dependency order
      const sortedSeeders = this.sortSeedersByDependencies(seedersToRun);
      
      logger.info(`Planned execution order: ${sortedSeeders.join(' → ')}`, {
        source: 'SeedRunner',
        method: 'run',
        executionOrder: sortedSeeders
      });

      if (this.options.dryRun) {
        logger.info('DRY RUN - No actual seeding will be performed', {
          source: 'SeedRunner',
          method: 'run',
          dryRun: true
        });
        result.success = true;
        result.totalSeeders = sortedSeeders.length;
        result.duration = Date.now() - startTime;
        return result;
      }

      result.totalSeeders = sortedSeeders.length;

      // Run seeders in order
      for (const seederName of sortedSeeders) {
        try {
          logger.info(`Running ${seederName} seeder`, {
            source: 'SeedRunner',
            method: 'run',
            seeder: seederName
          });
          
          const seederFactory = this.seeders.get(seederName)!;
          const seeder = seederFactory();
          
          const seederResult = await seeder.seed();
          result.results[seederName] = seederResult;

          if (seederResult.success) {
            result.successfulSeeders++;
            logger.info(`${seederName} completed successfully`, {
              source: 'SeedRunner',
              method: 'run',
              seeder: seederName,
              success: true
            });
          } else {
            result.failedSeeders++;
            result.errors.push(...seederResult.errors);
            logger.error(`${seederName} failed`, {
              source: 'SeedRunner',
              method: 'run',
              seeder: seederName,
              errors: seederResult.errors
            });
            
            if (!this.options.continueOnError) {
              logger.info('Stopping execution due to error', {
                source: 'SeedRunner',
                method: 'run',
                seeder: seederName
              });
              break;
            }
          }

          // Cleanup seeder resources
          await seeder.cleanup();

        } catch (error) {
          result.failedSeeders++;
          result.errors.push(`${seederName}: ${error}`);
          logger.error(`${seederName} crashed`, {
            source: 'SeedRunner',
            method: 'run',
            seeder: seederName,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
          
          if (!this.options.continueOnError) {
            logger.info('Stopping execution due to crash', {
              source: 'SeedRunner',
              method: 'run',
              seeder: seederName
            });
            break;
          }
        }
      }

      result.skippedSeeders = result.totalSeeders - result.successfulSeeders - result.failedSeeders;
      result.success = result.failedSeeders === 0;
      result.duration = Date.now() - startTime;

      // Print summary
      this.printSummary(result);

    } catch (error) {
      result.errors.push(`Runner error: ${error}`);
      result.success = false;
      result.duration = Date.now() - startTime;
      logger.error('Seed runner crashed', {
        source: 'SeedRunner',
        method: 'run',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }

    return result;
  }

  /**
   * Get list of available seeders
   */
  getAvailableSeeders(): string[] {
    return Array.from(this.seeders.keys());
  }

  /**
   * Validate seeder dependencies
   */
  validateDependencies(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const allSeeders = this.getAvailableSeeders();

    for (const [seederName, dependencies] of Array.from(this.dependencies.entries())) {
      for (const dependency of dependencies) {
        if (!allSeeders.includes(dependency)) {
          errors.push(`${seederName} depends on ${dependency} which is not registered`);
        }
      }
    }

    // Check for circular dependencies
    const circularDeps = this.detectCircularDependencies();
    if (circularDeps.length > 0) {
      errors.push(`Circular dependencies detected: ${circularDeps.join(', ')}`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Determine which seeders to run based on options
   */
  private determineSeedersToRun(): string[] {
    let seedersToRun: string[];

    if (this.options.runOnly && this.options.runOnly.length > 0) {
      seedersToRun = this.options.runOnly.filter(name => this.seeders.has(name));
    } else if (this.options.runAll) {
      seedersToRun = this.getAvailableSeeders();
    } else {
      seedersToRun = [];
    }

    // Remove skipped seeders
    if (this.options.skipSeeders && this.options.skipSeeders.length > 0) {
      seedersToRun = seedersToRun.filter(name => !this.options.skipSeeders!.includes(name));
    }

    return seedersToRun;
  }

  /**
   * Sort seeders by dependency order using topological sort
   */
  private sortSeedersByDependencies(seeders: string[]): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const sorted: string[] = [];

    const visit = (seederName: string) => {
      if (visiting.has(seederName)) {
        throw new Error(`Circular dependency detected involving ${seederName}`);
      }
      if (visited.has(seederName)) {
        return;
      }

      visiting.add(seederName);

      const dependencies = this.dependencies.get(seederName) || [];
      for (const dependency of dependencies) {
        if (seeders.includes(dependency)) {
          visit(dependency);
        }
      }

      visiting.delete(seederName);
      visited.add(seederName);
      sorted.push(seederName);
    };

    for (const seeder of seeders) {
      visit(seeder);
    }

    return sorted;
  }

  /**
   * Detect circular dependencies
   */
  private detectCircularDependencies(): string[] {
    const circular: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (seederName: string, path: string[] = []) => {
      if (visiting.has(seederName)) {
        circular.push([...path, seederName].join(' → '));
        return;
      }
      if (visited.has(seederName)) {
        return;
      }

      visiting.add(seederName);
      const dependencies = this.dependencies.get(seederName) || [];
      
      for (const dependency of dependencies) {
        visit(dependency, [...path, seederName]);
      }

      visiting.delete(seederName);
      visited.add(seederName);
    };

    for (const seeder of this.getAvailableSeeders()) {
      visit(seeder);
    }

    return circular;
  }

  /**
   * Print execution summary
   */
  private printSummary(result: RunnerResult): void {
    logger.info('SEEDING SUMMARY', {
      source: 'SeedRunner',
      method: 'printSummary',
      duration: result.duration,
      totalSeeders: result.totalSeeders,
      successfulSeeders: result.successfulSeeders,
      failedSeeders: result.failedSeeders,
      skippedSeeders: result.skippedSeeders,
      success: result.success
    });
    
    if (result.errors.length > 0) {
      logger.error(`Errors encountered (${result.errors.length})`, {
        source: 'SeedRunner',
        method: 'printSummary',
        errors: result.errors
      });
    }

    if (result.success) {
      logger.info('All seeders completed successfully!', {
        source: 'SeedRunner',
        method: 'printSummary'
      });
    } else {
      logger.warn('Some seeders failed. Check the logs above.', {
        source: 'SeedRunner',
        method: 'printSummary',
        failedCount: result.failedSeeders
      });
    }
  }
}