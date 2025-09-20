import { ValueObject } from '../../base/ValueObject';

export interface WarehouseNameProps {
    value: string;
}

export class WarehouseName extends ValueObject<WarehouseNameProps> {
    private static readonly MIN_LENGTH = 2;
    private static readonly MAX_LENGTH = 100;
    private static readonly INVALID_PATTERNS = [
        /<script/i,
        /<\/script>/i,
        /javascript:/i,
        /vbscript:/i
    ];

    private constructor(props: WarehouseNameProps) {
        super(props);
    }

    public static create(name: string): WarehouseName {
        if (!name) {
            throw new Error('Warehouse name cannot be empty');
        }

        const trimmedName = name.trim();

        if (trimmedName.length < this.MIN_LENGTH) {
            throw new Error(`Warehouse name must be at least ${this.MIN_LENGTH} characters long`);
        }

        if (trimmedName.length > this.MAX_LENGTH) {
            throw new Error(`Warehouse name cannot exceed ${this.MAX_LENGTH} characters`);
        }

        if (this.containsInvalidPatterns(trimmedName)) {
            throw new Error('Warehouse name contains potentially harmful content');
        }

        return new WarehouseName({ value: trimmedName });
    }

    get value(): string {
        return this.props.value;
    }

    public getAbbreviation(maxLength: number = 10): string {
        if (this.props.value.length <= maxLength) {
            return this.props.value;
        }

        const words = this.props.value.split(/\s+/);
        if (words.length === 1) {
            return this.props.value.substring(0, maxLength);
        }

        let abbreviation = words.map(word => word.charAt(0).toUpperCase()).join('');
        if (abbreviation.length <= maxLength) {
            return abbreviation;
        }

        return this.props.value.substring(0, maxLength);
    }

    public getDisplayName(): string {
        return this.props.value;
    }

    public getSearchTerms(): string[] {
        return this.props.value
            .toLowerCase()
            .split(/\s+/)
            .filter(term => term.length > 2)
            .filter((term, index, arr) => arr.indexOf(term) === index);
    }

    public matchesSearch(searchTerm: string): boolean {
        const term = searchTerm.toLowerCase().trim();
        return this.props.value.toLowerCase().includes(term);
    }

    public getInitials(): string {
        return this.props.value
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase())
            .join('');
    }

    private static containsInvalidPatterns(name: string): boolean {
        return this.INVALID_PATTERNS.some(pattern => pattern.test(name));
    }

    public validate(): string[] {
        const errors: string[] = [];

        if (this.props.value.length < WarehouseName.MIN_LENGTH) {
            errors.push(`Warehouse name must be at least ${WarehouseName.MIN_LENGTH} characters long`);
        }

        if (this.props.value.length > WarehouseName.MAX_LENGTH) {
            errors.push(`Warehouse name cannot exceed ${WarehouseName.MAX_LENGTH} characters`);
        }

        if (WarehouseName.containsInvalidPatterns(this.props.value)) {
            errors.push('Warehouse name contains invalid content');
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