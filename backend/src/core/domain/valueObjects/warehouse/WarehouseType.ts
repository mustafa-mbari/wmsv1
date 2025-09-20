import { ValueObject } from '../../base/ValueObject';

export interface WarehouseTypeProps {
    value: string;
}

export class WarehouseType extends ValueObject<WarehouseTypeProps> {
    private static readonly VALID_TYPES = [
        'distribution',
        'fulfillment',
        'storage',
        'cross_dock',
        'cold_storage',
        'bonded',
        'retail',
        'manufacturing',
        'transit',
        'quarantine',
        'returns',
        'consolidated'
    ] as const;

    public static readonly DISTRIBUTION = 'distribution';
    public static readonly FULFILLMENT = 'fulfillment';
    public static readonly STORAGE = 'storage';
    public static readonly CROSS_DOCK = 'cross_dock';
    public static readonly COLD_STORAGE = 'cold_storage';
    public static readonly BONDED = 'bonded';
    public static readonly RETAIL = 'retail';
    public static readonly MANUFACTURING = 'manufacturing';
    public static readonly TRANSIT = 'transit';
    public static readonly QUARANTINE = 'quarantine';
    public static readonly RETURNS = 'returns';
    public static readonly CONSOLIDATED = 'consolidated';

    private constructor(props: WarehouseTypeProps) {
        super(props);
    }

    public static create(type: string): WarehouseType {
        if (!type) {
            throw new Error('Warehouse type cannot be empty');
        }

        const normalizedType = type.toLowerCase().trim();

        if (!this.VALID_TYPES.includes(normalizedType as any)) {
            throw new Error(`Invalid warehouse type: ${type}. Valid types are: ${this.VALID_TYPES.join(', ')}`);
        }

        return new WarehouseType({ value: normalizedType });
    }

    public static distribution(): WarehouseType {
        return new WarehouseType({ value: this.DISTRIBUTION });
    }

    public static fulfillment(): WarehouseType {
        return new WarehouseType({ value: this.FULFILLMENT });
    }

    public static storage(): WarehouseType {
        return new WarehouseType({ value: this.STORAGE });
    }

    public static crossDock(): WarehouseType {
        return new WarehouseType({ value: this.CROSS_DOCK });
    }

    public static coldStorage(): WarehouseType {
        return new WarehouseType({ value: this.COLD_STORAGE });
    }

    public static bonded(): WarehouseType {
        return new WarehouseType({ value: this.BONDED });
    }

    public static retail(): WarehouseType {
        return new WarehouseType({ value: this.RETAIL });
    }

    public static manufacturing(): WarehouseType {
        return new WarehouseType({ value: this.MANUFACTURING });
    }

    public static transit(): WarehouseType {
        return new WarehouseType({ value: this.TRANSIT });
    }

    public static quarantine(): WarehouseType {
        return new WarehouseType({ value: this.QUARANTINE });
    }

    public static returns(): WarehouseType {
        return new WarehouseType({ value: this.RETURNS });
    }

    public static consolidated(): WarehouseType {
        return new WarehouseType({ value: this.CONSOLIDATED });
    }

    get value(): string {
        return this.props.value;
    }

