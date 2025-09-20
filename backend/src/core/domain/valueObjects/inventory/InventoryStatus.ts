import { ValueObject } from '../../base/ValueObject';

export interface InventoryStatusProps {
    value: string;
}

export class InventoryStatus extends ValueObject<InventoryStatusProps> {
    private static readonly VALID_STATUSES = [
        'available',
        'reserved',
        'allocated',
        'quarantined',
        'damaged',
        'expired',
        'blocked',
        'in_transit',
        'pending_receipt',
        'pending_putaway'
    ] as const;

    public static readonly AVAILABLE = 'available';
    public static readonly RESERVED = 'reserved';
    public static readonly ALLOCATED = 'allocated';
    public static readonly QUARANTINED = 'quarantined';
    public static readonly DAMAGED = 'damaged';
    public static readonly EXPIRED = 'expired';
    public static readonly BLOCKED = 'blocked';
    public static readonly IN_TRANSIT = 'in_transit';
    public static readonly PENDING_RECEIPT = 'pending_receipt';
    public static readonly PENDING_PUTAWAY = 'pending_putaway';

    private constructor(props: InventoryStatusProps) {
        super(props);
    }

    public static create(status: string): InventoryStatus {
        if (!status) {
            throw new Error('Inventory status cannot be empty');
        }

        const normalizedStatus = status.toLowerCase().trim();

        if (!this.VALID_STATUSES.includes(normalizedStatus as any)) {
            throw new Error(`Invalid inventory status: ${status}. Valid statuses are: ${this.VALID_STATUSES.join(', ')}`);
        }

        return new InventoryStatus({ value: normalizedStatus });
    }

    public static available(): InventoryStatus {
        return new InventoryStatus({ value: this.AVAILABLE });
    }

    public static reserved(): InventoryStatus {
        return new InventoryStatus({ value: this.RESERVED });
    }

    public static allocated(): InventoryStatus {
        return new InventoryStatus({ value: this.ALLOCATED });
    }

    public static quarantined(): InventoryStatus {
        return new InventoryStatus({ value: this.QUARANTINED });
    }

    public static damaged(): InventoryStatus {
        return new InventoryStatus({ value: this.DAMAGED });
    }

    public static expired(): InventoryStatus {
        return new InventoryStatus({ value: this.EXPIRED });
    }

    public static blocked(): InventoryStatus {
        return new InventoryStatus({ value: this.BLOCKED });
    }

    public static inTransit(): InventoryStatus {
        return new InventoryStatus({ value: this.IN_TRANSIT });
    }

    public static pendingReceipt(): InventoryStatus {
        return new InventoryStatus({ value: this.PENDING_RECEIPT });
    }

