# WMS Project Structure - Adaptive Modular Architecture

## 📁 Project Root Structure

```
wmlab/
├── backend/
├── frontend/
├── shared/
├── infrastructure/
├── docs/
├── scripts/
├── .github/
├── package.json
├── .env.example
└── README.md
```

## 🔧 Backend Structure (Node.js + Express + Prisma)

```
backend/
├── src/
│   ├── core/                      # Core Business Logic (Hexagonal Core)
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── Product.entity.ts
│   │   │   │   ├── User.entity.ts
│   │   │   │   ├── Order.entity.ts
│   │   │   │   ├── Warehouse.entity.ts
│   │   │   │   ├── Inventory.entity.ts
│   │   │   │   └── base/
│   │   │   │       └── BaseEntity.ts
│   │   │   ├── repositories/      # Repository Interfaces
│   │   │   │   ├── IProductRepository.ts
│   │   │   │   ├── IUserRepository.ts
│   │   │   │   ├── IOrderRepository.ts
│   │   │   │   └── IBaseRepository.ts
│   │   │   ├── services/          # Business Services
│   │   │   │   ├── ProductService.ts
│   │   │   │   ├── UserService.ts
│   │   │   │   ├── OrderService.ts
│   │   │   │   ├── InventoryService.ts
│   │   │   │   └── WarehouseService.ts
│   │   │   ├── events/            # Domain Events
│   │   │   │   ├── OrderCreatedEvent.ts
│   │   │   │   ├── ProductAddedEvent.ts
│   │   │   │   ├── InventoryUpdatedEvent.ts
│   │   │   │   └── EventBus.ts
│   │   │   └── value-objects/
│   │   │       ├── Money.ts
│   │   │       ├── Address.ts
│   │   │       └── Quantity.ts
│   │   │
│   │   ├── application/           # Application Layer
│   │   │   ├── use-cases/
│   │   │   │   ├── product/
│   │   │   │   │   ├── CreateProduct.usecase.ts
│   │   │   │   │   ├── UpdateProduct.usecase.ts
│   │   │   │   │   └── GetProducts.usecase.ts
│   │   │   │   ├── order/
│   │   │   │   │   ├── CreateOrder.usecase.ts
│   │   │   │   │   ├── ProcessOrder.usecase.ts
│   │   │   │   │   └── CancelOrder.usecase.ts
│   │   │   │   └── inventory/
│   │   │   │       ├── UpdateStock.usecase.ts
│   │   │   │       └── CheckAvailability.usecase.ts
│   │   │   ├── dto/               # Data Transfer Objects
│   │   │   │   ├── product/
│   │   │   │   │   ├── CreateProductDto.ts
│   │   │   │   │   ├── UpdateProductDto.ts
│   │   │   │   │   └── ProductResponseDto.ts
│   │   │   │   ├── order/
│   │   │   │   │   ├── CreateOrderDto.ts
│   │   │   │   │   └── OrderResponseDto.ts
│   │   │   │   └── user/
│   │   │   │       ├── CreateUserDto.ts
│   │   │   │       └── UserResponseDto.ts
│   │   │   └── facades/           # Facade Pattern
│   │   │       ├── ProductFacade.ts
│   │   │       ├── OrderFacade.ts
│   │   │       └── InventoryFacade.ts
│   │   │
│   │   └── shared/
│   │       ├── constants/
│   │       │   ├── app.constants.ts
│   │       │   ├── error.constants.ts
│   │       │   └── status.constants.ts
│   │       ├── exceptions/
│   │       │   ├── BaseException.ts
│   │       │   ├── ValidationException.ts
│   │       │   └── BusinessException.ts
│   │       └── interfaces/
│   │           ├── IConfig.ts
│   │           └── IContext.ts
│   │
│   ├── infrastructure/            # Infrastructure Layer (Adapters)
│   │   ├── persistence/
│   │   │   ├── prisma/
│   │   │   │   ├── schema.prisma
│   │   │   │   └── migrations/
│   │   │   ├── repositories/      # Repository Implementations
│   │   │   │   ├── impl/
│   │   │   │   │   ├── ProductRepository.impl.ts
│   │   │   │   │   ├── UserRepository.impl.ts
│   │   │   │   │   └── OrderRepository.impl.ts
│   │   │   │   └── factories/
│   │   │   │       └── RepositoryFactory.ts
│   │   │   └── models/           # Prisma Models
│   │   │       ├── Product.model.ts
│   │   │       ├── User.model.ts
│   │   │       └── Order.model.ts
│   │   │
│   │   ├── api/                   # API Layer
│   │   │   ├── controllers/
│   │   │   │   ├── ProductController.ts
│   │   │   │   ├── OrderController.ts
│   │   │   │   ├── UserController.ts
│   │   │   │   └── BaseController.ts
│   │   │   ├── routes/
│   │   │   │   ├── product.routes.ts
│   │   │   │   ├── order.routes.ts
│   │   │   │   ├── user.routes.ts
│   │   │   │   └── index.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   ├── validation.middleware.ts
│   │   │   │   ├── error.middleware.ts
│   │   │   │   └── logging.middleware.ts
│   │   │   └── validators/
│   │   │       ├── product.validator.ts
│   │   │       └── order.validator.ts
│   │   │
│   │   ├── messaging/             # Event System
│   │   │   ├── listeners/
│   │   │   │   ├── OrderEventListener.ts
│   │   │   │   ├── InventoryEventListener.ts
│   │   │   │   └── BaseListener.ts
│   │   │   ├── publishers/
│   │   │   │   └── EventPublisher.ts
│   │   │   └── adapters/
│   │   │       ├── RabbitMQAdapter.ts
│   │   │       ├── KafkaAdapter.ts
│   │   │       └── LocalEventAdapter.ts
│   │   │
│   │   ├── cache/
│   │   │   ├── RedisCache.impl.ts
│   │   │   ├── MemoryCache.impl.ts
│   │   │   └── CacheFactory.ts
│   │   │
│   │   └── external/              # External Services
│   │       ├── payment/
│   │       │   └── StripeAdapter.ts
│   │       ├── shipping/
│   │       │   └── ShippingAdapter.ts
│   │       └── notification/
│   │           ├── EmailService.ts
│   │           └── SMSService.ts
│   │
│   ├── config/                    # Configuration
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── cache.config.ts
│   │   ├── messaging.config.ts
│   │   └── environments/
│   │       ├── development.ts
│   │       ├── staging.ts
│   │       └── production.ts
│   │
│   ├── plugins/                   # Plugin System
│   │   ├── interfaces/
│   │   │   └── IPlugin.ts
│   │   ├── manager/
│   │   │   └── PluginManager.ts
│   │   └── builtin/
│   │       ├── LoggingPlugin.ts
│   │       ├── MetricsPlugin.ts
│   │       └── SecurityPlugin.ts
│   │
│   ├── i18n/                      # Internationalization
│   │   ├── locales/
│   │   │   ├── en/
│   │   │   │   ├── common.json
│   │   │   │   ├── errors.json
│   │   │   │   └── validation.json
│   │   │   └── ar/
│   │   │       ├── common.json
│   │   │       ├── errors.json
│   │   │       └── validation.json
│   │   └── i18n.config.ts
│   │
│   ├── utils/                     # Utilities
│   │   ├── logger/
│   │   │   ├── Logger.ts
│   │   │   └── LoggerFactory.ts
│   │   ├── helpers/
│   │   │   ├── date.helper.ts
│   │   │   ├── string.helper.ts
│   │   │   └── validation.helper.ts
│   │   ├── decorators/
│   │   │   ├── cache.decorator.ts
│   │   │   ├── log.decorator.ts
│   │   │   └── validate.decorator.ts
│   │   └── common/
│   │       ├── Result.ts
│   │       └── Either.ts
│   │
│   ├── visualization/             # Monitoring & Visualization
│   │   ├── metrics/
│   │   │   ├── MetricsCollector.ts
│   │   │   └── PrometheusExporter.ts
│   │   ├── tracing/
│   │   │   └── TracingService.ts
│   │   └── dashboards/
│   │       └── dashboard.config.ts
│   │
│   ├── host/                      # Application Hosting
│   │   ├── Server.ts
│   │   ├── App.ts
│   │   └── Bootstrap.ts
│   │
│   └── di/                        # Dependency Injection
│       ├── Container.ts
│       ├── modules/
│       │   ├── CoreModule.ts
│       │   ├── InfrastructureModule.ts
│       │   └── ApplicationModule.ts
│       └── decorators/
│           ├── Injectable.ts
│           └── Inject.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
│
├── prisma/
│   └── schema.prisma
│
└── package.json
```

