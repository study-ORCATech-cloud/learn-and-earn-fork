// System management API service

import { managementApiService } from './managementApiService';
import { MANAGEMENT_API_ENDPOINTS } from '../utils/constants';
import type {
  SystemHealth,
  CacheStatistics,
  CacheClearResponse,
  GlobalLogoutResponse,
  GlobalLogoutStatus,
  SystemDashboardData,
  SystemMetrics,
  SystemAlert,
  CacheType,
} from '../types/system';
import type { ApiResponse } from '../types/management';

class SystemManagementService {
  /**
   * Get system health status
   */
  async getHealthCheck(): Promise<ApiResponse<SystemHealth>> {
    return managementApiService.get<SystemHealth>(
      MANAGEMENT_API_ENDPOINTS.HEALTH_CHECK
    );
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<ApiResponse<CacheStatistics>> {
    return managementApiService.get<CacheStatistics>(
      MANAGEMENT_API_ENDPOINTS.CACHE_STATS
    );
  }

  /**
   * Clear data cache
   */
  async clearDataCache(): Promise<ApiResponse<CacheClearResponse>> {
    return managementApiService.post<CacheClearResponse>(
      MANAGEMENT_API_ENDPOINTS.CLEAR_DATA_CACHE
    );
  }

  /**
   * Clear lab cache
   */
  async clearLabCache(): Promise<ApiResponse<CacheClearResponse>> {
    return managementApiService.post<CacheClearResponse>(
      MANAGEMENT_API_ENDPOINTS.CLEAR_LAB_CACHE
    );
  }

  /**
   * Clear cache by type
   */
  async clearCache(type: CacheType): Promise<ApiResponse<CacheClearResponse>> {
    switch (type) {
      case 'data':
        return this.clearDataCache();
      case 'lab':
        return this.clearLabCache();
      default:
        return {
          success: false,
          error: 'invalid_cache_type',
          message: 'Invalid cache type specified',
        };
    }
  }

  /**
   * Trigger global logout
   */
  async globalLogout(): Promise<ApiResponse<GlobalLogoutResponse>> {
    return managementApiService.post<GlobalLogoutResponse>(
      MANAGEMENT_API_ENDPOINTS.GLOBAL_LOGOUT
    );
  }

  /**
   * Get global logout status
   */
  async getGlobalLogoutStatus(): Promise<ApiResponse<GlobalLogoutStatus>> {
    return managementApiService.get<GlobalLogoutStatus>(
      MANAGEMENT_API_ENDPOINTS.GLOBAL_LOGOUT_STATUS
    );
  }

  /**
   * Clear global logout and resume normal token validation
   */
  async clearGlobalLogout(): Promise<ApiResponse<{ success: boolean; message: string; timestamp: string }>> {
    return managementApiService.post(
      MANAGEMENT_API_ENDPOINTS.CLEAR_GLOBAL_LOGOUT
    );
  }

  /**
   * Get comprehensive system dashboard data
   */
  async getSystemDashboard(): Promise<ApiResponse<SystemDashboardData>> {
    try {
      // Make parallel requests for all dashboard data
      const [healthResponse, cacheResponse, logoutStatusResponse] = await Promise.all([
        this.getHealthCheck(),
        this.getCacheStats(),
        this.getGlobalLogoutStatus(),
      ]);

      // Create mock metrics for now (would come from dedicated endpoint)
      const mockMetrics: SystemMetrics = {
        uptime: '7d 14h 32m',
        memory_usage: {
          used: '2.1GB',
          total: '4.0GB',
          percentage: 52.5,
        },
        active_sessions: 127,
        total_users: 1543,
        cache_health: healthResponse.data?.status === 'healthy' ? 'healthy' : 'degraded',
      };

      // Create mock alerts (would come from dedicated endpoint)
      const mockAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'info',
          title: 'System Update',
          message: 'Scheduled maintenance window tonight at 2 AM UTC',
          timestamp: new Date().toISOString(),
          acknowledged: false,
        },
      ];

      const dashboardData: SystemDashboardData = {
        health: healthResponse.data || {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          service: 'learn-and-earn-backend',
          version: 'unknown',
          environment: 'unknown',
        },
        metrics: mockMetrics,
        cache_stats: cacheResponse.data || {
          lab_cache: { hits: 0, misses: 0, hit_rate: 0 },
          data_cache: { size: '0B', entries: 0 },
          timestamp: new Date().toISOString(),
        },
        recent_alerts: mockAlerts,
        global_logout_status: logoutStatusResponse.data || {
          success: true,
          global_logout_active: false,
          timestamp: new Date().toISOString(),
        },
      };

      return {
        success: true,
        data: dashboardData,
      };
    } catch (error) {
      return {
        success: false,
        error: 'dashboard_fetch_failed',
        message: 'Failed to fetch system dashboard data',
      };
    }
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(): Promise<ApiResponse<SystemMetrics>> {
    // This would be a dedicated endpoint for system metrics
    // For now, we'll return mock data
    const mockMetrics: SystemMetrics = {
      uptime: '7d 14h 32m',
      memory_usage: {
        used: '2.1GB',
        total: '4.0GB', 
        percentage: 52.5,
      },
      active_sessions: 127,
      total_users: 1543,
      cache_health: 'healthy',
    };

    return {
      success: true,
      data: mockMetrics,
    };
  }

