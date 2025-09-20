import 'reflect-metadata';

export const INJECTABLE_METADATA_KEY = Symbol('injectable');
export const DEPENDENCIES_METADATA_KEY = Symbol('dependencies');

export interface InjectableOptions {
    singleton?: boolean;
    token?: string;
}

/**
 * Decorator to mark a class as injectable
 * @param options Configuration options for the injectable class
 */
export function Injectable(options: InjectableOptions = {}) {
    return function <T extends new (...args: any[]) => any>(target: T) {
        // Store metadata about the injectable class
        Reflect.defineMetadata(INJECTABLE_METADATA_KEY, {
            singleton: options.singleton || false,
            token: options.token || target.name
        }, target);

        // Store constructor parameter types for automatic dependency resolution
        const paramTypes = Reflect.getMetadata('design:paramtypes', target) || [];
        Reflect.defineMetadata(DEPENDENCIES_METADATA_KEY, paramTypes, target);

        return target;
    };
}

/**
 * Get injectable metadata from a class
 */
export function getInjectableMetadata(target: any): InjectableOptions | undefined {
    return Reflect.getMetadata(INJECTABLE_METADATA_KEY, target);
}

/**
 * Get dependency metadata from a class
 */
export function getDependencyMetadata(target: any): any[] {
    return Reflect.getMetadata(DEPENDENCIES_METADATA_KEY, target) || [];
}