import { ValueObject } from '../../base/ValueObject';

export interface ProductNameProps {
    value: string;
}

/**
 * ProductName value object
 * Ensures product names are valid and properly formatted
 */
export class ProductName extends ValueObject<ProductNameProps> {
    private static readonly MIN_LENGTH = 1;
    private static readonly MAX_LENGTH = 200;
    private static readonly INVALID_CHARS_REGEX = /[<>\"'&]/;

    private constructor(props: ProductNameProps) {
        super(props);
    }

    /**
     * Create product name from string
     */
    public static create(name: string): ProductName {
        if (!name) {
            throw new Error('Product name cannot be empty');
        }

        const trimmedName = name.trim();

        if (trimmedName.length < this.MIN_LENGTH) {
            throw new Error(`Product name must be at least ${this.MIN_LENGTH} character long`);
        }

        if (trimmedName.length > this.MAX_LENGTH) {
            throw new Error(`Product name cannot exceed ${this.MAX_LENGTH} characters`);
        }

        if (this.INVALID_CHARS_REGEX.test(trimmedName)) {
            throw new Error('Product name cannot contain invalid characters (<, >, ", \', &)');
        }

        // Check for suspicious patterns
        if (this.containsSuspiciousPatterns(trimmedName)) {
            throw new Error('Product name contains potentially harmful content');
        }

        return new ProductName({ value: trimmedName });
    }

    /**
     * Get product name value
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
     * Get search-friendly version (lowercase, normalized)
     */
    public getSearchValue(): string {
        return this.props.value.toLowerCase().replace(/\s+/g, ' ');
    }

    /**
     * Get URL-friendly slug
     */
    public getSlug(): string {
        return this.props.value
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    /**
     * Get keywords for search indexing
     */
    public getKeywords(): string[] {
        return this.props.value
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 2)
            .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates
    }

    /**
     * Check if name contains specific words
     */
    public contains(searchTerm: string): boolean {
        return this.getSearchValue().includes(searchTerm.toLowerCase());
    }

    /**
     * Check if name starts with specific text
     */
    public startsWith(prefix: string): boolean {
        return this.getSearchValue().startsWith(prefix.toLowerCase());
    }

    /**
     * Check if name ends with specific text
     */
    public endsWith(suffix: string): boolean {
        return this.getSearchValue().endsWith(suffix.toLowerCase());
    }

    /**
     * Get abbreviated version (for display in limited space)
     */
    public getAbbreviated(maxLength: number = 50): string {
        if (this.props.value.length <= maxLength) {
            return this.props.value;
        }

        return this.props.value.substring(0, maxLength - 3) + '...';
    }

    /**
     * Get word count
     */
    public getWordCount(): number {
        return this.props.value.split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * Check if product name is valid
     */
    public isValid(): boolean {
        try {
            ProductName.create(this.props.value);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check for suspicious patterns that might indicate malicious content
     */
    private static containsSuspiciousPatterns(name: string): boolean {
        const suspiciousPatterns = [
            /script/i,
            /javascript/i,
            /vbscript/i,
            /onload/i,
            /onerror/i,
            /onclick/i,
            /style\s*=/i,
            /expression/i,
            /alert\s*\(/i,
            /document\./i,
            /window\./i,
            /eval\s*\(/i
        ];

        return suspiciousPatterns.some(pattern => pattern.test(name));
    }

    /**
     * Capitalize first letter of each word
     */
    public capitalize(): ProductName {
        const capitalized = this.props.value
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());

        return ProductName.create(capitalized);
    }

    /**
     * Convert to title case
     */
    public toTitleCase(): ProductName {
        const titleCase = this.props.value
            .toLowerCase()
            .split(' ')
            .map(word => {
                // Don't capitalize common small words unless they're the first word
                const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to', 'up'];
                if (smallWords.includes(word)) {
                    return word;
                }
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');

        // Always capitalize the first word
        const finalTitleCase = titleCase.charAt(0).toUpperCase() + titleCase.slice(1);

        return ProductName.create(finalTitleCase);
    }

    /**
     * String representation
     */
    public toString(): string {
        return this.props.value;
    }
}