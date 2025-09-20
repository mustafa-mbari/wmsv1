import { DomainEvent } from '../base/DomainEvent';
import { EntityId } from '../../valueObjects/common/EntityId';
import { Username } from '../../valueObjects/user/Username';
import { Email } from '../../valueObjects/user/Email';

export interface UserCreatedEventProps {
    userId: EntityId;
    username: Username;
    email: Email;
    occurredAt: Date;
}

/**
 * Domain event fired when a new user is created
 */
export class UserCreatedEvent extends DomainEvent {
    public readonly userId: EntityId;
    public readonly username: Username;
    public readonly email: Email;

    constructor(userId: EntityId, username: Username, email: Email) {
        super();
        this.userId = userId;
        this.username = username;
        this.email = email;
    }

    public getEventName(): string {
        return 'UserCreated';
    }

    public getAggregateId(): EntityId {
        return this.userId;
    }

    public getEventData(): any {
        return {
            userId: this.userId.value,
            username: this.username.value,
            email: this.email.value,
            occurredAt: this.occurredAt.toISOString()
        };
    }
}