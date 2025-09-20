import { ValueObject } from '../../base/ValueObject';

export interface MoneyProps {
    amount: number;
    currency: string;
}

/**
 * Money value object
 * Represents monetary values with currency information
 */
export class Money extends ValueObject<MoneyProps> {
    private static readonly DEFAULT_CURRENCY = 'USD';
    private static readonly VALID_CURRENCIES = [
        'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD'
    ];

    private constructor(props: MoneyProps) {
        super(props);
    }

    /**
     * Create money from amount and currency
     */
    public static create(amount: number, currency: string = Money.DEFAULT_CURRENCY): Money {
        if (typeof amount !== 'number' || isNaN(amount)) {
            throw new Error('Amount must be a valid number');
        }

        if (amount < 0) {
            throw new Error('Amount cannot be negative');
        }

        if (!currency) {
            throw new Error('Currency cannot be empty');
        }

        const normalizedCurrency = currency.toUpperCase().trim();

        if (!this.VALID_CURRENCIES.includes(normalizedCurrency)) {
            throw new Error(`Invalid currency: ${currency}. Valid currencies are: ${this.VALID_CURRENCIES.join(', ')}`);
        }

        // Round to 2 decimal places for monetary precision
        const roundedAmount = Math.round(amount * 100) / 100;

        return new Money({
            amount: roundedAmount,
            currency: normalizedCurrency
        });
    }

    /**
     * Create zero money
     */
    public static zero(currency: string = Money.DEFAULT_CURRENCY): Money {
        return Money.create(0, currency);
    }

    /**
     * Create from string (e.g., "123.45" or "$123.45")
     */
    public static fromString(value: string, currency?: string): Money {
        if (!value) {
            throw new Error('Value cannot be empty');
        }

        // Extract currency symbol if present
        let extractedCurrency = currency;
        let cleanValue = value.trim();

        const currencySymbols: { [key: string]: string } = {
            '$': 'USD',
            '€': 'EUR',
            '£': 'GBP',
            '¥': 'JPY',
            '¤': 'USD' // Generic currency symbol
        };

        for (const [symbol, curr] of Object.entries(currencySymbols)) {
            if (cleanValue.includes(symbol)) {
                extractedCurrency = extractedCurrency || curr;
                cleanValue = cleanValue.replace(symbol, '');
                break;
            }
        }

        // Remove commas and spaces
        cleanValue = cleanValue.replace(/[,\s]/g, '');

        const amount = parseFloat(cleanValue);
        if (isNaN(amount)) {
            throw new Error(`Invalid monetary value: ${value}`);
        }

        return Money.create(amount, extractedCurrency || Money.DEFAULT_CURRENCY);
    }

    // Getters
    get amount(): number {
        return this.props.amount;
    }

    get currency(): string {
        return this.props.currency;
    }

    // Operations

    /**
     * Add another money amount (same currency required)
     */
    public add(other: Money): Money {
        this.ensureSameCurrency(other);
        return Money.create(this.props.amount + other.amount, this.props.currency);
    }

    /**
     * Subtract another money amount (same currency required)
     */
    public subtract(other: Money): Money {
        this.ensureSameCurrency(other);
        const result = this.props.amount - other.amount;

        if (result < 0) {
            throw new Error('Subtraction would result in negative amount');
        }

        return Money.create(result, this.props.currency);
    }

    /**
     * Multiply by a factor
     */
    public multiply(factor: number): Money {
        if (typeof factor !== 'number' || isNaN(factor)) {
            throw new Error('Factor must be a valid number');
        }

        if (factor < 0) {
            throw new Error('Factor cannot be negative');
        }

        return Money.create(this.props.amount * factor, this.props.currency);
    }

    /**
     * Divide by a divisor
     */
    public divide(divisor: number): Money {
        if (typeof divisor !== 'number' || isNaN(divisor)) {
            throw new Error('Divisor must be a valid number');
        }

        if (divisor <= 0) {
            throw new Error('Divisor must be positive');
        }

        return Money.create(this.props.amount / divisor, this.props.currency);
    }

    /**
     * Calculate percentage
     */
    public percentage(percent: number): Money {
        if (typeof percent !== 'number' || isNaN(percent)) {
            throw new Error('Percentage must be a valid number');
        }

        return this.multiply(percent / 100);
    }

    /**
     * Apply discount
     */
    public applyDiscount(discountPercent: number): Money {
        if (discountPercent < 0 || discountPercent > 100) {
            throw new Error('Discount percentage must be between 0 and 100');
        }

        const discountAmount = this.percentage(discountPercent);
        return this.subtract(discountAmount);
    }

