// Custom hook for system health monitoring

import { useState, useEffect, useCallback } from 'react';
import { useSystem } from '../context/SystemContext';
import { systemManagementService } from '../services/systemManagementService';
import { formatHealthStatus, formatHitRate, formatFileSize } from '../utils/formatters';
import type { 
  SystemHealth, 
  CacheStatistics, 
  GlobalLogoutStatus, 
  SystemDashboardData,
  SystemAlert,
  CacheType 
} from '../types/system';

export interface SystemHealthMetrics {
  isHealthy: boolean;
  healthScore: number; // 0-100
  criticalIssues: string[];
  warnings: string[];
  recommendations: string[];
}

export interface UseSystemHealthOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
  enableAlerts?: boolean;
}

export interface UseSystemHealthReturn {
  // Data
  health: SystemHealth | null;
  cacheStats: CacheStatistics | null;
  globalLogoutStatus: GlobalLogoutStatus | null;
  dashboardData: SystemDashboardData | null;
  alerts: SystemAlert[];
  
  // Loading states
  isLoading: boolean;
  isLoadingHealth: boolean;
  isLoadingCache: boolean;
  isLoadingLogout: boolean;
  
  // Error states
  error: string | null;
  healthError: string | null;
  cacheError: string | null;
  logoutError: string | null;
  
  // Health analysis
  healthMetrics: SystemHealthMetrics;
  cacheHealthStatus: 'healthy' | 'degraded' | 'unhealthy';
  
  // Operations
  loadSystemHealth: () => Promise<void>;
  loadCacheStats: () => Promise<void>;
  loadGlobalLogoutStatus: () => Promise<void>;
  loadDashboard: () => Promise<void>;
  clearCache: (type: CacheType) => Promise<boolean>;
  triggerGlobalLogout: () => Promise<boolean>;
  clearGlobalLogout: () => Promise<boolean>;
  
  // Alert management
  loadAlerts: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<boolean>;
  acknowledgeAllAlerts: () => Promise<boolean>;
  getUnacknowledgedCount: () => number;
  
  // Auto-refresh control
  enableAutoRefresh: (enabled: boolean) => void;
  setRefreshInterval: (seconds: number) => void;
  isAutoRefreshEnabled: () => boolean;
  
  // Health analysis
  analyzeSystemHealth: () => SystemHealthMetrics;
  getCacheHealth: () => { status: string; details: string };
  getSystemUptime: () => string;
  
  // Formatting helpers
  formatHealthStatus: (status: string) => { text: string; className: string; icon: string };
  formatCacheHitRate: (rate: number) => string;
  formatCacheSize: (size: string) => string;
  
  // Utility
  refreshAll: () => Promise<void>;
  clearErrors: () => void;
  exportHealthReport: () => string;
}

