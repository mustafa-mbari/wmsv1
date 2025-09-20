import { ValueObject } from '../../base/ValueObject';

export interface QualityStatusProps {
    value: string;
}

export class QualityStatus extends ValueObject<QualityStatusProps> {
    private static readonly VALID_STATUSES = [
        'good',
        'acceptable',
        'damaged',
        'defective',
        'expired',
        'quarantined',
        'rejected',
        'pending_inspection',
        'approved',
        'hold'
    ] as const;

    public static readonly GOOD = 'good';
    public static readonly ACCEPTABLE = 'acceptable';
    public static readonly DAMAGED = 'damaged';
    public static readonly DEFECTIVE = 'defective';
    public static readonly EXPIRED = 'expired';
    public static readonly QUARANTINED = 'quarantined';
    public static readonly REJECTED = 'rejected';
    public static readonly PENDING_INSPECTION = 'pending_inspection';
    public static readonly APPROVED = 'approved';
    public static readonly HOLD = 'hold';

    private constructor(props: QualityStatusProps) {
        super(props);
    }

    public static create(status: string): QualityStatus {
        if (!status) {
            throw new Error('Quality status cannot be empty');
        }

        const normalizedStatus = status.toLowerCase().trim();

        if (!this.VALID_STATUSES.includes(normalizedStatus as any)) {
            throw new Error(`Invalid quality status: ${status}. Valid statuses are: ${this.VALID_STATUSES.join(', ')}`);
        }

        return new QualityStatus({ value: normalizedStatus });
    }

    public static good(): QualityStatus {
        return new QualityStatus({ value: this.GOOD });
    }

    public static acceptable(): QualityStatus {
        return new QualityStatus({ value: this.ACCEPTABLE });
    }

    public static damaged(): QualityStatus {
        return new QualityStatus({ value: this.DAMAGED });
    }

    public static defective(): QualityStatus {
        return new QualityStatus({ value: this.DEFECTIVE });
    }

    public static expired(): QualityStatus {
        return new QualityStatus({ value: this.EXPIRED });
    }

    public static quarantined(): QualityStatus {
        return new QualityStatus({ value: this.QUARANTINED });
    }

    public static rejected(): QualityStatus {
        return new QualityStatus({ value: this.REJECTED });
    }

    public static pendingInspection(): QualityStatus {
        return new QualityStatus({ value: this.PENDING_INSPECTION });
    }

    public static approved(): QualityStatus {
        return new QualityStatus({ value: this.APPROVED });
    }

