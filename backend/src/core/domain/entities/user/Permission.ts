import { AuditableEntity } from '../base/AuditableEntity';
import { EntityId } from '../../valueObjects/common/EntityId';
import { PermissionName } from '../../valueObjects/user/PermissionName';
import { PermissionSlug } from '../../valueObjects/user/PermissionSlug';
import { PermissionResource } from '../../valueObjects/user/PermissionResource';
import { PermissionAction } from '../../valueObjects/user/PermissionAction';
import { IDomainEvent } from '../../events/IDomainEvent';
import { PermissionCreatedEvent } from '../../events/user/PermissionCreatedEvent';
import { PermissionUpdatedEvent } from '../../events/user/PermissionUpdatedEvent';

export interface PermissionProps {
    id: EntityId;
    name: PermissionName;
    slug: PermissionSlug;
    resource: PermissionResource;
    action: PermissionAction;
    description?: string;
    isActive: boolean;
    isSystemPermission: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: EntityId;
    updatedBy?: EntityId;
    deletedAt?: Date;
    deletedBy?: EntityId;
}

/**
 * Permission domain entity
 * Represents a specific permission for a resource and action
 */
export class Permission extends AuditableEntity {
    private _name: PermissionName;
    private _slug: PermissionSlug;
    private _resource: PermissionResource;
    private _action: PermissionAction;
    private _description?: string;
    private _isActive: boolean;
    private _isSystemPermission: boolean;

    private constructor(props: PermissionProps) {
        super({
            id: props.id,
            createdAt: props.createdAt,
            updatedAt: props.updatedAt,
            createdBy: props.createdBy,
            updatedBy: props.updatedBy,
            deletedAt: props.deletedAt,
            deletedBy: props.deletedBy
        });

        this._name = props.name;
        this._slug = props.slug;
        this._resource = props.resource;
        this._action = props.action;
        this._description = props.description;
        this._isActive = props.isActive;
        this._isSystemPermission = props.isSystemPermission;
    }

    /**
     * Create a new permission
     */
    public static create(
        name: PermissionName,
        slug: PermissionSlug,
        resource: PermissionResource,
        action: PermissionAction,
        description?: string,
        isSystemPermission: boolean = false,
        createdBy?: EntityId
    ): Permission {
        const id = EntityId.create();
        const now = new Date();

        const permission = new Permission({
            id,
            name,
            slug,
            resource,
            action,
            description,
            isActive: true,
            isSystemPermission,
            createdAt: now,
            updatedAt: now,
            createdBy
        });

        // Add domain event
        permission.addDomainEvent(new PermissionCreatedEvent(id, name, resource, action));

        return permission;
    }

    /**
     * Create permission from resource and action
     */
    public static createFromResourceAction(
        resource: PermissionResource,
        action: PermissionAction,
        description?: string,
        isSystemPermission: boolean = false,
        createdBy?: EntityId
    ): Permission {
        const name = PermissionName.fromResourceAction(resource, action);
        const slug = PermissionSlug.fromResourceAction(resource, action);

        return this.create(name, slug, resource, action, description, isSystemPermission, createdBy);
    }

    /**
     * Reconstitute permission from persistence
     */
    public static reconstitute(props: PermissionProps): Permission {
        return new Permission(props);
    }

    // Getters
    get name(): PermissionName {
        return this._name;
    }

    get slug(): PermissionSlug {
        return this._slug;
    }

    get resource(): PermissionResource {
        return this._resource;
    }

    get action(): PermissionAction {
        return this._action;
    }

