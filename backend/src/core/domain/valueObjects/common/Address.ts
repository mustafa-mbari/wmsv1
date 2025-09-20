import { ValueObject } from '../../base/ValueObject';

export interface AddressProps {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    addressLine2?: string;
}

export class Address extends ValueObject<AddressProps> {
    private static readonly REQUIRED_FIELDS = ['street', 'city', 'state', 'country', 'postalCode'];

    private constructor(props: AddressProps) {
        super(props);
    }

    public static create(
        street: string,
        city: string,
        state: string,
        country: string,
        postalCode: string,
        addressLine2?: string
    ): Address {
        const errors = this.validate(street, city, state, country, postalCode);
        if (errors.length > 0) {
            throw new Error(`Invalid address: ${errors.join(', ')}`);
        }

        return new Address({
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            country: country.trim().toUpperCase(),
            postalCode: postalCode.trim(),
            addressLine2: addressLine2?.trim()
        });
    }

    public static fromObject(obj: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
        addressLine2?: string;
    }): Address {
        return Address.create(
            obj.street,
            obj.city,
            obj.state,
            obj.country,
            obj.postalCode,
            obj.addressLine2
        );
    }

    // Getters
    get street(): string { return this.props.street; }
    get city(): string { return this.props.city; }
    get state(): string { return this.props.state; }
    get country(): string { return this.props.country; }
    get postalCode(): string { return this.props.postalCode; }
    get addressLine2(): string | undefined { return this.props.addressLine2; }

    public getFormattedAddress(format: 'single_line' | 'multi_line' | 'postal' = 'multi_line'): string {
        switch (format) {
            case 'single_line':
                return this.getSingleLineAddress();
            case 'multi_line':
                return this.getMultiLineAddress();
            case 'postal':
                return this.getPostalAddress();
            default:
                return this.getMultiLineAddress();
        }
    }

    private getSingleLineAddress(): string {
        const parts = [this.props.street];
        if (this.props.addressLine2) {
            parts.push(this.props.addressLine2);
        }
        parts.push(`${this.props.city}, ${this.props.state} ${this.props.postalCode}`);
        parts.push(this.props.country);
        return parts.join(', ');
    }

    private getMultiLineAddress(): string {
        const lines = [this.props.street];
        if (this.props.addressLine2) {
            lines.push(this.props.addressLine2);
        }
        lines.push(`${this.props.city}, ${this.props.state} ${this.props.postalCode}`);
        lines.push(this.props.country);
        return lines.join('\n');
    }

    private getPostalAddress(): string {
        const lines = [this.props.street];
        if (this.props.addressLine2) {
            lines.push(this.props.addressLine2);
        }
        lines.push(this.props.city);
        lines.push(`${this.props.state} ${this.props.postalCode}`);
        lines.push(this.props.country);
        return lines.join('\n');
    }

    public getDisplayAddress(): string {
        return this.getSingleLineAddress();
    }

    public isSameCountry(other: Address): boolean {
        return this.props.country === other.country;
    }

    public isSameState(other: Address): boolean {
        return this.isSameCountry(other) && this.props.state === other.state;
    }

    public isSameCity(other: Address): boolean {
        return this.isSameState(other) && this.props.city.toLowerCase() === other.city.toLowerCase();
    }

    public isInternational(): boolean {
        // Assuming US as default domestic country - this could be configurable
        return this.props.country !== 'US' && this.props.country !== 'USA';
    }

    public getRegion(): string {
        // This is a simplified example - in reality, you'd want a more comprehensive mapping
        const regionMap: { [key: string]: string } = {
            'US': 'North America',
            'USA': 'North America',
            'CA': 'North America',
            'MX': 'North America',
            'GB': 'Europe',
            'DE': 'Europe',
            'FR': 'Europe',
            'IT': 'Europe',
            'ES': 'Europe',
            'JP': 'Asia',
            'CN': 'Asia',
            'IN': 'Asia',
            'KR': 'Asia',
            'AU': 'Oceania',
            'NZ': 'Oceania',
            'BR': 'South America',
            'AR': 'South America',
            'CL': 'South America'
        };

        return regionMap[this.props.country] || 'Other';
    }

    public toGeocodingString(): string {
        return `${this.props.street}, ${this.props.city}, ${this.props.state} ${this.props.postalCode}, ${this.props.country}`;
    }

    public toShippingLabel(): string[] {
        const lines = [this.props.street];
        if (this.props.addressLine2) {
            lines.push(this.props.addressLine2);
        }
        lines.push(`${this.props.city}, ${this.props.state} ${this.props.postalCode}`);
        lines.push(this.props.country);
        return lines;
    }

    private static validate(
        street: string,
        city: string,
        state: string,
        country: string,
        postalCode: string
    ): string[] {
        const errors: string[] = [];

        if (!street || street.trim().length === 0) {
            errors.push('Street address is required');
        }

        if (!city || city.trim().length === 0) {
            errors.push('City is required');
        }

        if (!state || state.trim().length === 0) {
            errors.push('State/Province is required');
        }

        if (!country || country.trim().length === 0) {
            errors.push('Country is required');
        }

        if (!postalCode || postalCode.trim().length === 0) {
            errors.push('Postal code is required');
        }

        // Basic validation for common country codes
        const countryCode = country.trim().toUpperCase();
        if (countryCode.length !== 2 && countryCode.length !== 3) {
            // Allow both 2-letter (ISO 3166-1 alpha-2) and 3-letter (ISO 3166-1 alpha-3) codes
            if (!['USA', 'UNITED STATES', 'UNITED KINGDOM'].includes(countryCode)) {
                errors.push('Country must be a valid 2 or 3 letter country code');
            }
        }

        return errors;
    }

    public toString(): string {
        return this.getSingleLineAddress();
    }
}