    public static hold(): QualityStatus {
        return new QualityStatus({ value: this.HOLD });
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
            case QualityStatus.GOOD:
            case QualityStatus.APPROVED:
                return 'green';
            case QualityStatus.ACCEPTABLE:
                return 'blue';
            case QualityStatus.DAMAGED:
            case QualityStatus.DEFECTIVE:
            case QualityStatus.REJECTED:
                return 'red';
            case QualityStatus.EXPIRED:
                return 'orange';
            case QualityStatus.QUARANTINED:
            case QualityStatus.HOLD:
                return 'yellow';
            case QualityStatus.PENDING_INSPECTION:
                return 'purple';
            default:
                return 'gray';
        }
    }

    public getIcon(): string {
        switch (this.props.value) {
            case QualityStatus.GOOD:
            case QualityStatus.APPROVED:
                return '✅';
            case QualityStatus.ACCEPTABLE:
                return '👍';
            case QualityStatus.DAMAGED:
                return '💥';
            case QualityStatus.DEFECTIVE:
                return '❌';
            case QualityStatus.EXPIRED:
                return '⌛';
            case QualityStatus.QUARANTINED:
                return '🔒';
            case QualityStatus.REJECTED:
                return '🚫';
            case QualityStatus.PENDING_INSPECTION:
                return '🔍';
            case QualityStatus.HOLD:
                return '⏸️';
            default:
                return '❓';
        }
    }

    public isGood(): boolean {
        return this.props.value === QualityStatus.GOOD;
    }

    public isAcceptable(): boolean {
        return this.props.value === QualityStatus.ACCEPTABLE;
    }

    public isDamaged(): boolean {
        return this.props.value === QualityStatus.DAMAGED;
    }

    public isDefective(): boolean {
        return this.props.value === QualityStatus.DEFECTIVE;
    }

    public isExpired(): boolean {
        return this.props.value === QualityStatus.EXPIRED;
    }

    public isQuarantined(): boolean {
        return this.props.value === QualityStatus.QUARANTINED;
    }

    public isRejected(): boolean {
        return this.props.value === QualityStatus.REJECTED;
    }

    public isPendingInspection(): boolean {
        return this.props.value === QualityStatus.PENDING_INSPECTION;
    }

    public isApproved(): boolean {
        return this.props.value === QualityStatus.APPROVED;
    }

    public isOnHold(): boolean {
        return this.props.value === QualityStatus.HOLD;
    }

    public isUsable(): boolean {
        return [
            QualityStatus.GOOD,
            QualityStatus.ACCEPTABLE,
            QualityStatus.APPROVED
        ].includes(this.props.value as any);
    }

    public requiresAction(): boolean {
        return [
            QualityStatus.DAMAGED,
            QualityStatus.DEFECTIVE,
            QualityStatus.EXPIRED,
            QualityStatus.QUARANTINED,
            QualityStatus.PENDING_INSPECTION,
            QualityStatus.HOLD
        ].includes(this.props.value as any);
    }

    public canBeImproved(): boolean {
        return [
            QualityStatus.DAMAGED,
            QualityStatus.DEFECTIVE,
            QualityStatus.QUARANTINED,
            QualityStatus.HOLD
        ].includes(this.props.value as any);
    }

    public isFinal(): boolean {
        return [
            QualityStatus.REJECTED,
            QualityStatus.EXPIRED
        ].includes(this.props.value as any);
    }

    public getPriority(): number {
        const priorities: { [key: string]: number } = {
            [QualityStatus.GOOD]: 1,
            [QualityStatus.APPROVED]: 2,
            [QualityStatus.ACCEPTABLE]: 3,
            [QualityStatus.PENDING_INSPECTION]: 4,
            [QualityStatus.HOLD]: 5,
            [QualityStatus.QUARANTINED]: 6,
            [QualityStatus.DAMAGED]: 7,
            [QualityStatus.DEFECTIVE]: 8,
            [QualityStatus.EXPIRED]: 9,
            [QualityStatus.REJECTED]: 10
        };

        return priorities[this.props.value] || 99;
    }

    public getDescription(): string {
        const descriptions: { [key: string]: string } = {
            [QualityStatus.GOOD]: 'Item is in good condition and ready for use',
            [QualityStatus.ACCEPTABLE]: 'Item is acceptable for use with minor issues',
            [QualityStatus.DAMAGED]: 'Item has physical damage but may be repairable',
            [QualityStatus.DEFECTIVE]: 'Item has functional defects and needs repair',
            [QualityStatus.EXPIRED]: 'Item has passed its expiration date',
            [QualityStatus.QUARANTINED]: 'Item is isolated pending quality assessment',
            [QualityStatus.REJECTED]: 'Item has been rejected and cannot be used',
            [QualityStatus.PENDING_INSPECTION]: 'Item is awaiting quality inspection',
            [QualityStatus.APPROVED]: 'Item has been approved for use after inspection',
            [QualityStatus.HOLD]: 'Item is on hold pending further review'
        };

        return descriptions[this.props.value] || 'Unknown quality status';
    }

    public canTransitionTo(newStatus: QualityStatus): boolean {
        const current = this.props.value;
        const target = newStatus.value;

        const allowedTransitions: { [key: string]: string[] } = {
            [QualityStatus.GOOD]: [
                QualityStatus.ACCEPTABLE,
                QualityStatus.DAMAGED,
                QualityStatus.DEFECTIVE,
                QualityStatus.EXPIRED,
                QualityStatus.QUARANTINED,
                QualityStatus.HOLD
            ],
            [QualityStatus.ACCEPTABLE]: [
                QualityStatus.GOOD,
                QualityStatus.DAMAGED,
                QualityStatus.DEFECTIVE,
                QualityStatus.EXPIRED,
                QualityStatus.QUARANTINED,
                QualityStatus.REJECTED,
                QualityStatus.HOLD
            ],
            [QualityStatus.DAMAGED]: [
                QualityStatus.GOOD,
                QualityStatus.ACCEPTABLE,
                QualityStatus.DEFECTIVE,
                QualityStatus.QUARANTINED,
                QualityStatus.REJECTED,
                QualityStatus.HOLD
            ],
            [QualityStatus.DEFECTIVE]: [
                QualityStatus.GOOD,
                QualityStatus.ACCEPTABLE,
                QualityStatus.DAMAGED,
                QualityStatus.QUARANTINED,
                QualityStatus.REJECTED,
                QualityStatus.HOLD
            ],
            [QualityStatus.EXPIRED]: [
                QualityStatus.QUARANTINED,
                QualityStatus.REJECTED
            ],
            [QualityStatus.QUARANTINED]: [
                QualityStatus.GOOD,
                QualityStatus.ACCEPTABLE,
                QualityStatus.DAMAGED,
                QualityStatus.DEFECTIVE,
                QualityStatus.EXPIRED,
                QualityStatus.REJECTED,
                QualityStatus.APPROVED,
                QualityStatus.HOLD
            ],
            [QualityStatus.REJECTED]: [], // Final state
            [QualityStatus.PENDING_INSPECTION]: [
                QualityStatus.GOOD,
                QualityStatus.ACCEPTABLE,
                QualityStatus.DAMAGED,
                QualityStatus.DEFECTIVE,
                QualityStatus.EXPIRED,
                QualityStatus.QUARANTINED,
                QualityStatus.REJECTED,
                QualityStatus.APPROVED,
                QualityStatus.HOLD
            ],
            [QualityStatus.APPROVED]: [
                QualityStatus.GOOD,
                QualityStatus.ACCEPTABLE,
                QualityStatus.DAMAGED,
                QualityStatus.DEFECTIVE,
                QualityStatus.EXPIRED,
                QualityStatus.QUARANTINED,
                QualityStatus.HOLD
            ],
            [QualityStatus.HOLD]: [
                QualityStatus.GOOD,
                QualityStatus.ACCEPTABLE,
                QualityStatus.DAMAGED,
                QualityStatus.DEFECTIVE,
                QualityStatus.EXPIRED,
                QualityStatus.QUARANTINED,
                QualityStatus.REJECTED,
                QualityStatus.APPROVED,
                QualityStatus.PENDING_INSPECTION
            ]
        };

        return allowedTransitions[current]?.includes(target) || false;
    }

    public getNextPossibleStatuses(): QualityStatus[] {
        const current = this.props.value;

        const transitions: { [key: string]: string[] } = {
            [QualityStatus.GOOD]: [
                QualityStatus.ACCEPTABLE,
                QualityStatus.DAMAGED,
                QualityStatus.QUARANTINED,
                QualityStatus.HOLD
            ],
            [QualityStatus.ACCEPTABLE]: [
                QualityStatus.GOOD,
                QualityStatus.DAMAGED,
                QualityStatus.QUARANTINED,
                QualityStatus.REJECTED,
                QualityStatus.HOLD
            ],
            [QualityStatus.DAMAGED]: [
                QualityStatus.GOOD,
                QualityStatus.ACCEPTABLE,
                QualityStatus.QUARANTINED,
                QualityStatus.REJECTED
            ],
            [QualityStatus.DEFECTIVE]: [
                QualityStatus.GOOD,
                QualityStatus.ACCEPTABLE,
                QualityStatus.QUARANTINED,
                QualityStatus.REJECTED
            ],
            [QualityStatus.EXPIRED]: [
                QualityStatus.QUARANTINED,
                QualityStatus.REJECTED
            ],
            [QualityStatus.QUARANTINED]: [
                QualityStatus.GOOD,
                QualityStatus.ACCEPTABLE,
                QualityStatus.DAMAGED,
                QualityStatus.DEFECTIVE,
                QualityStatus.REJECTED,
                QualityStatus.APPROVED
            ],
            [QualityStatus.REJECTED]: [],
            [QualityStatus.PENDING_INSPECTION]: [
                QualityStatus.GOOD,
                QualityStatus.ACCEPTABLE,
                QualityStatus.DAMAGED,
                QualityStatus.DEFECTIVE,
                QualityStatus.QUARANTINED,
                QualityStatus.REJECTED,
                QualityStatus.APPROVED
            ],
            [QualityStatus.APPROVED]: [
                QualityStatus.GOOD,
                QualityStatus.ACCEPTABLE,
                QualityStatus.DAMAGED,
                QualityStatus.QUARANTINED
            ],
            [QualityStatus.HOLD]: [
                QualityStatus.GOOD,
                QualityStatus.ACCEPTABLE,
                QualityStatus.DAMAGED,
                QualityStatus.QUARANTINED,
                QualityStatus.REJECTED,
                QualityStatus.APPROVED,
                QualityStatus.PENDING_INSPECTION
            ]
        };

        return (transitions[current] || []).map(status => QualityStatus.create(status));
    }

    public isValid(): boolean {
        return QualityStatus.VALID_STATUSES.includes(this.props.value as any);
    }

    public static getAllValidStatuses(): string[] {
        return [...this.VALID_STATUSES];
    }

    public toString(): string {
        return this.props.value;
    }
}