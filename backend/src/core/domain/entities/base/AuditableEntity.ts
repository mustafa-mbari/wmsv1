import { BaseEntity } from './BaseEntity';
import { AuditFields, EntityId } from '../../../shared/types/common.types';

/**
 * Base auditable entity that includes audit fields
 */
export abstract class AuditableEntity extends BaseEntity implements AuditFields {
    protected _createdAt: Date;
    protected _updatedAt: Date;
    protected _deletedAt: Date | null;
    protected _createdBy: number | null;
    protected _updatedBy: number | null;
    protected _deletedBy: number | null;

    constructor(
        id?: EntityId,
        auditFields?: Partial<AuditFields>
    ) {
        super(id);

        const now = new Date();
        this._createdAt = auditFields?.createdAt || now;
        this._updatedAt = auditFields?.updatedAt || now;
        this._deletedAt = auditFields?.deletedAt ?? null;
        this._createdBy = auditFields?.createdBy ?? null;
        this._updatedBy = auditFields?.updatedBy ?? null;
        this._deletedBy = auditFields?.deletedBy ?? null;
    }

    get createdAt(): Date {
        return this._createdAt;
    }

    get updatedAt(): Date {
        return this._updatedAt;
    }

    get deletedAt(): Date | null {
        return this._deletedAt;
    }

    get createdBy(): number | null {
        return this._createdBy;
    }

    get updatedBy(): number | null {
        return this._updatedBy;
    }

    get deletedBy(): number | null {
        return this._deletedBy;
    }

    get isDeleted(): boolean {
        return this._deletedAt !== null;
    }

    protected markAsUpdated(updatedBy?: number): void {
        this._updatedAt = new Date();
        if (updatedBy !== undefined) {
            this._updatedBy = updatedBy;
        }
    }

    protected markAsDeleted(deletedBy?: number): void {
        this._deletedAt = new Date();
        if (deletedBy !== undefined) {
            this._deletedBy = deletedBy;
        }
    }

    protected restore(): void {
        this._deletedAt = null;
        this._deletedBy = null;
        this.markAsUpdated();
    }
}