    public getDisplayValue(): string {
        return this.props.value
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    public getIcon(): string {
        switch (this.props.value) {
            case WarehouseType.DISTRIBUTION:
                return '🚚';
            case WarehouseType.FULFILLMENT:
                return '📦';
            case WarehouseType.STORAGE:
                return '🏪';
            case WarehouseType.CROSS_DOCK:
                return '⚡';
            case WarehouseType.COLD_STORAGE:
                return '❄️';
            case WarehouseType.BONDED:
                return '🔒';
            case WarehouseType.RETAIL:
                return '🛍️';
            case WarehouseType.MANUFACTURING:
                return '🏭';
            case WarehouseType.TRANSIT:
                return '🚛';
            case WarehouseType.QUARANTINE:
                return '⚠️';
            case WarehouseType.RETURNS:
                return '↩️';
            case WarehouseType.CONSOLIDATED:
                return '📊';
            default:
                return '📋';
        }
    }

    public getColor(): string {
        switch (this.props.value) {
            case WarehouseType.DISTRIBUTION:
                return 'blue';
            case WarehouseType.FULFILLMENT:
                return 'green';
            case WarehouseType.STORAGE:
                return 'gray';
            case WarehouseType.CROSS_DOCK:
                return 'yellow';
            case WarehouseType.COLD_STORAGE:
                return 'cyan';
            case WarehouseType.BONDED:
                return 'purple';
            case WarehouseType.RETAIL:
                return 'pink';
            case WarehouseType.MANUFACTURING:
                return 'orange';
            case WarehouseType.TRANSIT:
                return 'indigo';
            case WarehouseType.QUARANTINE:
                return 'red';
            case WarehouseType.RETURNS:
                return 'amber';
            case WarehouseType.CONSOLIDATED:
                return 'teal';
            default:
                return 'gray';
        }
    }

    // Type checks
    public isDistribution(): boolean {
        return this.props.value === WarehouseType.DISTRIBUTION;
    }

    public isFulfillment(): boolean {
        return this.props.value === WarehouseType.FULFILLMENT;
    }

    public isStorage(): boolean {
        return this.props.value === WarehouseType.STORAGE;
    }

    public isCrossDock(): boolean {
        return this.props.value === WarehouseType.CROSS_DOCK;
    }

    public isColdStorage(): boolean {
        return this.props.value === WarehouseType.COLD_STORAGE;
    }

    public isBonded(): boolean {
        return this.props.value === WarehouseType.BONDED;
    }

    public isRetail(): boolean {
        return this.props.value === WarehouseType.RETAIL;
    }

    public isManufacturing(): boolean {
        return this.props.value === WarehouseType.MANUFACTURING;
    }

    public isTransit(): boolean {
        return this.props.value === WarehouseType.TRANSIT;
    }

    public isQuarantine(): boolean {
        return this.props.value === WarehouseType.QUARANTINE;
    }

    public isReturns(): boolean {
        return this.props.value === WarehouseType.RETURNS;
    }

    public isConsolidated(): boolean {
        return this.props.value === WarehouseType.CONSOLIDATED;
    }

    // Business logic
    public requiresTemperatureControl(): boolean {
        return [
            WarehouseType.COLD_STORAGE,
            WarehouseType.MANUFACTURING
        ].includes(this.props.value as any);
    }

    public supportsLongTermStorage(): boolean {
        return [
            WarehouseType.STORAGE,
            WarehouseType.COLD_STORAGE,
            WarehouseType.BONDED,
            WarehouseType.CONSOLIDATED
        ].includes(this.props.value as any);
    }

    public supportsFastTurnover(): boolean {
        return [
            WarehouseType.DISTRIBUTION,
            WarehouseType.FULFILLMENT,
            WarehouseType.CROSS_DOCK,
            WarehouseType.TRANSIT
        ].includes(this.props.value as any);
    }

    public requiresSpecialLicensing(): boolean {
        return [
            WarehouseType.BONDED,
            WarehouseType.QUARANTINE,
            WarehouseType.MANUFACTURING
        ].includes(this.props.value as any);
    }

    public canHandleReturns(): boolean {
        return [
            WarehouseType.DISTRIBUTION,
            WarehouseType.FULFILLMENT,
            WarehouseType.RETURNS,
            WarehouseType.CONSOLIDATED
        ].includes(this.props.value as any);
    }

    public isCustomerFacing(): boolean {
        return [
            WarehouseType.RETAIL,
            WarehouseType.FULFILLMENT
        ].includes(this.props.value as any);
    }

    public getTypicalOperatingHours(): string {
        switch (this.props.value) {
            case WarehouseType.RETAIL:
                return '8:00-22:00';
            case WarehouseType.FULFILLMENT:
            case WarehouseType.DISTRIBUTION:
                return '6:00-22:00';
            case WarehouseType.CROSS_DOCK:
            case WarehouseType.TRANSIT:
                return '24/7';
            case WarehouseType.STORAGE:
            case WarehouseType.COLD_STORAGE:
            case WarehouseType.BONDED:
                return '8:00-18:00';
            case WarehouseType.MANUFACTURING:
                return '6:00-18:00';
            case WarehouseType.QUARANTINE:
            case WarehouseType.RETURNS:
                return '9:00-17:00';
            default:
                return '8:00-18:00';
        }
    }

    public getDescription(): string {
        const descriptions: { [key: string]: string } = {
            [WarehouseType.DISTRIBUTION]: 'Central hub for distributing goods to multiple locations',
            [WarehouseType.FULFILLMENT]: 'Facility focused on order fulfillment and shipping to end customers',
            [WarehouseType.STORAGE]: 'Long-term storage facility for inventory management',
            [WarehouseType.CROSS_DOCK]: 'Fast transfer facility with minimal storage time',
            [WarehouseType.COLD_STORAGE]: 'Temperature-controlled facility for perishable goods',
            [WarehouseType.BONDED]: 'Secure facility for goods under customs control',
            [WarehouseType.RETAIL]: 'Customer-facing retail storage and pickup location',
            [WarehouseType.MANUFACTURING]: 'Production facility with integrated storage',
            [WarehouseType.TRANSIT]: 'Temporary facility for goods in transit',
            [WarehouseType.QUARANTINE]: 'Isolation facility for quality control and inspection',
            [WarehouseType.RETURNS]: 'Dedicated facility for processing returned goods',
            [WarehouseType.CONSOLIDATED]: 'Multi-purpose facility handling various operations'
        };

        return descriptions[this.props.value] || 'Unknown warehouse type';
    }

    public getPriority(): number {
        const priorities: { [key: string]: number } = {
            [WarehouseType.DISTRIBUTION]: 1,
            [WarehouseType.FULFILLMENT]: 2,
            [WarehouseType.CROSS_DOCK]: 3,
            [WarehouseType.MANUFACTURING]: 4,
            [WarehouseType.RETAIL]: 5,
            [WarehouseType.STORAGE]: 6,
            [WarehouseType.COLD_STORAGE]: 7,
            [WarehouseType.CONSOLIDATED]: 8,
            [WarehouseType.TRANSIT]: 9,
            [WarehouseType.BONDED]: 10,
            [WarehouseType.RETURNS]: 11,
            [WarehouseType.QUARANTINE]: 12
        };

        return priorities[this.props.value] || 99;
    }

    public isValid(): boolean {
        return WarehouseType.VALID_TYPES.includes(this.props.value as any);
    }

    public static getAllValidTypes(): string[] {
        return [...this.VALID_TYPES];
    }

    public toString(): string {
        return this.props.value;
    }
}