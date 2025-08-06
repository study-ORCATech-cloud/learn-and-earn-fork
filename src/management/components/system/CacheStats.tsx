// Cache statistics component with management actions

import React, { useState } from 'react';
import { 
  Database, 
  BarChart3, 
  Trash2, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { useSystemHealth } from '../../hooks/useSystemHealth';
import { useSystem } from '../../context/SystemContext';
import { useManagement } from '../../context/ManagementContext';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingSpinner from '../common/LoadingSpinner';

interface CacheStatsProps {
  showActions?: boolean;
  autoRefresh?: boolean;
  className?: string;
}

const CacheStats: React.FC<CacheStatsProps> = ({
  showActions = true,
  autoRefresh = true,
  className,
}) => {
  const management = useManagement();
  const { cacheStats, isLoading, error, refreshAll } = useSystemHealth({ autoRefresh });
  const systemContext = useSystem();
  const [clearingCache, setClearingCache] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const calculateCachePercentage = (totalEntries: number, totalAvailable: number) => {
    return totalAvailable > 0 ? Math.round((totalEntries / totalAvailable) * 100) : 0;
  };

  // Helper to adapt new cache structure to old component expectations
  const adaptCacheData = (labCache: any) => {
    if (!labCache) return null;
    
    const cachePercentage = calculateCachePercentage(labCache.total_entries, labCache.total_available_entries);
    return {
      hit_rate: cachePercentage,
      hits: labCache.total_entries,
      misses: Math.max(0, labCache.total_available_entries - labCache.total_entries),
      total_entries: labCache.total_entries,
      total_available_entries: labCache.total_available_entries,
      valid_entries: labCache.valid_entries,
      expired_entries: labCache.expired_entries,
      cache_enabled: labCache.cache_enabled,
    };
  };

  const adaptDataCache = (dataCache: any) => {
    if (!dataCache) return null;
    
    return {
      entries: dataCache.total_entries,
      size: dataCache.cache_enabled ? 'Enabled' : 'Disabled',
      cache_enabled: dataCache.cache_enabled,
      cached_at: dataCache.cached_at,
      is_valid: dataCache.is_valid,
    };
  };

  const getHitRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-400';
    if (rate >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Create adapted data for the component to use
  const adaptedLabCache = cacheStats ? adaptCacheData(cacheStats.lab_cache) : null;
  const adaptedDataCache = cacheStats ? adaptDataCache(cacheStats.data_cache) : null;

  const getHitRateStatus = (rate: number) => {
    if (rate >= 90) return { icon: <CheckCircle className="w-4 h-4" />, label: 'Excellent', color: 'text-green-400' };
    if (rate >= 70) return { icon: <AlertTriangle className="w-4 h-4" />, label: 'Good', color: 'text-yellow-400' };
    return { icon: <AlertTriangle className="w-4 h-4" />, label: 'Poor', color: 'text-red-400' };
  };

  const formatSize = (sizeStr: string) => {
    // Handle size strings like "2.5MB"
    return sizeStr || 'Unknown';
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAll();
    } catch (error) {
      console.error('Failed to refresh cache stats:', error);
    } finally {
      // Add a small delay to show the feedback even if the request is very fast
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleClearCache = async (cacheType: 'data' | 'lab') => {
    setClearingCache(cacheType);
    try {
      await systemContext.clearCache(cacheType as any);
      // Refresh stats after clearing
      await refreshAll();
    } catch (error) {
      console.error(`Failed to clear ${cacheType} cache:`, error);
    } finally {
      setClearingCache(null);
      setShowClearDialog(null);
    }
  };

  if (error) {
    return (
      <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
        <CardContent className="p-6">
          <div className="text-center text-red-400">
            <Database className="w-8 h-8 mx-auto mb-2" />
            <p>Failed to load cache statistics</p>
            <p className="text-sm text-slate-500 mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAll}
              className="mt-3 bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-200 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Cache Statistics
              <Badge variant="secondary" className="bg-slate-700 text-slate-200">
                Real-time
              </Badge>
            </CardTitle>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <RefreshCw className={cn('w-4 h-4', (isLoading || isRefreshing) && 'animate-spin')} />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {isLoading && !cacheStats ? (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <LoadingSpinner text="Loading cache statistics..." />
            </div>
          </CardContent>
        </Card>
      ) : cacheStats ? (
        <>
          {/* Lab Cache Stats */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Lab Cache
                  {adaptedLabCache && (() => {
                    const cachePercentage = adaptedLabCache.hit_rate || calculateCachePercentage(
                      adaptedLabCache.total_entries, 
                      adaptedLabCache.total_available_entries
                    );
                    const status = getHitRateStatus(cachePercentage);
                    return (
                      <Badge 
                        variant="outline" 
                        className={cn('border', status.color, 'border-current')}
                      >
                        {status.icon}
                        <span className="ml-1">{status.label}</span>
                      </Badge>
                    );
                  })()}
                </CardTitle>
                
                {showActions && management.canPerformOperation('manage_system') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowClearDialog('lab')}
                    disabled={clearingCache === 'lab'}
                    className="bg-slate-800 border-slate-600 text-red-400 hover:bg-red-900/20 hover:border-red-500 hover:text-red-300"
                  >
                    {clearingCache === 'lab' ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Clear Cache
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {adaptedLabCache ? (
                <>
                  {/* Cache Percentage Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Cache Percentage</span>
                      <span className={cn('font-bold text-lg', getHitRateColor(
                        adaptedLabCache.hit_rate || calculateCachePercentage(
                          adaptedLabCache.total_entries, 
                          adaptedLabCache.total_available_entries
                        )
                      ))}>
                        {(adaptedLabCache.hit_rate || calculateCachePercentage(
                          adaptedLabCache.total_entries, 
                          adaptedLabCache.total_available_entries
                        )).toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={adaptedLabCache.hit_rate || calculateCachePercentage(
                        adaptedLabCache.total_entries, 
                        adaptedLabCache.total_available_entries
                      )} 
                      className="h-3"
                    />
                  </div>

                  {/* Cache Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-slate-800/50 border-slate-600">
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Database className="w-5 h-5 text-blue-400" />
                          <span className="text-slate-300 font-medium">Cache Entries</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-400">
                          {adaptedLabCache.hits?.toLocaleString() || 0}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Cached labs
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-600">
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Database className="w-5 h-5 text-green-400" />
                          <span className="text-slate-300 font-medium">Total Available</span>
                        </div>
                        <div className="text-2xl font-bold text-green-400">
                          {adaptedLabCache.total_available_entries?.toLocaleString() || 0}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Cache available labs
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-600">
                      <CardContent className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-purple-400" />
                          <span className="text-slate-300 font-medium">Cache Status</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-400">
                          {adaptedLabCache.cache_enabled ? 'Enabled' : 'Disabled'}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Cache lookups that failed
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Performance Analysis */}
                  <div className="bg-slate-800/30 rounded-lg p-4">
                    <h4 className="text-slate-300 font-medium mb-3">Performance Analysis</h4>
                    <div className="space-y-2 text-sm">
                      {(() => {
                        const cachePercentage = adaptedLabCache.hit_rate || calculateCachePercentage(
                          adaptedLabCache.total_entries, 
                          adaptedLabCache.total_available_entries
                        );
                        if (cachePercentage >= 90) {
                          return (
                            <div className="flex items-start gap-2 text-green-400">
                              <CheckCircle className="w-4 h-4 mt-0.5" />
                              <span>Excellent cache performance! The lab cache is working efficiently.</span>
                            </div>
                          );
                        } else if (cachePercentage >= 70) {
                          return (
                            <div className="flex items-start gap-2 text-yellow-400">
                              <AlertTriangle className="w-4 h-4 mt-0.5" />
                              <span>Good cache performance, but there's room for improvement.</span>
                            </div>
                          );
                        } else {
                          return (
                            <div className="flex items-start gap-2 text-red-400">
                              <AlertTriangle className="w-4 h-4 mt-0.5" />
                              <span>Poor cache performance. Consider reviewing cache configuration.</span>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No lab cache statistics available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Cache Stats */}
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Cache
                </CardTitle>
                
                {showActions && management.canPerformOperation('manage_system') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowClearDialog('data')}
                    disabled={clearingCache === 'data'}
                    className="bg-slate-800 border-slate-600 text-red-400 hover:bg-red-900/20 hover:border-red-500 hover:text-red-300"
                  >
                    {clearingCache === 'data' ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Clear Cache
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {adaptedDataCache ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-slate-800/50 border-slate-600">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Database className="w-6 h-6 text-blue-400" />
                        <span className="text-slate-300 font-medium">Cache Entries</span>
                      </div>
                      <div className="text-3xl font-bold text-blue-400 mb-2">
                        {adaptedDataCache.entries?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm text-slate-500">
                        Total cached items
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-600">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <Activity className="w-6 h-6 text-purple-400" />
                        <span className="text-slate-300 font-medium">Cache Status</span>
                      </div>
                      <div className="text-3xl font-bold text-purple-400 mb-2">
                        {adaptedDataCache.cache_enabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  No data cache statistics available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Last Updated */}
          {cacheStats.timestamp && (
            <Card className="bg-slate-800/30 border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>
                    Last updated: {formatDate(cacheStats.timestamp)} 
                    ({formatRelativeTime(cacheStats.timestamp)})
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cache Clear Confirmation Dialog */}
          <ConfirmDialog
            isOpen={!!showClearDialog}
            onClose={() => setShowClearDialog(null)}
            onConfirm={() => showClearDialog && handleClearCache(showClearDialog as 'data' | 'lab')}
            title={`Clear ${showClearDialog === 'data' ? 'Data' : 'Lab'} Cache`}
            description={`Are you sure you want to clear the ${showClearDialog} cache? This action cannot be undone and may temporarily impact system performance.`}
            confirmText="Clear Cache"
            cancelText="Cancel"
            type="danger"
            isLoading={!!clearingCache}
          />
        </>
      ) : (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-12">
            <div className="text-center text-slate-400">
              <Database className="w-12 h-12 mx-auto mb-4" />
              <p>No cache statistics available</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CacheStats;