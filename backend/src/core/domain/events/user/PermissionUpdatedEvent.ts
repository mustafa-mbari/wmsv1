import { DomainEvent } from '../base/DomainEvent';
import { EntityId } from '../../valueObjects/common/EntityId';

export interface PermissionUpdatedEventProps {
    permissionId: EntityId;
    changes: any;
    occurredAt: Date;
}

/**
 * Domain event fired when a permission is updated
 */
export class PermissionUpdatedEvent extends DomainEvent {
    public readonly permissionId: EntityId;
    public readonly changes: any;

    constructor(permissionId: EntityId, changes: any) {
        super();
        this.permissionId = permissionId;
        this.changes = changes;
    }

    public getEventName(): string {
        return 'PermissionUpdated';
    }

    public getAggregateId(): EntityId {
        return this.permissionId;
    }

    public getEventData(): any {
        return {
            permissionId: this.permissionId.value,
            changes: this.changes,
            occurredAt: this.occurredAt.toISOString()
        };
    }
}