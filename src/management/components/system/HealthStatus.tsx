// System health status component with monitoring widgets

import React from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  TrendingUp,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { useSystemHealth } from '../../hooks/useSystemHealth';
import LoadingSpinner from '../common/LoadingSpinner';

interface HealthStatusProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  className?: string;
}

const HealthStatus: React.FC<HealthStatusProps> = ({
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
  className,
}) => {
  const { 
    healthData, 
    cacheStats, 
    isLoading, 
    error, 
    lastUpdated, 
    refresh 
  } = useSystemHealth({ autoRefresh, refreshInterval });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'ok':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
      case 'unhealthy':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'ok':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error':
      case 'unhealthy':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  const calculateCacheHitRate = (hits: number, misses: number) => {
    const total = hits + misses;
    return total > 0 ? Math.round((hits / total) * 100) : 0;
  };

  if (error) {
    return (
      <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-400 mb-2">Health Check Failed</h3>
            <p className="text-slate-400 mb-4">{error}</p>
            <Button
              onClick={refresh}
              variant="outline"
              className="border-slate-600 text-slate-300"
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
              <Activity className="w-5 h-5" />
              System Health Status
              {healthData && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    'border',
                    healthData.status === 'healthy' 
                      ? 'bg-green-900/20 border-green-500/30 text-green-400'
                      : 'bg-red-900/20 border-red-500/30 text-red-400'
                  )}
                >
                  {healthData.status?.toUpperCase()}
                </Badge>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-slate-500">
                  Updated {formatRelativeTime(lastUpdated)}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {isLoading && !healthData ? (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <LoadingSpinner text="Loading health status..." />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overall Status */}
          {healthData && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Service Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(healthData.status)}
                        <span className={cn('font-semibold', getStatusColor(healthData.status))}>
                          {healthData.status?.charAt(0).toUpperCase() + healthData.status?.slice(1)}
                        </span>
                      </div>
                    </div>
                    <Server className="w-8 h-8 text-slate-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Version</p>
                      <p className="font-semibold text-slate-200 mt-1">
                        {healthData.version || 'Unknown'}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-slate-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Environment</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            'border',
                            healthData.environment === 'production'
                              ? 'border-red-500/30 text-red-400'
                              : 'border-blue-500/30 text-blue-400'
                          )}
                        >
                          {healthData.environment || 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                    <Wifi className="w-8 h-8 text-slate-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cache Statistics */}
          {cacheStats && (
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Cache Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Lab Cache */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-300">Lab Cache</h4>
                    <Badge variant="outline" className="border-slate-600 text-slate-400">
                      Hit Rate: {cacheStats.lab_cache ? calculateCacheHitRate(
                        cacheStats.lab_cache.hits, 
                        cacheStats.lab_cache.misses
                      ) : 0}%
                    </Badge>
                  </div>
                  
                  {cacheStats.lab_cache && (
                    <>
                      <Progress 
                        value={calculateCacheHitRate(cacheStats.lab_cache.hits, cacheStats.lab_cache.misses)} 
                        className="h-2"
                      />
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-green-400 font-semibold">
                            {cacheStats.lab_cache.hits?.toLocaleString() || 0}
                          </div>
                          <div className="text-slate-500">Hits</div>
                        </div>
                        <div className="text-center">
                          <div className="text-red-400 font-semibold">
                            {cacheStats.lab_cache.misses?.toLocaleString() || 0}
                          </div>
                          <div className="text-slate-500">Misses</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-400 font-semibold">
                            {cacheStats.lab_cache.hit_rate?.toFixed(1) || '0'}%
                          </div>
                          <div className="text-slate-500">Rate</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Data Cache */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-300">Data Cache</h4>
                    <Badge variant="outline" className="border-slate-600 text-slate-400">
                      {cacheStats.data_cache?.size || 'Unknown'}
                    </Badge>
                  </div>
                  
                  {cacheStats.data_cache && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center bg-slate-800/50 rounded p-3">
                        <div className="text-slate-200 font-semibold text-lg">
                          {cacheStats.data_cache.entries?.toLocaleString() || 0}
                        </div>
                        <div className="text-slate-500">Entries</div>
                      </div>
                      <div className="text-center bg-slate-800/50 rounded p-3">
                        <div className="text-slate-200 font-semibold text-lg">
                          {cacheStats.data_cache.size || 'Unknown'}
                        </div>
                        <div className="text-slate-500">Size</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cache Timestamp */}
                {cacheStats.timestamp && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-700">
                    <Clock className="w-3 h-3" />
                    <span>Cache stats updated: {formatDate(cacheStats.timestamp)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* System Information */}
          {healthData && (
            <Card className="bg-slate-900/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-200 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">Service Name</span>
                      <span className="text-slate-200 font-mono">
                        {healthData.service || 'learn-and-earn-backend'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">Version</span>
                      <Badge variant="outline" className="border-slate-600 text-slate-300 font-mono">
                        {healthData.version || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">Environment</span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'border font-mono',
                          healthData.environment === 'production'
                            ? 'border-red-500/30 text-red-400'
                            : 'border-blue-500/30 text-blue-400'
                        )}
                      >
                        {healthData.environment || 'Unknown'}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">Status</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(healthData.status)}
                        <span className={cn('font-medium', getStatusColor(healthData.status))}>
                          {healthData.status?.charAt(0).toUpperCase() + healthData.status?.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">Last Check</span>
                      <span className="text-slate-200 font-mono text-sm">
                        {healthData.timestamp ? formatDate(healthData.timestamp) : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-700">
                      <span className="text-slate-400">Auto Refresh</span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          'border',
                          autoRefresh 
                            ? 'border-green-500/30 text-green-400' 
                            : 'border-slate-600 text-slate-400'
                        )}
                      >
                        {autoRefresh ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Health Warnings */}
          {healthData?.status !== 'healthy' && (
            <Alert className="bg-yellow-900/20 border-yellow-500/30">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <AlertDescription className="text-yellow-300">
                <strong>System Health Warning:</strong> The system is not reporting as fully healthy. 
                Some services may be experiencing issues. Check logs and contact system administrators if problems persist.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
};

export default HealthStatus;