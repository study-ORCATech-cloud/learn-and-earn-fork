// System management context for system health and operations

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { systemManagementService } from '../services/systemManagementService';
import type { 
  SystemHealth, 
  CacheStatistics, 
  GlobalLogoutStatus, 
  SystemDashboardData,
  SystemMetrics,
  SystemAlert,
  CacheType 
} from '../types/system';

interface SystemState {
  // Dashboard data
  dashboardData: SystemDashboardData | null;
  dashboardLoading: boolean;
  dashboardError: string | null;
  
  // System health
  health: SystemHealth | null;
  healthLoading: boolean;
  healthError: string | null;
  
  // Cache statistics
  cacheStats: CacheStatistics | null;
  cacheStatsLoading: boolean;
  cacheStatsError: string | null;
  
  // Cache operations
  cacheOperationInProgress: boolean;
  lastCacheOperation: {
    type: CacheType;
    success: boolean;
    message: string;
    timestamp: string;
  } | null;
  
  // Global logout
  globalLogoutStatus: GlobalLogoutStatus | null;
  globalLogoutLoading: boolean;
  globalLogoutError: string | null;
  
  // System alerts
  alerts: SystemAlert[];
  alertsLoading: boolean;
  alertsError: string | null;
  unacknowledgedCount: number;
  
  // Auto-refresh
  autoRefreshEnabled: boolean;
  autoRefreshInterval: number; // in seconds
}

type SystemAction =
  | { type: 'SET_DASHBOARD_LOADING'; payload: boolean }
  | { type: 'SET_DASHBOARD_DATA'; payload: SystemDashboardData }
  | { type: 'SET_DASHBOARD_ERROR'; payload: string | null }
  | { type: 'SET_HEALTH_LOADING'; payload: boolean }
  | { type: 'SET_HEALTH'; payload: SystemHealth }
  | { type: 'SET_HEALTH_ERROR'; payload: string | null }
  | { type: 'SET_CACHE_STATS_LOADING'; payload: boolean }
  | { type: 'SET_CACHE_STATS'; payload: CacheStatistics }
  | { type: 'SET_CACHE_STATS_ERROR'; payload: string | null }
  | { type: 'SET_CACHE_OPERATION_IN_PROGRESS'; payload: boolean }
  | { type: 'SET_LAST_CACHE_OPERATION'; payload: { type: CacheType; success: boolean; message: string; timestamp: string } | null }
  | { type: 'SET_GLOBAL_LOGOUT_LOADING'; payload: boolean }
  | { type: 'SET_GLOBAL_LOGOUT_STATUS'; payload: GlobalLogoutStatus }
  | { type: 'SET_GLOBAL_LOGOUT_ERROR'; payload: string | null }
  | { type: 'SET_ALERTS_LOADING'; payload: boolean }
  | { type: 'SET_ALERTS'; payload: SystemAlert[] }
  | { type: 'SET_ALERTS_ERROR'; payload: string | null }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: string }
  | { type: 'SET_AUTO_REFRESH_ENABLED'; payload: boolean }
  | { type: 'SET_AUTO_REFRESH_INTERVAL'; payload: number };

const initialState: SystemState = {
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,
  health: null,
  healthLoading: false,
  healthError: null,
  cacheStats: null,
  cacheStatsLoading: false,
  cacheStatsError: null,
  cacheOperationInProgress: false,
  lastCacheOperation: null,
  globalLogoutStatus: null,
  globalLogoutLoading: false,
  globalLogoutError: null,
  alerts: [],
  alertsLoading: false,
  alertsError: null,
  unacknowledgedCount: 0,
  autoRefreshEnabled: true,
  autoRefreshInterval: 30, // 30 seconds
};

