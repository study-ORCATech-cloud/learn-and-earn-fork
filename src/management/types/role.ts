// Role and permission management types

export type UserRole = 'owner' | 'admin' | 'moderator' | 'user';

export interface Role {
  name: UserRole;
  level: number;
  permissions: string[];
}

export interface PermissionMetadata {
  display_name: string;
  description: string;
  category: string;
}

export interface CategoryMetadata {
  label: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
}

export interface RoleMetadata {
  display_name: string;
  description: string;
  icon: string;
  color: string;
  level: number;
  can_be_assigned_via_ui: boolean;
}

export interface UIConfiguration {
  permission_categorization_rules: Array<{
    rule: string;
    category: string;
    priority: number;
  }>;
  color_mapping: Record<string, {
    text: string;
    bg: string;
    border: string;
  }>;
  icon_mapping: Record<string, string>;
}

export interface RoleHierarchy {
  roles: Role[];
  levels: Record<UserRole, number>;
  permissions: Record<UserRole, string[]>;
  permission_metadata?: Record<string, PermissionMetadata>;
  category_metadata?: Record<string, CategoryMetadata>;
  role_metadata?: Record<string, RoleMetadata>;
  ui_configuration?: UIConfiguration;
}

export interface ChangeUserRoleRequest {
  role: UserRole;
  reason?: string;
}

export interface ChangeUserRoleResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
  old_role: UserRole;
  new_role: UserRole;
  changed_by: string;
  reason?: string;
}

export interface UserPermissions {
  user_id: string;
  email: string;
  role: UserRole;
  role_level: number;
  permissions: string[];
  can_manage_roles: UserRole[];
  effective_permissions: {
    can_view_all_users: boolean;
    can_create_users: boolean;
    can_edit_all_users: boolean;
    can_delete_users: boolean;
    can_change_roles: boolean;
    can_view_audit_logs: boolean;
    can_bulk_operations: boolean;
    can_manage_system: boolean;
  };
}

export interface ManageableRoles {
  current_user_role: UserRole;
  manageable_roles: UserRole[];
  detailed_roles: Role[];
}

export interface ValidateRolePermissionRequest {
  user_role: UserRole;
  required_role: UserRole;
  operation: string;
}

export interface ValidateRolePermissionResponse {
  user_role: UserRole;
  required_role: UserRole;
  operation: string;
  has_permission: boolean;
  validation_details: {
    user_role_level: number;
    required_role_level: number;
  };
}

// Permission constants
export const PERMISSIONS = {
  VIEW_ALL_USERS: 'view_all_users',
  CREATE_USERS: 'create_users',
  EDIT_ALL_USERS: 'edit_all_users',
  DELETE_USERS: 'delete_users',
  CHANGE_ALL_ROLES: 'change_all_roles',
  CHANGE_ADMIN_AND_BELOW_ROLES: 'change_admin_and_below_roles',
  EDIT_USER_ROLE_ONLY: 'edit_user_role_only',
  CHANGE_USER_ROLE_ONLY: 'change_user_role_only',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  MANAGE_SYSTEM: 'manage_system',
  BULK_OPERATIONS: 'bulk_operations',
  VIEW_OWN_PROFILE: 'view_own_profile',
  EDIT_OWN_PROFILE: 'edit_own_profile',
} as const;

// Role level constants
export const ROLE_LEVELS = {
  owner: 99999,
  admin: 9000,
  moderator: 5000,
  user: 100,
} as const;

// Role hierarchy helper functions
export const canManageRole = (currentUserRole: UserRole, targetRole: UserRole): boolean => {
  const currentLevel = ROLE_LEVELS[currentUserRole];
  const targetLevel = ROLE_LEVELS[targetRole];
  return currentLevel > targetLevel;
};

export const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case 'owner':
      return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
    case 'admin':
      return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'moderator':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'user':
      return 'text-green-400 bg-green-400/10 border-green-400/30';
    default:
      return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
  }
};

export const getRoleIcon = (role: UserRole): string => {
  switch (role) {
    case 'owner':
      return '👑';
    case 'admin':
      return '🛡️';
    case 'moderator':
      return '⚖️';
    case 'user':
      return '👤';
    default:
      return '❓';
  }
};