    /**
     * Apply tax
     */
    public applyTax(taxPercent: number): Money {
        if (taxPercent < 0) {
            throw new Error('Tax percentage cannot be negative');
        }

        const taxAmount = this.percentage(taxPercent);
        return this.add(taxAmount);
    }

    // Comparisons

    /**
     * Check if equal to another money amount
     */
    public equals(other: Money): boolean {
        return this.props.amount === other.amount &&
               this.props.currency === other.currency;
    }

    /**
     * Check if greater than another money amount
     */
    public greaterThan(other: Money): boolean {
        this.ensureSameCurrency(other);
        return this.props.amount > other.amount;
    }

    /**
     * Check if greater than or equal to another money amount
     */
    public greaterThanOrEqual(other: Money): boolean {
        this.ensureSameCurrency(other);
        return this.props.amount >= other.amount;
    }

    /**
     * Check if less than another money amount
     */
    public lessThan(other: Money): boolean {
        this.ensureSameCurrency(other);
        return this.props.amount < other.amount;
    }

    /**
     * Check if less than or equal to another money amount
     */
    public lessThanOrEqual(other: Money): boolean {
        this.ensureSameCurrency(other);
        return this.props.amount <= other.amount;
    }

    /**
     * Check if zero
     */
    public isZero(): boolean {
        return this.props.amount === 0;
    }

    /**
     * Check if positive
     */
    public isPositive(): boolean {
        return this.props.amount > 0;
    }

    // Formatting

    /**
     * Format as string with currency symbol
     */
    public format(options: {
        locale?: string;
        showCurrency?: boolean;
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
    } = {}): string {
        const {
            locale = 'en-US',
            showCurrency = true,
            minimumFractionDigits = 2,
            maximumFractionDigits = 2
        } = options;

        const formatter = new Intl.NumberFormat(locale, {
            style: showCurrency ? 'currency' : 'decimal',
            currency: showCurrency ? this.props.currency : undefined,
            minimumFractionDigits,
            maximumFractionDigits
        });

        return formatter.format(this.props.amount);
    }

    /**
     * Format as string without currency
     */
    public formatAmount(): string {
        return this.format({ showCurrency: false });
    }

    /**
     * Get currency symbol
     */
    public getCurrencySymbol(): string {
        const symbols: { [key: string]: string } = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'JPY': '¥',
            'AUD': 'A$',
            'CAD': 'C$',
            'CHF': 'CHF',
            'CNY': '¥',
            'SEK': 'kr',
            'NZD': 'NZ$'
        };

        return symbols[this.props.currency] || this.props.currency;
    }

    // Utility methods

    /**
     * Round to nearest cent
     */
    public roundToCent(): Money {
        return Money.create(
            Math.round(this.props.amount * 100) / 100,
            this.props.currency
        );
    }

    /**
     * Round up to nearest cent
     */
    public roundUpToCent(): Money {
        return Money.create(
            Math.ceil(this.props.amount * 100) / 100,
            this.props.currency
        );
    }

    /**
     * Round down to nearest cent
     */
    public roundDownToCent(): Money {
        return Money.create(
            Math.floor(this.props.amount * 100) / 100,
            this.props.currency
        );
    }

    /**
     * Convert to different currency (requires exchange rate)
     */
    public convertTo(targetCurrency: string, exchangeRate: number): Money {
        if (!targetCurrency) {
            throw new Error('Target currency cannot be empty');
        }

        if (typeof exchangeRate !== 'number' || isNaN(exchangeRate) || exchangeRate <= 0) {
            throw new Error('Exchange rate must be a positive number');
        }

        const convertedAmount = this.props.amount * exchangeRate;
        return Money.create(convertedAmount, targetCurrency);
    }

    /**
     * Ensure same currency for operations
     */
    private ensureSameCurrency(other: Money): void {
        if (this.props.currency !== other.currency) {
            throw new Error(`Currency mismatch: ${this.props.currency} vs ${other.currency}`);
        }
    }

    /**
     * Validate money value
     */
    public isValid(): boolean {
        try {
            Money.create(this.props.amount, this.props.currency);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get valid currencies
     */
    public static getValidCurrencies(): string[] {
        return [...this.VALID_CURRENCIES];
    }

    /**
     * String representation
     */
    public toString(): string {
        return this.format();
    }
}