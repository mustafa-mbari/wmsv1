#!/usr/bin/env node
import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { Container } from '../../../di/Container';
import { SeedRunner } from './utils/SeedRunner';
import { UserSeeder } from './user/UserSeeder';
import { RoleSeeder } from './user/RoleSeeder';
import { ProductSeeder } from './product/ProductSeeder';

// Load environment variables
dotenv.config();

/**
 * Main seeding script with new architecture
 */
class SeedingApplication {
    private container: Container;
    private prisma: PrismaClient;
    private seedRunner: SeedRunner;

    constructor() {
        this.container = Container.getInstance();
        this.setupDependencies();
    }

    private setupDependencies(): void {
        // Setup Prisma
        this.prisma = new PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : []
        });

        // Register dependencies in container
        this.container.registerValue('PrismaClient', this.prisma);
        this.container.registerValue('Logger', console);

        // Create seed runner
        this.seedRunner = new SeedRunner();

        // Register seeders
        this.registerSeeders();
    }

    private registerSeeders(): void {
        console.log('📦 Registering seeders...');

        // User domain seeders (roles first, then users)
        this.seedRunner.registerSeeder(
            'RoleSeeder',
            'user',
            () => new RoleSeeder(this.prisma, console),
            []
        );

        this.seedRunner.registerSeeder(
            'UserSeeder',
            'user',
            () => new UserSeeder(this.prisma, console),
            ['RoleSeeder']
        );

        // Product domain seeders
        this.seedRunner.registerSeeder(
            'ProductSeeder',
            'product',
            () => new ProductSeeder(this.prisma, console),
            []
        );

        // TODO: Add more seeders
        // this.seedRunner.registerSeeder('BrandSeeder', 'product', () => new BrandSeeder(this.prisma, console), []);
        // this.seedRunner.registerSeeder('WarehouseSeeder', 'warehouse', () => new WarehouseSeeder(this.prisma, console), []);
        // etc.

        console.log(`✅ Registered ${this.seedRunner.getRegisteredSeeders().length} seeders`);
    }

    async run(): Promise<void> {
        try {
            console.log('🌱 Starting WMS Database Seeding with New Architecture');
            console.log('════════════════════════════════════════════════════════');

            // Parse command line arguments
            const options = this.parseArguments();

            // Connect to database
            await this.prisma.$connect();
            console.log('✅ Connected to database');

            // Run seeders
            const result = await this.seedRunner.runSeeders(options);

            if (result.isSuccess) {
                const summary = result.getValue();
                console.log('🎉 Seeding completed successfully!');

                if (summary.failedSeeders > 0) {
                    console.log('⚠️  Some seeders failed, but process continued due to --force flag');
                    process.exit(1);
                } else {
                    process.exit(0);
                }
            } else {
                console.error('💥 Seeding failed:', result.error);
                process.exit(1);
            }

        } catch (error) {
            console.error('💥 Fatal error during seeding:', error);
            process.exit(1);
        } finally {
            await this.cleanup();
        }
    }

    private parseArguments() {
        const args = process.argv.slice(2);
        const options: any = {};

        args.forEach(arg => {
            if (arg === '--force') {
                options.force = true;
            } else if (arg === '--verbose') {
                options.verbose = true;
            } else if (arg === '--dry-run') {
                options.dryRun = true;
            } else if (arg.startsWith('--domain=')) {
                options.domain = arg.split('=')[1];
            } else if (arg.startsWith('--tables=')) {
                options.tables = arg.split('=')[1].split(',');
            }
        });

        // Log options
        console.log('⚙️  Seeding options:', {
            domain: options.domain || 'all',
            tables: options.tables || 'all',
            force: options.force || false,
            dryRun: options.dryRun || false,
            verbose: options.verbose || false
        });

        return options;
    }

    private async cleanup(): Promise<void> {
        try {
            await this.prisma.$disconnect();
            console.log('🔌 Disconnected from database');
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
}

// Handle script execution
if (require.main === module) {
    const app = new SeedingApplication();

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        console.log('\\n🛑 Received SIGINT, shutting down gracefully...');
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('\\n🛑 Received SIGTERM, shutting down gracefully...');
        process.exit(0);
    });

    // Run the application
    app.run().catch(error => {
        console.error('💥 Unhandled error:', error);
        process.exit(1);
    });
}

export default SeedingApplication;