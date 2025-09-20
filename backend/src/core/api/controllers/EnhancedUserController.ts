import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { BaseController } from './BaseController';
import { CreateUserUseCase } from '../../application/useCases/user/CreateUserUseCase';
import { GetUserByIdUseCase } from '../../application/useCases/user/GetUserByIdUseCase';
import { UpdateUserUseCase } from '../../application/useCases/user/UpdateUserUseCase';
import { DeleteUserUseCase } from '../../application/useCases/user/DeleteUserUseCase';
import { SearchUsersUseCase } from '../../application/useCases/user/SearchUsersUseCase';
import { ChangePasswordUseCase } from '../../application/useCases/user/ChangePasswordUseCase';
import { UpdateUserRolesUseCase } from '../../application/useCases/user/UpdateUserRolesUseCase';
import { UpdateUserProfileUseCase } from '../../application/useCases/user/UpdateUserProfileUseCase';
import { EntityId } from '../../domain/valueObjects/common/EntityId';

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  roles?: string[];
  is_active?: boolean;
  employee_id?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  warehouse_access?: string[];
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  is_active?: boolean;
  employee_id?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  warehouse_access?: string[];
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdateUserRolesDto {
  roles: string[];
  reason?: string;
}

export interface UpdateUserProfileDto {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
    notifications?: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

export interface UserSearchFilters {
  roles?: string[];
  department?: string;
  is_active?: boolean;
  warehouse_access?: string;
  hire_date_from?: string;
  hire_date_to?: string;
  last_login_from?: string;
  last_login_to?: string;
}

@injectable()
export class EnhancedUserController extends BaseController {
  constructor(
    @inject('CreateUserUseCase') private createUserUseCase: CreateUserUseCase,
    @inject('GetUserByIdUseCase') private getUserByIdUseCase: GetUserByIdUseCase,
    @inject('UpdateUserUseCase') private updateUserUseCase: UpdateUserUseCase,
    @inject('DeleteUserUseCase') private deleteUserUseCase: DeleteUserUseCase,
    @inject('SearchUsersUseCase') private searchUsersUseCase: SearchUsersUseCase,
    @inject('ChangePasswordUseCase') private changePasswordUseCase: ChangePasswordUseCase,
    @inject('UpdateUserRolesUseCase') private updateUserRolesUseCase: UpdateUserRolesUseCase,
    @inject('UpdateUserProfileUseCase') private updateUserProfileUseCase: UpdateUserProfileUseCase
  ) {
    super();
  }

  /**
   * Create a new user
   * POST /api/v2/users
   */
  createUser = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const currentUser = this.getCurrentUser(req);
    const userData: CreateUserDto = req.body;

    // Validate required fields
    this.validateRequired(userData, ['username', 'email', 'password', 'first_name', 'last_name']);

    // Check if user has permission to create users
    if (!this.requireRole(req, 'admin') && !this.requireRole(req, 'super-admin')) {
      this.forbidden(res, 'Admin role required to create users');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      this.badRequest(res, 'Invalid email format');
      return;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(userData.password)) {
      this.badRequest(res, 'Password must be at least 8 characters with uppercase, lowercase, number, and special character');
      return;
    }

    const result = await this.createUserUseCase.execute({
      ...userData,
      createdBy: currentUser.id
    });

    if (!result.success) {
      this.badRequest(res, result.error, result.errors);
      return;
    }

    // Remove password from response
    const responseData = { ...result.data };
    delete responseData.password;

