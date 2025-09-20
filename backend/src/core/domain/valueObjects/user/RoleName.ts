import { ValueObject } from '../../base/ValueObject';

export interface RoleNameProps {
    value: string;
}

/**
 * RoleName value object
 * Ensures role names are valid and properly formatted
 */
export class RoleName extends ValueObject<RoleNameProps> {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 100;
    private static readonly ROLE_NAME_REGEX = /^[a-zA-Z0-9\s\-_]+$/;

    private constructor(props: RoleNameProps) {
        super(props);
    }

    /**
     * Create role name from string
     */
    public static create(name: string): RoleName {
        if (!name) {
            throw new Error('Role name cannot be empty');
        }

        const trimmedName = name.trim();

        if (trimmedName.length < this.MIN_LENGTH) {
            throw new Error(`Role name must be at least ${this.MIN_LENGTH} characters long`);
        }

        if (trimmedName.length > this.MAX_LENGTH) {
            throw new Error(`Role name cannot exceed ${this.MAX_LENGTH} characters`);
        }

        if (!this.ROLE_NAME_REGEX.test(trimmedName)) {
            throw new Error('Role name can only contain letters, numbers, spaces, hyphens, and underscores');
        }

        // Normalize the name (proper case)
        const normalizedName = trimmedName
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());

        return new RoleName({ value: normalizedName });
    }

    /**
     * Get role name value
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
     * Get kebab-case version for slug generation
     */
    public toKebabCase(): string {
        return this.props.value
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/_/g, '-');
    }

    /**
     * Get snake_case version
     */
    public toSnakeCase(): string {
        return this.props.value
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/-/g, '_');
    }

    /**
     * Check if role name is valid
     */
    public isValid(): boolean {
        try {
            RoleName.create(this.props.value);
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
}