## 🎨 Frontend Structure (React + Next.js)

```
frontend/
├── src/
│   ├── app/                       # Next.js App Directory
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── products/
│   │   │   ├── orders/
│   │   │   ├── inventory/
│   │   │   └── warehouse/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── core/
│   │   ├── domain/
│   │   │   ├── models/
│   │   │   └── types/
│   │   ├── services/
│   │   │   ├── ProductService.ts
│   │   │   ├── OrderService.ts
│   │   │   └── AuthService.ts
│   │   └── facades/
│   │       └── ApiFacade.ts
│   │
│   ├── infrastructure/
│   │   ├── api/
│   │   │   ├── client/
│   │   │   │   ├── ApiClient.ts
│   │   │   │   └── HttpClient.ts
│   │   │   ├── endpoints/
│   │   │   └── interceptors/
│   │   ├── store/               # State Management
│   │   │   ├── slices/
│   │   │   ├── middleware/
│   │   │   └── store.ts
│   │   └── cache/
│   │       └── QueryClient.ts
│   │
│   ├── presentation/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── features/
│   │   │   └── layouts/
│   │   ├── hooks/
│   │   ├── contexts/
│   │   └── providers/
│   │
│   ├── shared/
│   │   ├── constants/
│   │   ├── utils/
│   │   ├── helpers/
│   │   └── types/
│   │
│   ├── i18n/
│   │   ├── locales/
│   │   └── config.ts
│   │
│   └── visualization/
│       ├── charts/
│       ├── dashboards/
│       └── reports/
│
├── public/
├── styles/
└── package.json
```

