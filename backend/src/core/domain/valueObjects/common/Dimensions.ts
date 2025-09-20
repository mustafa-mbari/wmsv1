import { ValueObject } from '../../base/ValueObject';

export interface DimensionsProps {
    length: number;
    width: number;
    height: number;
    unit: string;
}

/**
 * Dimensions value object
 * Represents 3D dimensions (length, width, height) with units
 */
export class Dimensions extends ValueObject<DimensionsProps> {
    private static readonly VALID_UNITS = [
        'mm', 'cm', 'm', 'in', 'ft'
    ] as const;

    private static readonly DEFAULT_UNIT = 'cm';

    // Conversion factors to millimeters
    private static readonly CONVERSION_TO_MM: { [key: string]: number } = {
        'mm': 1,
        'cm': 10,
        'm': 1000,
        'in': 25.4,
        'ft': 304.8
    };

    private constructor(props: DimensionsProps) {
        super(props);
    }

    /**
     * Create dimensions from length, width, height, and unit
     */
    public static create(
        length: number,
        width: number,
        height: number,
        unit: string = Dimensions.DEFAULT_UNIT
    ): Dimensions {
        // Validate inputs
        if (typeof length !== 'number' || isNaN(length) || length < 0) {
            throw new Error('Length must be a non-negative number');
        }

        if (typeof width !== 'number' || isNaN(width) || width < 0) {
            throw new Error('Width must be a non-negative number');
        }

        if (typeof height !== 'number' || isNaN(height) || height < 0) {
            throw new Error('Height must be a non-negative number');
        }

        if (!unit) {
            throw new Error('Unit cannot be empty');
        }

        const normalizedUnit = unit.toLowerCase().trim();

        if (!this.VALID_UNITS.includes(normalizedUnit as any)) {
            throw new Error(`Invalid unit: ${unit}. Valid units are: ${this.VALID_UNITS.join(', ')}`);
        }

        // Round to 2 decimal places for precision
        const roundedLength = Math.round(length * 100) / 100;
        const roundedWidth = Math.round(width * 100) / 100;
        const roundedHeight = Math.round(height * 100) / 100;

        return new Dimensions({
            length: roundedLength,
            width: roundedWidth,
            height: roundedHeight,
            unit: normalizedUnit
        });
    }

    /**
     * Create cubic dimensions (all sides equal)
     */
    public static createCube(side: number, unit: string = Dimensions.DEFAULT_UNIT): Dimensions {
        return Dimensions.create(side, side, side, unit);
    }

    /**
     * Create from string (e.g., "10x5x3cm", "12 x 8 x 6 in")
     */
    public static fromString(input: string): Dimensions {
        if (!input) {
            throw new Error('Dimensions string cannot be empty');
        }

        const trimmed = input.trim();

        // Match patterns like "10x5x3cm", "12 x 8 x 6 in", "10.5x5.2x3.1 cm"
        const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/);

        if (!match) {
            throw new Error(`Invalid dimensions format: ${input}. Expected format: "lengthxwidthxheight unit" (e.g., "10x5x3cm")`);
        }

        const length = parseFloat(match[1]);
        const width = parseFloat(match[2]);
        const height = parseFloat(match[3]);
        const unit = match[4];

