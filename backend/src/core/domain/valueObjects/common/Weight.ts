import { ValueObject } from '../../base/ValueObject';

export interface WeightProps {
    value: number;
    unit: string;
}

/**
 * Weight value object
 * Represents weight measurements with units
 */
export class Weight extends ValueObject<WeightProps> {
    private static readonly VALID_UNITS = [
        'kg', 'g', 'lb', 'oz', 'ton', 'mt'
    ] as const;

    private static readonly DEFAULT_UNIT = 'kg';

    // Conversion factors to grams
    private static readonly CONVERSION_TO_GRAMS: { [key: string]: number } = {
        'g': 1,
        'kg': 1000,
        'lb': 453.592,
        'oz': 28.3495,
        'ton': 1000000,
        'mt': 1000000 // metric ton
    };

    private constructor(props: WeightProps) {
        super(props);
    }

    /**
     * Create weight from value and unit
     */
    public static create(value: number, unit: string = Weight.DEFAULT_UNIT): Weight {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Weight value must be a valid number');
        }

        if (value < 0) {
            throw new Error('Weight cannot be negative');
        }

        if (!unit) {
            throw new Error('Weight unit cannot be empty');
        }

        const normalizedUnit = unit.toLowerCase().trim();

        if (!this.VALID_UNITS.includes(normalizedUnit as any)) {
            throw new Error(`Invalid weight unit: ${unit}. Valid units are: ${this.VALID_UNITS.join(', ')}`);
        }

        // Round to 3 decimal places for precision
        const roundedValue = Math.round(value * 1000) / 1000;

