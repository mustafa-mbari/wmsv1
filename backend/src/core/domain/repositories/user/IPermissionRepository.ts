import { Permission } from '../../entities/user/Permission';
import { EntityId } from '../../valueObjects/common/EntityId';
import { PermissionName } from '../../valueObjects/user/PermissionName';
import { PermissionSlug } from '../../valueObjects/user/PermissionSlug';
import { PermissionResource } from '../../valueObjects/user/PermissionResource';
import { PermissionAction } from '../../valueObjects/user/PermissionAction';
import { IRepository } from '../base/IRepository';
import { PaginationParams, PaginatedResult } from '../../valueObjects/common/Pagination';

export interface PermissionSearchCriteria {
    search?: string;
    resource?: string;
    action?: string;
    isActive?: boolean;
    isSystemPermission?: boolean;
    scope?: 'system' | 'admin' | 'user';
    createdAfter?: Date;
    createdBefore?: Date;
}

export interface PermissionSortOptions {
    field: 'name' | 'resource' | 'action' | 'createdAt' | 'updatedAt';
    direction: 'asc' | 'desc';
}

/**
 * Permission repository interface
 * Defines contract for permission persistence operations
 */
export interface IPermissionRepository extends IRepository<Permission, EntityId> {
    /**
     * Find permission by name
     */
    findByName(name: PermissionName): Promise<Permission | null>;

    /**
     * Find permission by slug
     */
    findBySlug(slug: PermissionSlug): Promise<Permission | null>;

    /**
     * Find permission by resource and action
     */
    findByResourceAndAction(resource: PermissionResource, action: PermissionAction): Promise<Permission | null>;

    /**
     * Check if permission exists by name
     */
    existsByName(name: PermissionName): Promise<boolean>;

    /**
     * Check if permission exists by slug
     */
    existsBySlug(slug: PermissionSlug): Promise<boolean>;

    /**
     * Check if permission exists by resource and action
     */
    existsByResourceAndAction(resource: PermissionResource, action: PermissionAction): Promise<boolean>;

    /**
     * Find permissions with pagination and filtering
     */
    findWithPagination(
        criteria: PermissionSearchCriteria,
        pagination: PaginationParams,
        sort?: PermissionSortOptions
    ): Promise<PaginatedResult<Permission>>;

    /**
     * Find permissions by resource
     */
    findByResource(resource: PermissionResource): Promise<Permission[]>;

    /**
     * Find permissions by action
     */
    findByAction(action: PermissionAction): Promise<Permission[]>;

    /**
     * Find permissions by multiple resources
     */
    findByResources(resources: PermissionResource[]): Promise<Permission[]>;

    /**
     * Find permissions by multiple actions
     */
    findByActions(actions: PermissionAction[]): Promise<Permission[]>;

    /**
     * Find all active permissions
     */
    findActive(): Promise<Permission[]>;

    /**
     * Find all inactive permissions
     */
    findInactive(): Promise<Permission[]>;

    /**
     * Find system permissions
     */
    findSystemPermissions(): Promise<Permission[]>;

    /**
     * Find user-defined permissions (non-system)
     */
    findUserDefinedPermissions(): Promise<Permission[]>;

    /**
     * Find administrative permissions
     */
    findAdministrativePermissions(): Promise<Permission[]>;

    /**
     * Find permissions by scope
     */
    findByScope(scope: 'system' | 'admin' | 'user'): Promise<Permission[]>;

    /**
     * Find permissions for role
     */
    findByRoleId(roleId: EntityId): Promise<Permission[]>;

    /**
     * Find permissions for user (through roles)
     */
    findByUserId(userId: EntityId): Promise<Permission[]>;

    /**
     * Find permissions for multiple roles
     */
    findByRoleIds(roleIds: EntityId[]): Promise<Permission[]>;

    /**
     * Find wildcard permissions
     */
    findWildcardPermissions(): Promise<Permission[]>;

    /**
     * Find CRUD permissions for a resource
     */
    findCrudPermissions(resource: PermissionResource): Promise<Permission[]>;

    /**
     * Count permissions by criteria
     */
    countByCriteria(criteria: PermissionSearchCriteria): Promise<number>;

    /**
     * Count active permissions
     */
    countActive(): Promise<number>;

    /**
     * Count system permissions
     */
    countSystemPermissions(): Promise<number>;

    /**
     * Count permissions by resource
     */
    countByResource(resource: PermissionResource): Promise<number>;

    /**
     * Get permission statistics
     */
    getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        system: number;
        userDefined: number;
        administrative: number;
        byResource: { [resource: string]: number };
        byAction: { [action: string]: number };
    }>;

    /**
     * Get all unique resources
     */
    getAllResources(): Promise<string[]>;

    /**
     * Get all unique actions
     */
    getAllActions(): Promise<string[]>;

    /**
     * Get permissions grouped by resource
     */
    getGroupedByResource(): Promise<{ [resource: string]: Permission[] }>;

    /**
     * Get permissions grouped by action
     */
    getGroupedByAction(): Promise<{ [action: string]: Permission[] }>;

    /**
     * Check if permission grants access to resource/action
     */
    checkAccess(
        userPermissions: Permission[],
        resource: string,
        action: string
    ): Promise<boolean>;

    /**
     * Check if user has permission (through roles)
     */
    userHasPermission(
        userId: EntityId,
        resource: string,
        action: string
    ): Promise<boolean>;

    /**
     * Check if role has permission
     */
    roleHasPermission(
        roleId: EntityId,
        resource: string,
        action: string
    ): Promise<boolean>;

    /**
     * Find effective permissions for user (resolved through roles and wildcards)
     */
    findEffectivePermissions(userId: EntityId): Promise<Permission[]>;

    /**
     * Check if permission can be deleted
     */
    canBeDeleted(permissionId: EntityId): Promise<boolean>;

    /**
     * Get permission usage count (number of roles with this permission)
     */
    getRoleCount(permissionId: EntityId): Promise<number>;

    /**
     * Find permissions with role counts
     */
    findWithRoleCounts(): Promise<Array<Permission & { roleCount: number }>>;

    /**
     * Bulk update permission status
     */
    bulkUpdateStatus(permissionIds: EntityId[], isActive: boolean): Promise<void>;

    /**
     * Soft delete permissions (mark as deleted)
     */
    softDelete(permissionIds: EntityId[], deletedBy: EntityId): Promise<void>;

    /**
     * Restore soft deleted permissions
     */
    restore(permissionIds: EntityId[], restoredBy: EntityId): Promise<void>;

    /**
     * Permanently delete permissions (hard delete)
     */
    permanentlyDelete(permissionIds: EntityId[]): Promise<void>;

    /**
     * Find permissions for export
     */
    findForExport(criteria: PermissionSearchCriteria): Promise<Permission[]>;

    /**
     * Create standard CRUD permissions for a resource
     */
    createCrudPermissions(resource: PermissionResource, createdBy: EntityId): Promise<Permission[]>;

    /**
     * Import permissions from definition
     */
    importFromDefinition(definitions: any[], createdBy: EntityId): Promise<Permission[]>;
}