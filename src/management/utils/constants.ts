// Management system constants

// API endpoints
export const MANAGEMENT_API_ENDPOINTS = {
  // User management
  USERS: '/api/v1/users',
  USER_BY_ID: (id: string) => `/api/v1/users/${id}`,
  USER_ACTIVATE: (id: string) => `/api/v1/users/${id}/activate`,
  USER_SEARCH: '/api/v1/users/search',
  USER_BULK_OPERATIONS: '/api/v1/users/bulk-operations',
  USER_PROVIDERS: (id: string) => `/api/v1/users/${id}/providers`,
  USER_AUDIT: (id: string) => `/api/v1/users/${id}/audit`,

  // Role management
  ROLES: '/api/v1/roles',
  CHANGE_USER_ROLE: (id: string) => `/api/v1/roles/users/${id}/role`,
  USER_PERMISSIONS: (id: string) => `/api/v1/roles/users/${id}/permissions`,
  MANAGEABLE_ROLES: '/api/v1/roles/manageable',
  VALIDATE_ROLE_PERMISSION: '/api/v1/roles/validate',

  // System management
  HEALTH_CHECK: '/v1/management/health',
  CACHE_STATS: '/v1/management/cache-stats',
  CLEAR_DATA_CACHE: '/v1/management/cache/data/clear',
  CLEAR_LAB_CACHE: '/v1/management/cache/lab/clear',
  GLOBAL_LOGOUT: '/v1/admin/global-logout',
  GLOBAL_LOGOUT_STATUS: '/v1/admin/global-logout/status',
  CLEAR_GLOBAL_LOGOUT: '/v1/admin/clear-global-logout',
} as const;

// Role hierarchy and permissions
export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
} as const;

export const ROLE_LEVELS = {
  [USER_ROLES.OWNER]: 99999,
  [USER_ROLES.ADMIN]: 9000,
  [USER_ROLES.MODERATOR]: 5000,
  [USER_ROLES.USER]: 100,
} as const;

// Permissions
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

// Bulk operations
export const BULK_OPERATIONS = {
  ACTIVATE: 'ACTIVATE',
  DEACTIVATE: 'DEACTIVATE',
  ROLE_CHANGE: 'ROLE_CHANGE',
  DELETE: 'DELETE',
} as const;

// Audit actions
export const AUDIT_ACTIONS = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  ROLE_CHANGE: 'ROLE_CHANGE',
  ACTIVATE: 'ACTIVATE',
  DEACTIVATE: 'DEACTIVATE',
} as const;

// OAuth providers
export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
  GITHUB: 'github',
} as const;

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 50,
  MAX_LIMIT: 100,
} as const;

// Search configuration
export const SEARCH_CONFIG = {
  MIN_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
} as const;

// Cache types
export const CACHE_TYPES = {
  DATA: 'data',
  LAB: 'lab',
} as const;

// System health statuses
export const HEALTH_STATUSES = {
  HEALTHY: 'healthy',
  DEGRADED: 'degraded',
  UNHEALTHY: 'unhealthy',
} as const;

// Alert types
export const ALERT_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// UI constants
export const UI_CONSTANTS = {
  SIDEBAR_WIDTH: '16rem',
  MOBILE_BREAKPOINT: '768px',
  TOAST_DURATION: 5000,
  LOADING_DELAY: 200,
} as const;

// Color schemes for roles
export const ROLE_COLORS = {
  [USER_ROLES.OWNER]: {
    text: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/30',
    full: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  },
  [USER_ROLES.ADMIN]: {
    text: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/30',
    full: 'text-red-400 bg-red-400/10 border-red-400/30',
  },
  [USER_ROLES.MODERATOR]: {
    text: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
    full: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  },
  [USER_ROLES.USER]: {
    text: 'text-green-400',
    bg: 'bg-green-400/10',
    border: 'border-green-400/30',
    full: 'text-green-400 bg-green-400/10 border-green-400/30',
  },
} as const;

// Icons for roles
export const ROLE_ICONS = {
  [USER_ROLES.OWNER]: '👑',
  [USER_ROLES.ADMIN]: '🛡️',
  [USER_ROLES.MODERATOR]: '⚖️',
  [USER_ROLES.USER]: '👤',
} as const;

export const PROVIDER_ICONS = {
  [OAUTH_PROVIDERS.GOOGLE]: '🔍',
  [OAUTH_PROVIDERS.GITHUB]: '🐙',
} as const;