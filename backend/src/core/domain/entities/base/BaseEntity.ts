import { IEntity, IDomainEvent, IAggregateRoot } from '../../../shared/types/domain.types';
import { EntityId } from '../../../shared/types/common.types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Base entity class that all domain entities should extend
 */
export abstract class BaseEntity implements IEntity {
    protected _id: EntityId;
    private _domainEvents: IDomainEvent[] = [];

    constructor(id?: EntityId) {
        this._id = id || this.generateId();
    }

    get id(): EntityId {
        return this._id;
    }

    equals(other: IEntity): boolean {
        if (!other || !(other instanceof BaseEntity)) {
            return false;
        }

        return this._id === other._id;
    }

    protected generateId(): string {
        return uuidv4();
    }

    protected addDomainEvent(event: IDomainEvent): void {
        this._domainEvents.push(event);
    }

    getUncommittedEvents(): IDomainEvent[] {
        return [...this._domainEvents];
    }

    markEventsAsCommitted(): void {
        this._domainEvents = [];
    }

    protected validate(): void {
        // Override in derived classes for validation logic
    }
}

/**
 * Base aggregate root class
 */
export abstract class BaseAggregateRoot extends BaseEntity implements IAggregateRoot {
    constructor(id?: EntityId) {
        super(id);
    }

    addDomainEvent(event: IDomainEvent): void {
        super.addDomainEvent(event);
    }
}