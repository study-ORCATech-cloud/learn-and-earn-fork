// User management API service

import { managementApiService } from './managementApiService';
import { MANAGEMENT_API_ENDPOINTS } from '../utils/constants';
import type {
  ManagementUser,
  UserDetails,
  CreateUserRequest,
  UpdateUserRequest,
  DeactivateUserRequest,
  ActivateUserRequest,
  BulkUserOperationRequest,
  UserListResponse,
  UserProvidersResponse,
  UserAuditResponse,
  SearchUsersResponse,
  UserFilters,
} from '../types/user';
import type { ApiResponse, BulkOperationResult } from '../types/management';

class UserManagementService {
  /**
   * Get list of users with filtering and pagination
   */
  async getUsers(
    page: number = 1,
    limit: number = 50,
    filters?: UserFilters
  ): Promise<ApiResponse<UserListResponse>> {
    const params = {
      page,
      limit,
      ...filters,
    };

    return managementApiService.get<UserListResponse>(
      MANAGEMENT_API_ENDPOINTS.USERS,
      params
    );
  }

  /**
   * Get detailed information about a specific user
   */
  async getUserById(userId: string): Promise<ApiResponse<UserDetails>> {
    return managementApiService.get<UserDetails>(
      MANAGEMENT_API_ENDPOINTS.USER_BY_ID(userId)
    );
  }


  /**
   * Update user information
   */
  async updateUser(userId: string, userData: UpdateUserRequest): Promise<ApiResponse<{
    success: boolean;
    message: string;
    user: ManagementUser;
    updated_fields: string[];
    updated_by: string;
  }>> {
    return managementApiService.put(
      MANAGEMENT_API_ENDPOINTS.USER_BY_ID(userId),
      userData
    );
  }

  /**
   * Deactivate a user (soft delete)
   */
  async deactivateUser(userId: string, reason?: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
    user: { id: string; is_active: boolean };
    deactivated_by: string;
    reason?: string;
  }>> {
    const data: DeactivateUserRequest = reason ? { reason } : {};
    
    return managementApiService.delete(
      MANAGEMENT_API_ENDPOINTS.USER_BY_ID(userId),
      data
    );
  }

  /**
   * Reactivate a user
   */
  async activateUser(userId: string, reason?: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
    user: { id: string; is_active: boolean };
    activated_by: string;
    reason?: string;
  }>> {
    const data: ActivateUserRequest = reason ? { reason } : {};
    
    return managementApiService.post(
      MANAGEMENT_API_ENDPOINTS.USER_ACTIVATE(userId),
      data
    );
  }

  /**
   * Change user role
   */
  async changeUserRole(userId: string, data: { role: string; reason?: string }): Promise<ApiResponse<{
    success: boolean;
    message: string;
    user: ManagementUser;
    old_role: string;
    new_role: string;
    changed_by: string;
    reason?: string;
  }>> {
    return managementApiService.put(
      MANAGEMENT_API_ENDPOINTS.CHANGE_USER_ROLE(userId),
      data
    );
  }

  /**
   * Search users by name or email
   */
  async searchUsers(query: string): Promise<ApiResponse<SearchUsersResponse>> {
    return managementApiService.get<SearchUsersResponse>(
      MANAGEMENT_API_ENDPOINTS.USER_SEARCH,
      { q: query }
    );
  }

  /**
   * Perform bulk operations on multiple users
   */
  async bulkOperations(request: BulkUserOperationRequest): Promise<ApiResponse<BulkOperationResult>> {
    return managementApiService.post<BulkOperationResult>(
      MANAGEMENT_API_ENDPOINTS.USER_BULK_OPERATIONS,
      request
    );
  }

  /**
   * Get user's linked OAuth providers
   */
  async getUserProviders(userId: string): Promise<ApiResponse<UserProvidersResponse>> {
    return managementApiService.get<UserProvidersResponse>(
      MANAGEMENT_API_ENDPOINTS.USER_PROVIDERS(userId)
    );
  }

  /**
   * Get user audit trail
   */
  async getUserAudit(
    userId: string,
    page: number = 1,
    limit: number = 50,
    filters?: {
      action?: string;
      start_date?: string;
      end_date?: string;
    }
  ): Promise<ApiResponse<UserAuditResponse>> {
    const params = {
      page,
      limit,
      ...filters,
    };

    return managementApiService.get<UserAuditResponse>(
      MANAGEMENT_API_ENDPOINTS.USER_AUDIT(userId),
      params
    );
  }

  /**
   * Get users with basic filters (for dropdowns and selectors)
   */
  async getUsersForSelection(role?: string): Promise<ApiResponse<Pick<ManagementUser, 'id' | 'email' | 'name' | 'role'>[]>> {
    const params = role ? { role, limit: 100 } : { limit: 100 };
    
    const response = await managementApiService.get<UserListResponse>(
      MANAGEMENT_API_ENDPOINTS.USERS,
      params
    );

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.users.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        })),
      };
    }

    return response as ApiResponse<Pick<ManagementUser, 'id' | 'email' | 'name' | 'role'>[]>;
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<ApiResponse<{
    total_users: number;
    active_users: number;
    inactive_users: number;
    users_by_role: Record<string, number>;
    users_by_provider: Record<string, number>;
    recent_registrations: number; // Last 30 days
  }>> {
    // This would be a custom endpoint for dashboard statistics
    // For now, we'll calculate from the first page of users
    const response = await this.getUsers(1, 100);
    
    if (!response.success || !response.data) {
      return response as any;
    }

    const users = response.data.users;
    const stats = {
      total_users: response.data.pagination.total,
      active_users: users.filter(u => u.is_active).length,
      inactive_users: users.filter(u => !u.is_active).length,
      users_by_role: users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      users_by_provider: users.reduce((acc, user) => {
        const providerCount = user.provider_count || 1;
        acc['oauth'] = (acc['oauth'] || 0) + providerCount;
        return acc;
      }, {} as Record<string, number>),
      recent_registrations: users.filter(user => {
        const createdAt = new Date(user.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdAt > thirtyDaysAgo;
      }).length,
    };

    return {
      success: true,
      data: stats,
    };
  }
}

export const userManagementService = new UserManagementService();