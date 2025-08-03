// Core management types and interfaces

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  field?: string;
}

export interface PaginationInfo {
  page: number;
  pages: number;
  per_page: number;
  total: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface FilterOptions {
  role?: string;
  search?: string;
  provider?: string;
  is_active?: boolean;
}

export interface BulkOperationResult<T = any> {
  operation: string;
  total_users: number;
  successful: Array<{
    user_id: string;
    result: T;
  }>;
  failed: Array<{
    user_id: string;
    error: string;
  }>;
  summary: {
    successful_count: number;
    failed_count: number;
    success_rate: number;
  };
}

export interface AuditLogEntry {
  id: string;
  action: string;
  resource_type: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  reason?: string;
  performed_by: string;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  environment: string;
}

export interface CacheStats {
  lab_cache: {
    hits: number;
    misses: number;
    hit_rate: number;
  };
  data_cache: {
    size: string;
    entries: number;
  };
  timestamp: string;
}

export interface GlobalLogoutStatus {
  global_logout_active: boolean;
  global_logout_time?: string;
  timestamp: string;
}

// Management operation types
export type BulkOperation = 'ACTIVATE' | 'DEACTIVATE' | 'ROLE_CHANGE' | 'DELETE';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'ROLE_CHANGE' | 'ACTIVATE' | 'DEACTIVATE';