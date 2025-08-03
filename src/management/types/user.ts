// User management types

export interface ManagementUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  provider_count?: number; // For admins only
  last_login_ago?: string; // For admins only
}

export interface UserDetails extends ManagementUser {
  providers: UserProvider[];
  recent_activity?: AuditLogEntry[]; // For admins only
}

export interface UserProvider {
  id: string;
  provider: 'google' | 'github';
  provider_email: string;
  provider_name?: string;
  is_primary: boolean;
  linked_at: string;
  last_used: string;
  avatar_url?: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role?: UserRole;
  avatar_url?: string;
}

export interface UpdateUserRequest {
  name?: string;
  avatar_url?: string;
}

export interface DeactivateUserRequest {
  reason?: string;
}

export interface ActivateUserRequest {
  reason?: string;
}

export interface BulkUserOperationRequest {
  operation: BulkOperation;
  user_ids: string[];
  role?: UserRole; // Required for ROLE_CHANGE
  reason?: string;
}

export interface UserListResponse {
  users: ManagementUser[];
  pagination: PaginationInfo;
  filters_applied: FilterOptions;
}

export interface UserProvidersResponse {
  user_id: string;
  email: string;
  providers: UserProvider[];
  provider_count: number;
}

export interface UserAuditResponse {
  user_id: string;
  audit_logs: AuditLogEntry[];
  pagination: PaginationInfo;
  filters: {
    action?: string;
    start_date?: string;
    end_date?: string;
  };
}

export interface SearchUsersResponse {
  query: string;
  results: Pick<ManagementUser, 'id' | 'email' | 'name' | 'role' | 'avatar_url'>[];
  count: number;
}

// User management state
export interface UserFilters {
  role?: UserRole;
  search?: string;
  provider?: 'google' | 'github';
  is_active?: boolean;
}

export interface UserSortConfig {
  field: keyof ManagementUser;
  direction: 'asc' | 'desc';
}

// Import types from main auth system
import type { AuditLogEntry, PaginationInfo, FilterOptions, BulkOperation } from './management';

export type UserRole = 'owner' | 'admin' | 'moderator' | 'user';