    get description(): string | undefined {
        return this._description;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    get isSystemPermission(): boolean {
        return this._isSystemPermission;
    }

    // Business methods

    /**
     * Update permission information
     */
    public update(
        name: PermissionName,
        description?: string,
        updatedBy?: EntityId
    ): void {
        const oldName = this._name;
        this._name = name;
        this._description = description;
        this.touch(updatedBy);

        this.addDomainEvent(new PermissionUpdatedEvent(this.id, {
            name: { old: oldName, new: name },
            description: { old: this._description, new: description }
        }));
    }

    /**
     * Activate permission
     */
    public activate(updatedBy?: EntityId): void {
        if (this._isActive) {
            return; // Already active
        }

        this._isActive = true;
        this.touch(updatedBy);

        this.addDomainEvent(new PermissionUpdatedEvent(this.id, {
            status: { old: 'inactive', new: 'active' }
        }));
    }

    /**
     * Deactivate permission
     */
    public deactivate(updatedBy?: EntityId): void {
        if (!this._isActive) {
            return; // Already inactive
        }

        if (this._isSystemPermission) {
            throw new Error('System permissions cannot be deactivated');
        }

        this._isActive = false;
        this.touch(updatedBy);

        this.addDomainEvent(new PermissionUpdatedEvent(this.id, {
            status: { old: 'active', new: 'inactive' }
        }));
    }

    /**
     * Check if permission can be deleted
     */
    public canBeDeleted(): boolean {
        return !this._isSystemPermission;
    }

    /**
     * Check if permission can be modified
     */
    public canBeModified(): boolean {
        return !this._isSystemPermission;
    }

    /**
     * Check if this permission matches a resource and action
     */
    public matches(resource: PermissionResource, action: PermissionAction): boolean {
        return this._resource.equals(resource) && this._action.equals(action);
    }

    /**
     * Check if this permission grants access to a specific resource/action
     */
    public grantsAccessTo(resource: string, action: string): boolean {
        return this._resource.value === resource && this._action.value === action;
    }

    /**
     * Check if this is a wildcard permission (grants all actions on a resource)
     */
    public isWildcardPermission(): boolean {
        return this._action.isWildcard();
    }

    /**
     * Check if this is an administrative permission
     */
    public isAdministrativePermission(): boolean {
        const adminResources = ['users', 'roles', 'permissions', 'system'];
        return adminResources.includes(this._resource.value);
    }

    /**
     * Get permission scope (system, admin, user)
     */
    public getScope(): 'system' | 'admin' | 'user' {
        if (this._isSystemPermission) {
            return 'system';
        }

        if (this.isAdministrativePermission()) {
            return 'admin';
        }

        return 'user';
    }

    /**
     * Get permission priority (higher number = more specific)
     */
    public getPriority(): number {
        let priority = 0;

        // More specific actions have higher priority
        if (!this._action.isWildcard()) {
            priority += 10;
        }

        // More specific resources have higher priority
        if (!this._resource.isWildcard()) {
            priority += 5;
        }

        return priority;
    }

    /**
     * Validate business rules
     */
    public validate(): void {
        if (!this._name.isValid()) {
            throw new Error('Invalid permission name');
        }

        if (!this._slug.isValid()) {
            throw new Error('Invalid permission slug');
        }

        if (!this._resource.isValid()) {
            throw new Error('Invalid permission resource');
        }

        if (!this._action.isValid()) {
            throw new Error('Invalid permission action');
        }

        if (this._description && this._description.length > 255) {
            throw new Error('Permission description cannot exceed 255 characters');
        }
    }

    /**
     * Get display name for permission
     */
    public getDisplayName(): string {
        return this._name.getDisplayValue();
    }

    /**
     * Get full permission string (resource:action)
     */
    public getPermissionString(): string {
        return `${this._resource.value}:${this._action.value}`;
    }

    /**
     * Export to plain object for persistence
     */
    public toPersistence(): any {
        return {
            id: this.id.value,
            name: this._name.value,
            slug: this._slug.value,
            resource: this._resource.value,
            action: this._action.value,
            description: this._description,
            is_active: this._isActive,
            is_system_permission: this._isSystemPermission,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
            created_by: this.createdBy?.value,
            updated_by: this.updatedBy?.value,
            deleted_at: this.deletedAt,
            deleted_by: this.deletedBy?.value
        };
    }
}