## 🔗 Shared Structure

```
shared/
├── types/
│   ├── dto/
│   ├── entities/
│   └── api/
├── constants/
├── utils/
└── contracts/
```

### 10. Configuration System

```typescript
// backend/src/config/app.config.ts
export class AppConfig {
    private static instance: AppConfig;
    private config: Map<string, any> = new Map();
    private env: Environment;

    private constructor() {
        this.env = process.env.NODE_ENV as Environment || 'development';
        this.loadConfiguration();
    }

    static getInstance(): AppConfig {
        if (!AppConfig.instance) {
            AppConfig.instance = new AppConfig();
        }
        return AppConfig.instance;
    }

    private loadConfiguration(): void {
        // Load base configuration
        const baseConfig = this.loadBaseConfig();
        
        // Load environment-specific configuration
        const envConfig = this.loadEnvironmentConfig(this.env);
        
        // Merge configurations
        this.config = this.mergeConfigs(baseConfig, envConfig);
        
        // Load from environment variables
        this.loadFromEnv();
    }

    get<T>(path: string): T {
        const keys = path.split('.');
        let value = this.config;
        
        for (const key of keys) {
            value = value.get(key);
            if (!value) return undefined as T;
        }
        
        return value as T;
    }

    private loadFromEnv(): void {
        // Database
        this.config.set('database.url', process.env.DATABASE_URL);
        this.config.set('database.pool.max', parseInt(process.env.DB_POOL_MAX || '10'));
        
        // Cache
        this.config.set('cache.redis.url', process.env.REDIS_URL);
        
        // Messaging
        this.config.set('messaging.rabbitmq.url', process.env.RABBITMQ_URL);
        
        // Cloud/Local Switch
        this.config.set('deployment.mode', process.env.DEPLOYMENT_MODE || 'local');
    }
}

// backend/src/config/environments/production.ts
export const productionConfig = {
    app: {
        name: 'WMS Production',
        port: 3000,
        corsOrigins: ['https://wms.example.com']
    },
    database: {
        type: 'postgres',
        pool: {
            max: 20,
            min: 5,
            idle: 10000
        },
        ssl: true
    },
    cache: {
        strategy: 'redis',
        ttl: 3600
    },
    messaging: {
        type: 'rabbitmq',
        prefetch: 10
    },
    logging: {
        level: 'info',
        transports: ['file', 'elasticsearch']
    },
    features: {
        useCache: true,
        useEvents: true,
        useMetrics: true
    }
};
```

### 11. Helper & Utility Classes

```typescript
// backend/src/utils/helpers/validation.helper.ts
export class ValidationHelper {
    static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidSKU(sku: string): boolean {
        const skuRegex = /^[A-Z0-9]{6,12}$/;
        return skuRegex.test(sku);
    }

    static sanitizeInput(input: string): string {
        return input.trim().replace(/[<>]/g, '');
    }

    static validateDateRange(startDate: Date, endDate: Date): boolean {
        return startDate <= endDate;
    }
}

// backend/src/utils/common/Result.ts
export class Result<T> {
    public isSuccess: boolean;
    public isFailure: boolean;
    public error?: string;
    private _value?: T;

    private constructor(isSuccess: boolean, error?: string, value?: T) {
        if (isSuccess && error) {
            throw new Error('InvalidOperation: Success result cannot have error');
        }
        if (!isSuccess && !error) {
            throw new Error('InvalidOperation: Failure result must have error');
        }

        this.isSuccess = isSuccess;
        this.isFailure = !isSuccess;
        this.error = error;
        this._value = value;

        Object.freeze(this);
    }

    getValue(): T {
        if (!this.isSuccess) {
            throw new Error('Cannot get value from failure result');
        }
        return this._value as T;
    }

    static ok<U>(value?: U): Result<U> {
        return new Result<U>(true, undefined, value);
    }

    static fail<U>(error: string): Result<U> {
        return new Result<U>(false, error);
    }

    static combine(results: Result<any>[]): Result<any> {
        for (const result of results) {
            if (result.isFailure) return result;
        }
        return Result.ok();
    }
}
```

### 12. I18n Configuration

```typescript
// backend/src/i18n/i18n.config.ts
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';

@Injectable()
export class I18nService {
    private i18n: typeof i18next;

    constructor(@Inject('Config') private config: IConfig) {
        this.initialize();
    }

    private async initialize(): Promise<void> {
        await i18next
            .use(Backend)
            .use(middleware.LanguageDetector)
            .init({
                fallbackLng: 'en',
                preload: ['en', 'ar'],
                backend: {
                    loadPath: './src/i18n/locales/{{lng}}/{{ns}}.json'
                },
                detection: {
                    order: ['header', 'querystring', 'cookie'],
                    caches: ['cookie']
                }
            });

        this.i18n = i18next;
    }

    translate(key: string, lng?: string, params?: any): string {
        return this.i18n.t(key, { lng, ...params });
    }

    getMiddleware() {
        return middleware.handle(this.i18n);
    }
}
```