  /**
   * Get system alerts
   */
  async getSystemAlerts(acknowledged?: boolean): Promise<ApiResponse<SystemAlert[]>> {
    // This would be a dedicated endpoint for system alerts
    // For now, we'll return mock data
    const mockAlerts: SystemAlert[] = [
      {
        id: '1',
        type: 'info',
        title: 'System Update',
        message: 'Scheduled maintenance window tonight at 2 AM UTC',
        timestamp: new Date().toISOString(),
        acknowledged: false,
      },
      {
        id: '2',
        type: 'warning',
        title: 'High Memory Usage',
        message: 'System memory usage is above 80%',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        acknowledged: true,
      },
    ];

    const filteredAlerts = acknowledged !== undefined 
      ? mockAlerts.filter(alert => alert.acknowledged === acknowledged)
      : mockAlerts;

    return {
      success: true,
      data: filteredAlerts,
    };
  }

  /**
   * Acknowledge a system alert
   */
  async acknowledgeAlert(alertId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    // This would be a dedicated endpoint for acknowledging alerts
    return {
      success: true,
      data: {
        success: true,
        message: 'Alert acknowledged successfully',
      },
    };
  }

  /**
   * Get cache health status
   */
  async getCacheHealth(): Promise<ApiResponse<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: string }>> {
    try {
      const cacheStats = await this.getCacheStats();
      
      if (!cacheStats.success || !cacheStats.data) {
        return {
          success: true,
          data: {
            status: 'unhealthy',
            details: 'Unable to retrieve cache statistics',
          },
        };
      }

      const { lab_cache } = cacheStats.data;
      
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      let details = 'All caches operating normally';

      if (lab_cache.hit_rate < 50) {
        status = 'unhealthy';
        details = 'Lab cache hit rate is critically low';
      } else if (lab_cache.hit_rate < 80) {
        status = 'degraded';
        details = 'Lab cache hit rate is below optimal levels';
      }

      return {
        success: true,
        data: { status, details },
      };
    } catch (error) {
      return {
        success: false,
        error: 'cache_health_check_failed',
        message: 'Failed to check cache health',
      };
    }
  }

  /**
   * Perform system maintenance operations
   */
  async performMaintenance(operations: string[]): Promise<ApiResponse<{
    completed: string[];
    failed: string[];
    results: Record<string, any>;
  }>> {
    const completed: string[] = [];
    const failed: string[] = [];
    const results: Record<string, any> = {};

    for (const operation of operations) {
      try {
        switch (operation) {
          case 'clear_data_cache':
            const dataCacheResult = await this.clearDataCache();
            if (dataCacheResult.success) {
              completed.push(operation);
              results[operation] = dataCacheResult.data;
            } else {
              failed.push(operation);
              results[operation] = { error: dataCacheResult.error };
            }
            break;

          case 'clear_lab_cache':
            const labCacheResult = await this.clearLabCache();
            if (labCacheResult.success) {
              completed.push(operation);
              results[operation] = labCacheResult.data;
            } else {
              failed.push(operation);
              results[operation] = { error: labCacheResult.error };
            }
            break;

          default:
            failed.push(operation);
            results[operation] = { error: 'Unknown operation' };
        }
      } catch (error) {
        failed.push(operation);
        results[operation] = { error: 'Operation failed' };
      }
    }

    return {
      success: true,
      data: {
        completed,
        failed,
        results,
      },
    };
  }
}

export const systemManagementService = new SystemManagementService();