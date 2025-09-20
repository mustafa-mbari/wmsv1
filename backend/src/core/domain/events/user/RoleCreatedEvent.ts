import { DomainEvent } from '../base/DomainEvent';
import { EntityId } from '../../valueObjects/common/EntityId';
import { RoleName } from '../../valueObjects/user/RoleName';
import { RoleSlug } from '../../valueObjects/user/RoleSlug';

export interface RoleCreatedEventProps {
    roleId: EntityId;
    roleName: RoleName;
    roleSlug: RoleSlug;
    occurredAt: Date;
}

/**
 * Domain event fired when a new role is created
 */
export class RoleCreatedEvent extends DomainEvent {
    public readonly roleId: EntityId;
    public readonly roleName: RoleName;
    public readonly roleSlug: RoleSlug;

    constructor(roleId: EntityId, roleName: RoleName, roleSlug: RoleSlug) {
        super();
        this.roleId = roleId;
        this.roleName = roleName;
        this.roleSlug = roleSlug;
    }

    public getEventName(): string {
        return 'RoleCreated';
    }

    public getAggregateId(): EntityId {
        return this.roleId;
    }

    public getEventData(): any {
        return {
            roleId: this.roleId.value,
            roleName: this.roleName.value,
            roleSlug: this.roleSlug.value,
            occurredAt: this.occurredAt.toISOString()
        };
    }
}