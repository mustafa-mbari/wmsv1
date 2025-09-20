import { ValueObject } from '../../base/ValueObject';

export interface RoleSlugProps {
    value: string;
}

/**
 * RoleSlug value object
 * Ensures role slugs are valid and properly formatted
 */
export class RoleSlug extends ValueObject<RoleSlugProps> {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 100;
    private static readonly SLUG_REGEX = /^[a-z0-9-]+$/;
    private static readonly RESERVED_SLUGS = [
        'api', 'admin', 'www', 'mail', 'ftp', 'root', 'test', 'guest',
        'null', 'undefined', 'system', 'config', 'settings'
    ];

    private constructor(props: RoleSlugProps) {
        super(props);
    }

    /**
     * Create role slug from string
     */
    public static create(slug: string): RoleSlug {
        if (!slug) {
            throw new Error('Role slug cannot be empty');
        }

        const normalizedSlug = slug.trim().toLowerCase();

        if (normalizedSlug.length < this.MIN_LENGTH) {
            throw new Error(`Role slug must be at least ${this.MIN_LENGTH} characters long`);
        }

        if (normalizedSlug.length > this.MAX_LENGTH) {
            throw new Error(`Role slug cannot exceed ${this.MAX_LENGTH} characters`);
        }

        if (!this.SLUG_REGEX.test(normalizedSlug)) {
            throw new Error('Role slug can only contain lowercase letters, numbers, and hyphens');
        }

        if (normalizedSlug.startsWith('-') || normalizedSlug.endsWith('-')) {
            throw new Error('Role slug cannot start or end with a hyphen');
        }

        if (normalizedSlug.includes('--')) {
            throw new Error('Role slug cannot contain consecutive hyphens');
        }

        if (this.RESERVED_SLUGS.includes(normalizedSlug)) {
            throw new Error('This role slug is reserved and cannot be used');
        }

        return new RoleSlug({ value: normalizedSlug });
    }

    /**
     * Create role slug from role name
     */
    public static fromName(name: string): RoleSlug {
        if (!name) {
            throw new Error('Name cannot be empty');
        }

        // Convert name to slug format
        const slug = name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

        return this.create(slug);
    }

    /**
     * Get role slug value
     */
    get value(): string {
        return this.props.value;
    }

    /**
     * Get human-readable version
     */
    public toDisplayName(): string {
        return this.props.value
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
        return this.props.value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    }

    /**
     * Check if slug is reserved
     */
    public isReserved(): boolean {
        return RoleSlug.RESERVED_SLUGS.includes(this.props.value);
    }

    /**
     * Check if role slug is valid
     */
    public isValid(): boolean {
        try {
            RoleSlug.create(this.props.value);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if this is a system role slug
     */
    public isSystemRole(): boolean {
        const systemRoles = ['super-admin', 'admin', 'system-admin'];
        return systemRoles.includes(this.props.value);
    }

    /**
     * Check if this is an administrative role slug
     */
    public isAdministrativeRole(): boolean {
        const adminRoles = ['super-admin', 'admin', 'administrator', 'system-admin'];
        return adminRoles.includes(this.props.value);
    }

    /**
     * String representation
     */
    public toString(): string {
        return this.props.value;
    }
}