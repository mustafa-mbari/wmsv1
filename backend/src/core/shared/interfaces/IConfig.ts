/**
 * Configuration interface
 */
export interface IConfig {
    // Application settings
    app: {
        name: string;
        port: number;
        env: 'development' | 'staging' | 'production';
        corsOrigins: string[];
        jwtSecret: string;
        jwtExpiresIn: string;
    };

    // Database settings
    database: {
        url: string;
        type: 'postgres' | 'mysql' | 'sqlite';
        pool: {
            max: number;
            min: number;
            idle: number;
        };
        ssl: boolean;
        logging: boolean;
    };

    // Cache settings
    cache: {
        strategy: 'redis' | 'memory';
        redis?: {
            url: string;
            keyPrefix: string;
        };
        ttl: number;
    };

    // Messaging settings
    messaging: {
        type: 'rabbitmq' | 'local';
        rabbitmq?: {
            url: string;
            exchange: string;
        };
        prefetch: number;
    };

    // Logging settings
    logging: {
        level: 'error' | 'warn' | 'info' | 'debug';
        transports: string[];
        file?: {
            path: string;
            maxSize: string;
            maxFiles: number;
        };
    };

    // Feature flags
    features: {
        useCache: boolean;
        useEvents: boolean;
        useMetrics: boolean;
        useI18n: boolean;
    };

    // File upload settings
    upload: {
        maxFileSize: number;
        allowedMimeTypes: string[];
        destination: string;
    };

    // External services
    external: {
        email?: {
            provider: string;
            apiKey: string;
            from: string;
        };
        storage?: {
            provider: string;
            bucket: string;
            region: string;
        };
    };
}