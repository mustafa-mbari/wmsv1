import { DomainEvent } from '../base/DomainEvent';
import { EntityId } from '../../valueObjects/common/EntityId';

export interface RoleUpdatedEventProps {
    roleId: EntityId;
    changes: any;
    occurredAt: Date;
}

/**
 * Domain event fired when a role is updated
 */
export class RoleUpdatedEvent extends DomainEvent {
    public readonly roleId: EntityId;
    public readonly changes: any;

    constructor(roleId: EntityId, changes: any) {
        super();
        this.roleId = roleId;
        this.changes = changes;
    }

    public getEventName(): string {
        return 'RoleUpdated';
    }

    public getAggregateId(): EntityId {
        return this.roleId;
    }

    public getEventData(): any {
        return {
            roleId: this.roleId.value,
            changes: this.changes,
            occurredAt: this.occurredAt.toISOString()
        };
    }
}