// User Service - Layer 3: Business logic for user management
import { apiFacade } from '@/lib/facades/api-facade';
import { ApiResponse, User, BulkOperationResult } from '@/types/api';

export class UserService {
  private readonly baseEndpoint = '/api/users';

  /**
   * Get all users with optional filtering and pagination
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    roles?: string[];
    department?: string;
    is_active?: boolean;
  }): Promise<ApiResponse<User[]>> {
    return apiFacade.getPaginated<User>(this.baseEndpoint, params);
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiFacade.get<User>(`${this.baseEndpoint}/me`);
  }

  /**
   * Get a single user by ID
   */
  async getUser(id: string): Promise<ApiResponse<User>> {
    return apiFacade.get<User>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Create a new user
   */
  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    const transformedData = this.transformUserData(userData);
    return apiFacade.post<User>(this.baseEndpoint, transformedData);
  }

  /**
   * Update an existing user
   */
  async updateUser(id: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    const transformedData = this.transformUserData(userData);
    return apiFacade.put<User>(`${this.baseEndpoint}/${id}`, transformedData);
  }

  /**
   * Update user profile
   */
  async updateProfile(id: string, profileData: any): Promise<ApiResponse<User>> {
    return apiFacade.put<User>(`${this.baseEndpoint}/${id}/profile`, profileData);
  }

  /**
   * Change user password
   */
  async changePassword(id: string, passwordData: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<ApiResponse<void>> {
    return apiFacade.post<void>(`${this.baseEndpoint}/${id}/change-password`, passwordData);
  }

  /**
   * Update user roles
   */
  async updateUserRoles(id: string, rolesData: {
    roles: string[];
    reason?: string;
  }): Promise<ApiResponse<User>> {
    return apiFacade.put<User>(`${this.baseEndpoint}/${id}/roles`, rolesData);
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiFacade.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Bulk operations on users
   */
  async bulkOperations(
    operation: 'activate' | 'deactivate' | 'delete',
    users: any[]
  ): Promise<ApiResponse<BulkOperationResult<User>>> {
    return apiFacade.bulk<BulkOperationResult<User>>(
      `${this.baseEndpoint}/bulk`,
      operation,
      users
    );
  }

  /**
   * Get user activity log
   */
  async getUserActivity(id: string, params?: {
    page?: number;
    limit?: number;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<any[]>> {
    return apiFacade.get(`${this.baseEndpoint}/${id}/activity`, params);
  }

  /**
   * Transform user data before sending to API
   */
  private transformUserData(userData: Partial<User>): any {
    const transformed = { ...userData };

    // Clean up empty strings
    Object.keys(transformed).forEach(key => {
      if (transformed[key] === '') {
        delete transformed[key];
      }
    });

    return transformed;
  }

  /**
   * Validate user data
   */
  validateUserData(userData: Partial<User>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!userData.username?.trim()) {
      errors.push('Username is required');
    }

    if (!userData.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.push('Valid email is required');
    }

    if (!userData.first_name?.trim()) {
      errors.push('First name is required');
    }

    if (!userData.last_name?.trim()) {
      errors.push('Last name is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const userService = new UserService();