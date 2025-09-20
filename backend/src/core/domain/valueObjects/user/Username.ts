import { ValueObject } from '../../base/ValueObject';

export interface UsernameProps {
    value: string;
}

/**
 * Username value object
 * Ensures usernames meet system requirements
 */
export class Username extends ValueObject<UsernameProps> {
    private static readonly MIN_LENGTH = 3;
    private static readonly MAX_LENGTH = 50;
    private static readonly USERNAME_REGEX = /^[a-zA-Z0-9_.-]+$/;
    private static readonly RESERVED_USERNAMES = [
        'admin', 'administrator', 'root', 'system', 'api', 'www', 'mail', 'support',
        'help', 'info', 'contact', 'security', 'null', 'undefined', 'test'
    ];

    private constructor(props: UsernameProps) {
        super(props);
    }

    /**
     * Create username from string
     */
    public static create(username: string): Username {
        if (!username) {
            throw new Error('Username cannot be empty');
        }

        const trimmedUsername = username.trim();

        if (trimmedUsername.length < this.MIN_LENGTH) {
            throw new Error(`Username must be at least ${this.MIN_LENGTH} characters long`);
        }

        if (trimmedUsername.length > this.MAX_LENGTH) {
            throw new Error(`Username cannot exceed ${this.MAX_LENGTH} characters`);
        }

        if (!this.USERNAME_REGEX.test(trimmedUsername)) {
            throw new Error('Username can only contain letters, numbers, dots, underscores, and hyphens');
        }

        if (this.RESERVED_USERNAMES.includes(trimmedUsername.toLowerCase())) {
            throw new Error('This username is reserved and cannot be used');
        }

        if (trimmedUsername.startsWith('.') || trimmedUsername.endsWith('.')) {
            throw new Error('Username cannot start or end with a dot');
        }

        if (trimmedUsername.includes('..')) {
            throw new Error('Username cannot contain consecutive dots');
        }

        return new Username({ value: trimmedUsername });
    }

    /**
     * Get username value
     */
    get value(): string {
        return this.props.value;
    }

    /**
     * Check if username is valid
     */
    public isValid(): boolean {
        try {
            Username.create(this.props.value);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if username is reserved
     */
    public isReserved(): boolean {
        return Username.RESERVED_USERNAMES.includes(this.props.value.toLowerCase());
    }

    /**
     * Get username without special characters for display
     */
    public getDisplayValue(): string {
        return this.props.value.replace(/[._-]/g, ' ');
    }

    /**
     * String representation
     */
    public toString(): string {
        return this.props.value;
    }
}