function systemReducer(state: SystemState, action: SystemAction): SystemState {
  switch (action.type) {
    case 'SET_DASHBOARD_LOADING':
      return { ...state, dashboardLoading: action.payload };
    
    case 'SET_DASHBOARD_DATA':
      return { 
        ...state, 
        dashboardData: action.payload,
        dashboardLoading: false,
        dashboardError: null,
      };
    
    case 'SET_DASHBOARD_ERROR':
      return { ...state, dashboardError: action.payload, dashboardLoading: false };
    
    case 'SET_HEALTH_LOADING':
      return { ...state, healthLoading: action.payload };
    
    case 'SET_HEALTH':
      return { 
        ...state, 
        health: action.payload,
        healthLoading: false,
        healthError: null,
      };
    
    case 'SET_HEALTH_ERROR':
      return { ...state, healthError: action.payload, healthLoading: false };
    
    case 'SET_CACHE_STATS_LOADING':
      return { ...state, cacheStatsLoading: action.payload };
    
    case 'SET_CACHE_STATS':
      return { 
        ...state, 
        cacheStats: action.payload,
        cacheStatsLoading: false,
        cacheStatsError: null,
      };
    
    case 'SET_CACHE_STATS_ERROR':
      return { ...state, cacheStatsError: action.payload, cacheStatsLoading: false };
    
    case 'SET_CACHE_OPERATION_IN_PROGRESS':
      return { ...state, cacheOperationInProgress: action.payload };
    
    case 'SET_LAST_CACHE_OPERATION':
      return { ...state, lastCacheOperation: action.payload };
    
    case 'SET_GLOBAL_LOGOUT_LOADING':
      return { ...state, globalLogoutLoading: action.payload };
    
    case 'SET_GLOBAL_LOGOUT_STATUS':
      return { 
        ...state, 
        globalLogoutStatus: action.payload,
        globalLogoutLoading: false,
        globalLogoutError: null,
      };
    
    case 'SET_GLOBAL_LOGOUT_ERROR':
      return { ...state, globalLogoutError: action.payload, globalLogoutLoading: false };
    
    case 'SET_ALERTS_LOADING':
      return { ...state, alertsLoading: action.payload };
    
    case 'SET_ALERTS':
      const alerts = action.payload;
      const unacknowledgedCount = alerts.filter(alert => !alert.acknowledged).length;
      return { 
        ...state, 
        alerts,
        unacknowledgedCount,
        alertsLoading: false,
        alertsError: null,
      };
    
    case 'SET_ALERTS_ERROR':
      return { ...state, alertsError: action.payload, alertsLoading: false };
    
    case 'ACKNOWLEDGE_ALERT':
      const alertId = action.payload;
      const updatedAlerts = state.alerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      );
      const newUnacknowledgedCount = updatedAlerts.filter(alert => !alert.acknowledged).length;
      return { 
        ...state, 
        alerts: updatedAlerts,
        unacknowledgedCount: newUnacknowledgedCount,
      };
    
    case 'SET_AUTO_REFRESH_ENABLED':
      return { ...state, autoRefreshEnabled: action.payload };
    
    case 'SET_AUTO_REFRESH_INTERVAL':
      return { ...state, autoRefreshInterval: action.payload };
    
    default:
      return state;
  }
}

interface SystemContextType {
  state: SystemState;
  
  // Dashboard operations
  loadDashboard: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  
  // Health operations
  loadHealth: () => Promise<void>;
  refreshHealth: () => Promise<void>;
  
  // Cache operations
  loadCacheStats: () => Promise<void>;
  clearCache: (type: CacheType) => Promise<boolean>;
  refreshCacheStats: () => Promise<void>;
  
  // Global logout operations
  loadGlobalLogoutStatus: () => Promise<void>;
  triggerGlobalLogout: () => Promise<boolean>;
  clearGlobalLogout: () => Promise<boolean>;
  
  // Alert operations
  loadAlerts: () => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<boolean>;
  acknowledgeAllAlerts: () => Promise<boolean>;
  
  // Auto-refresh operations
  enableAutoRefresh: (enabled: boolean) => void;
  setAutoRefreshInterval: (seconds: number) => void;
  
  // Utility functions
  clearErrors: () => void;
  isSystemHealthy: () => boolean;
  getCacheHealthStatus: () => 'healthy' | 'degraded' | 'unhealthy';
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};

interface SystemProviderProps {
  children: ReactNode;
}