### 13. Visualization & Metrics

```typescript
// backend/src/visualization/metrics/MetricsCollector.ts
export class MetricsCollector {
    private metrics: Map<string, Metric> = new Map();
    private registry: Registry;

    constructor() {
        this.registry = new Registry();
        this.setupDefaultMetrics();
    }

    private setupDefaultMetrics(): void {
        // System metrics
        this.createGauge('system_memory_usage', 'System memory usage in bytes');
        this.createGauge('system_cpu_usage', 'System CPU usage percentage');
        
        // Application metrics
        this.createCounter('http_requests_total', 'Total HTTP requests');
        this.createHistogram('http_request_duration', 'HTTP request duration in ms');
        this.createGauge('active_connections', 'Number of active connections');
        
        // Business metrics
        this.createCounter('orders_created_total', 'Total orders created');
        this.createGauge('inventory_levels', 'Current inventory levels');
        this.createHistogram('order_processing_time', 'Order processing time in seconds');
    }

    incrementCounter(name: string, labels?: Record<string, string>): void {
        const counter = this.metrics.get(name) as Counter;
        if (counter) {
            counter.inc(labels);
        }
    }

    recordDuration(name: string, value: number, labels?: Record<string, string>): void {
        const histogram = this.metrics.get(name) as Histogram;
        if (histogram) {
            histogram.observe(labels, value);
        }
    }

    setGauge(name: string, value: number, labels?: Record<string, string>): void {
        const gauge = this.metrics.get(name) as Gauge;
        if (gauge) {
            gauge.set(labels, value);
        }
    }

    async getMetrics(): Promise<string> {
        return this.registry.metrics();
    }
}
```

### 14. Host & Bootstrap

```typescript
// backend/src/host/Bootstrap.ts
export class Bootstrap {
    private container: Container;
    private server: Server;
    private config: AppConfig;

    async initialize(): Promise<void> {
        console.log('🚀 Initializing WMS Application...');
        
        // Initialize configuration
        this.config = AppConfig.getInstance();
        
        // Setup DI Container
        this.container = Container.getInstance();
        await this.registerModules();
        
        // Initialize database
        await this.initializeDatabase();
        
        // Load plugins
        await this.loadPlugins();
        
        // Setup event system
        await this.setupEventSystem();
        
        // Initialize cache
        await this.initializeCache();
        
        // Create server
        this.server = new Server(this.container);
    }

    private async registerModules(): Promise<void> {
        CoreModule.register(this.container);
        InfrastructureModule.register(this.container);
        ApplicationModule.register(this.container);
        
        console.log('✅ Modules registered');
    }

    private async initializeDatabase(): Promise<void> {
        const prisma = new PrismaClient({
            log: this.config.get('database.logging') ? ['query', 'info', 'warn', 'error'] : []
        });
        
        await prisma.$connect();
        this.container.register('PrismaClient', () => prisma, { singleton: true });
        
        console.log('✅ Database connected');
    }

    private async setupEventSystem(): Promise<void> {
        const deploymentMode = this.config.get('deployment.mode');
        
        let eventBus: IEventBus;
        if (deploymentMode === 'cloud') {
            eventBus = new RabbitMQEventBus(this.config.get('messaging.rabbitmq'));
        } else {
            eventBus = new LocalEventBus();
        }
        
        await eventBus.initialize();
        this.container.register('EventBus', () => eventBus, { singleton: true });
        
        // Register event listeners
        this.registerEventListeners();
        
        console.log('✅ Event system initialized');
    }

    private async initializeCache(): Promise<void> {
        const cacheStrategy = this.config.get('cache.strategy');
        
        let cacheService: ICacheService;
        if (cacheStrategy === 'redis') {
            cacheService = new RedisCacheService(this.config.get('cache.redis'));
        } else {
            cacheService = new MemoryCacheService();
        }
        
        await cacheService.connect();
        this.container.register('CacheService', () => cacheService, { singleton: true });
        
        console.log('✅ Cache initialized');
    }

    private async loadPlugins(): Promise<void> {
        const pluginManager = new PluginManager(
            this.container,
            this.config,
            this.container.resolve('Logger')
        );
        
        await pluginManager.loadPlugins();
        this.container.register('PluginManager', () => pluginManager, { singleton: true });
        
        console.log('✅ Plugins loaded');
    }

    private registerEventListeners(): void {
        const eventBus = this.container.resolve<IEventBus>('EventBus');
        
        // Register domain event listeners
        const orderListener = new OrderEventListener(
            this.container.resolve('InventoryService'),
            this.container.resolve('NotificationService'),
            this.container.resolve('Logger')
        );
        
        eventBus.subscribe('order.created', orderListener.handleOrderCreated.bind(orderListener));
        eventBus.subscribe('order.cancelled', orderListener.handleOrderCancelled.bind(orderListener));
        
        // Register other listeners...
    }

    async start(): Promise<void> {
        await this.initialize();
        const port = this.config.get<number>('app.port');
        
        await this.server.listen(port);
        console.log(`
        ╔════════════════════════════════════════╗
        ║   WMS Server running on port ${port}     ║
        ║   Environment: ${this.config.get('app.env')}         ║
        ║   Deployment: ${this.config.get('deployment.mode')}           ║
        ╚════════════════════════════════════════╝
        `);
    }

    async shutdown(): Promise<void> {
        console.log('Shutting down gracefully...');
        
        // Close server
        await this.server?.close();
        
        // Disconnect services
        const prisma = this.container.resolve('PrismaClient');
        await prisma.$disconnect();
        
        const cache = this.container.resolve('CacheService');
        await cache.disconnect();
        
        const eventBus = this.container.resolve('EventBus');
        await eventBus.close();
        
        console.log('Shutdown complete');
    }
}

// backend/src/index.ts
import { Bootstrap } from './host/Bootstrap';

const bootstrap = new Bootstrap();

// Start application
bootstrap.start().catch(error => {
    console.error('Failed to start application:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    await bootstrap.shutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await bootstrap.shutdown();
    process.exit(0);
});
```

