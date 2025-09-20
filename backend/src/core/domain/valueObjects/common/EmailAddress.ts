import { ValueObject } from '../../base/ValueObject';

export interface EmailAddressProps {
    value: string;
}

export class EmailAddress extends ValueObject<EmailAddressProps> {
    private static readonly EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    private static readonly MAX_LENGTH = 254;

    private constructor(props: EmailAddressProps) {
        super(props);
    }

    public static create(email: string): EmailAddress {
        if (!email) {
            throw new Error('Email address cannot be empty');
        }

        const trimmed = email.trim().toLowerCase();

        if (trimmed.length > this.MAX_LENGTH) {
            throw new Error(`Email address cannot exceed ${this.MAX_LENGTH} characters`);
        }

        if (!this.EMAIL_PATTERN.test(trimmed)) {
            throw new Error('Invalid email address format');
        }

        return new EmailAddress({ value: trimmed });
    }

    get value(): string {
        return this.props.value;
    }

    public getLocalPart(): string {
        return this.props.value.split('@')[0];
    }

    public getDomain(): string {
        return this.props.value.split('@')[1];
    }

    public getDisplayName(): string {
        return this.props.value;
    }

    public isBusinessEmail(): boolean {
        const commonPersonalDomains = [
            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
            'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'
        ];

        return !commonPersonalDomains.includes(this.getDomain());
    }

    public toString(): string {
        return this.props.value;
    }
}