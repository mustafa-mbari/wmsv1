import { ValueObject } from '../../base/ValueObject';

export interface ProductDescriptionProps {
    value: string;
}

/**
 * ProductDescription value object
 * Ensures product descriptions are valid and properly formatted
 */
export class ProductDescription extends ValueObject<ProductDescriptionProps> {
    private static readonly MIN_LENGTH = 1;
    private static readonly MAX_LENGTH = 2000;
    private static readonly INVALID_PATTERNS = [
        /<script/i,
        /<\/script>/i,
        /javascript:/i,
        /vbscript:/i,
        /onload\s*=/i,
        /onerror\s*=/i,
        /onclick\s*=/i
    ];

    private constructor(props: ProductDescriptionProps) {
        super(props);
    }

    /**
     * Create product description from string
     */
    public static create(description: string): ProductDescription {
        if (!description) {
            throw new Error('Product description cannot be empty');
        }

        const trimmedDescription = description.trim();

        if (trimmedDescription.length < this.MIN_LENGTH) {
            throw new Error(`Product description must be at least ${this.MIN_LENGTH} character long`);
        }

        if (trimmedDescription.length > this.MAX_LENGTH) {
            throw new Error(`Product description cannot exceed ${this.MAX_LENGTH} characters`);
        }

        // Check for potentially harmful content
        if (this.containsInvalidPatterns(trimmedDescription)) {
            throw new Error('Product description contains potentially harmful content');
        }

        return new ProductDescription({ value: trimmedDescription });
    }

    /**
     * Get product description value
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
     * Get plain text version (strip HTML if any)
     */
    public getPlainText(): string {
        return this.props.value.replace(/<[^>]*>/g, '');
    }

    /**
     * Get truncated version for previews
     */
    public getTruncated(maxLength: number = 150): string {
        const plainText = this.getPlainText();
        if (plainText.length <= maxLength) {
            return plainText;
        }

        // Find the last complete word within the limit
        const truncated = plainText.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');

        if (lastSpaceIndex > maxLength * 0.8) {
            return truncated.substring(0, lastSpaceIndex) + '...';
        }

        return truncated + '...';
    }

    /**
     * Get summary (first sentence or first 100 characters)
     */
    public getSummary(): string {
        const plainText = this.getPlainText();

        // Try to find first sentence
        const firstSentence = plainText.match(/^[^.!?]*[.!?]/);
        if (firstSentence && firstSentence[0].length <= 200) {
            return firstSentence[0].trim();
        }

        // Fall back to truncated version
        return this.getTruncated(100);
    }

    /**
     * Get word count
     */
    public getWordCount(): number {
        const plainText = this.getPlainText();
        return plainText.split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * Get character count (excluding HTML tags)
     */
    public getCharacterCount(): number {
        return this.getPlainText().length;
    }

    /**
     * Get reading time estimate (in minutes)
     */
    public getReadingTime(): number {
        const wordsPerMinute = 200; // Average reading speed
        const wordCount = this.getWordCount();
        return Math.ceil(wordCount / wordsPerMinute);
    }

    /**
     * Extract keywords for search indexing
     */
    public getKeywords(): string[] {
        const plainText = this.getPlainText().toLowerCase();

        // Remove common stop words
        const stopWords = new Set([
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'were', 'will', 'with', 'this', 'these', 'they',
            'them', 'their', 'have', 'had', 'can', 'could', 'should', 'would'
        ]);

        return plainText
            .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
            .split(/\s+/)
            .filter(word => word.length > 2) // Only words with 3+ characters
            .filter(word => !stopWords.has(word)) // Remove stop words
            .filter(word => !/^\d+$/.test(word)) // Remove pure numbers
            .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates
    }

    /**
     * Check if description contains specific text
     */
    public contains(searchTerm: string): boolean {
        return this.getPlainText().toLowerCase().includes(searchTerm.toLowerCase());
    }

    /**
     * Get search score for a term (0-1)
     */
    public getSearchScore(searchTerm: string): number {
        const plainText = this.getPlainText().toLowerCase();
        const term = searchTerm.toLowerCase();

        if (!plainText.includes(term)) {
            return 0;
        }

        // Higher score for exact matches and matches near the beginning
        let score = 0.5; // Base score for containing the term

        // Boost for exact word matches
        const wordBoundaryRegex = new RegExp(`\\b${term}\\b`, 'gi');
        const exactMatches = plainText.match(wordBoundaryRegex);
        if (exactMatches) {
            score += exactMatches.length * 0.2;
        }

        // Boost for matches near the beginning
        const firstIndex = plainText.indexOf(term);
        if (firstIndex < 50) {
            score += 0.3;
        } else if (firstIndex < 150) {
            score += 0.1;
        }

        return Math.min(score, 1.0);
    }

    /**
     * Format for different output types
     */
    public formatAs(format: 'html' | 'markdown' | 'plain'): string {
        switch (format) {
            case 'html':
                return this.props.value
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/\n/g, '<br>')
                    .replace(/^/, '<p>')
                    .replace(/$/, '</p>');

            case 'markdown':
                return this.props.value; // Assume it's already markdown-formatted

            case 'plain':
            default:
                return this.getPlainText();
        }
    }

    /**
     * Check if description is suitable for SEO (has good length and content)
     */
    public isSeoFriendly(): boolean {
        const charCount = this.getCharacterCount();
        const wordCount = this.getWordCount();

        // Good SEO descriptions are typically 150-300 characters and 25-50 words
        return charCount >= 120 && charCount <= 320 && wordCount >= 20 && wordCount <= 60;
    }

    /**
     * Get SEO recommendations
     */
    public getSeoRecommendations(): string[] {
        const recommendations: string[] = [];
        const charCount = this.getCharacterCount();
        const wordCount = this.getWordCount();

        if (charCount < 120) {
            recommendations.push('Description is too short for good SEO (recommended: 120-320 characters)');
        }

        if (charCount > 320) {
            recommendations.push('Description is too long for good SEO (recommended: 120-320 characters)');
        }

        if (wordCount < 20) {
            recommendations.push('Add more descriptive content (recommended: 20-60 words)');
        }

        if (wordCount > 60) {
            recommendations.push('Consider shortening the description (recommended: 20-60 words)');
        }

        if (this.getKeywords().length < 3) {
            recommendations.push('Include more relevant keywords');
        }

        return recommendations;
    }

    /**
     * Check for potentially harmful content
     */
    private static containsInvalidPatterns(description: string): boolean {
        return this.INVALID_PATTERNS.some(pattern => pattern.test(description));
    }

    /**
     * Validate description
     */
    public isValid(): boolean {
        try {
            ProductDescription.create(this.props.value);
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