## 📦 Additional Technologies to Use

### Backend Technologies:
- **Message Queues**: RabbitMQ, Apache Kafka, AWS SQS
- **Caching**: Redis, Memcached
- **Search**: Elasticsearch, Algolia
- **Monitoring**: Prometheus, Grafana, New Relic
- **Logging**: Winston, Pino, ELK Stack
- **API Documentation**: Swagger/OpenAPI, API Blueprint
- **Testing**: Jest, Mocha, Supertest
- **Security**: Helmet, express-rate-limit, bcrypt, JWT
- **Validation**: Joi, Yup, class-validator
- **ORM/ODM**: Prisma, TypeORM, Mongoose
- **Task Scheduling**: Bull, Agenda, node-cron
- **File Storage**: AWS S3, MinIO, Multer

### Frontend Technologies:
- **State Management**: Redux Toolkit, Zustand, Jotai
- **UI Libraries**: Material-UI, Ant Design, Chakra UI, shadcn/ui
- **Forms**: React Hook Form, Formik
- **Charts**: Recharts, Chart.js, D3.js
- **Tables**: TanStack Table, AG-Grid
- **API Client**: Axios, TanStack Query, SWR
- **Styling**: Tailwind CSS, styled-components, Emotion
- **Testing**: Jest, React Testing Library, Cypress
- **Build Tools**: Vite, Turbo, Webpack
- **Documentation**: Storybook, Docusaurus

### DevOps & Infrastructure:
- **Containers**: Docker, Kubernetes
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins
- **Cloud**: AWS, GCP, Azure, Vercel
- **Monitoring**: DataDog, Sentry
- **Database**: PostgreSQL, MongoDB, Redis
- **CDN**: CloudFlare, AWS CloudFront
- **Load Balancing**: Nginx, HAProxy

## 💻 Code Examples

### 1. Entity Example (Product.entity.ts)

```typescript
// backend/src/core/domain/entities/Product.entity.ts
export class Product extends BaseEntity {
    private _id: string;
    private _name: string;
    private _sku: string;
    private _price: Money;
    private _quantity: Quantity;
    private _category: Category;
    private _warehouse: Warehouse;
    private _createdAt: Date;
    private _updatedAt: Date;

    constructor(props: ProductProps) {
        super();
        this.validate(props);
        this._id = props.id || this.generateId();
        this._name = props.name;
        this._sku = props.sku;
        this._price = new Money(props.price);
        this._quantity = new Quantity(props.quantity);
        this._category = props.category;
        this._warehouse = props.warehouse;
        this._createdAt = props.createdAt || new Date();
        this._updatedAt = props.updatedAt || new Date();
    }

    // Domain logic
    public updateStock(quantity: number): void {
        this._quantity = this._quantity.add(quantity);
        this._updatedAt = new Date();
        this.addDomainEvent(new StockUpdatedEvent(this));
    }

    public canFulfillOrder(requestedQuantity: number): boolean {
        return this._quantity.getValue() >= requestedQuantity;
    }

    // Getters
    get id(): string { return this._id; }
    get name(): string { return this._name; }
    get sku(): string { return this._sku; }
    get price(): Money { return this._price; }
    get quantity(): Quantity { return this._quantity; }
}
```

### 2. Repository Interface & Implementation

