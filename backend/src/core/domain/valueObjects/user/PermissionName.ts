import { ValueObject } from '../../base/ValueObject';
import { PermissionResource } from './PermissionResource';
import { PermissionAction } from './PermissionAction';

export interface PermissionNameProps {
    value: string;
}

/**
 * PermissionName value object
 * Ensures permission names are valid and properly formatted
 */
export class PermissionName extends ValueObject<PermissionNameProps> {
    private static readonly MIN_LENGTH = 3;
    private static readonly MAX_LENGTH = 100;
    private static readonly PERMISSION_NAME_REGEX = /^[a-zA-Z0-9\s\-_:]+$/;

    private constructor(props: PermissionNameProps) {
        super(props);
    }

    /**
     * Create permission name from string
     */
    public static create(name: string): PermissionName {
        if (!name) {
            throw new Error('Permission name cannot be empty');
        }

        const trimmedName = name.trim();

        if (trimmedName.length < this.MIN_LENGTH) {
            throw new Error(`Permission name must be at least ${this.MIN_LENGTH} characters long`);
        }

        if (trimmedName.length > this.MAX_LENGTH) {
            throw new Error(`Permission name cannot exceed ${this.MAX_LENGTH} characters`);
        }

        if (!this.PERMISSION_NAME_REGEX.test(trimmedName)) {
            throw new Error('Permission name can only contain letters, numbers, spaces, hyphens, underscores, and colons');
        }

        // Normalize the name (title case)
        const normalizedName = trimmedName
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());

        return new PermissionName({ value: normalizedName });
    }

    /**
     * Create permission name from resource and action
     */
    public static fromResourceAction(
        resource: PermissionResource,
        action: PermissionAction
    ): PermissionName {
        const resourceName = resource.getDisplayName();
        const actionName = action.getDisplayName();

        const name = `${actionName} ${resourceName}`;
        return this.create(name);
    }

    /**
     * Get permission name value
     */
    get value(): string {
        return this.props.value;
    }

    /**
     * Get display value (formatted for UI)
     */
    public getDisplayValue(): string {
        return this.props.value;
    }

    /**
     * Get kebab-case version
     */
    public toKebabCase(): string {
        return this.props.value
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/_/g, '-')
            .replace(/:/g, '-');
    }

    /**
     * Get snake_case version
     */
    public toSnakeCase(): string {
        return this.props.value
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/-/g, '_')
            .replace(/:/g, '_');
    }

    /**
     * Get camelCase version
     */
    public toCamelCase(): string {
        return this.props.value
            .toLowerCase()
            .replace(/[\s\-_:]+(.)/g, (_, char) => char.toUpperCase())
            .replace(/^(.)/, (char) => char.toLowerCase());
    }

    /**
     * Check if permission name is valid
     */
    public isValid(): boolean {
        try {
            PermissionName.create(this.props.value);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Extract resource name from permission name
     */
    public extractResource(): string | null {
        // Try to match patterns like "Create Users", "Read Products", etc.
        const match = this.props.value.match(/^(Create|Read|Update|Delete|Manage|View|List)\s+(.+)$/i);
        return match ? match[2].toLowerCase().replace(/\s+/g, '_') : null;
    }

    /**
     * Extract action name from permission name
     */
    public extractAction(): string | null {
        // Try to match patterns like "Create Users", "Read Products", etc.
        const match = this.props.value.match(/^(Create|Read|Update|Delete|Manage|View|List)/i);
        return match ? match[1].toLowerCase() : null;
    }

    /**
     * String representation
     */
    public toString(): string {
        return this.props.value;
    }
}