export const SystemProvider: React.FC<SystemProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(systemReducer, initialState);

  const loadDashboard = useCallback(async () => {
    try {
      dispatch({ type: 'SET_DASHBOARD_LOADING', payload: true });
      
      const response = await systemManagementService.getSystemDashboard();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_DASHBOARD_DATA', payload: response.data });
      } else {
        dispatch({ type: 'SET_DASHBOARD_ERROR', payload: response.message || 'Failed to load dashboard' });
      }
    } catch (error) {
      dispatch({ type: 'SET_DASHBOARD_ERROR', payload: 'Failed to load dashboard' });
    }
  }, []);

  const refreshDashboard = useCallback(async () => {
    await loadDashboard();
  }, [loadDashboard]);

  const loadHealth = useCallback(async () => {
    try {
      dispatch({ type: 'SET_HEALTH_LOADING', payload: true });
      
      const response = await systemManagementService.getHealthCheck();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_HEALTH', payload: response.data });
      } else {
        dispatch({ type: 'SET_HEALTH_ERROR', payload: response.message || 'Failed to load health status' });
      }
    } catch (error) {
      dispatch({ type: 'SET_HEALTH_ERROR', payload: 'Failed to load health status' });
    }
  }, []);

  const refreshHealth = useCallback(async () => {
    await loadHealth();
  }, [loadHealth]);

  const loadCacheStats = useCallback(async () => {
    try {
      dispatch({ type: 'SET_CACHE_STATS_LOADING', payload: true });
      
      const response = await systemManagementService.getCacheStats();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_CACHE_STATS', payload: response.data });
      } else {
        dispatch({ type: 'SET_CACHE_STATS_ERROR', payload: response.message || 'Failed to load cache statistics' });
      }
    } catch (error) {
      dispatch({ type: 'SET_CACHE_STATS_ERROR', payload: 'Failed to load cache statistics' });
    }
  }, []);

  const clearCache = useCallback(async (type: CacheType): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_CACHE_OPERATION_IN_PROGRESS', payload: true });
      
      const response = await systemManagementService.clearCache(type);
      
      const operation = {
        type,
        success: response.success,
        message: response.message || (response.success ? 'Cache cleared successfully' : 'Failed to clear cache'),
        timestamp: new Date().toISOString(),
      };
      
      dispatch({ type: 'SET_LAST_CACHE_OPERATION', payload: operation });
      
      if (response.success) {
        // Refresh cache stats after successful clear
        await loadCacheStats();
        return true;
      }
      
      return false;
    } catch (error) {
      dispatch({ 
        type: 'SET_LAST_CACHE_OPERATION', 
        payload: {
          type,
          success: false,
          message: 'Failed to clear cache',
          timestamp: new Date().toISOString(),
        }
      });
      return false;
    } finally {
      dispatch({ type: 'SET_CACHE_OPERATION_IN_PROGRESS', payload: false });
    }
  }, [loadCacheStats]);

  const refreshCacheStats = useCallback(async () => {
    await loadCacheStats();
  }, [loadCacheStats]);

  const loadGlobalLogoutStatus = useCallback(async () => {
    try {
      dispatch({ type: 'SET_GLOBAL_LOGOUT_LOADING', payload: true });
      
      const response = await systemManagementService.getGlobalLogoutStatus();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_GLOBAL_LOGOUT_STATUS', payload: response.data });
      } else {
        dispatch({ type: 'SET_GLOBAL_LOGOUT_ERROR', payload: response.message || 'Failed to load global logout status' });
      }
    } catch (error) {
      dispatch({ type: 'SET_GLOBAL_LOGOUT_ERROR', payload: 'Failed to load global logout status' });
    }
  }, []);

  const triggerGlobalLogout = useCallback(async (): Promise<boolean> => {
    try {
      const response = await systemManagementService.globalLogout();
      
      if (response.success) {
        await loadGlobalLogoutStatus();
        return true;
      }
      
      dispatch({ type: 'SET_GLOBAL_LOGOUT_ERROR', payload: response.message || 'Failed to trigger global logout' });
      return false;
    } catch (error) {
      dispatch({ type: 'SET_GLOBAL_LOGOUT_ERROR', payload: 'Failed to trigger global logout' });
      return false;
    }
  }, [loadGlobalLogoutStatus]);

  const clearGlobalLogout = useCallback(async (): Promise<boolean> => {
    try {
      const response = await systemManagementService.clearGlobalLogout();
      
      if (response.success) {
        await loadGlobalLogoutStatus();
        return true;
      }
      
      dispatch({ type: 'SET_GLOBAL_LOGOUT_ERROR', payload: response.message || 'Failed to clear global logout' });
      return false;
    } catch (error) {
      dispatch({ type: 'SET_GLOBAL_LOGOUT_ERROR', payload: 'Failed to clear global logout' });
      return false;
    }
  }, [loadGlobalLogoutStatus]);

  const loadAlerts = useCallback(async () => {
    try {
      dispatch({ type: 'SET_ALERTS_LOADING', payload: true });
      
      const response = await systemManagementService.getSystemAlerts();
      
      if (response.success && response.data) {
        dispatch({ type: 'SET_ALERTS', payload: response.data });
      } else {
        dispatch({ type: 'SET_ALERTS_ERROR', payload: response.message || 'Failed to load alerts' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ALERTS_ERROR', payload: 'Failed to load alerts' });
    }
  }, []);

  const acknowledgeAlert = useCallback(async (alertId: string): Promise<boolean> => {
    try {
      const response = await systemManagementService.acknowledgeAlert(alertId);
      
      if (response.success) {
        dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: alertId });
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }, []);

  const acknowledgeAllAlerts = useCallback(async (): Promise<boolean> => {
    try {
      const unacknowledgedAlerts = state.alerts.filter(alert => !alert.acknowledged);
      const results = await Promise.all(
        unacknowledgedAlerts.map(alert => acknowledgeAlert(alert.id))
      );
      
      return results.every(result => result);
    } catch (error) {
      return false;
    }
  }, [state.alerts, acknowledgeAlert]);

  const enableAutoRefresh = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_AUTO_REFRESH_ENABLED', payload: enabled });
  }, []);

  const setAutoRefreshInterval = useCallback((seconds: number) => {
    dispatch({ type: 'SET_AUTO_REFRESH_INTERVAL', payload: seconds });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: 'SET_DASHBOARD_ERROR', payload: null });
    dispatch({ type: 'SET_HEALTH_ERROR', payload: null });
    dispatch({ type: 'SET_CACHE_STATS_ERROR', payload: null });
    dispatch({ type: 'SET_GLOBAL_LOGOUT_ERROR', payload: null });
    dispatch({ type: 'SET_ALERTS_ERROR', payload: null });
  }, []);

  const isSystemHealthy = useCallback((): boolean => {
    return state.health?.status === 'healthy';
  }, [state.health]);

  const getCacheHealthStatus = useCallback((): 'healthy' | 'degraded' | 'unhealthy' => {
    if (!state.cacheStats) return 'unhealthy';
    
    const { lab_cache } = state.cacheStats;
    
    if (lab_cache.hit_rate >= 80) return 'healthy';
    if (lab_cache.hit_rate >= 50) return 'degraded';
    return 'unhealthy';
  }, [state.cacheStats]);

  // Auto-refresh effect
  useEffect(() => {
    if (!state.autoRefreshEnabled) return;

    const interval = setInterval(async () => {
      // Refresh critical system data
      await Promise.all([
        loadHealth(),
        loadCacheStats(),
        loadGlobalLogoutStatus(),
      ]);
    }, state.autoRefreshInterval * 1000);

    return () => clearInterval(interval);
  }, [state.autoRefreshEnabled, state.autoRefreshInterval, loadHealth, loadCacheStats, loadGlobalLogoutStatus]);

  const contextValue: SystemContextType = {
    state,
    loadDashboard,
    refreshDashboard,
    loadHealth,
    refreshHealth,
    loadCacheStats,
    clearCache,
    refreshCacheStats,
    loadGlobalLogoutStatus,
    triggerGlobalLogout,
    clearGlobalLogout,
    loadAlerts,
    acknowledgeAlert,
    acknowledgeAllAlerts,
    enableAutoRefresh,
    setAutoRefreshInterval,
    clearErrors,
    isSystemHealthy,
    getCacheHealthStatus,
  };

  return (
    <SystemContext.Provider value={contextValue}>
      {children}
    </SystemContext.Provider>
  );
};

export default SystemProvider;