import { ValueObject } from '../../base/ValueObject';

export interface LotNumberProps {
    value: string;
}

export class LotNumber extends ValueObject<LotNumberProps> {
    private static readonly MIN_LENGTH = 1;
    private static readonly MAX_LENGTH = 50;
    private static readonly VALID_PATTERN = /^[A-Za-z0-9\-_\.]+$/;

    private constructor(props: LotNumberProps) {
        super(props);
    }

    public static create(lotNumber: string): LotNumber {
        if (!lotNumber) {
            throw new Error('Lot number cannot be empty');
        }

        const trimmedLotNumber = lotNumber.trim().toUpperCase();

        if (trimmedLotNumber.length < this.MIN_LENGTH) {
            throw new Error(`Lot number must be at least ${this.MIN_LENGTH} character long`);
        }

        if (trimmedLotNumber.length > this.MAX_LENGTH) {
            throw new Error(`Lot number cannot exceed ${this.MAX_LENGTH} characters`);
        }

        if (!this.VALID_PATTERN.test(trimmedLotNumber)) {
            throw new Error('Lot number can only contain letters, numbers, hyphens, underscores, and dots');
        }

        return new LotNumber({ value: trimmedLotNumber });
    }

    public static generateWithDate(prefix: string = 'LOT', date?: Date): LotNumber {
        const currentDate = date || new Date();
        const year = currentDate.getFullYear().toString().slice(-2);
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');
        const hour = currentDate.getHours().toString().padStart(2, '0');
        const minute = currentDate.getMinutes().toString().padStart(2, '0');

        const lotNumber = `${prefix}-${year}${month}${day}-${hour}${minute}`;
        return LotNumber.create(lotNumber);
    }

    public static generateWithSequence(prefix: string = 'LOT', sequence: number): LotNumber {
        const paddedSequence = sequence.toString().padStart(6, '0');
        const lotNumber = `${prefix}-${paddedSequence}`;
        return LotNumber.create(lotNumber);
    }

    public static generateWithBatch(batchId: string, sequence?: number): LotNumber {
        let lotNumber = `BATCH-${batchId}`;
        if (sequence !== undefined) {
            lotNumber += `-${sequence.toString().padStart(3, '0')}`;
        }
        return LotNumber.create(lotNumber);
    }

    get value(): string {
        return this.props.value;
    }

    public getPrefix(): string {
        const parts = this.props.value.split('-');
        return parts[0];
    }

    public getSuffix(): string {
        const parts = this.props.value.split('-');
        return parts.length > 1 ? parts.slice(1).join('-') : '';
    }

    public getDatePart(): string | null {
        const match = this.props.value.match(/(\d{6})/);
        return match ? match[1] : null;
    }

    public getSequencePart(): string | null {
        const parts = this.props.value.split('-');
        if (parts.length >= 3) {
            const lastPart = parts[parts.length - 1];
            return /^\d+$/.test(lastPart) ? lastPart : null;
        }
        return null;
    }

    public parseDateFromLot(): Date | null {
        const datePart = this.getDatePart();
        if (!datePart || datePart.length !== 6) {
            return null;
        }

        try {
            const year = 2000 + parseInt(datePart.substring(0, 2));
            const month = parseInt(datePart.substring(2, 4)) - 1; // JS months are 0-based
            const day = parseInt(datePart.substring(4, 6));

            const date = new Date(year, month, day);

            // Validate the parsed date
            if (date.getFullYear() === year &&
                date.getMonth() === month &&
                date.getDate() === day) {
                return date;
            }
        } catch {
            // Invalid date
        }

        return null;
    }

    public isExpired(shelfLifeDays: number): boolean {
        const lotDate = this.parseDateFromLot();
        if (!lotDate) {
            return false; // Cannot determine expiry without date
        }

        const expiryDate = new Date(lotDate);
        expiryDate.setDate(expiryDate.getDate() + shelfLifeDays);

        return new Date() > expiryDate;
    }

    public getDaysOld(): number | null {
        const lotDate = this.parseDateFromLot();
        if (!lotDate) {
            return null;
        }

        const diffTime = new Date().getTime() - lotDate.getTime();
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }

    public getRemainingShelfLife(totalShelfLifeDays: number): number | null {
        const daysOld = this.getDaysOld();
        if (daysOld === null) {
            return null;
        }

        return Math.max(0, totalShelfLifeDays - daysOld);
    }

    public matchesPattern(pattern: string): boolean {
        try {
            const regex = new RegExp(pattern, 'i');
            return regex.test(this.props.value);
        } catch {
            return false;
        }
    }

    public createChildLot(childSuffix: string): LotNumber {
        const childLotNumber = `${this.props.value}-${childSuffix}`;
        return LotNumber.create(childLotNumber);
    }

    public getParentLot(): LotNumber | null {
        const parts = this.props.value.split('-');
        if (parts.length <= 2) {
            return null; // No parent lot
        }

        const parentLotNumber = parts.slice(0, -1).join('-');
        try {
            return LotNumber.create(parentLotNumber);
        } catch {
            return null;
        }
    }

    public isChildOf(parentLot: LotNumber): boolean {
        return this.props.value.startsWith(parentLot.value + '-');
    }

    public getHierarchyLevel(): number {
        return this.props.value.split('-').length;
    }

    public format(options: {
        showPrefix?: boolean;
        showDate?: boolean;
        showSequence?: boolean;
        separator?: string;
    } = {}): string {
        const {
            showPrefix = true,
            showDate = true,
            showSequence = true,
            separator = '-'
        } = options;

        const parts: string[] = [];

        if (showPrefix) {
            parts.push(this.getPrefix());
        }

        if (showDate) {
            const datePart = this.getDatePart();
            if (datePart) {
                parts.push(datePart);
            }
        }

        if (showSequence) {
            const sequencePart = this.getSequencePart();
            if (sequencePart) {
                parts.push(sequencePart);
            }
        }

        return parts.join(separator);
    }

    public validate(): string[] {
        const errors: string[] = [];

        if (this.props.value.length < LotNumber.MIN_LENGTH) {
            errors.push(`Lot number must be at least ${LotNumber.MIN_LENGTH} character long`);
        }

        if (this.props.value.length > LotNumber.MAX_LENGTH) {
            errors.push(`Lot number cannot exceed ${LotNumber.MAX_LENGTH} characters`);
        }

        if (!LotNumber.VALID_PATTERN.test(this.props.value)) {
            errors.push('Lot number contains invalid characters');
        }

        return errors;
    }

    public isValid(): boolean {
        return this.validate().length === 0;
    }

    public toString(): string {
        return this.props.value;
    }
}