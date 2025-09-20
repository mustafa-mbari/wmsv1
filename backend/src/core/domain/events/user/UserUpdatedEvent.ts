import { DomainEvent } from '../base/DomainEvent';
import { EntityId } from '../../valueObjects/common/EntityId';

export interface UserUpdatedEventProps {
    userId: EntityId;
    changes: any;
    occurredAt: Date;
}

/**
 * Domain event fired when a user is updated
 */
export class UserUpdatedEvent extends DomainEvent {
    public readonly userId: EntityId;
    public readonly changes: any;

    constructor(userId: EntityId, changes: any) {
        super();
        this.userId = userId;
        this.changes = changes;
    }

    public getEventName(): string {
        return 'UserUpdated';
    }

    public getAggregateId(): EntityId {
        return this.userId;
    }

    public getEventData(): any {
        return {
            userId: this.userId.value,
            changes: this.changes,
            occurredAt: this.occurredAt.toISOString()
        };
    }
}