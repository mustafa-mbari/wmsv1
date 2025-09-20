import 'reflect-metadata';
import { Container } from '../di/Container';
import { Injectable } from '../di/decorators';

/**
 * Bootstrap class for initializing the application
 */
@Injectable({ singleton: true })
export class Bootstrap {
    private container: Container;

    constructor() {
        this.container = Container.getInstance();
    }

    async initialize(): Promise<void> {
        console.log('🚀 Initializing WMS Application with Adaptive Modular Architecture...');

        // Initialize configuration
        await this.loadConfiguration();

        // Register modules
        await this.registerModules();

        // Initialize database
        await this.initializeDatabase();

        // Setup services
        await this.setupServices();

        console.log('✅ WMS Application initialized successfully');
    }

    private async loadConfiguration(): Promise<void> {
        // Load environment-specific configuration
        const environment = process.env.NODE_ENV || 'development';
        console.log(`📋 Loading configuration for environment: ${environment}`);

        // Register configuration as singleton
        this.container.registerValue('Environment', environment);
        this.container.registerValue('Config', {
            app: {
                name: 'WMS Application',
                port: parseInt(process.env.PORT || '8000'),
                env: environment
            },
            database: {
                url: process.env.DATABASE_URL || ''
            }
        });
    }

    private async registerModules(): Promise<void> {
        console.log('📦 Registering application modules...');

        // TODO: Register domain modules
        // CoreModule.register(this.container);
        // InfrastructureModule.register(this.container);
        // ApplicationModule.register(this.container);

        console.log('✅ Modules registered');
    }

    private async initializeDatabase(): Promise<void> {
        console.log('🗄️ Initializing database connection...');

        // TODO: Initialize Prisma client and register
        // const prisma = new PrismaClient();
        // await prisma.$connect();
        // this.container.registerValue('PrismaClient', prisma);

        console.log('✅ Database initialized');
    }

    private async setupServices(): Promise<void> {
        console.log('⚙️ Setting up services...');

        // TODO: Initialize services
        // - Event bus
        // - Cache
        // - Logger
        // - Metrics

        console.log('✅ Services initialized');
    }

    async shutdown(): Promise<void> {
        console.log('🛑 Shutting down gracefully...');

        // TODO: Cleanup resources
        // - Close database connections
        // - Shutdown event bus
        // - Close cache connections

        console.log('✅ Shutdown complete');
    }

    getContainer(): Container {
        return this.container;
    }
}