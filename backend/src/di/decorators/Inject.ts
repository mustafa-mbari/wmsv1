import 'reflect-metadata';

export const INJECT_METADATA_KEY = Symbol('inject');

/**
 * Decorator to inject a dependency by token
 * @param token The token to inject
 */
export function Inject(token: string) {
    return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
        // Get existing inject metadata
        const existingTokens = Reflect.getMetadata(INJECT_METADATA_KEY, target) || {};

        // Store the token for this parameter index
        existingTokens[parameterIndex] = token;

        // Set the updated metadata
        Reflect.defineMetadata(INJECT_METADATA_KEY, existingTokens, target);
    };
}

/**
 * Get injection metadata from a class constructor
 */
export function getInjectMetadata(target: any): { [parameterIndex: number]: string } {
    return Reflect.getMetadata(INJECT_METADATA_KEY, target) || {};
}