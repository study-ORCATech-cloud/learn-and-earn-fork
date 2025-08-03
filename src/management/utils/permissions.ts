// Permission checking utilities

import { UserRole, ROLE_LEVELS, PERMISSIONS } from './constants';
import type { UserPermissions } from '../types/role';

/**
 * Check if a user role has sufficient level to perform an action on a target role
 */
export const canManageRole = (userRole: UserRole, targetRole: UserRole): boolean => {
  const userLevel = ROLE_LEVELS[userRole];
  const targetLevel = ROLE_LEVELS[targetRole];
  return userLevel > targetLevel;
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (userPermissions: UserPermissions, permission: string): boolean => {
  return userPermissions.permissions.includes(permission);
};

/**
 * Check if a user can view all users
 */
export const canViewAllUsers = (userRole: UserRole): boolean => {
  return userRole === 'owner' || userRole === 'admin' || userRole === 'moderator';
};

/**
 * Check if a user can create users
 */
export const canCreateUsers = (userRole: UserRole): boolean => {
  return userRole === 'owner' || userRole === 'admin';
};

/**
 * Check if a user can edit all users
 */
export const canEditAllUsers = (userRole: UserRole): boolean => {
  return userRole === 'owner' || userRole === 'admin';
};

/**
 * Check if a user can delete users
 */
export const canDeleteUsers = (userRole: UserRole): boolean => {
  return userRole === 'owner' || userRole === 'admin';
};

/**
 * Check if a user can perform bulk operations
 */
export const canPerformBulkOperations = (userRole: UserRole): boolean => {
  return userRole === 'owner' || userRole === 'admin';
};

/**
 * Check if a user can view audit logs
 */
export const canViewAuditLogs = (userRole: UserRole): boolean => {
  return userRole === 'owner' || userRole === 'admin';
};

/**
 * Check if a user can manage system settings
 */
export const canManageSystem = (userRole: UserRole): boolean => {
  return userRole === 'owner' || userRole === 'admin';
};

/**
 * Check if a user can change roles
 */
export const canChangeRoles = (userRole: UserRole, targetRole?: UserRole): boolean => {
  if (userRole === 'owner') {
    return true; // Owner can change any role except owner (which can't be assigned via API)
  }
  
  if (userRole === 'admin') {
    return !targetRole || canManageRole(userRole, targetRole);
  }
  
  if (userRole === 'moderator') {
    return targetRole === 'user'; // Moderators can only change user roles
  }
  
  return false;
};

/**
 * Get list of roles that a user can assign to others
 */
export const getManageableRoles = (userRole: UserRole): UserRole[] => {
  switch (userRole) {
    case 'owner':
      return ['admin', 'moderator', 'user'];
    case 'admin':
      return ['moderator', 'user'];
    case 'moderator':
      return ['user'];
    default:
      return [];
  }
};

/**
 * Check if a user can edit a specific user
 */
export const canEditUser = (userRole: UserRole, currentUserId: string, targetUserId: string, targetUserRole?: UserRole): boolean => {
  // Users can always edit their own profile
  if (currentUserId === targetUserId) {
    return true;
  }
  
  // Check role-based permissions
  if (userRole === 'owner') {
    return true;
  }
  
  if (userRole === 'admin') {
    return !targetUserRole || canManageRole(userRole, targetUserRole);
  }
  
  if (userRole === 'moderator') {
    return targetUserRole === 'user';
  }
  
  return false;
};

/**
 * Check if a user can deactivate another user
 */
export const canDeactivateUser = (userRole: UserRole, currentUserId: string, targetUserId: string, targetUserRole?: UserRole): boolean => {
  // Users cannot deactivate themselves
  if (currentUserId === targetUserId) {
    return false;
  }
  
  // Only admins and owners can deactivate users
  if (userRole === 'owner') {
    return true;
  }
  
  if (userRole === 'admin') {
    return !targetUserRole || canManageRole(userRole, targetUserRole);
  }
  
  return false;
};

/**
 * Check if a user can access the management interface
 */
export const canAccessManagement = (userRole: UserRole): boolean => {
  return userRole === 'owner' || userRole === 'admin' || userRole === 'moderator';
};

/**
 * Get effective permissions for a user role
 */
export const getEffectivePermissions = (userRole: UserRole) => {
  return {
    can_view_all_users: canViewAllUsers(userRole),
    can_create_users: canCreateUsers(userRole),
    can_edit_all_users: canEditAllUsers(userRole),
    can_delete_users: canDeleteUsers(userRole),
    can_change_roles: canChangeRoles(userRole),
    can_view_audit_logs: canViewAuditLogs(userRole),
    can_bulk_operations: canPerformBulkOperations(userRole),
    can_manage_system: canManageSystem(userRole),
  };
};

/**
 * Validate if a user can perform a specific operation
 */
export const validateOperation = (
  userRole: UserRole,
  operation: string,
  targetRole?: UserRole,
  currentUserId?: string,
  targetUserId?: string
): boolean => {
  switch (operation) {
    case 'view_users':
      return canViewAllUsers(userRole);
    case 'create_user':
      return canCreateUsers(userRole);
    case 'edit_user':
      return currentUserId && targetUserId 
        ? canEditUser(userRole, currentUserId, targetUserId, targetRole)
        : canEditAllUsers(userRole);
    case 'delete_user':
      return currentUserId && targetUserId
        ? canDeactivateUser(userRole, currentUserId, targetUserId, targetRole)
        : canDeleteUsers(userRole);
    case 'change_role':
      return canChangeRoles(userRole, targetRole);
    case 'bulk_operations':
      return canPerformBulkOperations(userRole);
    case 'view_audit':
      return canViewAuditLogs(userRole);
    case 'manage_system':
      return canManageSystem(userRole);
    default:
      return false;
  }
};