        return new Weight({
            value: roundedValue,
            unit: normalizedUnit
        });
    }

    /**
     * Create from string (e.g., "2.5kg", "10 lb")
     */
    public static fromString(input: string): Weight {
        if (!input) {
            throw new Error('Weight string cannot be empty');
        }

        const trimmed = input.trim();

        // Match patterns like "2.5kg", "10 lb", "1.5 kg"
        const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/);

        if (!match) {
            throw new Error(`Invalid weight format: ${input}. Expected format: "number unit" (e.g., "2.5kg")`);
        }

        const value = parseFloat(match[1]);
        const unit = match[2];

        return Weight.create(value, unit);
    }

    // Getters
    get value(): number {
        return this.props.value;
    }

    get unit(): string {
        return this.props.unit;
    }

    // Conversions

    /**
     * Convert to grams
     */
    public toGrams(): number {
        const factor = Weight.CONVERSION_TO_GRAMS[this.props.unit];
        return this.props.value * factor;
    }

    /**
     * Convert to specific unit
     */
    public convertTo(targetUnit: string): Weight {
        const normalizedTargetUnit = targetUnit.toLowerCase().trim();

        if (!Weight.VALID_UNITS.includes(normalizedTargetUnit as any)) {
            throw new Error(`Invalid target unit: ${targetUnit}`);
        }

        if (this.props.unit === normalizedTargetUnit) {
            return this; // No conversion needed
        }

        const grams = this.toGrams();
        const targetFactor = Weight.CONVERSION_TO_GRAMS[normalizedTargetUnit];
        const convertedValue = grams / targetFactor;

        return Weight.create(convertedValue, normalizedTargetUnit);
    }

    /**
     * Convert to kilograms
     */
    public toKilograms(): Weight {
        return this.convertTo('kg');
    }

    /**
     * Convert to pounds
     */
    public toPounds(): Weight {
        return this.convertTo('lb');
    }

    /**
     * Convert to ounces
     */
    public toOunces(): Weight {
        return this.convertTo('oz');
    }

    // Operations

    /**
     * Add another weight (converts to same unit)
     */
    public add(other: Weight): Weight {
        const otherConverted = other.convertTo(this.props.unit);
        return Weight.create(
            this.props.value + otherConverted.value,
            this.props.unit
        );
    }

    /**
     * Subtract another weight (converts to same unit)
     */
    public subtract(other: Weight): Weight {
        const otherConverted = other.convertTo(this.props.unit);
        const result = this.props.value - otherConverted.value;

        if (result < 0) {
            throw new Error('Subtraction would result in negative weight');
        }

        return Weight.create(result, this.props.unit);
    }

    /**
     * Multiply by a factor
     */
    public multiply(factor: number): Weight {
        if (typeof factor !== 'number' || isNaN(factor)) {
            throw new Error('Factor must be a valid number');
        }

        if (factor < 0) {
            throw new Error('Factor cannot be negative');
        }

        return Weight.create(this.props.value * factor, this.props.unit);
    }

    /**
     * Divide by a divisor
     */
    public divide(divisor: number): Weight {
        if (typeof divisor !== 'number' || isNaN(divisor)) {
            throw new Error('Divisor must be a valid number');
        }

        if (divisor <= 0) {
            throw new Error('Divisor must be positive');
        }

        return Weight.create(this.props.value / divisor, this.props.unit);
    }

    // Comparisons

    /**
     * Check if equal to another weight
     */
    public equals(other: Weight): boolean {
        const thisGrams = this.toGrams();
        const otherGrams = other.toGrams();
        return Math.abs(thisGrams - otherGrams) < 0.001; // Account for floating point precision
    }

    /**
     * Check if greater than another weight
     */
    public greaterThan(other: Weight): boolean {
        return this.toGrams() > other.toGrams();
    }

    /**
     * Check if greater than or equal to another weight
     */
    public greaterThanOrEqual(other: Weight): boolean {
        return this.toGrams() >= other.toGrams();
    }

    /**
     * Check if less than another weight
     */
    public lessThan(other: Weight): boolean {
        return this.toGrams() < other.toGrams();
    }

    /**
     * Check if less than or equal to another weight
     */
    public lessThanOrEqual(other: Weight): boolean {
        return this.toGrams() <= other.toGrams();
    }

    /**
     * Check if zero
     */
    public isZero(): boolean {
        return this.props.value === 0;
    }

    // Formatting

    /**
     * Format as string
     */
    public format(options: {
        decimals?: number;
        showUnit?: boolean;
        locale?: string;
    } = {}): string {
        const {
            decimals = 3,
            showUnit = true,
            locale = 'en-US'
        } = options;

        const formatter = new Intl.NumberFormat(locale, {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimals
        });

        const formattedValue = formatter.format(this.props.value);

        if (showUnit) {
            return `${formattedValue}${this.props.unit}`;
        }

        return formattedValue;
    }

    /**
     * Get unit display name
     */
    public getUnitDisplayName(): string {
        const displayNames: { [key: string]: string } = {
            'g': 'grams',
            'kg': 'kilograms',
            'lb': 'pounds',
            'oz': 'ounces',
            'ton': 'tons',
            'mt': 'metric tons'
        };

        return displayNames[this.props.unit] || this.props.unit;
    }

    /**
     * Get appropriate unit for display based on magnitude
     */
    public getOptimalUnit(): Weight {
        const grams = this.toGrams();

        if (grams >= 1000000) {
            return this.convertTo('mt'); // metric tons
        } else if (grams >= 1000) {
            return this.convertTo('kg');
        } else {
            return this.convertTo('g');
        }
    }

    // Utility methods

    /**
     * Check if weight is suitable for shipping
     */
    public isSuitableForShipping(maxWeight: Weight): boolean {
        return this.lessThanOrEqual(maxWeight);
    }

    /**
     * Get shipping category based on weight
     */
    public getShippingCategory(): string {
        const kg = this.convertTo('kg');

        if (kg.value <= 0.5) return 'light';
        if (kg.value <= 2) return 'standard';
        if (kg.value <= 10) return 'medium';
        if (kg.value <= 30) return 'heavy';
        return 'oversized';
    }

    /**
     * Check if weight requires special handling
     */
    public requiresSpecialHandling(): boolean {
        const kg = this.convertTo('kg');
        return kg.value > 30; // Over 30kg requires special handling
    }

    /**
     * Validate weight
     */
    public isValid(): boolean {
        try {
            Weight.create(this.props.value, this.props.unit);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get valid units
     */
    public static getValidUnits(): string[] {
        return [...this.VALID_UNITS];
    }

    /**
     * String representation
     */
    public toString(): string {
        return this.format();
    }
}