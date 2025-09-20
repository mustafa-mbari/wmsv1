import { ValueObject } from '../../base/ValueObject';

export interface WarehouseStatusProps {
    value: string;
}

export class WarehouseStatus extends ValueObject<WarehouseStatusProps> {
    private static readonly VALID_STATUSES = [
        'operational',
        'maintenance',
        'construction',
        'inactive',
        'decommissioned',
        'emergency',
        'limited_operations',
        'seasonal_closed',
        'under_renovation'
    ] as const;

    public static readonly OPERATIONAL = 'operational';
    public static readonly MAINTENANCE = 'maintenance';
    public static readonly CONSTRUCTION = 'construction';
    public static readonly INACTIVE = 'inactive';
    public static readonly DECOMMISSIONED = 'decommissioned';
    public static readonly EMERGENCY = 'emergency';
    public static readonly LIMITED_OPERATIONS = 'limited_operations';
    public static readonly SEASONAL_CLOSED = 'seasonal_closed';
    public static readonly UNDER_RENOVATION = 'under_renovation';

    private constructor(props: WarehouseStatusProps) {
        super(props);
    }

    public static create(status: string): WarehouseStatus {
        if (!status) {
            throw new Error('Warehouse status cannot be empty');
        }

        const normalizedStatus = status.toLowerCase().trim();

        if (!this.VALID_STATUSES.includes(normalizedStatus as any)) {
            throw new Error(`Invalid warehouse status: ${status}. Valid statuses are: ${this.VALID_STATUSES.join(', ')}`);
        }

        return new WarehouseStatus({ value: normalizedStatus });
    }

    public static operational(): WarehouseStatus {
        return new WarehouseStatus({ value: this.OPERATIONAL });
    }

    public static maintenance(): WarehouseStatus {
        return new WarehouseStatus({ value: this.MAINTENANCE });
    }

    public static construction(): WarehouseStatus {
        return new WarehouseStatus({ value: this.CONSTRUCTION });
    }

    public static inactive(): WarehouseStatus {
        return new WarehouseStatus({ value: this.INACTIVE });
    }

    public static decommissioned(): WarehouseStatus {
        return new WarehouseStatus({ value: this.DECOMMISSIONED });
    }

    public static emergency(): WarehouseStatus {
        return new WarehouseStatus({ value: this.EMERGENCY });
    }

    public static limitedOperations(): WarehouseStatus {
        return new WarehouseStatus({ value: this.LIMITED_OPERATIONS });
    }

    public static seasonalClosed(): WarehouseStatus {
        return new WarehouseStatus({ value: this.SEASONAL_CLOSED });
    }

