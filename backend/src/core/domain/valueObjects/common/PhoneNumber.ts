import { ValueObject } from '../../base/ValueObject';

export interface PhoneNumberProps {
    value: string;
}

export class PhoneNumber extends ValueObject<PhoneNumberProps> {
    private static readonly PHONE_PATTERN = /^\+?[\d\s\-\(\)\.]{7,20}$/;
    private static readonly DIGITS_PATTERN = /\d/g;

    private constructor(props: PhoneNumberProps) {
        super(props);
    }

    public static create(phoneNumber: string): PhoneNumber {
        if (!phoneNumber) {
            throw new Error('Phone number cannot be empty');
        }

        const trimmed = phoneNumber.trim();

        if (!this.PHONE_PATTERN.test(trimmed)) {
            throw new Error('Invalid phone number format');
        }

        const digits = trimmed.match(this.DIGITS_PATTERN);
        if (!digits || digits.length < 7 || digits.length > 15) {
            throw new Error('Phone number must contain between 7 and 15 digits');
        }

        return new PhoneNumber({ value: trimmed });
    }

    get value(): string {
        return this.props.value;
    }

    public getDigitsOnly(): string {
        return this.props.value.replace(/\D/g, '');
    }

    public getFormatted(): string {
        const digits = this.getDigitsOnly();

        if (digits.length === 10) {
            return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
        }

        if (digits.length === 11 && digits.startsWith('1')) {
            return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
        }

        return this.props.value;
    }

    public getInternationalFormat(): string {
        const digits = this.getDigitsOnly();

        if (!digits.startsWith('1') && digits.length === 10) {
            return `+1${digits}`;
        }

        if (!this.props.value.startsWith('+')) {
            return `+${digits}`;
        }

        return this.props.value;
    }

    public toString(): string {
        return this.props.value;
    }
}