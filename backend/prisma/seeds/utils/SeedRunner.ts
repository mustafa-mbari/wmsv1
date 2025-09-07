// prisma/seeds/utils/SeedRunner.ts
// Main utility for running seeds in correct order with dependency management

import { PrismaClient } from '@prisma/client';
import { BaseSeed, SeedOptions, SeedResult } from '../classes/BaseSeed';

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
    
    console.log(`📝 Registered seeder: ${name} (dependencies: ${seederInstance.getDependencies().join(', ') || 'none'})`);
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
      console.log('🚀 Starting WMS Database Seeding...\n');

      // Determine which seeders to run
      const seedersToRun = this.determineSeedersToRun();
      
      if (seedersToRun.length === 0) {
        console.log('📭 No seeders to run');
        result.success = true;
        result.duration = Date.now() - startTime;
        return result;
      }

      // Sort seeders by dependency order
      const sortedSeeders = this.sortSeedersByDependencies(seedersToRun);
      
      console.log(`📋 Planned execution order: ${sortedSeeders.join(' → ')}\n`);

      if (this.options.dryRun) {
        console.log('🔍 DRY RUN - No actual seeding will be performed\n');
        result.success = true;
        result.totalSeeders = sortedSeeders.length;
        result.duration = Date.now() - startTime;
        return result;
      }

      result.totalSeeders = sortedSeeders.length;

      // Run seeders in order
      for (const seederName of sortedSeeders) {
        try {
          console.log(`\n🌱 Running ${seederName} seeder...`);
          
          const seederFactory = this.seeders.get(seederName)!;
          const seeder = seederFactory();
          
          const seederResult = await seeder.seed();
          result.results[seederName] = seederResult;

          if (seederResult.success) {
            result.successfulSeeders++;
            console.log(`✅ ${seederName} completed successfully`);
          } else {
            result.failedSeeders++;
            result.errors.push(...seederResult.errors);
            console.error(`❌ ${seederName} failed`);
            
            if (!this.options.continueOnError) {
              console.log('🛑 Stopping execution due to error');
              break;
            }
          }

          // Cleanup seeder resources
          await seeder.cleanup();

        } catch (error) {
          result.failedSeeders++;
          result.errors.push(`${seederName}: ${error}`);
          console.error(`💥 ${seederName} crashed:`, error);
          
          if (!this.options.continueOnError) {
            console.log('🛑 Stopping execution due to crash');
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
      console.error('💥 Seed runner crashed:', error);
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

    for (const [seederName, dependencies] of this.dependencies.entries()) {
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
    console.log('\n' + '='.repeat(50));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(50));
    console.log(`⏱️  Duration: ${result.duration}ms`);
    console.log(`📝 Total Seeders: ${result.totalSeeders}`);
    console.log(`✅ Successful: ${result.successfulSeeders}`);
    console.log(`❌ Failed: ${result.failedSeeders}`);
    console.log(`⏭️  Skipped: ${result.skippedSeeders}`);
    
    if (result.errors.length > 0) {
      console.log(`\n🚨 Errors (${result.errors.length}):`);
      result.errors.forEach(error => console.log(`   • ${error}`));
    }

    if (result.success) {
      console.log('\n🎉 All seeders completed successfully!');
    } else {
      console.log('\n⚠️  Some seeders failed. Check the logs above.');
    }
    
    console.log('='.repeat(50) + '\n');
  }
}