export const useSystemHealth = (options: UseSystemHealthOptions = {}): UseSystemHealthReturn => {
  const { 
    autoRefresh = false, 
    refreshInterval = 30, 
    enableAlerts = true 
  } = options;
  
  const systemContext = useSystem();
  
  const [healthMetrics, setHealthMetrics] = useState<SystemHealthMetrics>({
    isHealthy: true,
    healthScore: 100,
    criticalIssues: [],
    warnings: [],
    recommendations: [],
  });

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      systemContext.enableAutoRefresh(true);
      systemContext.setAutoRefreshInterval(refreshInterval);
    }
    
    return () => {
      if (autoRefresh) {
        systemContext.enableAutoRefresh(false);
      }
    };
  }, [autoRefresh, refreshInterval, systemContext]);

  // Update health metrics when system data changes
  useEffect(() => {
    setHealthMetrics(analyzeSystemHealth());
  }, [
    systemContext.state.health,
    systemContext.state.cacheStats,
    systemContext.state.alerts,
    systemContext.state.globalLogoutStatus,
  ]);

  const loadSystemHealth = useCallback(async () => {
    await systemContext.loadHealth();
  }, [systemContext]);

  const loadCacheStats = useCallback(async () => {
    await systemContext.loadCacheStats();
  }, [systemContext]);

  const loadGlobalLogoutStatus = useCallback(async () => {
    await systemContext.loadGlobalLogoutStatus();
  }, [systemContext]);

  const loadDashboard = useCallback(async () => {
    await systemContext.loadDashboard();
  }, [systemContext]);

  const clearCache = useCallback(async (type: CacheType): Promise<boolean> => {
    return await systemContext.clearCache(type);
  }, [systemContext]);

  const triggerGlobalLogout = useCallback(async (): Promise<boolean> => {
    return await systemContext.triggerGlobalLogout();
  }, [systemContext]);

  const clearGlobalLogout = useCallback(async (): Promise<boolean> => {
    return await systemContext.clearGlobalLogout();
  }, [systemContext]);

  const loadAlerts = useCallback(async () => {
    await systemContext.loadAlerts();
  }, [systemContext]);

  const acknowledgeAlert = useCallback(async (alertId: string): Promise<boolean> => {
    return await systemContext.acknowledgeAlert(alertId);
  }, [systemContext]);

  const acknowledgeAllAlerts = useCallback(async (): Promise<boolean> => {
    return await systemContext.acknowledgeAllAlerts();
  }, [systemContext]);

  const getUnacknowledgedCount = useCallback((): number => {
    return systemContext.state.unacknowledgedCount;
  }, [systemContext.state.unacknowledgedCount]);

  const enableAutoRefresh = useCallback((enabled: boolean) => {
    systemContext.enableAutoRefresh(enabled);
  }, [systemContext]);

  const setRefreshInterval = useCallback((seconds: number) => {
    systemContext.setAutoRefreshInterval(seconds);
  }, [systemContext]);

  const isAutoRefreshEnabled = useCallback((): boolean => {
    return systemContext.state.autoRefreshEnabled;
  }, [systemContext.state.autoRefreshEnabled]);

  const analyzeSystemHealth = useCallback((): SystemHealthMetrics => {
    const { health, cacheStats, alerts, globalLogoutStatus } = systemContext.state;
    
    let healthScore = 100;
    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Analyze system health
    if (health) {
      if (health.status === 'unhealthy') {
        healthScore -= 40;
        criticalIssues.push('System is unhealthy');
      } else if (health.status === 'degraded') {
        healthScore -= 20;
        warnings.push('System performance is degraded');
      }
    } else {
      healthScore -= 30;
      criticalIssues.push('Unable to determine system health');
    }

    // Analyze cache performance
    if (cacheStats) {
      const { lab_cache } = cacheStats;
      
      if (lab_cache.hit_rate < 50) {
        healthScore -= 25;
        criticalIssues.push(`Lab cache hit rate is critically low: ${lab_cache.hit_rate.toFixed(1)}%`);
      } else if (lab_cache.hit_rate < 80) {
        healthScore -= 10;
        warnings.push(`Lab cache hit rate is below optimal: ${lab_cache.hit_rate.toFixed(1)}%`);
      }
      
      if (lab_cache.hit_rate < 90) {
        recommendations.push('Consider clearing cache or investigating cache performance');
      }
    } else {
      healthScore -= 15;
      warnings.push('Cache statistics unavailable');
    }

    // Analyze alerts
    const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
    const criticalAlerts = unacknowledgedAlerts.filter(alert => alert.type === 'error');
    const warningAlerts = unacknowledgedAlerts.filter(alert => alert.type === 'warning');

    if (criticalAlerts.length > 0) {
      healthScore -= criticalAlerts.length * 10;
      criticalIssues.push(`${criticalAlerts.length} critical alert(s) require attention`);
    }

    if (warningAlerts.length > 0) {
      healthScore -= warningAlerts.length * 5;
      warnings.push(`${warningAlerts.length} warning alert(s) pending`);
    }

    if (unacknowledgedAlerts.length > 5) {
      recommendations.push('Review and acknowledge pending alerts');
    }

    // Analyze global logout status
    if (globalLogoutStatus?.global_logout_active) {
      healthScore -= 15;
      warnings.push('Global logout is active - all user sessions are invalidated');
      recommendations.push('Consider clearing global logout if issue has been resolved');
    }

    // Ensure health score doesn't go below 0
    healthScore = Math.max(0, healthScore);

    return {
      isHealthy: healthScore >= 80 && criticalIssues.length === 0,
      healthScore,
      criticalIssues,
      warnings,
      recommendations,
    };
  }, [systemContext.state]);

  const getCacheHealth = useCallback(() => {
    return systemContext.getCacheHealthStatus();
  }, [systemContext]);

  const getSystemUptime = useCallback((): string => {
    const dashboardData = systemContext.state.dashboardData;
    return dashboardData?.metrics.uptime || 'Unknown';
  }, [systemContext.state.dashboardData]);

  const formatHealthStatusHelper = useCallback((status: string) => {
    return formatHealthStatus(status);
  }, []);

  const formatCacheHitRate = useCallback((rate: number): string => {
    return formatHitRate(rate);
  }, []);

  const formatCacheSize = useCallback((size: string): string => {
    return formatFileSize(size);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      loadSystemHealth(),
      loadCacheStats(),
      loadGlobalLogoutStatus(),
      enableAlerts ? loadAlerts() : Promise.resolve(),
    ]);
  }, [loadSystemHealth, loadCacheStats, loadGlobalLogoutStatus, loadAlerts, enableAlerts]);

  const clearErrors = useCallback(() => {
    systemContext.clearErrors();
  }, [systemContext]);

  const exportHealthReport = useCallback((): string => {
    const { health, cacheStats, alerts, globalLogoutStatus, dashboardData } = systemContext.state;
    
    const report = {
      timestamp: new Date().toISOString(),
      system_health: health,
      cache_statistics: cacheStats,
      global_logout_status: globalLogoutStatus,
      alerts: alerts,
      metrics: dashboardData?.metrics,
      health_analysis: healthMetrics,
    };

    return JSON.stringify(report, null, 2);
  }, [systemContext.state, healthMetrics]);

  return {
    // Data
    health: systemContext.state.health,
    cacheStats: systemContext.state.cacheStats,
    globalLogoutStatus: systemContext.state.globalLogoutStatus,
    dashboardData: systemContext.state.dashboardData,
    alerts: systemContext.state.alerts,
    
    // Loading states
    isLoading: systemContext.state.dashboardLoading,
    isLoadingHealth: systemContext.state.healthLoading,
    isLoadingCache: systemContext.state.cacheStatsLoading,
    isLoadingLogout: systemContext.state.globalLogoutLoading,
    
    // Error states
    error: systemContext.state.dashboardError,
    healthError: systemContext.state.healthError,
    cacheError: systemContext.state.cacheStatsError,
    logoutError: systemContext.state.globalLogoutError,
    
    // Health analysis
    healthMetrics,
    cacheHealthStatus: systemContext.getCacheHealthStatus(),
    
    // Operations
    loadSystemHealth,
    loadCacheStats,
    loadGlobalLogoutStatus,
    loadDashboard,
    clearCache,
    triggerGlobalLogout,
    clearGlobalLogout,
    
    // Alert management
    loadAlerts,
    acknowledgeAlert,
    acknowledgeAllAlerts,
    getUnacknowledgedCount,
    
    // Auto-refresh control
    enableAutoRefresh,
    setRefreshInterval,
    isAutoRefreshEnabled,
    
    // Health analysis
    analyzeSystemHealth,
    getCacheHealth,
    getSystemUptime,
    
    // Formatting helpers
    formatHealthStatus: formatHealthStatusHelper,
    formatCacheHitRate,
    formatCacheSize,
    
    // Utility
    refreshAll,
    clearErrors,
    exportHealthReport,
  };
};