    this.created(res, responseData, 'User created successfully');
  });

  /**
   * Get user by ID
   * GET /api/v2/users/:id
   */
  getUserById = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.getEntityId(req);
    const currentUser = this.getCurrentUser(req);
    const includeSensitive = req.query.include_sensitive === 'true';

    // Users can view their own profile, admins can view any profile
    if (!userId.equals(currentUser.id) && !this.requireRole(req, 'admin') && !this.requireRole(req, 'super-admin')) {
      this.forbidden(res, 'Access denied');
      return;
    }

    const result = await this.getUserByIdUseCase.execute({
      id: userId,
      includeSensitive: includeSensitive && this.requireRole(req, 'admin')
    });

    if (!result.success) {
      this.notFound(res, result.error);
      return;
    }

    this.ok(res, result.data);
  });

  /**
   * Search and list users with pagination and filters
   * GET /api/v2/users
   */
  searchUsers = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Only admins can search users
    if (!this.requireRole(req, 'admin') && !this.requireRole(req, 'super-admin')) {
      this.forbidden(res, 'Admin role required to search users');
      return;
    }

    const options = this.getQueryOptions(req);
    const filters: UserSearchFilters = {
      roles: req.query.roles ? (req.query.roles as string).split(',') : undefined,
      department: req.query.department as string,
      is_active: req.query.is_active === 'true' ? true : req.query.is_active === 'false' ? false : undefined,
      warehouse_access: req.query.warehouse_access as string,
      hire_date_from: req.query.hire_date_from as string,
      hire_date_to: req.query.hire_date_to as string,
      last_login_from: req.query.last_login_from as string,
      last_login_to: req.query.last_login_to as string
    };

    const result = await this.searchUsersUseCase.execute({
      ...options,
      filters
    });

    if (!result.success) {
      this.badRequest(res, result.error);
      return;
    }

    if (result.pagination) {
      this.okPaginated(
        res,
        result.data,
        result.pagination.total,
        result.pagination.page,
        result.pagination.limit,
        'Users retrieved successfully'
      );
    } else {
      this.ok(res, result.data, 'Users retrieved successfully');
    }
  });

  /**
   * Update user
   * PUT /api/v2/users/:id
   */
  updateUser = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.getEntityId(req);
    const currentUser = this.getCurrentUser(req);
    const updateData: UpdateUserDto = req.body;

    // Users can update their own basic info, admins can update any user
    const canUpdate = userId.equals(currentUser.id) ||
                     this.requireRole(req, 'admin') ||
                     this.requireRole(req, 'super-admin');

    if (!canUpdate) {
      this.forbidden(res, 'Access denied');
      return;
    }

    // Non-admins cannot change certain fields
    if (!this.requireRole(req, 'admin') && !this.requireRole(req, 'super-admin')) {
      const restrictedFields = ['is_active', 'employee_id', 'warehouse_access'];
      const hasRestrictedFields = restrictedFields.some(field => updateData[field] !== undefined);

      if (hasRestrictedFields) {
        this.forbidden(res, 'Insufficient permissions to update these fields');
        return;
      }
    }

    // Validate email format if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        this.badRequest(res, 'Invalid email format');
        return;
      }
    }

    const result = await this.updateUserUseCase.execute({
      id: userId,
      ...updateData,
      updatedBy: currentUser.id
    });

    if (!result.success) {
      if (result.error?.includes('not found')) {
        this.notFound(res, result.error);
      } else {
        this.badRequest(res, result.error, result.errors);
      }
      return;
    }

    this.ok(res, result.data, 'User updated successfully');
  });

  /**
   * Delete user (soft delete)
   * DELETE /api/v2/users/:id
   */
  deleteUser = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.getEntityId(req);
    const currentUser = this.getCurrentUser(req);

    // Only super-admins can delete users
    if (!this.requireRole(req, 'super-admin')) {
      this.forbidden(res, 'Super admin role required for user deletion');
      return;
    }

    // Cannot delete self
    if (userId.equals(currentUser.id)) {
      this.badRequest(res, 'Cannot delete your own account');
      return;
    }

    const result = await this.deleteUserUseCase.execute({
      id: userId,
      deletedBy: currentUser.id
    });

    if (!result.success) {
      if (result.error?.includes('not found')) {
        this.notFound(res, result.error);
      } else {
        this.badRequest(res, result.error);
      }
      return;
    }

    this.noContent(res);
  });

  /**
   * Change user password
   * POST /api/v2/users/:id/change-password
   */
  changePassword = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.getEntityId(req);
    const currentUser = this.getCurrentUser(req);
    const passwordData: ChangePasswordDto = req.body;

    this.validateRequired(passwordData, ['current_password', 'new_password', 'confirm_password']);

    // Users can only change their own password, unless admin
    if (!userId.equals(currentUser.id) && !this.requireRole(req, 'admin') && !this.requireRole(req, 'super-admin')) {
      this.forbidden(res, 'Access denied');
      return;
    }

    // Validate new password confirmation
    if (passwordData.new_password !== passwordData.confirm_password) {
      this.badRequest(res, 'New password and confirmation do not match');
      return;
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwordData.new_password)) {
      this.badRequest(res, 'Password must be at least 8 characters with uppercase, lowercase, number, and special character');
      return;
    }

    const result = await this.changePasswordUseCase.execute({
      userId,
      currentPassword: passwordData.current_password,
      newPassword: passwordData.new_password,
      changedBy: currentUser.id
    });

    if (!result.success) {
      this.badRequest(res, result.error);
      return;
    }

    this.ok(res, { success: true }, 'Password changed successfully');
  });

  /**
   * Update user roles
   * PUT /api/v2/users/:id/roles
   */
  updateUserRoles = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.getEntityId(req);
    const currentUser = this.getCurrentUser(req);
    const rolesData: UpdateUserRolesDto = req.body;

    this.validateRequired(rolesData, ['roles']);

    // Only admins can update roles
    if (!this.requireRole(req, 'admin') && !this.requireRole(req, 'super-admin')) {
      this.forbidden(res, 'Admin role required to update user roles');
      return;
    }

    // Cannot modify own roles
    if (userId.equals(currentUser.id)) {
      this.badRequest(res, 'Cannot modify your own roles');
      return;
    }

    // Validate roles array
    if (!Array.isArray(rolesData.roles)) {
      this.badRequest(res, 'Roles must be an array');
      return;
    }

    const result = await this.updateUserRolesUseCase.execute({
      userId,
      roles: rolesData.roles,
      reason: rolesData.reason,
      updatedBy: currentUser.id
    });

    if (!result.success) {
      this.badRequest(res, result.error);
      return;
    }

    this.ok(res, result.data, 'User roles updated successfully');
  });

  /**
   * Update user profile
   * PUT /api/v2/users/:id/profile
   */
  updateUserProfile = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.getEntityId(req);
    const currentUser = this.getCurrentUser(req);
    const profileData: UpdateUserProfileDto = req.body;

    // Users can only update their own profile
    if (!userId.equals(currentUser.id)) {
      this.forbidden(res, 'Can only update your own profile');
      return;
    }

    const result = await this.updateUserProfileUseCase.execute({
      userId,
      ...profileData,
      updatedBy: currentUser.id
    });

    if (!result.success) {
      this.badRequest(res, result.error, result.errors);
      return;
    }

    this.ok(res, result.data, 'Profile updated successfully');
  });

  /**
   * Get current user profile
   * GET /api/v2/users/me
   */
  getCurrentUserProfile = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const currentUser = this.getCurrentUser(req);

    const result = await this.getUserByIdUseCase.execute({
      id: currentUser.id,
      includeSensitive: false
    });

    if (!result.success) {
      this.notFound(res, result.error);
      return;
    }

    this.ok(res, result.data);
  });

  /**
   * Get user activity log
   * GET /api/v2/users/:id/activity
   */
  getUserActivity = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = this.getEntityId(req);
    const currentUser = this.getCurrentUser(req);
    const options = this.getQueryOptions(req);

    // Users can view their own activity, admins can view any user's activity
    if (!userId.equals(currentUser.id) && !this.requireRole(req, 'admin') && !this.requireRole(req, 'super-admin')) {
      this.forbidden(res, 'Access denied');
      return;
    }

    // This would require an activity tracking use case
    // For now, return a placeholder response
    this.ok(res, {
      userId: userId.value,
      activities: [],
      total: 0,
      page: options.page || 1,
      limit: options.limit || 10
    }, 'User activity retrieved');
  });

  /**
   * Bulk user operations
   * POST /api/v2/users/bulk
   */
  bulkOperations = this.asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const currentUser = this.getCurrentUser(req);
    const { operation, users } = req.body;

    if (!operation || !users || !Array.isArray(users)) {
      this.badRequest(res, 'Operation and users array are required');
      return;
    }

    // Only super-admins can perform bulk operations
    if (!this.requireRole(req, 'super-admin')) {
      this.forbidden(res, 'Super admin role required for bulk operations');
      return;
    }

    let results = [];
    let errors = [];

    try {
      switch (operation) {
        case 'activate':
        case 'deactivate':
          for (const { id } of users) {
            if (!id) {
              errors.push({ id, error: 'ID is required' });
              continue;
            }

            const result = await this.updateUserUseCase.execute({
              id: EntityId.fromString(id),
              is_active: operation === 'activate',
              updatedBy: currentUser.id
            });

            if (result.success) {
              results.push({ id, status: operation });
            } else {
              errors.push({ id, error: result.error });
            }
          }
          break;

        case 'delete':
          for (const { id } of users) {
            if (!id) {
              errors.push({ id, error: 'ID is required' });
              continue;
            }

            // Cannot delete current user
            if (EntityId.fromString(id).equals(currentUser.id)) {
              errors.push({ id, error: 'Cannot delete your own account' });
              continue;
            }

            const result = await this.deleteUserUseCase.execute({
              id: EntityId.fromString(id),
              deletedBy: currentUser.id
            });

            if (result.success) {
              results.push({ id, deleted: true });
            } else {
              errors.push({ id, error: result.error });
            }
          }
          break;

        default:
          this.badRequest(res, 'Invalid operation. Supported: activate, deactivate, delete');
          return;
      }

      this.ok(res, {
        operation,
        successful: results.length,
        failed: errors.length,
        results,
        errors
      }, `Bulk ${operation} completed`);

    } catch (error) {
      this.internalServerError(res, 'Bulk operation failed', error);
    }
  });
}