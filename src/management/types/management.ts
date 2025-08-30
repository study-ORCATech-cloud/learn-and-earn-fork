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

// Contact management types
export interface ContactMessage {
  id: string;
  name: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  message: string;
  ip_address?: string;
  user_agent?: string;
  country?: string;
  city?: string;
  status: 'NEW' | 'READ' | 'IN_PROGRESS' | 'RESOLVED' | 'SPAM';
  created_at: string;
  read_at?: string;
  resolved_at?: string;
  acknowledgment_sent: boolean;
  acknowledgment_sent_at?: string;
  admin_notes?: string;
  assigned_to?: string;
}

export interface ContactMessageResponse {
  success: boolean;
  messages: ContactMessage[];
  pagination: {
    page: number;
    per_page: number;
    total_pages: number;
    total_items: number;
    has_next: boolean;
    has_prev: boolean;
    next_page?: number;
    prev_page?: number;
  };
  filters: {
    status?: string;
    search?: string;
  };
  stats: {
    total_messages: number;
    new_messages: number;
    in_progress: number;
    resolved: number;
  };
}

export interface ContactSystemHealth {
  status: string;
  message: string;
  stats: {
    total_messages: number;
    email_enabled: boolean;
    geolocation_enabled: boolean;
    rate_limit_per_hour: number;
  };
}

export interface ContactFilters {
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface ContactMessageUpdate {
  status?: 'NEW' | 'READ' | 'IN_PROGRESS' | 'RESOLVED' | 'SPAM';
  admin_notes?: string;
  assigned_to?: string;
}

// Management operation types
export type BulkOperation = 'ACTIVATE' | 'DEACTIVATE' | 'ROLE_CHANGE' | 'DELETE';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'ROLE_CHANGE' | 'ACTIVATE' | 'DEACTIVATE';