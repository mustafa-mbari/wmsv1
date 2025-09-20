import { Type } from '../core/shared/types/common.types';

export interface ServiceDescriptor {
    token: string;
    factory: () => any;
    singleton?: boolean;
    dependencies?: string[];
}

export interface RegisterOptions {
    singleton?: boolean;
    dependencies?: string[];
}

export class Container {
    private static instance: Container;
    private services: Map<string, ServiceDescriptor> = new Map();
    private singletonInstances: Map<string, any> = new Map();
    private resolutionStack: Set<string> = new Set();

    private constructor() {}

    static getInstance(): Container {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }

    register<T>(
        token: string,
        factory: () => T,
        options: RegisterOptions = {}
    ): void {
        const descriptor: ServiceDescriptor = {
            token,
            factory,
            singleton: options.singleton || false,
            dependencies: options.dependencies || []
        };

        this.services.set(token, descriptor);

        // Clear singleton instance if re-registering
        if (this.singletonInstances.has(token)) {
            this.singletonInstances.delete(token);
        }
    }

    registerClass<T>(
        token: string,
        targetClass: Type<T>,
        options: RegisterOptions = {}
    ): void {
        this.register(token, () => new targetClass(), options);
    }

    registerValue<T>(token: string, value: T): void {
        this.register(token, () => value, { singleton: true });
    }

    resolve<T>(token: string): T {
        // Check for circular dependencies
        if (this.resolutionStack.has(token)) {
            const stack = Array.from(this.resolutionStack).join(' -> ');
            throw new Error(`Circular dependency detected: ${stack} -> ${token}`);
        }

        const descriptor = this.services.get(token);
        if (!descriptor) {
            throw new Error(`Service '${token}' not registered in container`);
        }

        // Return singleton instance if exists
        if (descriptor.singleton && this.singletonInstances.has(token)) {
            return this.singletonInstances.get(token);
        }

        // Add to resolution stack
        this.resolutionStack.add(token);

        try {
            // Resolve dependencies first
            const resolvedDependencies: any[] = [];
            if (descriptor.dependencies) {
                for (const dep of descriptor.dependencies) {
                    resolvedDependencies.push(this.resolve(dep));
                }
            }

            // Create instance
            const instance = descriptor.factory();

            // Store singleton instance
            if (descriptor.singleton) {
                this.singletonInstances.set(token, instance);
            }

            return instance;
        } finally {
            // Remove from resolution stack
            this.resolutionStack.delete(token);
        }
    }

    has(token: string): boolean {
        return this.services.has(token);
    }

    clear(): void {
        this.services.clear();
        this.singletonInstances.clear();
        this.resolutionStack.clear();
    }

    getAllTokens(): string[] {
        return Array.from(this.services.keys());
    }

    getSingletonTokens(): string[] {
        return Array.from(this.services.entries())
            .filter(([, descriptor]) => descriptor.singleton)
            .map(([token]) => token);
    }

    // Utility method for testing
    reset(): void {
        this.clear();
        Container.instance = new Container();
    }
}

// Export singleton instance
export const container = Container.getInstance();