```typescript
// backend/src/core/domain/repositories/IProductRepository.ts
export interface IProductRepository {
    findById(id: string): Promise<Product | null>;
    findBySku(sku: string): Promise<Product | null>;
    findAll(filters?: ProductFilters): Promise<Product[]>;
    save(product: Product): Promise<void>;
    update(product: Product): Promise<void>;
    delete(id: string): Promise<void>;
}

// backend/src/infrastructure/persistence/repositories/impl/ProductRepository.impl.ts
@Injectable()
export class ProductRepositoryImpl implements IProductRepository {
    constructor(
        @Inject('PrismaClient') private prisma: PrismaClient,
        @Inject('CacheService') private cache: ICacheService,
        @Inject('EventBus') private eventBus: IEventBus
    ) {}

    async findById(id: string): Promise<Product | null> {
        // Check cache first
        const cached = await this.cache.get(`product:${id}`);
        if (cached) return ProductMapper.toDomain(cached);

        const data = await this.prisma.product.findUnique({
            where: { id },
            include: { category: true, warehouse: true }
        });

        if (!data) return null;

        const product = ProductMapper.toDomain(data);
        await this.cache.set(`product:${id}`, data, 3600);
        
        return product;
    }

    async save(product: Product): Promise<void> {
        const data = ProductMapper.toPersistence(product);
        await this.prisma.product.create({ data });
        
        // Publish domain events
        product.getUncommittedEvents().forEach(event => {
            this.eventBus.publish(event);
        });
        
        product.markEventsAsCommitted();
    }
}
```

### 3. Service Layer

```typescript
// backend/src/core/domain/services/ProductService.ts
@Injectable()
export class ProductService {
    constructor(
        @Inject('ProductRepository') private productRepo: IProductRepository,
        @Inject('WarehouseService') private warehouseService: WarehouseService,
        @Inject('Logger') private logger: ILogger
    ) {}

    async createProduct(data: CreateProductDto): Promise<Result<Product>> {
        try {
            // Business validation
            const warehouse = await this.warehouseService.checkCapacity(
                data.warehouseId, 
                data.quantity
            );
            
            if (!warehouse.isSuccess()) {
                return Result.fail(warehouse.error);
            }

            // Check for duplicate SKU
            const existing = await this.productRepo.findBySku(data.sku);
            if (existing) {
                return Result.fail('Product with this SKU already exists');
            }

            // Create product entity
            const product = new Product({
                name: data.name,
                sku: data.sku,
                price: data.price,
                quantity: data.quantity,
                category: data.category,
                warehouse: warehouse.getValue()
            });

            // Save to repository
            await this.productRepo.save(product);
            
            this.logger.info(`Product created: ${product.id}`);
            return Result.ok(product);
            
        } catch (error) {
            this.logger.error('Error creating product', error);
            return Result.fail('Failed to create product');
        }
    }

    async updateStock(
        productId: string, 
        quantity: number, 
        operation: 'ADD' | 'REMOVE'
    ): Promise<Result<void>> {
        const product = await this.productRepo.findById(productId);
        
        if (!product) {
            return Result.fail('Product not found');
        }

        if (operation === 'ADD') {
            product.updateStock(quantity);
        } else {
            if (!product.canFulfillOrder(quantity)) {
                return Result.fail('Insufficient stock');
            }
            product.updateStock(-quantity);
        }

        await this.productRepo.update(product);
        return Result.ok();
    }
}
```

### 4. Facade Pattern

```typescript
// backend/src/core/application/facades/ProductFacade.ts
@Injectable()
export class ProductFacade {
    constructor(
        @Inject('CreateProductUseCase') private createProduct: CreateProductUseCase,
        @Inject('UpdateProductUseCase') private updateProduct: UpdateProductUseCase,
        @Inject('GetProductsUseCase') private getProducts: GetProductsUseCase,
        @Inject('ProductService') private productService: ProductService,
        @Inject('InventoryService') private inventoryService: InventoryService
    ) {}

    async createProductWithInventory(data: CreateProductRequest): Promise<ProductResponse> {
        // Orchestrate multiple services
        const product = await this.createProduct.execute(data);
        await this.inventoryService.initializeInventory(product.id);
        
        return ProductMapper.toResponse(product);
    }

    async getProductsWithAvailability(filters: ProductFilters): Promise<ProductWithStock[]> {
        const products = await this.getProducts.execute(filters);
        
        // Enrich with inventory data
        const enrichedProducts = await Promise.all(
            products.map(async (product) => {
                const stock = await this.inventoryService.getStock(product.id);
                return {
                    ...ProductMapper.toResponse(product),
                    availableStock: stock.available,
                    reservedStock: stock.reserved
                };
            })
        );

        return enrichedProducts;
    }
}
```

### 5. Factory Pattern

