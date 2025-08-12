// System management types

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  service: string;
  version: string;
  environment: string;
}

export interface CacheStatistics {
  lab_cache: {
    expired_entries: number;
    max_age_hours: number;
    total_available_entries: number;
    total_entries: number;
    valid_entries: number;
  };
  data_cache: {
    cache_enabled: boolean;
    cached_at: string;
    expires_at: string | null;
    is_cached: boolean;
    is_valid: boolean;
    max_age_hours: number;
    total_entries: number;
  };
  timestamp: string;
}

export interface CacheClearResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

export interface GlobalLogoutResponse {
  success: boolean;
  message: string;
  logout_time: string;
  timestamp: string;
}

export interface GlobalLogoutStatus {
  success: boolean;
  global_logout_active: boolean;
  global_logout_time?: string;
  timestamp: string;
}

// System operation types
export type CacheType = 'data' | 'lab';

export interface SystemMetrics {
  uptime: string;
  memory_usage: {
    used: string;
    total: string;
    percentage: number;
  };
  active_sessions: number;
  total_users: number;
  cache_health: 'healthy' | 'degraded';
}

// System alert types
export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

// System configuration
export interface SystemConfig {
  maintenance_mode: boolean;
  registration_enabled: boolean;
  max_users_per_role: Record<string, number>;
  session_timeout_minutes: number;
  cache_ttl_seconds: number;
}

// System dashboard data
export interface SystemDashboardData {
  health: SystemHealth;
  metrics: SystemMetrics;
  cache_stats: CacheStatistics;
  recent_alerts: SystemAlert[];
  global_logout_status: GlobalLogoutStatus;
}