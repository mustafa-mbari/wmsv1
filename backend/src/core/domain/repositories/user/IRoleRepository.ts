import { Role } from '../../entities/user/Role';
import { EntityId } from '../../valueObjects/common/EntityId';
import { RoleName } from '../../valueObjects/user/RoleName';
import { RoleSlug } from '../../valueObjects/user/RoleSlug';
import { IRepository } from '../base/IRepository';
import { PaginationParams, PaginatedResult } from '../../valueObjects/common/Pagination';

export interface RoleSearchCriteria {
    search?: string;
    isActive?: boolean;
    isSystemRole?: boolean;
    createdAfter?: Date;
    createdBefore?: Date;
}

export interface RoleSortOptions {
    field: 'name' | 'slug' | 'createdAt' | 'updatedAt';
    direction: 'asc' | 'desc';
}

/**
 * Role repository interface
 * Defines contract for role persistence operations
 */
export interface IRoleRepository extends IRepository<Role, EntityId> {
    /**
     * Find role by name
     */
    findByName(name: RoleName): Promise<Role | null>;

    /**
     * Find role by slug
     */
    findBySlug(slug: RoleSlug): Promise<Role | null>;

    /**
     * Check if role name exists
     */
    existsByName(name: RoleName): Promise<boolean>;

    /**
     * Check if role slug exists
     */
    existsBySlug(slug: RoleSlug): Promise<boolean>;

    /**
     * Check if role name or slug exists (excluding specific role)
     */
    existsByNameOrSlug(name: RoleName, slug: RoleSlug, excludeRoleId?: EntityId): Promise<boolean>;

    /**
     * Find roles with pagination and filtering
     */
    findWithPagination(
        criteria: RoleSearchCriteria,
        pagination: PaginationParams,
        sort?: RoleSortOptions
    ): Promise<PaginatedResult<Role>>;

    /**
     * Find all active roles
     */
    findActive(): Promise<Role[]>;

    /**
     * Find all inactive roles
     */
    findInactive(): Promise<Role[]>;

    /**
     * Find system roles
     */
    findSystemRoles(): Promise<Role[]>;

    /**
     * Find user-defined roles (non-system)
     */
    findUserDefinedRoles(): Promise<Role[]>;

    /**
     * Find roles by hierarchy level
     */
    findByHierarchyLevel(maxLevel: number): Promise<Role[]>;

    /**
     * Find administrative roles
     */
    findAdministrativeRoles(): Promise<Role[]>;

    /**
     * Find management roles
     */
    findManagementRoles(): Promise<Role[]>;

    /**
     * Find roles for user
     */
    findByUserId(userId: EntityId): Promise<Role[]>;

    /**
     * Find roles with their permissions
     */
    findWithPermissions(roleId: EntityId): Promise<Role | null>;

    /**
     * Find all roles with their permissions
     */
    findAllWithPermissions(): Promise<Role[]>;

    /**
     * Count roles by criteria
     */
    countByCriteria(criteria: RoleSearchCriteria): Promise<number>;

    /**
     * Count active roles
     */
    countActive(): Promise<number>;

    /**
     * Count system roles
     */
    countSystemRoles(): Promise<number>;

    /**
     * Get role statistics
     */
    getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        system: number;
        userDefined: number;
        withUsers: number;
        withoutUsers: number;
    }>;

    /**
     * Find roles that can be assigned by a user with specific role
     */
    findAssignableRoles(assignerRoleId: EntityId): Promise<Role[]>;

    /**
     * Check if role can be deleted
     */
    canBeDeleted(roleId: EntityId): Promise<boolean>;

    /**
     * Get role usage count (number of users with this role)
     */
    getUserCount(roleId: EntityId): Promise<number>;

    /**
     * Find roles with user count
     */
    findWithUserCounts(): Promise<Array<Role & { userCount: number }>>;

    /**
     * Bulk update role status
     */
    bulkUpdateStatus(roleIds: EntityId[], isActive: boolean): Promise<void>;

    /**
     * Soft delete roles (mark as deleted)
     */
    softDelete(roleIds: EntityId[], deletedBy: EntityId): Promise<void>;

    /**
     * Restore soft deleted roles
     */
    restore(roleIds: EntityId[], restoredBy: EntityId): Promise<void>;

    /**
     * Permanently delete roles (hard delete)
     */
    permanentlyDelete(roleIds: EntityId[]): Promise<void>;

    /**
     * Find roles for export
     */
    findForExport(criteria: RoleSearchCriteria): Promise<Role[]>;

    /**
     * Check if role has higher authority than another
     */
    hasHigherAuthority(roleId: EntityId, otherRoleId: EntityId): Promise<boolean>;

    /**
     * Find default role for new users
     */
    findDefaultRole(): Promise<Role | null>;
}