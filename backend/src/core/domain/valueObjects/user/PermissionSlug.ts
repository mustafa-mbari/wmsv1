import { ValueObject } from '../../base/ValueObject';
import { PermissionResource } from './PermissionResource';
import { PermissionAction } from './PermissionAction';

export interface PermissionSlugProps {
    value: string;
}

/**
 * PermissionSlug value object
 * Ensures permission slugs are valid and properly formatted
 */
export class PermissionSlug extends ValueObject<PermissionSlugProps> {
    private static readonly MIN_LENGTH = 3;
    private static readonly MAX_LENGTH = 100;
    private static readonly SLUG_REGEX = /^[a-z0-9-:]+$/;

    private constructor(props: PermissionSlugProps) {
        super(props);
    }

    /**
     * Create permission slug from string
     */
    public static create(slug: string): PermissionSlug {
        if (!slug) {
            throw new Error('Permission slug cannot be empty');
        }

        const normalizedSlug = slug.trim().toLowerCase();

        if (normalizedSlug.length < this.MIN_LENGTH) {
            throw new Error(`Permission slug must be at least ${this.MIN_LENGTH} characters long`);
        }

        if (normalizedSlug.length > this.MAX_LENGTH) {
            throw new Error(`Permission slug cannot exceed ${this.MAX_LENGTH} characters`);
        }

        if (!this.SLUG_REGEX.test(normalizedSlug)) {
            throw new Error('Permission slug can only contain lowercase letters, numbers, hyphens, and colons');
        }

        if (normalizedSlug.startsWith('-') || normalizedSlug.endsWith('-')) {
            throw new Error('Permission slug cannot start or end with a hyphen');
        }

        if (normalizedSlug.includes('--')) {
            throw new Error('Permission slug cannot contain consecutive hyphens');
        }

        return new PermissionSlug({ value: normalizedSlug });
    }

    /**
     * Create permission slug from resource and action
     */
    public static fromResourceAction(
        resource: PermissionResource,
        action: PermissionAction
    ): PermissionSlug {
        const slug = `${resource.value}:${action.value}`;
        return this.create(slug);
    }

    /**
     * Create permission slug from name
     */
    public static fromName(name: string): PermissionSlug {
        if (!name) {
            throw new Error('Name cannot be empty');
        }

        // Convert name to slug format
        const slug = name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s:-]/g, '') // Remove special characters except spaces, hyphens, and colons
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

        return this.create(slug);
    }

    /**
     * Get permission slug value
     */
    get value(): string {
        return this.props.value;
    }

    /**
     * Get resource part of the slug
     */
    public getResource(): string {
        const parts = this.props.value.split(':');
        return parts[0];
    }

    /**
     * Get action part of the slug
     */
    public getAction(): string {
        const parts = this.props.value.split(':');
        return parts.length > 1 ? parts[1] : '';
    }

    /**
     * Get human-readable version
     */
    public toDisplayName(): string {
        return this.props.value
            .replace(/:/g, ' ')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Get snake_case version
     */
    public toSnakeCase(): string {
        return this.props.value.replace(/-/g, '_');
    }

    /**
     * Get camelCase version
     */
    public toCamelCase(): string {
        return this.props.value
            .replace(/:([a-z])/g, (_, letter) => letter.toUpperCase())
            .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    }

    /**
     * Get permission as object with resource and action
     */
    public toPermissionObject(): { resource: string; action: string } {
        const parts = this.props.value.split(':');
        return {
            resource: parts[0],
            action: parts.length > 1 ? parts[1] : '*'
        };
    }

    /**
     * Check if this is a wildcard permission
     */
    public isWildcard(): boolean {
        return this.props.value.includes('*') || this.getAction() === '*';
    }

    /**
     * Check if this matches a specific permission pattern
     */
    public matches(pattern: string): boolean {
        // Convert pattern to regex, treating * as wildcard
        const regexPattern = pattern
            .replace(/\*/g, '.*')
            .replace(/\./g, '\\.');

        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(this.props.value);
    }

    /**
     * Check if permission slug is valid
     */
    public isValid(): boolean {
        try {
            PermissionSlug.create(this.props.value);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if this is a system permission slug
     */
    public isSystemPermission(): boolean {
        const systemPermissions = [
            'system:*',
            'system:config',
            'system:maintenance',
            'permissions:*',
            'roles:*'
        ];
        return systemPermissions.some(perm => this.matches(perm));
    }

    /**
     * Check if this is an administrative permission slug
     */
    public isAdministrativePermission(): boolean {
        const adminResources = ['users', 'roles', 'permissions', 'system'];
        return adminResources.includes(this.getResource());
    }

    /**
     * String representation
     */
    public toString(): string {
        return this.props.value;
    }
}