    public static underRenovation(): WarehouseStatus {
        return new WarehouseStatus({ value: this.UNDER_RENOVATION });
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

    public getColor(): string {
        switch (this.props.value) {
            case WarehouseStatus.OPERATIONAL:
                return 'green';
            case WarehouseStatus.LIMITED_OPERATIONS:
                return 'yellow';
            case WarehouseStatus.MAINTENANCE:
                return 'orange';
            case WarehouseStatus.UNDER_RENOVATION:
                return 'blue';
            case WarehouseStatus.CONSTRUCTION:
                return 'purple';
            case WarehouseStatus.SEASONAL_CLOSED:
                return 'cyan';
            case WarehouseStatus.INACTIVE:
                return 'gray';
            case WarehouseStatus.EMERGENCY:
                return 'red';
            case WarehouseStatus.DECOMMISSIONED:
                return 'black';
            default:
                return 'gray';
        }
    }

    public getIcon(): string {
        switch (this.props.value) {
            case WarehouseStatus.OPERATIONAL:
                return '✅';
            case WarehouseStatus.LIMITED_OPERATIONS:
                return '⚡';
            case WarehouseStatus.MAINTENANCE:
                return '🔧';
            case WarehouseStatus.UNDER_RENOVATION:
                return '🏗️';
            case WarehouseStatus.CONSTRUCTION:
                return '🚧';
            case WarehouseStatus.SEASONAL_CLOSED:
                return '❄️';
            case WarehouseStatus.INACTIVE:
                return '⏸️';
            case WarehouseStatus.EMERGENCY:
                return '🚨';
            case WarehouseStatus.DECOMMISSIONED:
                return '🚫';
            default:
                return '❓';
        }
    }

    // Status checks
    public isOperational(): boolean {
        return this.props.value === WarehouseStatus.OPERATIONAL;
    }

    public isMaintenance(): boolean {
        return this.props.value === WarehouseStatus.MAINTENANCE;
    }

    public isConstruction(): boolean {
        return this.props.value === WarehouseStatus.CONSTRUCTION;
    }

    public isInactive(): boolean {
        return this.props.value === WarehouseStatus.INACTIVE;
    }

    public isDecommissioned(): boolean {
        return this.props.value === WarehouseStatus.DECOMMISSIONED;
    }

    public isEmergency(): boolean {
        return this.props.value === WarehouseStatus.EMERGENCY;
    }

    public isLimitedOperations(): boolean {
        return this.props.value === WarehouseStatus.LIMITED_OPERATIONS;
    }

    public isSeasonalClosed(): boolean {
        return this.props.value === WarehouseStatus.SEASONAL_CLOSED;
    }

    public isUnderRenovation(): boolean {
        return this.props.value === WarehouseStatus.UNDER_RENOVATION;
    }

    // Business logic
    public canReceiveInventory(): boolean {
        return [
            WarehouseStatus.OPERATIONAL,
            WarehouseStatus.LIMITED_OPERATIONS
        ].includes(this.props.value as any);
    }

    public canShipInventory(): boolean {
        return [
            WarehouseStatus.OPERATIONAL,
            WarehouseStatus.LIMITED_OPERATIONS,
            WarehouseStatus.EMERGENCY
        ].includes(this.props.value as any);
    }

    public allowsStaffAccess(): boolean {
        return [
            WarehouseStatus.OPERATIONAL,
            WarehouseStatus.LIMITED_OPERATIONS,
            WarehouseStatus.MAINTENANCE,
            WarehouseStatus.UNDER_RENOVATION,
            WarehouseStatus.EMERGENCY
        ].includes(this.props.value as any);
    }

    public requiresSpecialPermissions(): boolean {
        return [
            WarehouseStatus.MAINTENANCE,
            WarehouseStatus.CONSTRUCTION,
            WarehouseStatus.UNDER_RENOVATION,
            WarehouseStatus.EMERGENCY
        ].includes(this.props.value as any);
    }

    public isTemporary(): boolean {
        return [
            WarehouseStatus.MAINTENANCE,
            WarehouseStatus.CONSTRUCTION,
            WarehouseStatus.UNDER_RENOVATION,
            WarehouseStatus.EMERGENCY,
            WarehouseStatus.SEASONAL_CLOSED
        ].includes(this.props.value as any);
    }

    public isPermanent(): boolean {
        return [
            WarehouseStatus.OPERATIONAL,
            WarehouseStatus.INACTIVE,
            WarehouseStatus.DECOMMISSIONED
        ].includes(this.props.value as any);
    }

    public canTransitionTo(newStatus: WarehouseStatus): boolean {
        const current = this.props.value;
        const target = newStatus.value;

        const allowedTransitions: { [key: string]: string[] } = {
            [WarehouseStatus.OPERATIONAL]: [
                WarehouseStatus.LIMITED_OPERATIONS,
                WarehouseStatus.MAINTENANCE,
                WarehouseStatus.UNDER_RENOVATION,
                WarehouseStatus.EMERGENCY,
                WarehouseStatus.SEASONAL_CLOSED,
                WarehouseStatus.INACTIVE
            ],
            [WarehouseStatus.LIMITED_OPERATIONS]: [
                WarehouseStatus.OPERATIONAL,
                WarehouseStatus.MAINTENANCE,
                WarehouseStatus.EMERGENCY,
                WarehouseStatus.INACTIVE
            ],
            [WarehouseStatus.MAINTENANCE]: [
                WarehouseStatus.OPERATIONAL,
                WarehouseStatus.LIMITED_OPERATIONS,
                WarehouseStatus.UNDER_RENOVATION,
                WarehouseStatus.EMERGENCY,
                WarehouseStatus.INACTIVE
            ],
            [WarehouseStatus.UNDER_RENOVATION]: [
                WarehouseStatus.OPERATIONAL,
                WarehouseStatus.LIMITED_OPERATIONS,
                WarehouseStatus.MAINTENANCE,
                WarehouseStatus.CONSTRUCTION,
                WarehouseStatus.INACTIVE
            ],
            [WarehouseStatus.CONSTRUCTION]: [
                WarehouseStatus.OPERATIONAL,
                WarehouseStatus.UNDER_RENOVATION,
                WarehouseStatus.INACTIVE
            ],
            [WarehouseStatus.SEASONAL_CLOSED]: [
                WarehouseStatus.OPERATIONAL,
                WarehouseStatus.LIMITED_OPERATIONS,
                WarehouseStatus.MAINTENANCE,
                WarehouseStatus.INACTIVE
            ],
            [WarehouseStatus.INACTIVE]: [
                WarehouseStatus.OPERATIONAL,
                WarehouseStatus.LIMITED_OPERATIONS,
                WarehouseStatus.MAINTENANCE,
                WarehouseStatus.UNDER_RENOVATION,
                WarehouseStatus.CONSTRUCTION,
                WarehouseStatus.DECOMMISSIONED
            ],
            [WarehouseStatus.EMERGENCY]: [
                WarehouseStatus.OPERATIONAL,
                WarehouseStatus.LIMITED_OPERATIONS,
                WarehouseStatus.MAINTENANCE,
                WarehouseStatus.INACTIVE
            ],
            [WarehouseStatus.DECOMMISSIONED]: [] // No transitions from decommissioned
        };

        return allowedTransitions[current]?.includes(target) || false;
    }

    public getNextPossibleStatuses(): WarehouseStatus[] {
        const current = this.props.value;

        const transitions: { [key: string]: string[] } = {
            [WarehouseStatus.OPERATIONAL]: [
                WarehouseStatus.LIMITED_OPERATIONS,
                WarehouseStatus.MAINTENANCE,
                WarehouseStatus.EMERGENCY,
                WarehouseStatus.SEASONAL_CLOSED,
                WarehouseStatus.INACTIVE
            ],
            [WarehouseStatus.LIMITED_OPERATIONS]: [
                WarehouseStatus.OPERATIONAL,
                WarehouseStatus.MAINTENANCE,
                WarehouseStatus.EMERGENCY,
                WarehouseStatus.INACTIVE
            ],
            [WarehouseStatus.MAINTENANCE]: [
                WarehouseStatus.OPERATIONAL,
                WarehouseStatus.LIMITED_OPERATIONS,
                WarehouseStatus.UNDER_RENOVATION,
                WarehouseStatus.EMERGENCY
            ],
            [WarehouseStatus.UNDER_RENOVATION]: [
                WarehouseStatus.OPERATIONAL,
                WarehouseStatus.LIMITED_OPERATIONS,
                WarehouseStatus.MAINTENANCE
            ],
            [WarehouseStatus.CONSTRUCTION]: [
                WarehouseStatus.OPERATIONAL,
                WarehouseStatus.UNDER_RENOVATION
            ],
            [WarehouseStatus.SEASONAL_CLOSED]: [
                WarehouseStatus.OPERATIONAL,
                WarehouseStatus.LIMITED_OPERATIONS
            ],
            [WarehouseStatus.INACTIVE]: [
                WarehouseStatus.OPERATIONAL,
                WarehouseStatus.LIMITED_OPERATIONS,
                WarehouseStatus.MAINTENANCE,
                WarehouseStatus.UNDER_RENOVATION,
                WarehouseStatus.DECOMMISSIONED
            ],
            [WarehouseStatus.EMERGENCY]: [
                WarehouseStatus.OPERATIONAL,
                WarehouseStatus.LIMITED_OPERATIONS,
                WarehouseStatus.MAINTENANCE
            ],
            [WarehouseStatus.DECOMMISSIONED]: []
        };

        return (transitions[current] || []).map(status => WarehouseStatus.create(status));
    }

    public getPriority(): number {
        const priorities: { [key: string]: number } = {
            [WarehouseStatus.OPERATIONAL]: 1,
            [WarehouseStatus.LIMITED_OPERATIONS]: 2,
            [WarehouseStatus.MAINTENANCE]: 3,
            [WarehouseStatus.UNDER_RENOVATION]: 4,
            [WarehouseStatus.SEASONAL_CLOSED]: 5,
            [WarehouseStatus.CONSTRUCTION]: 6,
            [WarehouseStatus.EMERGENCY]: 7,
            [WarehouseStatus.INACTIVE]: 8,
            [WarehouseStatus.DECOMMISSIONED]: 9
        };

        return priorities[this.props.value] || 99;
    }

    public getDescription(): string {
        const descriptions: { [key: string]: string } = {
            [WarehouseStatus.OPERATIONAL]: 'Fully operational and accepting all activities',
            [WarehouseStatus.LIMITED_OPERATIONS]: 'Operating with limited capacity or services',
            [WarehouseStatus.MAINTENANCE]: 'Under scheduled maintenance, limited access',
            [WarehouseStatus.UNDER_RENOVATION]: 'Being renovated or upgraded',
            [WarehouseStatus.CONSTRUCTION]: 'Under construction, not yet operational',
            [WarehouseStatus.SEASONAL_CLOSED]: 'Temporarily closed for seasonal reasons',
            [WarehouseStatus.INACTIVE]: 'Not currently in use but can be reactivated',
            [WarehouseStatus.EMERGENCY]: 'Emergency status with restricted access',
            [WarehouseStatus.DECOMMISSIONED]: 'Permanently closed and out of service'
        };

        return descriptions[this.props.value] || 'Unknown status';
    }

    public requiresAttention(): boolean {
        return [
            WarehouseStatus.EMERGENCY,
            WarehouseStatus.MAINTENANCE,
            WarehouseStatus.LIMITED_OPERATIONS
        ].includes(this.props.value as any);
    }

    public isValid(): boolean {
        return WarehouseStatus.VALID_STATUSES.includes(this.props.value as any);
    }

    public static getAllValidStatuses(): string[] {
        return [...this.VALID_STATUSES];
    }

    public toString(): string {
        return this.props.value;
    }
}