        return Dimensions.create(length, width, height, unit);
    }

    // Getters
    get length(): number {
        return this.props.length;
    }

    get width(): number {
        return this.props.width;
    }

    get height(): number {
        return this.props.height;
    }

    get unit(): string {
        return this.props.unit;
    }

    // Conversions

    /**
     * Convert all dimensions to millimeters
     */
    public toMillimeters(): { length: number; width: number; height: number } {
        const factor = Dimensions.CONVERSION_TO_MM[this.props.unit];
        return {
            length: this.props.length * factor,
            width: this.props.width * factor,
            height: this.props.height * factor
        };
    }

    /**
     * Convert to specific unit
     */
    public convertTo(targetUnit: string): Dimensions {
        const normalizedTargetUnit = targetUnit.toLowerCase().trim();

        if (!Dimensions.VALID_UNITS.includes(normalizedTargetUnit as any)) {
            throw new Error(`Invalid target unit: ${targetUnit}`);
        }

        if (this.props.unit === normalizedTargetUnit) {
            return this; // No conversion needed
        }

        const mm = this.toMillimeters();
        const targetFactor = Dimensions.CONVERSION_TO_MM[normalizedTargetUnit];

        return Dimensions.create(
            mm.length / targetFactor,
            mm.width / targetFactor,
            mm.height / targetFactor,
            normalizedTargetUnit
        );
    }

    /**
     * Convert to centimeters
     */
    public toCentimeters(): Dimensions {
        return this.convertTo('cm');
    }

    /**
     * Convert to inches
     */
    public toInches(): Dimensions {
        return this.convertTo('in');
    }

    /**
     * Convert to meters
     */
    public toMeters(): Dimensions {
        return this.convertTo('m');
    }

    // Calculations

    /**
     * Calculate volume
     */
    public getVolume(): number {
        return this.props.length * this.props.width * this.props.height;
    }

    /**
     * Calculate volume in cubic centimeters
     */
    public getVolumeInCubicCentimeters(): number {
        const cm = this.toCentimeters();
        return cm.getVolume();
    }

    /**
     * Calculate volume in cubic inches
     */
    public getVolumeInCubicInches(): number {
        const inches = this.toInches();
        return inches.getVolume();
    }

    /**
     * Calculate surface area
     */
    public getSurfaceArea(): number {
        const { length, width, height } = this.props;
        return 2 * (length * width + width * height + height * length);
    }

    /**
     * Calculate longest dimension
     */
    public getLongestDimension(): number {
        return Math.max(this.props.length, this.props.width, this.props.height);
    }

    /**
     * Calculate shortest dimension
     */
    public getShortestDimension(): number {
        return Math.min(this.props.length, this.props.width, this.props.height);
    }

    /**
     * Calculate diagonal length
     */
    public getDiagonal(): number {
        const { length, width, height } = this.props;
        return Math.sqrt(length * length + width * width + height * height);
    }

    /**
     * Get aspect ratio (length:width)
     */
    public getAspectRatio(): number {
        return this.props.width !== 0 ? this.props.length / this.props.width : 0;
    }

    // Comparisons

    /**
     * Check if equal to another dimensions
     */
    public equals(other: Dimensions): boolean {
        const thisMm = this.toMillimeters();
        const otherMm = other.toMillimeters();

        const tolerance = 0.1; // 0.1mm tolerance

        return Math.abs(thisMm.length - otherMm.length) < tolerance &&
               Math.abs(thisMm.width - otherMm.width) < tolerance &&
               Math.abs(thisMm.height - otherMm.height) < tolerance;
    }

    /**
     * Check if fits within another dimensions
     */
    public fitsWithin(container: Dimensions): boolean {
        const thisMm = this.toMillimeters();
        const containerMm = container.toMillimeters();

        // Check all possible orientations
        const orientations = [
            [thisMm.length, thisMm.width, thisMm.height],
            [thisMm.length, thisMm.height, thisMm.width],
            [thisMm.width, thisMm.length, thisMm.height],
            [thisMm.width, thisMm.height, thisMm.length],
            [thisMm.height, thisMm.length, thisMm.width],
            [thisMm.height, thisMm.width, thisMm.length]
        ];

        return orientations.some(([l, w, h]) =>
            l <= containerMm.length &&
            w <= containerMm.width &&
            h <= containerMm.height
        );
    }

    /**
     * Check if larger than another dimensions (by volume)
     */
    public isLargerThan(other: Dimensions): boolean {
        return this.getVolumeInCubicCentimeters() > other.getVolumeInCubicCentimeters();
    }

    // Validation and utilities

    /**
     * Check if dimensions are valid for shipping
     */
    public isValidForShipping(maxDimensions: Dimensions): boolean {
        return this.fitsWithin(maxDimensions);
    }

    /**
     * Check if dimensions require oversized shipping
     */
    public requiresOversizedShipping(): boolean {
        // Common oversized thresholds (in cm)
        const cm = this.toCentimeters();
        const maxStandardLength = 150;
        const maxStandardGirth = 300; // length + 2*(width + height)

        const girth = cm.length + 2 * (cm.width + cm.height);

        return cm.getLongestDimension() > maxStandardLength || girth > maxStandardGirth;
    }

    /**
     * Get shipping size category
     */
    public getShippingCategory(): string {
        const cm = this.toCentimeters();
        const volume = cm.getVolumeInCubicCentimeters();
        const longest = cm.getLongestDimension();

        if (volume <= 1000 && longest <= 20) return 'small';
        if (volume <= 5000 && longest <= 40) return 'medium';
        if (volume <= 20000 && longest <= 80) return 'large';
        if (volume <= 50000 && longest <= 120) return 'extra-large';
        return 'oversized';
    }

    /**
     * Check if dimensions form a cube
     */
    public isCube(tolerance: number = 0.01): boolean {
        const maxDiff = this.getLongestDimension() - this.getShortestDimension();
        return maxDiff <= tolerance;
    }

    /**
     * Scale dimensions by a factor
     */
    public scale(factor: number): Dimensions {
        if (typeof factor !== 'number' || isNaN(factor) || factor <= 0) {
            throw new Error('Scale factor must be a positive number');
        }

        return Dimensions.create(
            this.props.length * factor,
            this.props.width * factor,
            this.props.height * factor,
            this.props.unit
        );
    }

    // Formatting

    /**
     * Format as string
     */
    public format(options: {
        decimals?: number;
        separator?: string;
        showUnit?: boolean;
        locale?: string;
    } = {}): string {
        const {
            decimals = 2,
            separator = 'x',
            showUnit = true,
            locale = 'en-US'
        } = options;

        const formatter = new Intl.NumberFormat(locale, {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimals
        });

        const formattedLength = formatter.format(this.props.length);
        const formattedWidth = formatter.format(this.props.width);
        const formattedHeight = formatter.format(this.props.height);

        const dimensionsString = `${formattedLength}${separator}${formattedWidth}${separator}${formattedHeight}`;

        if (showUnit) {
            return `${dimensionsString}${this.props.unit}`;
        }

        return dimensionsString;
    }

    /**
     * Get unit display name
     */
    public getUnitDisplayName(): string {
        const displayNames: { [key: string]: string } = {
            'mm': 'millimeters',
            'cm': 'centimeters',
            'm': 'meters',
            'in': 'inches',
            'ft': 'feet'
        };

        return displayNames[this.props.unit] || this.props.unit;
    }

    /**
     * Validate dimensions
     */
    public isValid(): boolean {
        try {
            Dimensions.create(this.props.length, this.props.width, this.props.height, this.props.unit);
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