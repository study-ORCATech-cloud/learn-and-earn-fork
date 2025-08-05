// System actions component for maintenance operations

import React, { useState } from 'react';
import { 
  Settings, 
  Trash2, 
  Database, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Shield,
  Zap,
  Server,
  HardDrive
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useManagement } from '../../context/ManagementContext';
import { useSystemHealth } from '../../hooks/useSystemHealth';
import ConfirmDialog from '../common/ConfirmDialog';

interface SystemActionsProps {
  onActionComplete?: (action: string, success: boolean) => void;
  className?: string;
}

interface SystemAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  buttonColor: string;
  permission: string;
  danger: boolean;
  confirmTitle: string;
  confirmDescription: string;
  action: () => Promise<void>;
}

const SystemActions: React.FC<SystemActionsProps> = ({
  onActionComplete,
  className,
}) => {
  const management = useManagement();
  const { clearCache, refreshAll } = useSystemHealth();
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<SystemAction | null>(null);

  const executeAction = async (action: SystemAction) => {
    setExecutingAction(action.id);
    try {
      await action.action();
      onActionComplete?.(action.id, true);
    } catch (error) {
      console.error(`Failed to execute ${action.id}:`, error);
      onActionComplete?.(action.id, false);
    } finally {
      setExecutingAction(null);
      setPendingAction(null);
    }
  };

  const systemActions: SystemAction[] = [
    {
      id: 'clear_data_cache',
      title: 'Clear Data Cache',
      description: 'Clear all cached application data. This may temporarily slow down the system until cache is rebuilt.',
      icon: <Database className="w-5 h-5" />,
      color: 'text-blue-400',
      buttonColor: 'border-blue-500 text-blue-400 hover:bg-blue-900/20',
      permission: 'manage_system',
      danger: true,
      confirmTitle: 'Clear Data Cache',
      confirmDescription: 'This will clear all cached application data. The system may run slower until the cache is rebuilt. Continue?',
      action: () => clearCache('data'),
    },
    {
      id: 'clear_lab_cache',
      title: 'Clear Lab Cache',
      description: 'Clear cached lab data and configurations. Lab content will be re-fetched from the source.',
      icon: <HardDrive className="w-5 h-5" />,
      color: 'text-purple-400',
      buttonColor: 'border-purple-500 text-purple-400 hover:bg-purple-900/20',
      permission: 'manage_system',
      danger: true,
      confirmTitle: 'Clear Lab Cache',
      confirmDescription: 'This will clear all cached lab data. Lab loading may be slower until cache is rebuilt. Continue?',
      action: () => clearCache('lab'),
    },
    {
      id: 'refresh_system_status',
      title: 'Refresh System Status',
      description: 'Force refresh of system health status and cache statistics.',
      icon: <RefreshCw className="w-5 h-5" />,
      color: 'text-green-400',
      buttonColor: 'border-green-500 text-green-400 hover:bg-green-900/20',
      permission: 'manage_system',
      danger: false,
      confirmTitle: 'Refresh System Status',
      confirmDescription: 'This will refresh all system health data and cache statistics.',
      action: refreshAll,
    },
  ];

  const availableActions = systemActions.filter(action => 
    management.canPerformOperation(action.permission)
  );

  const dangerousActions = availableActions.filter(action => action.danger);
  const safeActions = availableActions.filter(action => !action.danger);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            System Maintenance
            <Badge variant="secondary" className="bg-slate-700 text-slate-200">
              {availableActions.length} actions
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* No Permissions Warning */}
      {availableActions.length === 0 && (
        <Alert className="bg-yellow-900/20 border-yellow-500/30">
          <Shield className="w-4 h-4 text-yellow-400" />
          <AlertDescription className="text-yellow-300">
            You do not have permission to perform system maintenance operations. 
            Contact your system administrator if you need access.
          </AlertDescription>
        </Alert>
      )}

      {/* Safe Actions */}
      {safeActions.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2 text-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Safe Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {safeActions.map((action) => (
              <div
                key={action.id}
                className="flex items-start justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-600"
              >
                <div className="flex items-start gap-3">
                  <div className={cn('mt-1', action.color)}>
                    {action.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-slate-200">{action.title}</h4>
                    <p className="text-sm text-slate-400">{action.description}</p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPendingAction(action)}
                  disabled={!!executingAction}
                  className={cn('shrink-0 border bg-slate-800', action.buttonColor)}
                >
                  {executingAction === action.id ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <span className="mr-2">{action.icon}</span>
                  )}
                  {executingAction === action.id ? 'Executing...' : 'Execute'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Dangerous Actions */}
      {dangerousActions.length > 0 && (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Potentially Disruptive Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-red-900/20 border-red-500/30">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <AlertDescription className="text-red-300">
                <strong>Warning:</strong> These operations may temporarily impact system performance 
                or user experience. Use with caution and preferably during maintenance windows.
              </AlertDescription>
            </Alert>

            {dangerousActions.map((action) => (
              <div
                key={action.id}
                className="flex items-start justify-between p-4 bg-slate-800/30 rounded-lg border border-red-500/30"
              >
                <div className="flex items-start gap-3">
                  <div className={cn('mt-1', action.color)}>
                    {action.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-slate-200">{action.title}</h4>
                    <p className="text-sm text-slate-400">{action.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="border-red-500/50 text-red-400 text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Potentially Disruptive
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPendingAction(action)}
                  disabled={!!executingAction}
                  className={cn(
                    'shrink-0 border bg-slate-800',
                    action.buttonColor,
                    'border-red-500/50 text-red-400 hover:bg-red-900/20'
                  )}
                >
                  {executingAction === action.id ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <span className="mr-2">{action.icon}</span>
                  )}
                  {executingAction === action.id ? 'Executing...' : 'Execute'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* System Information */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Server className="w-5 h-5" />
            Maintenance Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-slate-300">Best Practices</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
                  <p>Perform cache clearing operations during low-traffic periods</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
                  <p>Monitor system performance after maintenance operations</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
                  <p>Keep users informed about planned maintenance activities</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
                  <p>Have rollback procedures ready for critical operations</p>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            <div className="space-y-3">
              <h4 className="font-medium text-slate-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Impact Assessment
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h5 className="font-medium text-slate-400">Cache Operations</h5>
                  <ul className="space-y-1 text-slate-500">
                    <li>• May cause temporary slowdown</li>
                    <li>• Cache rebuilds automatically</li>
                    <li>• No data loss</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-slate-400">System Refresh</h5>
                  <ul className="space-y-1 text-slate-500">
                    <li>• No performance impact</li>
                    <li>• Updates health metrics</li>
                    <li>• Safe to execute anytime</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={() => pendingAction && executeAction(pendingAction)}
        title={pendingAction?.confirmTitle}
        description={pendingAction?.confirmDescription}
        confirmText="Execute"
        cancelText="Cancel"
        variant={pendingAction?.danger ? "destructive" : "default"}
        isLoading={!!executingAction}
      />
    </div>
  );
};

export default SystemActions;