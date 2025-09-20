import { ValueObject } from '../../base/ValueObject';

export interface SerialNumberProps {
    value: string;
}

export class SerialNumber extends ValueObject<SerialNumberProps> {
    private static readonly MIN_LENGTH = 1;
    private static readonly MAX_LENGTH = 100;
    private static readonly VALID_PATTERN = /^[A-Za-z0-9\-_\.#]+$/;

    private constructor(props: SerialNumberProps) {
        super(props);
    }

    public static create(serialNumber: string): SerialNumber {
        if (!serialNumber) {
            throw new Error('Serial number cannot be empty');
        }

        const trimmedSerialNumber = serialNumber.trim().toUpperCase();

        if (trimmedSerialNumber.length < this.MIN_LENGTH) {
            throw new Error(`Serial number must be at least ${this.MIN_LENGTH} character long`);
        }

        if (trimmedSerialNumber.length > this.MAX_LENGTH) {
            throw new Error(`Serial number cannot exceed ${this.MAX_LENGTH} characters`);
        }

        if (!this.VALID_PATTERN.test(trimmedSerialNumber)) {
            throw new Error('Serial number can only contain letters, numbers, hyphens, underscores, dots, and hash symbols');
        }

        return new SerialNumber({ value: trimmedSerialNumber });
    }

    public static generateSequential(prefix: string, sequence: number, totalDigits: number = 6): SerialNumber {
        const paddedSequence = sequence.toString().padStart(totalDigits, '0');
        const serialNumber = `${prefix}${paddedSequence}`;
        return SerialNumber.create(serialNumber);
    }

    public static generateWithDate(prefix: string = 'SN', date?: Date): SerialNumber {
        const currentDate = date || new Date();
        const year = currentDate.getFullYear().toString().slice(-2);
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');
        const hour = currentDate.getHours().toString().padStart(2, '0');
        const minute = currentDate.getMinutes().toString().padStart(2, '0');
        const second = currentDate.getSeconds().toString().padStart(2, '0');

        const serialNumber = `${prefix}${year}${month}${day}${hour}${minute}${second}`;
        return SerialNumber.create(serialNumber);
    }

    public static generateWithLot(lotNumber: string, sequence: number): SerialNumber {
        const paddedSequence = sequence.toString().padStart(4, '0');
        const serialNumber = `${lotNumber}-${paddedSequence}`;
        return SerialNumber.create(serialNumber);
    }

    public static generateMAC(): SerialNumber {
        const chars = '0123456789ABCDEF';
        let mac = '';
        for (let i = 0; i < 12; i++) {
            mac += chars.charAt(Math.floor(Math.random() * chars.length));
            if (i % 2 === 1 && i < 11) mac += ':';
        }
        return SerialNumber.create(mac.replace(/:/g, ''));
    }

    public static generateUUID(): SerialNumber {
        const chars = '0123456789ABCDEF';
        let uuid = '';
        for (let i = 0; i < 32; i++) {
            uuid += chars.charAt(Math.floor(Math.random() * chars.length));
            if ([8, 12, 16, 20].includes(i)) uuid += '-';
        }
        return SerialNumber.create(uuid.replace(/-/g, ''));
    }

    get value(): string {
        return this.props.value;
    }

    public getPrefix(): string {
        const match = this.props.value.match(/^([A-Z]+)/);
        return match ? match[1] : '';
    }

    public getNumericPart(): string {
        const match = this.props.value.match(/(\d+)$/);
        return match ? match[1] : '';
    }

    public getSequenceNumber(): number | null {
        const numericPart = this.getNumericPart();
        return numericPart ? parseInt(numericPart, 10) : null;
    }

    public getLotPart(): string | null {
        const parts = this.props.value.split('-');
        return parts.length > 1 ? parts[0] : null;
    }

    public parseDateFromSerial(): Date | null {
        // Try to extract date from patterns like SNYYMMDDHHMMSS
        const match = this.props.value.match(/(\d{12})$/);
        if (!match) {
            return null;
        }

        const dateString = match[1];
        if (dateString.length !== 12) {
            return null;
        }

        try {
            const year = 2000 + parseInt(dateString.substring(0, 2));
            const month = parseInt(dateString.substring(2, 4)) - 1; // JS months are 0-based
            const day = parseInt(dateString.substring(4, 6));
            const hour = parseInt(dateString.substring(6, 8));
            const minute = parseInt(dateString.substring(8, 10));
            const second = parseInt(dateString.substring(10, 12));

            const date = new Date(year, month, day, hour, minute, second);

            // Validate the parsed date
            if (date.getFullYear() === year &&
                date.getMonth() === month &&
                date.getDate() === day &&
                date.getHours() === hour &&
                date.getMinutes() === minute &&
                date.getSeconds() === second) {
                return date;
            }
        } catch {
            // Invalid date
        }

        return null;
    }

    public isConsecutiveTo(other: SerialNumber): boolean {
        const thisSequence = this.getSequenceNumber();
        const otherSequence = other.getSequenceNumber();

        if (thisSequence === null || otherSequence === null) {
            return false;
        }

        const thisPrefix = this.getPrefix();
        const otherPrefix = other.getPrefix();

        return thisPrefix === otherPrefix && Math.abs(thisSequence - otherSequence) === 1;
    }

    public isInRange(start: SerialNumber, end: SerialNumber): boolean {
        const thisSequence = this.getSequenceNumber();
        const startSequence = start.getSequenceNumber();
        const endSequence = end.getSequenceNumber();

        if (thisSequence === null || startSequence === null || endSequence === null) {
            return false;
        }

        const thisPrefix = this.getPrefix();
        const startPrefix = start.getPrefix();
        const endPrefix = end.getPrefix();

        return thisPrefix === startPrefix &&
               thisPrefix === endPrefix &&
               thisSequence >= startSequence &&
               thisSequence <= endSequence;
    }

    public getNextSerial(): SerialNumber | null {
        const sequence = this.getSequenceNumber();
        if (sequence === null) {
            return null;
        }

        const prefix = this.getPrefix();
        const numericPart = this.getNumericPart();
        const digitCount = numericPart.length;

        try {
            const nextSequence = sequence + 1;
            const paddedNext = nextSequence.toString().padStart(digitCount, '0');
            const nextSerialValue = this.props.value.replace(/\d+$/, paddedNext);
            return SerialNumber.create(nextSerialValue);
        } catch {
            return null;
        }
    }

    public getPreviousSerial(): SerialNumber | null {
        const sequence = this.getSequenceNumber();
        if (sequence === null || sequence <= 0) {
            return null;
        }

        const prefix = this.getPrefix();
        const numericPart = this.getNumericPart();
        const digitCount = numericPart.length;

        try {
            const prevSequence = sequence - 1;
            const paddedPrev = prevSequence.toString().padStart(digitCount, '0');
            const prevSerialValue = this.props.value.replace(/\d+$/, paddedPrev);
            return SerialNumber.create(prevSerialValue);
        } catch {
            return null;
        }
    }

    public matchesPattern(pattern: string): boolean {
        try {
            const regex = new RegExp(pattern, 'i');
            return regex.test(this.props.value);
        } catch {
            return false;
        }
    }

    public isValidChecksum(algorithm: 'luhn' | 'mod10' = 'luhn'): boolean {
        const numericPart = this.getNumericPart();
        if (!numericPart || numericPart.length < 2) {
            return false;
        }

        switch (algorithm) {
            case 'luhn':
                return this.validateLuhnChecksum(numericPart);
            case 'mod10':
                return this.validateMod10Checksum(numericPart);
            default:
                return false;
        }
    }

    private validateLuhnChecksum(number: string): boolean {
        const digits = number.split('').map(d => parseInt(d, 10));
        let sum = 0;
        let isEven = false;

        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = digits[i];

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    private validateMod10Checksum(number: string): boolean {
        const digits = number.split('').map(d => parseInt(d, 10));
        const sum = digits.slice(0, -1).reduce((acc, digit) => acc + digit, 0);
        const checkDigit = digits[digits.length - 1];
        return (sum % 10) === checkDigit;
    }

    public format(options: {
        withDashes?: boolean;
        groupSize?: number;
        uppercase?: boolean;
    } = {}): string {
        const {
            withDashes = false,
            groupSize = 4,
            uppercase = true
        } = options;

        let formatted = uppercase ? this.props.value.toUpperCase() : this.props.value.toLowerCase();

        if (withDashes && groupSize > 0) {
            const groups = [];
            for (let i = 0; i < formatted.length; i += groupSize) {
                groups.push(formatted.substring(i, i + groupSize));
            }
            formatted = groups.join('-');
        }

        return formatted;
    }

    public obfuscate(visibleChars: number = 4): string {
        if (this.props.value.length <= visibleChars) {
            return '*'.repeat(this.props.value.length);
        }

        const visible = this.props.value.substring(this.props.value.length - visibleChars);
        const hidden = '*'.repeat(this.props.value.length - visibleChars);
        return hidden + visible;
    }

    public validate(): string[] {
        const errors: string[] = [];

        if (this.props.value.length < SerialNumber.MIN_LENGTH) {
            errors.push(`Serial number must be at least ${SerialNumber.MIN_LENGTH} character long`);
        }

        if (this.props.value.length > SerialNumber.MAX_LENGTH) {
            errors.push(`Serial number cannot exceed ${SerialNumber.MAX_LENGTH} characters`);
        }

        if (!SerialNumber.VALID_PATTERN.test(this.props.value)) {
            errors.push('Serial number contains invalid characters');
        }

        return errors;
    }

    public isValid(): boolean {
        return this.validate().length === 0;
    }

    public toString(): string {
        return this.props.value;
    }
}