import { DomainEvent } from '../base/DomainEvent';
import { EntityId } from '../../valueObjects/common/EntityId';
import { PermissionName } from '../../valueObjects/user/PermissionName';
import { PermissionResource } from '../../valueObjects/user/PermissionResource';
import { PermissionAction } from '../../valueObjects/user/PermissionAction';

export interface PermissionCreatedEventProps {
    permissionId: EntityId;
    permissionName: PermissionName;
    resource: PermissionResource;
    action: PermissionAction;
    occurredAt: Date;
}

/**
 * Domain event fired when a new permission is created
 */
export class PermissionCreatedEvent extends DomainEvent {
    public readonly permissionId: EntityId;
    public readonly permissionName: PermissionName;
    public readonly resource: PermissionResource;
    public readonly action: PermissionAction;

    constructor(
        permissionId: EntityId,
        permissionName: PermissionName,
        resource: PermissionResource,
        action: PermissionAction
    ) {
        super();
        this.permissionId = permissionId;
        this.permissionName = permissionName;
        this.resource = resource;
        this.action = action;
    }

    public getEventName(): string {
        return 'PermissionCreated';
    }

    public getAggregateId(): EntityId {
        return this.permissionId;
    }

    public getEventData(): any {
        return {
            permissionId: this.permissionId.value,
            permissionName: this.permissionName.value,
            resource: this.resource.value,
            action: this.action.value,
            occurredAt: this.occurredAt.toISOString()
        };
    }
}