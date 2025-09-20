import { ValueObject } from '../../base/ValueObject';

export interface ProductSkuProps {
    value: string;
}

/**
 * ProductSku value object
 * Ensures product SKUs are valid and properly formatted
 */
export class ProductSku extends ValueObject<ProductSkuProps> {
    private static readonly MIN_LENGTH = 1;
    private static readonly MAX_LENGTH = 100;
    private static readonly SKU_REGEX = /^[A-Z0-9_-]+$/;

    private constructor(props: ProductSkuProps) {
        super(props);
    }

    /**
     * Create product SKU from string
     */
    public static create(sku: string): ProductSku {
        if (!sku) {
            throw new Error('Product SKU cannot be empty');
        }

        const normalizedSku = sku.trim().toUpperCase();

        if (normalizedSku.length < this.MIN_LENGTH) {
            throw new Error(`Product SKU must be at least ${this.MIN_LENGTH} character long`);
        }

        if (normalizedSku.length > this.MAX_LENGTH) {
            throw new Error(`Product SKU cannot exceed ${this.MAX_LENGTH} characters`);
        }

        if (!this.SKU_REGEX.test(normalizedSku)) {
            throw new Error('Product SKU can only contain uppercase letters, numbers, underscores, and hyphens');
        }

        // Additional business rules
        if (normalizedSku.startsWith('-') || normalizedSku.endsWith('-')) {
            throw new Error('Product SKU cannot start or end with a hyphen');
        }

        if (normalizedSku.startsWith('_') || normalizedSku.endsWith('_')) {
            throw new Error('Product SKU cannot start or end with an underscore');
        }

        if (normalizedSku.includes('--') || normalizedSku.includes('__')) {
            throw new Error('Product SKU cannot contain consecutive special characters');
        }

        return new ProductSku({ value: normalizedSku });
    }

    /**
     * Generate SKU from product name and optional prefix
     */
    public static generateFromName(productName: string, prefix?: string): ProductSku {
        if (!productName) {
            throw new Error('Product name is required for SKU generation');
        }

        // Clean and format the product name
        const cleanName = productName
            .toUpperCase()
            .replace(/[^A-Z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

        // Add prefix if provided
        const skuParts = [];
        if (prefix) {
            skuParts.push(prefix.toUpperCase());
        }
        skuParts.push(cleanName);

        // Add timestamp suffix to ensure uniqueness
        const timestamp = Date.now().toString().slice(-6);
        skuParts.push(timestamp);

        const generatedSku = skuParts.join('-');

        return this.create(generatedSku);
    }

    /**
     * Generate SKU with category and sequence
     */
    public static generateWithCategory(category: string, sequence: number): ProductSku {
        if (!category) {
            throw new Error('Category is required for SKU generation');
        }

        if (sequence < 1) {
            throw new Error('Sequence must be a positive number');
        }

        const categoryCode = category.toUpperCase().substring(0, 4);
        const paddedSequence = sequence.toString().padStart(6, '0');
        const sku = `${categoryCode}-${paddedSequence}`;

        return this.create(sku);
    }

    /**
     * Get product SKU value
     */
    get value(): string {
        return this.props.value;
    }

    /**
     * Get display value (formatted for UI)
     */
    public getDisplayValue(): string {
        return this.props.value;
    }

    /**
     * Get search-friendly version
     */
    public getSearchValue(): string {
        return this.props.value.toLowerCase();
    }

    /**
     * Extract prefix from SKU (text before first hyphen)
     */
    public getPrefix(): string | null {
        const parts = this.props.value.split('-');
        return parts.length > 1 ? parts[0] : null;
    }

    /**
     * Extract suffix from SKU (text after last hyphen)
     */
    public getSuffix(): string | null {
        const parts = this.props.value.split('-');
        return parts.length > 1 ? parts[parts.length - 1] : null;
    }

    /**
     * Extract main part from SKU (without prefix and suffix)
     */
    public getMainPart(): string {
        const parts = this.props.value.split('-');
        if (parts.length <= 2) {
            return parts[0];
        }
        return parts.slice(1, -1).join('-');
    }

    /**
     * Get all parts of the SKU
     */
    public getParts(): string[] {
        return this.props.value.split('-');
    }

    /**
     * Check if SKU matches a pattern
     */
    public matchesPattern(pattern: string): boolean {
        // Convert pattern to regex, treating * as wildcard
        const regexPattern = pattern
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');

        const regex = new RegExp(`^${regexPattern}$`, 'i');
        return regex.test(this.props.value);
    }

    /**
     * Check if SKU belongs to a specific category (by prefix)
     */
    public belongsToCategory(categoryPrefix: string): boolean {
        const prefix = this.getPrefix();
        return prefix ? prefix.toLowerCase() === categoryPrefix.toLowerCase() : false;
    }

    /**
     * Generate barcode-friendly version (remove special characters)
     */
    public getBarcodeValue(): string {
        return this.props.value.replace(/[-_]/g, '');
    }

    /**
     * Check if SKU has numeric suffix
     */
    public hasNumericSuffix(): boolean {
        const suffix = this.getSuffix();
        return suffix ? /^\d+$/.test(suffix) : false;
    }

    /**
     * Get numeric suffix value
     */
    public getNumericSuffix(): number | null {
        if (!this.hasNumericSuffix()) {
            return null;
        }
        const suffix = this.getSuffix();
        return suffix ? parseInt(suffix, 10) : null;
    }

    /**
     * Create variant SKU with new suffix
     */
    public createVariant(variantSuffix: string): ProductSku {
        const parts = this.getParts();
        parts[parts.length - 1] = variantSuffix.toUpperCase();
        return ProductSku.create(parts.join('-'));
    }

    /**
     * Create next sequential SKU (if has numeric suffix)
     */
    public createNext(): ProductSku {
        const numericSuffix = this.getNumericSuffix();
        if (numericSuffix === null) {
            throw new Error('Cannot create next SKU: current SKU does not have numeric suffix');
        }

        const nextSequence = numericSuffix + 1;
        const parts = this.getParts();
        parts[parts.length - 1] = nextSequence.toString().padStart(parts[parts.length - 1].length, '0');

        return ProductSku.create(parts.join('-'));
    }

    /**
     * Validate SKU format
     */
    public isValid(): boolean {
        try {
            ProductSku.create(this.props.value);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if SKU follows standard naming convention
     */
    public followsStandardConvention(): boolean {
        // Standard convention: PREFIX-MAIN-SEQUENCE
        const parts = this.getParts();

        if (parts.length < 2) {
            return false;
        }

        // Check if first part is alphabetic (prefix)
        if (!/^[A-Z]+$/.test(parts[0])) {
            return false;
        }

        // Check if last part is numeric (sequence)
        if (!/^\d+$/.test(parts[parts.length - 1])) {
            return false;
        }

        return true;
    }

    /**
     * String representation
     */
    public toString(): string {
        return this.props.value;
    }
}