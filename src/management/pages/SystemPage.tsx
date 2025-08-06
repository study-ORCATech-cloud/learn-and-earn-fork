// System management page with health monitoring and maintenance

import React, { useState } from 'react';
import { 
  Settings, 
  Activity, 
  Database, 
  LogOut, 
  Server,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useManagement } from '../context/ManagementContext';
import { useSystemHealth } from '../hooks/useSystemHealth';
import HealthStatus from '../components/system/HealthStatus';
import CacheStats from '../components/system/CacheStats';
import SystemActions from '../components/system/SystemActions';
import GlobalLogout from '../components/system/GlobalLogout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SystemStatusBar from '../components/common/SystemStatusBar';

const SystemPage: React.FC = () => {
  const management = useManagement();
  const { health, cacheStats, isLoading, error, refreshAll } = useSystemHealth({ autoRefresh: true });
  const [activeTab, setActiveTab] = useState('health');
  const [lastActionResult, setLastActionResult] = useState<{
    action: string;
    success: boolean;
    timestamp: Date;
  } | null>(null);

  const handleActionComplete = (action: string, success: boolean) => {
    setLastActionResult({
      action,
      success,
      timestamp: new Date(),
    });
    
    // Auto-hide the notification after 5 seconds
    setTimeout(() => setLastActionResult(null), 5000);
    
    // Refresh system data after actions
    refreshAll();
  };

  if (!management.canPerformOperation('manage_system')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="text-6xl text-slate-600">🔒</div>
          <h2 className="text-xl font-semibold text-slate-300">Access Restricted</h2>
          <p className="text-slate-500">
            You don't have permission to access system management.
          </p>
        </div>
      </div>
    );
  }

  const getHealthStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
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

  const getHealthStatusIcon = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-6 h-6" />
            System Management
            {health && (
              <Badge 
                variant="secondary" 
                className={cn(
                  'border',
                  health.status === 'healthy' 
                    ? 'bg-green-900/20 border-green-500/30 text-green-400'
                    : 'bg-red-900/20 border-red-500/30 text-red-400'
                )}
              >
                {health.status?.toUpperCase()}
              </Badge>
            )}
          </h1>
          <p className="text-slate-400">
            Monitor system health and perform maintenance operations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={refreshAll}
            disabled={isLoading}
            className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Action Result Notification */}
      {lastActionResult && (
        <Alert className={cn(
          'border',
          lastActionResult.success 
            ? 'bg-green-900/20 border-green-500/30'
            : 'bg-red-900/20 border-red-500/30'
        )}>
          {lastActionResult.success ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          )}
          <AlertDescription className={lastActionResult.success ? 'text-green-300' : 'text-red-300'}>
            <strong>
              {lastActionResult.success ? 'Success:' : 'Error:'} 
            </strong> {lastActionResult.action} operation {lastActionResult.success ? 'completed' : 'failed'}.
          </AlertDescription>
        </Alert>
      )}

      {/* System Overview Cards */}
      <SystemStatusBar
        health={health}
        cacheStats={cacheStats}
        isLoading={isLoading}
        showUserStats={false}
        showEnvironment={true}
        showVersion={true}
      />

      {error && (
        <Alert className="bg-red-900/20 border-red-500/30">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <AlertDescription className="text-red-300">
            <strong>System Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* System Management Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-800 border border-slate-600">
          <TabsTrigger 
            value="health" 
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
          >
            <Activity className="w-4 h-4 mr-2" />
            Health Status
          </TabsTrigger>
          <TabsTrigger 
            value="cache"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
          >
            <Database className="w-4 h-4 mr-2" />
            Cache Management
          </TabsTrigger>
          <TabsTrigger 
            value="actions"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            System Actions
          </TabsTrigger>
          <TabsTrigger 
            value="logout"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Global Logout
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          <HealthStatus 
            autoRefresh={true}
            refreshInterval={30000}
          />
        </TabsContent>

        <TabsContent value="cache" className="space-y-6">
          <CacheStats 
            showActions={true}
            autoRefresh={true}
          />
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <SystemActions 
            onActionComplete={handleActionComplete}
          />
        </TabsContent>

        <TabsContent value="logout" className="space-y-6">
          <GlobalLogout 
            onLogoutTriggered={() => handleActionComplete('Global logout', true)}
          />
        </TabsContent>
      </Tabs>

      {/* System Warnings */}
      {health && health.status !== 'healthy' && (
        <Alert className="bg-yellow-900/20 border-yellow-500/30">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <AlertDescription className="text-yellow-300">
            <strong>System Health Warning:</strong> The system is not reporting as fully healthy. 
            Check the health status tab for detailed information and consider reviewing system logs.
          </AlertDescription>
        </Alert>
      )}

      {/* Environment Warning */}
      {health?.environment === 'production' && (
        <Alert className="bg-red-900/20 border-red-500/30">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <AlertDescription className="text-red-300">
            <strong>Production Environment:</strong> You are managing a production system. 
            Exercise extreme caution when performing maintenance operations as they may affect live users.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SystemPage;