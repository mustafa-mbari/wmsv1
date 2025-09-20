import { EntityId } from '../valueObjects/common/EntityId';

export abstract class AuditableEntity {
    protected _id: EntityId;
    protected _createdAt: Date;
    protected _updatedAt: Date;
    protected _deletedAt?: Date;
    protected _createdBy?: EntityId;
    protected _updatedBy?: EntityId;
    protected _deletedBy?: EntityId;

    constructor(
        id?: EntityId,
        createdAt?: Date,
        updatedAt?: Date,
        deletedAt?: Date,
        createdBy?: EntityId,
        updatedBy?: EntityId,
        deletedBy?: EntityId
    ) {
        this._id = id || EntityId.generate();
        this._createdAt = createdAt || new Date();
        this._updatedAt = updatedAt || new Date();
        this._deletedAt = deletedAt;
        this._createdBy = createdBy;
        this._updatedBy = updatedBy;
        this._deletedBy = deletedBy;
    }

    public get id(): EntityId {
        return this._id;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }

    public get updatedAt(): Date {
        return this._updatedAt;
    }

    public get deletedAt(): Date | undefined {
        return this._deletedAt;
    }

    public get createdBy(): EntityId | undefined {
        return this._createdBy;
    }

    public get updatedBy(): EntityId | undefined {
        return this._updatedBy;
    }

    public get deletedBy(): EntityId | undefined {
        return this._deletedBy;
    }

    protected markAsUpdated(updatedBy?: EntityId): void {
        this._updatedAt = new Date();
        this._updatedBy = updatedBy;
    }

    protected markAsDeleted(deletedBy?: EntityId): void {
        this._deletedAt = new Date();
        this._deletedBy = deletedBy;
    }

    public isDeleted(): boolean {
        return this._deletedAt !== undefined;
    }

    public equals(other: AuditableEntity): boolean {
        return this._id.equals(other._id);
    }
}