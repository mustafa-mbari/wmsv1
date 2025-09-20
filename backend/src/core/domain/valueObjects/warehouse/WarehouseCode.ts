import { ValueObject } from '../../base/ValueObject';

export interface WarehouseCodeProps {
    value: string;
}

export class WarehouseCode extends ValueObject<WarehouseCodeProps> {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 20;
    private static readonly VALID_PATTERN = /^[A-Z0-9\-_]+$/;

    private constructor(props: WarehouseCodeProps) {
        super(props);
    }

    public static create(code: string): WarehouseCode {
        if (!code) {
            throw new Error('Warehouse code cannot be empty');
        }

        const normalizedCode = code.trim().toUpperCase();

        if (normalizedCode.length < this.MIN_LENGTH) {
            throw new Error(`Warehouse code must be at least ${this.MIN_LENGTH} characters long`);
        }

        if (normalizedCode.length > this.MAX_LENGTH) {
            throw new Error(`Warehouse code cannot exceed ${this.MAX_LENGTH} characters`);
        }

        if (!this.VALID_PATTERN.test(normalizedCode)) {
            throw new Error('Warehouse code can only contain uppercase letters, numbers, hyphens, and underscores');
        }

        return new WarehouseCode({ value: normalizedCode });
    }

    public static generateFromName(name: string, sequence?: number): WarehouseCode {
        if (!name) {
            throw new Error('Name cannot be empty for code generation');
        }

        const words = name.trim().split(/\s+/);
        let codeBase = '';

        if (words.length === 1) {
            codeBase = words[0].substring(0, 6).toUpperCase();
        } else {
            codeBase = words
                .filter(word => word.length > 0)
                .slice(0, 3)
                .map(word => word.charAt(0).toUpperCase())
                .join('');
        }

        const cleanCode = codeBase.replace(/[^A-Z0-9]/g, '');

        if (sequence !== undefined) {
            return WarehouseCode.create(`${cleanCode}${sequence.toString().padStart(2, '0')}`);
        }

        return WarehouseCode.create(cleanCode);
    }

    public static generateWithPrefix(prefix: string, sequence: number): WarehouseCode {
        const cleanPrefix = prefix.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const paddedSequence = sequence.toString().padStart(3, '0');
        return WarehouseCode.create(`${cleanPrefix}${paddedSequence}`);
    }

    public static generateWithLocation(country: string, city: string, sequence?: number): WarehouseCode {
        const countryCode = country.substring(0, 2).toUpperCase();
        const cityCode = city.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');

        let code = `${countryCode}${cityCode}`;

        if (sequence !== undefined) {
            code += sequence.toString().padStart(2, '0');
        }

        return WarehouseCode.create(code);
    }

    get value(): string {
        return this.props.value;
    }

    public getPrefix(): string {
        const match = this.props.value.match(/^([A-Z]+)/);
        return match ? match[1] : '';
    }

    public getNumericSuffix(): string {
        const match = this.props.value.match(/(\d+)$/);
        return match ? match[1] : '';
    }

    public getSequenceNumber(): number | null {
        const suffix = this.getNumericSuffix();
        return suffix ? parseInt(suffix, 10) : null;
    }

    public hasPrefix(prefix: string): boolean {
        return this.props.value.startsWith(prefix.toUpperCase());
    }

    public matchesPattern(pattern: string): boolean {
        try {
            const regex = new RegExp(pattern, 'i');
            return regex.test(this.props.value);
        } catch {
            return false;
        }
    }

    public createVariant(suffix: string): WarehouseCode {
        const cleanSuffix = suffix.toUpperCase().replace(/[^A-Z0-9\-_]/g, '');
        return WarehouseCode.create(`${this.props.value}${cleanSuffix}`);
    }

    public getFullCode(): string {
        return `WH-${this.props.value}`;
    }

    public getFormattedCode(options: {
        withPrefix?: boolean;
        separator?: string;
        groupSize?: number;
    } = {}): string {
        const {
            withPrefix = false,
            separator = '-',
            groupSize = 0
        } = options;

        let formatted = this.props.value;

        if (groupSize > 0) {
            const groups = [];
            for (let i = 0; i < formatted.length; i += groupSize) {
                groups.push(formatted.substring(i, i + groupSize));
            }
            formatted = groups.join(separator);
        }

        if (withPrefix) {
            formatted = `WH${separator}${formatted}`;
        }

        return formatted;
    }

    public isSequential(other: WarehouseCode): boolean {
        const thisSequence = this.getSequenceNumber();
        const otherSequence = other.getSequenceNumber();

        if (thisSequence === null || otherSequence === null) {
            return false;
        }

        const thisPrefix = this.getPrefix();
        const otherPrefix = other.getPrefix();

        return thisPrefix === otherPrefix && Math.abs(thisSequence - otherSequence) === 1;
    }

    public getNextCode(): WarehouseCode | null {
        const sequence = this.getSequenceNumber();
        if (sequence === null) {
            return null;
        }

        const prefix = this.getPrefix();
        const suffix = this.getNumericSuffix();
        const nextSequence = sequence + 1;
        const paddedNext = nextSequence.toString().padStart(suffix.length, '0');

        try {
            return WarehouseCode.create(`${prefix}${paddedNext}`);
        } catch {
            return null;
        }
    }

    public getPreviousCode(): WarehouseCode | null {
        const sequence = this.getSequenceNumber();
        if (sequence === null || sequence <= 1) {
            return null;
        }

        const prefix = this.getPrefix();
        const suffix = this.getNumericSuffix();
        const prevSequence = sequence - 1;
        const paddedPrev = prevSequence.toString().padStart(suffix.length, '0');

        try {
            return WarehouseCode.create(`${prefix}${paddedPrev}`);
        } catch {
            return null;
        }
    }

    public validate(): string[] {
        const errors: string[] = [];

        if (this.props.value.length < WarehouseCode.MIN_LENGTH) {
            errors.push(`Warehouse code must be at least ${WarehouseCode.MIN_LENGTH} characters long`);
        }

        if (this.props.value.length > WarehouseCode.MAX_LENGTH) {
            errors.push(`Warehouse code cannot exceed ${WarehouseCode.MAX_LENGTH} characters`);
        }

        if (!WarehouseCode.VALID_PATTERN.test(this.props.value)) {
            errors.push('Warehouse code contains invalid characters');
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