```typescript
// backend/src/infrastructure/persistence/repositories/factories/RepositoryFactory.ts
@Injectable()
export class RepositoryFactory {
    constructor(
        @Inject('Container') private container: Container,
        @Inject('Config') private config: IConfig
    ) {}

    createProductRepository(): IProductRepository {
        const dbType = this.config.get('database.type');
        
        switch (dbType) {
            case 'postgres':
                return this.container.resolve('PostgresProductRepository');
            case 'mongodb':
                return this.container.resolve('MongoProductRepository');
            case 'memory':
                return this.container.resolve('InMemoryProductRepository');
            default:
                throw new Error(`Unsupported database type: ${dbType}`);
        }
    }

    createOrderRepository(): IOrderRepository {
        // Similar implementation
        const strategy = this.config.get('order.storage.strategy');
        
        if (strategy === 'event-sourced') {
            return this.container.resolve('EventSourcedOrderRepository');
        }
        
        return this.createStandardRepository('Order');
    }

    private createStandardRepository(entityName: string): any {
        const repoName = `${entityName}Repository`;
        return this.container.resolve(repoName);
    }
}
```

### 6. Event System

```typescript
// backend/src/core/domain/events/OrderCreatedEvent.ts
export class OrderCreatedEvent extends DomainEvent {
    constructor(
        public readonly order: Order,
        public readonly customerId: string,
        public readonly items: OrderItem[]
    ) {
        super('order.created');
    }

    getAggregateId(): string {
        return this.order.id;
    }

    getEventData(): any {
        return {
            orderId: this.order.id,
            customerId: this.customerId,
            items: this.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
            })),
            total: this.order.total,
            createdAt: this.occurredOn
        };
    }
}

// backend/src/infrastructure/messaging/listeners/OrderEventListener.ts
@Injectable()
export class OrderEventListener extends BaseListener {
    constructor(
        @Inject('InventoryService') private inventoryService: InventoryService,
        @Inject('NotificationService') private notificationService: NotificationService,
        @Inject('Logger') private logger: ILogger
    ) {
        super();
    }

    @EventHandler('order.created')
    async handleOrderCreated(event: OrderCreatedEvent): Promise<void> {
        this.logger.info(`Processing order created event: ${event.order.id}`);
        
        try {
            // Reserve inventory
            for (const item of event.items) {
                await this.inventoryService.reserveStock(
                    item.productId, 
                    item.quantity,
                    event.order.id
                );
            }

            // Send notification
            await this.notificationService.notifyOrderCreated(event.order);
            
        } catch (error) {
            this.logger.error(`Failed to process order event`, error);
            // Implement compensation logic
            throw error;
        }
    }
}
```

### 7. Dependency Injection Container

```typescript
// backend/src/di/Container.ts
export class Container {
    private static instance: Container;
    private services: Map<string, any> = new Map();
    private singletons: Map<string, any> = new Map();
    private factories: Map<string, () => any> = new Map();

    static getInstance(): Container {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }

    register<T>(token: string, factory: () => T, options?: RegisterOptions): void {
        if (options?.singleton) {
            this.singletons.set(token, null);
        }
        this.factories.set(token, factory);
    }

    resolve<T>(token: string): T {
        // Check if singleton exists
        if (this.singletons.has(token)) {
            let instance = this.singletons.get(token);
            if (!instance) {
                instance = this.createInstance(token);
                this.singletons.set(token, instance);
            }
            return instance;
        }

        // Create new instance
        return this.createInstance(token);
    }

    private createInstance<T>(token: string): T {
        const factory = this.factories.get(token);
        if (!factory) {
            throw new Error(`No factory registered for token: ${token}`);
        }
        return factory();
    }
}

// backend/src/di/modules/CoreModule.ts
export class CoreModule {
    static register(container: Container): void {
        // Register repositories
        container.register('ProductRepository', 
            () => new ProductRepositoryImpl(
                container.resolve('PrismaClient'),
                container.resolve('CacheService'),
                container.resolve('EventBus')
            ),
            { singleton: true }
        );

        // Register services
        container.register('ProductService',
            () => new ProductService(
                container.resolve('ProductRepository'),
                container.resolve('WarehouseService'),
                container.resolve('Logger')
            ),
            { singleton: true }
        );

        // Register use cases
        container.register('CreateProductUseCase',
            () => new CreateProductUseCase(
                container.resolve('ProductService'),
                container.resolve('Validator')
            )
        );

        // Register facades
        container.register('ProductFacade',
            () => new ProductFacade(
                container.resolve('CreateProductUseCase'),
                container.resolve('UpdateProductUseCase'),
                container.resolve('GetProductsUseCase'),
                container.resolve('ProductService'),
                container.resolve('InventoryService')
            ),
            { singleton: true }
        );
    }
}
```

### 8. Controller with Decorators

