import { ValueObject } from '../../base/ValueObject';

export interface PermissionResourceProps {
    value: string;
}

/**
 * PermissionResource value object
 * Represents the resource that a permission applies to
 */
export class PermissionResource extends ValueObject<PermissionResourceProps> {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 50;
    private static readonly RESOURCE_REGEX = /^[a-z0-9_-]+(\*)?$/;

    // Standard system resources
    private static readonly SYSTEM_RESOURCES = [
        'users', 'roles', 'permissions', 'system', 'settings',
        'products', 'inventory', 'warehouses', 'orders', 'reports',
        'dashboard', 'analytics', 'logs', 'backups', 'api'
    ];

    private constructor(props: PermissionResourceProps) {
        super(props);
    }

    /**
     * Create permission resource from string
     */
    public static create(resource: string): PermissionResource {
        if (!resource) {
            throw new Error('Permission resource cannot be empty');
        }

        const normalizedResource = resource.trim().toLowerCase();

        if (normalizedResource.length < this.MIN_LENGTH) {
            throw new Error(`Permission resource must be at least ${this.MIN_LENGTH} characters long`);
        }

        if (normalizedResource.length > this.MAX_LENGTH) {
            throw new Error(`Permission resource cannot exceed ${this.MAX_LENGTH} characters`);
        }

        if (!this.RESOURCE_REGEX.test(normalizedResource)) {
            throw new Error('Permission resource can only contain lowercase letters, numbers, underscores, hyphens, and optional wildcard (*)');
        }

        // Validate wildcard usage
        if (normalizedResource.includes('*') && !normalizedResource.endsWith('*')) {
            throw new Error('Wildcard (*) can only be used at the end of the resource');
        }

        return new PermissionResource({ value: normalizedResource });
    }

    /**
     * Create wildcard resource (applies to all resources)
     */
    public static createWildcard(): PermissionResource {
        return new PermissionResource({ value: '*' });
    }

    /**
     * Get permission resource value
     */
    get value(): string {
        return this.props.value;
    }

    /**
     * Check if this is a wildcard resource
     */
    public isWildcard(): boolean {
        return this.props.value === '*' || this.props.value.endsWith('*');
    }

    /**
     * Check if this is a system resource
     */
    public isSystemResource(): boolean {
        if (this.isWildcard()) {
            return true;
        }
        return PermissionResource.SYSTEM_RESOURCES.includes(this.props.value);
    }

    /**
     * Get base resource (without wildcard)
     */
    public getBaseResource(): string {
        return this.props.value.replace(/\*$/, '');
    }

    /**
     * Get display name for the resource
     */
    public getDisplayName(): string {
        if (this.props.value === '*') {
            return 'All Resources';
        }

        const baseResource = this.getBaseResource();
        const displayName = baseResource
            .replace(/_/g, ' ')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());

        return this.isWildcard() ? `${displayName} (All)` : displayName;
    }

    /**
     * Get plural form of the resource
     */
    public getPlural(): string {
        const resource = this.getBaseResource();

        // Simple pluralization rules
        if (resource.endsWith('s') || resource.endsWith('sh') || resource.endsWith('ch')) {
            return resource + 'es';
        } else if (resource.endsWith('y') && !/[aeiou]y$/.test(resource)) {
            return resource.slice(0, -1) + 'ies';
        } else {
            return resource + 's';
        }
    }

    /**
     * Get singular form of the resource
     */
    public getSingular(): string {
        const resource = this.getBaseResource();

        // Simple singularization rules
        if (resource.endsWith('ies')) {
            return resource.slice(0, -3) + 'y';
        } else if (resource.endsWith('es')) {
            return resource.slice(0, -2);
        } else if (resource.endsWith('s') && !resource.endsWith('ss')) {
            return resource.slice(0, -1);
        } else {
            return resource;
        }
    }

    /**
     * Check if this resource matches another resource (considering wildcards)
     */
    public matches(otherResource: PermissionResource): boolean {
        if (this.props.value === '*' || otherResource.value === '*') {
            return true;
        }

        if (this.isWildcard()) {
            const baseResource = this.getBaseResource();
            return otherResource.value.startsWith(baseResource);
        }

        if (otherResource.isWildcard()) {
            const otherBaseResource = otherResource.getBaseResource();
            return this.props.value.startsWith(otherBaseResource);
        }

        return this.props.value === otherResource.value;
    }

    /**
     * Check if this resource is more specific than another
     */
    public isMoreSpecificThan(otherResource: PermissionResource): boolean {
        if (otherResource.isWildcard() && !this.isWildcard()) {
            return true;
        }

        if (this.isWildcard() && !otherResource.isWildcard()) {
            return false;
        }

        // More specific if it's a longer string (more detailed)
        return this.props.value.length > otherResource.value.length;
    }

    /**
     * Get resource category
     */
    public getCategory(): string {
        const categoryMap: { [key: string]: string } = {
            'users': 'user-management',
            'roles': 'user-management',
            'permissions': 'user-management',
            'products': 'inventory-management',
            'inventory': 'inventory-management',
            'warehouses': 'warehouse-management',
            'orders': 'order-management',
            'reports': 'reporting',
            'analytics': 'reporting',
            'dashboard': 'general',
            'system': 'system',
            'settings': 'system',
            'logs': 'system',
            'backups': 'system',
            'api': 'system'
        };

        const baseResource = this.getBaseResource();
        return categoryMap[baseResource] || 'custom';
    }

    /**
     * Check if permission resource is valid
     */
    public isValid(): boolean {
        try {
            PermissionResource.create(this.props.value);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * String representation
     */
    public toString(): string {
        return this.props.value;
    }

    /**
     * Get all standard system resources
     */
    public static getSystemResources(): string[] {
        return [...this.SYSTEM_RESOURCES];
    }
}