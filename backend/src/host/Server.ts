import 'reflect-metadata';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Bootstrap } from './Bootstrap';
import { Container } from '../di/Container';
// import { container } from '../core/infrastructure/container/Container'; // Temporarily disabled due to import issues
// import v2Routes from '../core/api/routes/v2'; // Temporarily disabled due to import issues

// Load environment variables
dotenv.config();

/**
 * Server class for the WMS application
 */
export class Server {
    private app: Application;
    private bootstrap: Bootstrap;
    private container: Container;
    private port: number;

    constructor() {
        this.app = express();
        this.bootstrap = new Bootstrap();
        this.container = Container.getInstance();
        this.port = parseInt(process.env.PORT || '8000');
    }

    async initialize(): Promise<void> {
        // Initialize the application
        await this.bootstrap.initialize();
        this.container = this.bootstrap.getContainer();

        // Initialize Enhanced Container for modern DI architecture
        // Container is already initialized in the import

        // Setup Express middleware
        this.setupMiddleware();

        // Setup routes
        this.setupRoutes();

        // Setup error handling
        this.setupErrorHandling();
    }

    private setupMiddleware(): void {
        // Security
        this.app.use(helmet());

        // CORS
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            credentials: true
        }));

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    private setupRoutes(): void {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'ok',
                timestamp: new Date().toISOString(),
                architecture: 'Adaptive Modular Architecture',
                version: '1.0.0'
            });
        });

        // API info endpoint
        this.app.get('/api/info', (req, res) => {
            res.json({
                name: 'WMS API',
                version: '1.0.0',
                architecture: 'Hexagonal Architecture with DDD',
                environment: process.env.NODE_ENV || 'development',
                features: [
                    'Dependency Injection',
                    'Domain-Driven Design',
                    'Repository Pattern',
                    'Use Cases',
                    'Event System'
                ]
            });
        });

        // Include original API routes from app.ts
        this.setupLegacyRoutes();

        // Domain-Driven Design API routes (v2) - temporarily disabled
        // this.app.use('/api/v2', v2Routes);

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: `Route ${req.method} ${req.originalUrl} not found`,
                timestamp: new Date().toISOString()
            });
        });
    }

    private setupLegacyRoutes(): void {
        // Add simple mock routes for testing the frontend
        console.log('🔄 Setting up mock API routes for testing...');

        // Mock products endpoint
        this.app.get('/api/products', (req, res) => {
            res.json({
                success: true,
                data: [
                    {
                        id: '1',
                        name: 'Sample Product 1',
                        sku: 'PROD-001',
                        description: 'This is a sample product for testing',
                        price: 29.99,
                        cost: 15.00,
                        stock_quantity: 100,
                        status: 'active',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    },
                    {
                        id: '2',
                        name: 'Sample Product 2',
                        sku: 'PROD-002',
                        description: 'Another sample product for testing',
                        price: 49.99,
                        cost: 25.00,
                        stock_quantity: 50,
                        status: 'active',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ],
                message: 'Products retrieved successfully'
            });
        });

        // Mock product creation
        this.app.post('/api/products', (req, res) => {
            const newProduct = {
                id: Date.now().toString(),
                ...req.body,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            res.json({
                success: true,
                data: newProduct,
                message: 'Product created successfully'
            });
        });

        // Mock users endpoint
        this.app.get('/api/users', (req, res) => {
            res.json({
                success: true,
                data: [
                    {
                        id: '1',
                        username: 'admin',
                        email: 'admin@example.com',
                        first_name: 'Admin',
                        last_name: 'User',
                        phone: '+1234567890',
                        roles: ['admin'],
                        is_active: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    },
                    {
                        id: '2',
                        username: 'user1',
                        email: 'user1@example.com',
                        first_name: 'John',
                        last_name: 'Doe',
                        phone: '+0987654321',
                        roles: ['user'],
                        is_active: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ],
                message: 'Users retrieved successfully'
            });
        });

        // Mock warehouses endpoint
        this.app.get('/api/warehouses', (req, res) => {
            res.json({
                success: true,
                data: [
                    {
                        id: '1',
                        name: 'Main Warehouse',
                        code: 'WH-001',
                        description: 'Primary warehouse facility',
                        address: {
                            street: '123 Main St',
                            city: 'Anytown',
                            state: 'State',
                            country: 'Country',
                            postal_code: '12345'
                        },
                        status: 'active',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ],
                message: 'Warehouses retrieved successfully'
            });
        });

        // Legacy health check
        this.app.get('/api/health', (req, res) => {
            res.json({
                success: true,
                data: {
                    status: 'OK',
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                }
            });
        });

        console.log('✅ Mock API routes set up successfully');
    }

    private setupErrorHandling(): void {
        // Global error handler
        this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            console.error('Global error handler:', error);

            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Internal server error',
                timestamp: new Date().toISOString(),
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            });
        });
    }

    async start(): Promise<void> {
        await this.initialize();

        return new Promise((resolve) => {
            this.app.listen(this.port, () => {
                console.log(`
╔════════════════════════════════════════════════════════════╗
║                    WMS Server Started                      ║
║                                                            ║
║   🚀 Server running on: http://localhost:${this.port}           ║
║   📐 Architecture: Adaptive Modular Architecture           ║
║   🌍 Environment: ${(process.env.NODE_ENV || 'development').padEnd(11)}                    ║
║   ⚡ Features: DI, DDD, Repository Pattern, Use Cases     ║
║                                                            ║
║   🔗 Health Check: http://localhost:${this.port}/health         ║
║   📊 API Info: http://localhost:${this.port}/api/info          ║
╚════════════════════════════════════════════════════════════╝
                `);
                resolve();
            });
        });
    }

    async stop(): Promise<void> {
        await this.bootstrap.shutdown();
        process.exit(0);
    }
}

// Start the server if this file is run directly
if (require.main === module) {
    const server = new Server();

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        console.log('SIGTERM received, shutting down gracefully...');
        await server.stop();
    });

    process.on('SIGINT', async () => {
        console.log('SIGINT received, shutting down gracefully...');
        await server.stop();
    });

    // Start the server
    server.start().catch((error) => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });
}