```typescript
// backend/src/infrastructure/api/controllers/ProductController.ts
@Controller('/api/products')
@UseMiddleware(AuthMiddleware)
export class ProductController extends BaseController {
    constructor(
        @Inject('ProductFacade') private productFacade: ProductFacade,
        @Inject('Logger') private logger: ILogger
    ) {
        super();
    }

    @Post('/')
    @ValidateBody(CreateProductDto)
    @UseCache({ ttl: 0 }) // No cache for POST
    async createProduct(
        @Body() data: CreateProductDto,
        @Context() ctx: IRequestContext
    ): Promise<ApiResponse<ProductResponse>> {
        try {
            const result = await this.productFacade.createProductWithInventory(data);
            
            this.logger.info(`Product created by user ${ctx.userId}`);
            
            return this.success(result, 'Product created successfully', 201);
        } catch (error) {
            return this.handleError(error);
        }
    }

    @Get('/')
    @UseCache({ ttl: 300 }) // Cache for 5 minutes
    async getProducts(
        @Query() filters: ProductFilters
    ): Promise<ApiResponse<ProductResponse[]>> {
        try {
            const products = await this.productFacade.getProductsWithAvailability(filters);
            return this.success(products);
        } catch (error) {
            return this.handleError(error);
        }
    }

    @Put('/:id/stock')
    @ValidateBody(UpdateStockDto)
    @RequirePermission('inventory.update')
    async updateStock(
        @Param('id') productId: string,
        @Body() data: UpdateStockDto
    ): Promise<ApiResponse<void>> {
        try {
            await this.productFacade.updateProductStock(
                productId, 
                data.quantity, 
                data.operation
            );
            
            return this.success(null, 'Stock updated successfully');
        } catch (error) {
            return this.handleError(error);
        }
    }
}
```

### 9. Plugin System

```typescript
// backend/src/plugins/interfaces/IPlugin.ts
export interface IPlugin {
    name: string;
    version: string;
    initialize(container: Container): Promise<void>;
    execute(context: PluginContext): Promise<void>;
    shutdown(): Promise<void>;
}

// backend/src/plugins/manager/PluginManager.ts
@Injectable()
export class PluginManager {
    private plugins: Map<string, IPlugin> = new Map();
    private hooks: Map<string, Set<PluginHook>> = new Map();

    constructor(
        @Inject('Container') private container: Container,
        @Inject('Config') private config: IConfig,
        @Inject('Logger') private logger: ILogger
    ) {}

    async loadPlugins(): Promise<void> {
        const pluginConfig = this.config.get('plugins');
        
        for (const pluginDef of pluginConfig) {
            if (pluginDef.enabled) {
                await this.loadPlugin(pluginDef);
            }
        }
    }

    private async loadPlugin(definition: PluginDefinition): Promise<void> {
        try {
            const PluginClass = await this.resolvePlugin(definition.path);
            const plugin = new PluginClass(definition.config);
            
            await plugin.initialize(this.container);
            this.plugins.set(plugin.name, plugin);
            
            this.logger.info(`Plugin loaded: ${plugin.name} v${plugin.version}`);
        } catch (error) {
            this.logger.error(`Failed to load plugin: ${definition.name}`, error);
            throw error;
        }
    }

    async executeHook(hookName: string, context: any): Promise<void> {
        const hooks = this.hooks.get(hookName) || new Set();
        
        for (const hook of hooks) {
            await hook.execute(context);
        }
    }

    registerHook(hookName: string, hook: PluginHook): void {
        if (!this.hooks.has(hookName)) {
            this.hooks.set(hookName, new Set());
        }
        this.hooks.get(hookName)!.add(hook);
    }
}

// backend/src/plugins/builtin/MetricsPlugin.ts
export class MetricsPlugin implements IPlugin {
    name = 'MetricsPlugin';
    version = '1.0.0';
    private metricsCollector: MetricsCollector;

    async initialize(container: Container): Promise<void> {
        this.metricsCollector = new MetricsCollector();
        container.register('MetricsCollector', () => this.metricsCollector);
        
        // Register hooks
        const pluginManager = container.resolve('PluginManager');
        pluginManager.registerHook('api.request', {
            execute: async (context) => {
                this.metricsCollector.incrementCounter('api_requests_total', {
                    method: context.method,
                    path: context.path
                });
            }
        });
    }

    async execute(context: PluginContext): Promise<void> {
        // Collect metrics based on context
        this.metricsCollector.recordDuration(
            'request_duration_ms',
            context.duration,
            { endpoint: context.endpoint }
        );
    }

    async shutdown(): Promise<void> {
        await this.metricsCollector.flush();
    }
}
------------------------------------------------------------------------------------------------------------------------
Q:In the Adaptive Modular Architecture, What the why that frontend call api from backend, 
can give me the steps and with examples

Answer:
Frontend (React/Next.js) 
    ↓
[1. UI Component] 
    ↓
[2. Custom Hook]
    ↓
[3. Service Layer]
    ↓
[4. API Facade]
    ↓
[5. HTTP Client]
    ↓
[6. API Client with Interceptors]
    ↓
═══════ Network ═══════
    ↓
Backend (Node.js/Express)
    ↓
[7. Middleware Chain]
    ↓
[8. Controller]
    ↓
[9. Use Case]
    ↓
[10. Service/Facade]
    ↓
[11. Repository]
    ↓
[12. Database]
    ↓
═══════ Response ═══════
    ↓
Back to Frontend