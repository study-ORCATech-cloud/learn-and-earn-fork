// Role management API service

import { managementApiService } from './managementApiService';
import { MANAGEMENT_API_ENDPOINTS } from '../utils/constants';
import type {
  RoleHierarchy,
  ChangeUserRoleRequest,
  ChangeUserRoleResponse,
  UserPermissions,
  ManageableRoles,
  ValidateRolePermissionRequest,
  ValidateRolePermissionResponse,
  UserRole,
} from '../types/role';
import type { ApiResponse } from '../types/management';

class RoleManagementService {
  /**
   * Get all available roles with hierarchy and permissions
   */
  async getRoles(): Promise<ApiResponse<RoleHierarchy>> {
    return managementApiService.get<RoleHierarchy>(
      MANAGEMENT_API_ENDPOINTS.ROLES
    );
  }

  /**
   * Change a user's role
   */
  async changeUserRole(
    userId: string,
    roleData: ChangeUserRoleRequest
  ): Promise<ApiResponse<ChangeUserRoleResponse>> {
    return managementApiService.put<ChangeUserRoleResponse>(
      MANAGEMENT_API_ENDPOINTS.CHANGE_USER_ROLE(userId),
      roleData
    );
  }

  /**
   * Get user's effective permissions based on their role
   */
  async getUserPermissions(userId: string): Promise<ApiResponse<UserPermissions>> {
    return managementApiService.get<UserPermissions>(
      MANAGEMENT_API_ENDPOINTS.USER_PERMISSIONS(userId)
    );
  }

  /**
   * Get list of roles that current user can assign to others
   */
  async getManageableRoles(): Promise<ApiResponse<ManageableRoles>> {
    return managementApiService.get<ManageableRoles>(
      MANAGEMENT_API_ENDPOINTS.MANAGEABLE_ROLES
    );
  }

  /**
   * Validate role hierarchy and permissions
   */
  async validateRolePermission(
    validationData: ValidateRolePermissionRequest
  ): Promise<ApiResponse<ValidateRolePermissionResponse>> {
    return managementApiService.post<ValidateRolePermissionResponse>(
      MANAGEMENT_API_ENDPOINTS.VALIDATE_ROLE_PERMISSION,
      validationData
    );
  }

  /**
   * Get current user's permissions (convenience method)
   */
  async getCurrentUserPermissions(): Promise<ApiResponse<UserPermissions>> {
    // This would typically use the current user's ID from the auth context
    // For now, we'll make a call to get current user info first
    try {
      // We could get current user ID from auth context instead
      const currentUser = await this.getCurrentUserInfo();
      if (currentUser.success && currentUser.data) {
        return this.getUserPermissions(currentUser.data.id);
      }
      
      return {
        success: false,
        error: 'user_not_found',
        message: 'Could not determine current user',
      };
    } catch (error) {
      return {
        success: false,
        error: 'request_failed',
        message: 'Failed to get current user permissions',
      };
    }
  }

  /**
   * Helper method to get current user info
   */
  private async getCurrentUserInfo(): Promise<ApiResponse<{ id: string; role: UserRole }>> {
    // This would typically call a /me endpoint or similar
    // For now, we'll return a placeholder
    return {
      success: false,
      error: 'not_implemented',
      message: 'Current user info endpoint not implemented',
    };
  }

  /**
   * Check if current user can manage a specific role
   */
  async canManageRole(targetRole: UserRole): Promise<boolean> {
    try {
      const manageableRoles = await this.getManageableRoles();
      if (manageableRoles.success && manageableRoles.data) {
        return manageableRoles.data.manageable_roles.includes(targetRole);
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Get role statistics and distribution
   */
  async getRoleStats(): Promise<ApiResponse<{
    total_roles: number;
    role_distribution: Record<UserRole, number>;
    role_hierarchy: Array<{
      role: UserRole;
      level: number;
      user_count: number;
      permissions_count: number;
    }>;
  }>> {
    try {
      const rolesResponse = await this.getRoles();
      
      if (!rolesResponse.success || !rolesResponse.data) {
        return rolesResponse as any;
      }

      const roles = rolesResponse.data.roles;
      
      // This would ideally come from a dedicated stats endpoint
      // For now, we'll create a basic structure
      const stats = {
        total_roles: roles.length,
        role_distribution: {} as Record<UserRole, number>,
        role_hierarchy: roles.map(role => ({
          role: role.name,
          level: role.level,
          user_count: 0, // Would need to get this from user stats
          permissions_count: role.permissions.length,
        })),
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: 'request_failed',
        message: 'Failed to get role statistics',
      };
    }
  }

  /**
   * Validate if a user can perform a specific operation
   */
  async validateUserOperation(
    userRole: UserRole,
    operation: string,
    targetRole?: UserRole
  ): Promise<boolean> {
    try {
      const validationRequest: ValidateRolePermissionRequest = {
        user_role: userRole,
        required_role: targetRole || 'user',
        operation,
      };

      const response = await this.validateRolePermission(validationRequest);
      return response.success && response.data?.has_permission === true;
    } catch {
      return false;
    }
  }
}

export const roleManagementService = new RoleManagementService();