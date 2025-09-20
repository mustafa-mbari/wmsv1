import { ValueObject } from '../../base/ValueObject';

export interface EmailProps {
    value: string;
}

/**
 * Email value object
 * Ensures email addresses are valid and normalized
 */
export class Email extends ValueObject<EmailProps> {
    private static readonly EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    private constructor(props: EmailProps) {
        super(props);
    }

    /**
     * Create email from string
     */
    public static create(email: string): Email {
        if (!email) {
            throw new Error('Email cannot be empty');
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (!this.EMAIL_REGEX.test(normalizedEmail)) {
            throw new Error('Invalid email format');
        }

        if (normalizedEmail.length > 255) {
            throw new Error('Email is too long (maximum 255 characters)');
        }

        return new Email({ value: normalizedEmail });
    }

    /**
     * Get email value
     */
    get value(): string {
        return this.props.value;
    }

    /**
     * Get email domain
     */
    get domain(): string {
        return this.props.value.split('@')[1];
    }

    /**
     * Get email local part (before @)
     */
    get localPart(): string {
        return this.props.value.split('@')[0];
    }

    /**
     * Check if email is from a specific domain
     */
    public isFromDomain(domain: string): boolean {
        return this.domain.toLowerCase() === domain.toLowerCase();
    }

    /**
     * Validate email format
     */
    public isValid(): boolean {
        try {
            Email.EMAIL_REGEX.test(this.props.value);
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