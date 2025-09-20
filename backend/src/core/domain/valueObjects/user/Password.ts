import { ValueObject } from '../../base/ValueObject';
import bcrypt from 'bcryptjs';

export interface PasswordProps {
    hashedValue: string;
}

/**
 * Password value object
 * Handles password hashing and validation
 */
export class Password extends ValueObject<PasswordProps> {
    private static readonly MIN_LENGTH = 8;
    private static readonly MAX_LENGTH = 128;
    private static readonly SALT_ROUNDS = 12;

    // Password strength requirements
    private static readonly STRENGTH_REQUIREMENTS = {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
    };

    private constructor(props: PasswordProps) {
        super(props);
    }

    /**
     * Create password from plain text (will be hashed)
     */
    public static async create(plainTextPassword: string): Promise<Password> {
        if (!plainTextPassword) {
            throw new Error('Password cannot be empty');
        }

        this.validatePasswordStrength(plainTextPassword);

        const hashedValue = await bcrypt.hash(plainTextPassword, this.SALT_ROUNDS);

        return new Password({ hashedValue });
    }

    /**
     * Create password from already hashed value (for reconstitution from database)
     */
    public static fromHash(hashedValue: string): Password {
        if (!hashedValue) {
            throw new Error('Hashed password cannot be empty');
        }

        return new Password({ hashedValue });
    }

    /**
     * Get hashed password value
     */
    get hashedValue(): string {
        return this.props.hashedValue;
    }

    /**
     * Compare plain text password with this hashed password
     */
    public async compare(plainTextPassword: string): Promise<boolean> {
        if (!plainTextPassword) {
            return false;
        }

        return await bcrypt.compare(plainTextPassword, this.props.hashedValue);
    }

    /**
     * Validate password strength
     */
    private static validatePasswordStrength(password: string): void {
        if (password.length < this.MIN_LENGTH) {
            throw new Error(`Password must be at least ${this.MIN_LENGTH} characters long`);
        }

        if (password.length > this.MAX_LENGTH) {
            throw new Error(`Password cannot exceed ${this.MAX_LENGTH} characters`);
        }

        const requirements = this.STRENGTH_REQUIREMENTS;
        const errors: string[] = [];

        if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('at least one uppercase letter');
        }

        if (requirements.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('at least one lowercase letter');
        }

        if (requirements.requireNumbers && !/\d/.test(password)) {
            errors.push('at least one number');
        }

        if (requirements.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('at least one special character');
        }

        if (errors.length > 0) {
            throw new Error(`Password must contain ${errors.join(', ')}`);
        }

        // Check for common weak patterns
        if (this.isCommonPassword(password)) {
            throw new Error('This password is too common. Please choose a more unique password');
        }
    }

    /**
     * Check if password is commonly used (basic check)
     */
    private static isCommonPassword(password: string): boolean {
        const commonPasswords = [
            'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
            'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1'
        ];

        return commonPasswords.includes(password.toLowerCase());
    }

    /**
     * Calculate password strength score (0-100)
     */
    public static calculateStrength(password: string): number {
        let score = 0;

        // Length scoring
        if (password.length >= 8) score += 25;
        if (password.length >= 12) score += 10;
        if (password.length >= 16) score += 10;

        // Character variety scoring
        if (/[a-z]/.test(password)) score += 10;
        if (/[A-Z]/.test(password)) score += 10;
        if (/\d/.test(password)) score += 10;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;

        // Pattern penalties
        if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
        if (/123|abc|qwe/i.test(password)) score -= 10; // Sequential patterns
        if (this.isCommonPassword(password)) score -= 20; // Common passwords

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Get password strength description
     */
    public static getStrengthDescription(score: number): string {
        if (score < 30) return 'Very Weak';
        if (score < 50) return 'Weak';
        if (score < 70) return 'Fair';
        if (score < 90) return 'Strong';
        return 'Very Strong';
    }

    /**
     * Validate that password meets minimum requirements
     */
    public static validateMinimumRequirements(password: string): {
        isValid: boolean;
        errors: string[];
    } {
        const errors: string[] = [];

        try {
            this.validatePasswordStrength(password);
            return { isValid: true, errors: [] };
        } catch (error) {
            return {
                isValid: false,
                errors: [error instanceof Error ? error.message : 'Invalid password']
            };
        }
    }

    /**
     * Check if password needs to be rehashed (due to changed salt rounds)
     */
    public needsRehash(): boolean {
        try {
            // Extract salt rounds from hash
            const rounds = bcrypt.getRounds(this.props.hashedValue);
            return rounds !== Password.SALT_ROUNDS;
        } catch {
            return true; // If we can't determine rounds, assume it needs rehashing
        }
    }
}