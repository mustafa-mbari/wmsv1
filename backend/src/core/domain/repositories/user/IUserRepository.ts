import { User } from '../../entities/user/User';
import { EntityId } from '../../valueObjects/common/EntityId';
import { Username } from '../../valueObjects/user/Username';
import { Email } from '../../valueObjects/user/Email';
import { IRepository } from '../base/IRepository';
import { PaginationParams, PaginatedResult } from '../../valueObjects/common/Pagination';

export interface UserSearchCriteria {
    search?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
    roleId?: EntityId;
    createdAfter?: Date;
    createdBefore?: Date;
}

export interface UserSortOptions {
    field: 'username' | 'email' | 'firstName' | 'lastName' | 'createdAt' | 'updatedAt' | 'lastLoginAt';
    direction: 'asc' | 'desc';
}

/**
 * User repository interface
 * Defines contract for user persistence operations
 */
export interface IUserRepository extends IRepository<User, EntityId> {
    /**
     * Find user by username
     */
    findByUsername(username: Username): Promise<User | null>;

    /**
     * Find user by email
     */
    findByEmail(email: Email): Promise<User | null>;

    /**
     * Find user by username or email
     */
    findByUsernameOrEmail(identifier: string): Promise<User | null>;

    /**
     * Find user by reset token
     */
    findByResetToken(token: string): Promise<User | null>;

    /**
     * Check if username exists
     */
    existsByUsername(username: Username): Promise<boolean>;

    /**
     * Check if email exists
     */
    existsByEmail(email: Email): Promise<boolean>;

    /**
     * Check if username or email exists (excluding specific user)
     */
    existsByUsernameOrEmail(username: Username, email: Email, excludeUserId?: EntityId): Promise<boolean>;

    /**
     * Find users with pagination and filtering
     */
    findWithPagination(
        criteria: UserSearchCriteria,
        pagination: PaginationParams,
        sort?: UserSortOptions
    ): Promise<PaginatedResult<User>>;

    /**
     * Find users by role
     */
    findByRole(roleId: EntityId): Promise<User[]>;

    /**
     * Find users with specific roles
     */
    findByRoles(roleIds: EntityId[]): Promise<User[]>;

    /**
     * Find active users
     */
    findActive(): Promise<User[]>;

    /**
     * Find inactive users
     */
    findInactive(): Promise<User[]>;

    /**
     * Find users with unverified emails
     */
    findWithUnverifiedEmails(): Promise<User[]>;

    /**
     * Find users who haven't logged in for a specified period
     */
    findInactiveUsers(days: number): Promise<User[]>;

    /**
     * Count users by criteria
     */
    countByCriteria(criteria: UserSearchCriteria): Promise<number>;

    /**
     * Count active users
     */
    countActive(): Promise<number>;

    /**
     * Count users created in date range
     */
    countCreatedInDateRange(startDate: Date, endDate: Date): Promise<number>;

    /**
     * Get user statistics
     */
    getStatistics(): Promise<{
        total: number;
        active: number;
        inactive: number;
        verified: number;
        unverified: number;
        createdToday: number;
        createdThisWeek: number;
        createdThisMonth: number;
        lastLoginToday: number;
        lastLoginThisWeek: number;
    }>;

    /**
     * Find users with roles and permissions
     */
    findWithRolesAndPermissions(userId: EntityId): Promise<User | null>;

    /**
     * Bulk update user status
     */
    bulkUpdateStatus(userIds: EntityId[], isActive: boolean): Promise<void>;

    /**
     * Soft delete users (mark as deleted)
     */
    softDelete(userIds: EntityId[], deletedBy: EntityId): Promise<void>;

    /**
     * Restore soft deleted users
     */
    restore(userIds: EntityId[], restoredBy: EntityId): Promise<void>;

    /**
     * Permanently delete users (hard delete)
     */
    permanentlyDelete(userIds: EntityId[]): Promise<void>;

    /**
     * Update last login timestamp
     */
    updateLastLogin(userId: EntityId): Promise<void>;

    /**
     * Clear reset tokens older than specified date
     */
    clearExpiredResetTokens(beforeDate: Date): Promise<number>;

    /**
     * Find users for export
     */
    findForExport(criteria: UserSearchCriteria): Promise<User[]>;
}