    public static pendingPutaway(): InventoryStatus {
        return new InventoryStatus({ value: this.PENDING_PUTAWAY });
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
            case InventoryStatus.AVAILABLE:
                return 'green';
            case InventoryStatus.RESERVED:
                return 'blue';
            case InventoryStatus.ALLOCATED:
                return 'purple';
            case InventoryStatus.QUARANTINED:
                return 'orange';
            case InventoryStatus.DAMAGED:
                return 'red';
            case InventoryStatus.EXPIRED:
                return 'red';
            case InventoryStatus.BLOCKED:
                return 'gray';
            case InventoryStatus.IN_TRANSIT:
                return 'yellow';
            case InventoryStatus.PENDING_RECEIPT:
                return 'cyan';
            case InventoryStatus.PENDING_PUTAWAY:
                return 'indigo';
            default:
                return 'gray';
        }
    }

    public getIcon(): string {
        switch (this.props.value) {
            case InventoryStatus.AVAILABLE:
                return '✅';
            case InventoryStatus.RESERVED:
                return '🔒';
            case InventoryStatus.ALLOCATED:
                return '📋';
            case InventoryStatus.QUARANTINED:
                return '⚠️';
            case InventoryStatus.DAMAGED:
                return '💥';
            case InventoryStatus.EXPIRED:
                return '⌛';
            case InventoryStatus.BLOCKED:
                return '🚫';
            case InventoryStatus.IN_TRANSIT:
                return '🚚';
            case InventoryStatus.PENDING_RECEIPT:
                return '📦';
            case InventoryStatus.PENDING_PUTAWAY:
                return '📍';
            default:
                return '❓';
        }
    }

    public isAvailable(): boolean {
        return this.props.value === InventoryStatus.AVAILABLE;
    }

    public isReserved(): boolean {
        return this.props.value === InventoryStatus.RESERVED;
    }

    public isAllocated(): boolean {
        return this.props.value === InventoryStatus.ALLOCATED;
    }

    public isQuarantined(): boolean {
        return this.props.value === InventoryStatus.QUARANTINED;
    }

    public isDamaged(): boolean {
        return this.props.value === InventoryStatus.DAMAGED;
    }

    public isExpired(): boolean {
        return this.props.value === InventoryStatus.EXPIRED;
    }

    public isBlocked(): boolean {
        return this.props.value === InventoryStatus.BLOCKED;
    }

    public isInTransit(): boolean {
        return this.props.value === InventoryStatus.IN_TRANSIT;
    }

    public isPendingReceipt(): boolean {
        return this.props.value === InventoryStatus.PENDING_RECEIPT;
    }

    public isPendingPutaway(): boolean {
        return this.props.value === InventoryStatus.PENDING_PUTAWAY;
    }

    public canBeMoved(): boolean {
        return [
            InventoryStatus.AVAILABLE,
            InventoryStatus.RESERVED,
            InventoryStatus.ALLOCATED
        ].includes(this.props.value as any);
    }

    public canBeReserved(): boolean {
        return this.props.value === InventoryStatus.AVAILABLE;
    }

    public canBeAllocated(): boolean {
        return [
            InventoryStatus.AVAILABLE,
            InventoryStatus.RESERVED
        ].includes(this.props.value as any);
    }

    public requiresApproval(): boolean {
        return [
            InventoryStatus.QUARANTINED,
            InventoryStatus.DAMAGED,
            InventoryStatus.EXPIRED
        ].includes(this.props.value as any);
    }

    public canTransitionTo(newStatus: InventoryStatus): boolean {
        const current = this.props.value;
        const target = newStatus.value;

        const allowedTransitions: { [key: string]: string[] } = {
            [InventoryStatus.AVAILABLE]: [
                InventoryStatus.RESERVED,
                InventoryStatus.ALLOCATED,
                InventoryStatus.QUARANTINED,
                InventoryStatus.DAMAGED,
                InventoryStatus.EXPIRED,
                InventoryStatus.BLOCKED,
                InventoryStatus.IN_TRANSIT
            ],
            [InventoryStatus.RESERVED]: [
                InventoryStatus.AVAILABLE,
                InventoryStatus.ALLOCATED,
                InventoryStatus.QUARANTINED,
                InventoryStatus.DAMAGED,
                InventoryStatus.EXPIRED,
                InventoryStatus.BLOCKED,
                InventoryStatus.IN_TRANSIT
            ],
            [InventoryStatus.ALLOCATED]: [
                InventoryStatus.AVAILABLE,
                InventoryStatus.RESERVED,
                InventoryStatus.QUARANTINED,
                InventoryStatus.DAMAGED,
                InventoryStatus.EXPIRED,
                InventoryStatus.BLOCKED,
                InventoryStatus.IN_TRANSIT
            ],
            [InventoryStatus.QUARANTINED]: [
                InventoryStatus.AVAILABLE,
                InventoryStatus.DAMAGED,
                InventoryStatus.EXPIRED,
                InventoryStatus.BLOCKED
            ],
            [InventoryStatus.DAMAGED]: [
                InventoryStatus.QUARANTINED,
                InventoryStatus.BLOCKED
            ],
            [InventoryStatus.EXPIRED]: [
                InventoryStatus.QUARANTINED,
                InventoryStatus.BLOCKED
            ],
            [InventoryStatus.BLOCKED]: [
                InventoryStatus.AVAILABLE,
                InventoryStatus.QUARANTINED,
                InventoryStatus.DAMAGED,
                InventoryStatus.EXPIRED
            ],
            [InventoryStatus.IN_TRANSIT]: [
                InventoryStatus.AVAILABLE,
                InventoryStatus.PENDING_RECEIPT,
                InventoryStatus.DAMAGED,
                InventoryStatus.QUARANTINED
            ],
            [InventoryStatus.PENDING_RECEIPT]: [
                InventoryStatus.AVAILABLE,
                InventoryStatus.PENDING_PUTAWAY,
                InventoryStatus.QUARANTINED,
                InventoryStatus.DAMAGED
            ],
            [InventoryStatus.PENDING_PUTAWAY]: [
                InventoryStatus.AVAILABLE,
                InventoryStatus.QUARANTINED,
                InventoryStatus.DAMAGED
            ]
        };

        return allowedTransitions[current]?.includes(target) || false;
    }

    public getNextPossibleStatuses(): InventoryStatus[] {
        const current = this.props.value;

        const transitions: { [key: string]: string[] } = {
            [InventoryStatus.AVAILABLE]: [
                InventoryStatus.RESERVED,
                InventoryStatus.ALLOCATED,
                InventoryStatus.QUARANTINED,
                InventoryStatus.BLOCKED,
                InventoryStatus.IN_TRANSIT
            ],
            [InventoryStatus.RESERVED]: [
                InventoryStatus.AVAILABLE,
                InventoryStatus.ALLOCATED,
                InventoryStatus.QUARANTINED,
                InventoryStatus.BLOCKED,
                InventoryStatus.IN_TRANSIT
            ],
            [InventoryStatus.ALLOCATED]: [
                InventoryStatus.AVAILABLE,
                InventoryStatus.RESERVED,
                InventoryStatus.QUARANTINED,
                InventoryStatus.BLOCKED,
                InventoryStatus.IN_TRANSIT
            ],
            [InventoryStatus.QUARANTINED]: [
                InventoryStatus.AVAILABLE,
                InventoryStatus.DAMAGED,
                InventoryStatus.EXPIRED,
                InventoryStatus.BLOCKED
            ],
            [InventoryStatus.DAMAGED]: [
                InventoryStatus.QUARANTINED,
                InventoryStatus.BLOCKED
            ],
            [InventoryStatus.EXPIRED]: [
                InventoryStatus.QUARANTINED,
                InventoryStatus.BLOCKED
            ],
            [InventoryStatus.BLOCKED]: [
                InventoryStatus.AVAILABLE,
                InventoryStatus.QUARANTINED
            ],
            [InventoryStatus.IN_TRANSIT]: [
                InventoryStatus.AVAILABLE,
                InventoryStatus.PENDING_RECEIPT,
                InventoryStatus.DAMAGED,
                InventoryStatus.QUARANTINED
            ],
            [InventoryStatus.PENDING_RECEIPT]: [
                InventoryStatus.AVAILABLE,
                InventoryStatus.PENDING_PUTAWAY,
                InventoryStatus.QUARANTINED,
                InventoryStatus.DAMAGED
            ],
            [InventoryStatus.PENDING_PUTAWAY]: [
                InventoryStatus.AVAILABLE,
                InventoryStatus.QUARANTINED,
                InventoryStatus.DAMAGED
            ]
        };

        return (transitions[current] || []).map(status => InventoryStatus.create(status));
    }

    public getPriority(): number {
        const priorities: { [key: string]: number } = {
            [InventoryStatus.AVAILABLE]: 1,
            [InventoryStatus.RESERVED]: 2,
            [InventoryStatus.ALLOCATED]: 3,
            [InventoryStatus.PENDING_PUTAWAY]: 4,
            [InventoryStatus.PENDING_RECEIPT]: 5,
            [InventoryStatus.IN_TRANSIT]: 6,
            [InventoryStatus.QUARANTINED]: 7,
            [InventoryStatus.BLOCKED]: 8,
            [InventoryStatus.DAMAGED]: 9,
            [InventoryStatus.EXPIRED]: 10
        };

        return priorities[this.props.value] || 99;
    }

    public getDescription(): string {
        const descriptions: { [key: string]: string } = {
            [InventoryStatus.AVAILABLE]: 'Inventory is available for use',
            [InventoryStatus.RESERVED]: 'Inventory is reserved for specific purpose',
            [InventoryStatus.ALLOCATED]: 'Inventory is allocated to an order or shipment',
            [InventoryStatus.QUARANTINED]: 'Inventory is under quality review',
            [InventoryStatus.DAMAGED]: 'Inventory is damaged and cannot be used',
            [InventoryStatus.EXPIRED]: 'Inventory has exceeded its expiry date',
            [InventoryStatus.BLOCKED]: 'Inventory is blocked from use',
            [InventoryStatus.IN_TRANSIT]: 'Inventory is being moved between locations',
            [InventoryStatus.PENDING_RECEIPT]: 'Inventory is waiting to be received',
            [InventoryStatus.PENDING_PUTAWAY]: 'Inventory is waiting to be put away'
        };

        return descriptions[this.props.value] || 'Unknown status';
    }

    public isValid(): boolean {
        return InventoryStatus.VALID_STATUSES.includes(this.props.value as any);
    }

    public static getAllValidStatuses(): string[] {
        return [...this.VALID_STATUSES];
    }

    public toString(): string {
        return this.props.value;
    }
}