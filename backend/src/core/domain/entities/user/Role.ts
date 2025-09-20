import { AuditableEntity } from '../base/AuditableEntity';
import { EntityId } from '../../valueObjects/common/EntityId';
import { RoleName } from '../../valueObjects/user/RoleName';
import { RoleSlug } from '../../valueObjects/user/RoleSlug';
import { IDomainEvent } from '../../events/IDomainEvent';
import { RoleCreatedEvent } from '../../events/user/RoleCreatedEvent';
import { RoleUpdatedEvent } from '../../events/user/RoleUpdatedEvent';

export interface RoleProps {
    id: EntityId;
    name: RoleName;
    slug: RoleSlug;
    description?: string;
    isActive: boolean;
    isSystemRole: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: EntityId;
    updatedBy?: EntityId;
    deletedAt?: Date;
    deletedBy?: EntityId;
}

/**
 * Role domain entity
 * Represents a role in the system with associated permissions
 */
export class Role extends AuditableEntity {
    private _name: RoleName;
    private _slug: RoleSlug;
    private _description?: string;
    private _isActive: boolean;
    private _isSystemRole: boolean;

    private constructor(props: RoleProps) {
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
        this._description = props.description;
        this._isActive = props.isActive;
        this._isSystemRole = props.isSystemRole;
    }

    /**
     * Create a new role
     */
    public static create(
        name: RoleName,
        slug: RoleSlug,
        description?: string,
        isSystemRole: boolean = false,
        createdBy?: EntityId
    ): Role {
        const id = EntityId.create();
        const now = new Date();

        const role = new Role({
            id,
            name,
            slug,
            description,
            isActive: true,
            isSystemRole,
            createdAt: now,
            updatedAt: now,
            createdBy
        });

        // Add domain event
        role.addDomainEvent(new RoleCreatedEvent(id, name, slug));

        return role;
    }

    /**
     * Reconstitute role from persistence
     */
    public static reconstitute(props: RoleProps): Role {
        return new Role(props);
    }

    // Getters
    get name(): RoleName {
        return this._name;
    }

    get slug(): RoleSlug {
        return this._slug;
    }

    get description(): string | undefined {
        return this._description;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    get isSystemRole(): boolean {
        return this._isSystemRole;
    }

    // Business methods

    /**
     * Update role information
     */
    public update(
        name: RoleName,
        description?: string,
        updatedBy?: EntityId
    ): void {
        const oldName = this._name;
        this._name = name;
        this._description = description;
        this.touch(updatedBy);

        this.addDomainEvent(new RoleUpdatedEvent(this.id, {
            name: { old: oldName, new: name },
            description: { old: this._description, new: description }
        }));
    }

    /**
     * Activate role
     */
    public activate(updatedBy?: EntityId): void {
        if (this._isActive) {
            return; // Already active
        }

        this._isActive = true;
        this.touch(updatedBy);

        this.addDomainEvent(new RoleUpdatedEvent(this.id, {
            status: { old: 'inactive', new: 'active' }
        }));
    }

    /**
     * Deactivate role
     */
    public deactivate(updatedBy?: EntityId): void {
        if (!this._isActive) {
            return; // Already inactive
        }

        if (this._isSystemRole) {
            throw new Error('System roles cannot be deactivated');
        }

        this._isActive = false;
        this.touch(updatedBy);

        this.addDomainEvent(new RoleUpdatedEvent(this.id, {
            status: { old: 'active', new: 'inactive' }
        }));
    }

    /**
     * Check if role can be deleted
     */
    public canBeDeleted(): boolean {
        return !this._isSystemRole;
    }

    /**
     * Check if role can be modified
     */
    public canBeModified(): boolean {
        return !this._isSystemRole;
    }

    /**
     * Validate business rules
     */
    public validate(): void {
        if (!this._name.isValid()) {
            throw new Error('Invalid role name');
        }

        if (!this._slug.isValid()) {
            throw new Error('Invalid role slug');
        }

        if (this._description && this._description.length > 255) {
            throw new Error('Role description cannot exceed 255 characters');
        }
    }

    /**
     * Get display name for role
     */
    public getDisplayName(): string {
        return this._name.getDisplayValue();
    }

    /**
     * Check if this is an administrative role
     */
    public isAdministrativeRole(): boolean {
        const adminSlugs = ['super-admin', 'admin', 'administrator'];
        return adminSlugs.includes(this._slug.value);
    }

    /**
     * Check if this is a management role
     */
    public isManagementRole(): boolean {
        const managementSlugs = ['manager', 'supervisor', 'team-lead', 'coordinator'];
        return managementSlugs.includes(this._slug.value);
    }

    /**
     * Get role hierarchy level (lower number = higher authority)
     */
    public getHierarchyLevel(): number {
        const hierarchyMap: { [key: string]: number } = {
            'super-admin': 0,
            'admin': 1,
            'administrator': 1,
            'manager': 2,
            'supervisor': 3,
            'team-lead': 4,
            'coordinator': 5,
            'employee': 6,
            'user': 7,
            'guest': 8
        };

        return hierarchyMap[this._slug.value] ?? 10;
    }

    /**
     * Check if this role has higher authority than another role
     */
    public hasHigherAuthorityThan(otherRole: Role): boolean {
        return this.getHierarchyLevel() < otherRole.getHierarchyLevel();
    }

    /**
     * Export to plain object for persistence
     */
    public toPersistence(): any {
        return {
            id: this.id.value,
            name: this._name.value,
            slug: this._slug.value,
            description: this._description,
            is_active: this._isActive,
            is_system_role: this._isSystemRole,
            created_at: this.createdAt,
            updated_at: this.updatedAt,
            created_by: this.createdBy?.value,
            updated_by: this.updatedBy?.value,
            deleted_at: this.deletedAt,
            deleted_by: this.deletedBy?.value
        };
    }
}