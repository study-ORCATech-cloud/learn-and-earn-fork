// Global logout component for system-wide session management

import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw,
  Shield,
  Users,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { useManagement } from '../../context/ManagementContext';
import { systemManagementService } from '../../services/systemManagementService';
import ConfirmDialog from '../common/ConfirmDialog';

interface GlobalLogoutProps {
  onLogoutTriggered?: () => void;
  className?: string;
}

interface GlobalLogoutStatus {
  global_logout_active: boolean;
  global_logout_time?: string;
  timestamp: string;
}

const GlobalLogout: React.FC<GlobalLogoutProps> = ({
  onLogoutTriggered,
  className,
}) => {
  const management = useManagement();
  const [status, setStatus] = useState<GlobalLogoutStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTriggerDialog, setShowTriggerDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const fetchStatus = async () => {
    try {
      setError(null);
      const response = await systemManagementService.getGlobalLogoutStatus();
      setStatus(response);
    } catch (err) {
      setError('Failed to fetch global logout status');
      console.error('Error fetching global logout status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Poll for status updates every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerLogout = async () => {
    setIsTriggering(true);
    setError(null);
    
    try {
      await systemManagementService.globalLogout();
      await fetchStatus(); // Refresh status
      onLogoutTriggered?.();
      setShowTriggerDialog(false);
    } catch (err) {
      setError('Failed to trigger global logout');
      console.error('Error triggering global logout:', err);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleClearLogout = async () => {
    setIsClearing(true);
    setError(null);
    
    try {
      await systemManagementService.clearGlobalLogout();
      await fetchStatus(); // Refresh status
      setShowClearDialog(false);
    } catch (err) {
      setError('Failed to clear global logout');
      console.error('Error clearing global logout:', err);
    } finally {
      setIsClearing(false);
    }
  };

  const canManageGlobalLogout = management.canPerformOperation('manage_system');

  if (!canManageGlobalLogout) {
    return (
      <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
        <CardContent className="p-6">
          <div className="text-center">
            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">Access Restricted</h3>
            <p className="text-slate-500">
              You do not have permission to manage global logout settings.
            </p>
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
              <LogOut className="w-5 h-5" />
              Global Logout Management
              {status && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    'border',
                    status.global_logout_active 
                      ? 'bg-red-900/20 border-red-500/30 text-red-400'
                      : 'bg-green-900/20 border-green-500/30 text-green-400'
                  )}
                >
                  {status.global_logout_active ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              )}
            </CardTitle>
            
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStatus}
              disabled={isLoading}
              className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert className="bg-red-900/20 border-red-500/30">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <AlertDescription className="text-red-300">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Status Display */}
      {status && (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-200 flex items-center gap-2">
              {status.global_logout_active ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
              Current Status
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {status.global_logout_active ? (
              /* Active Status */
              <div className="space-y-4">
                <Alert className="bg-red-900/20 border-red-500/30">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <AlertDescription className="text-red-300">
                    <strong>Global Logout is ACTIVE</strong>
                    <br />
                    All existing user sessions have been invalidated. Users must log in again to access the system.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-slate-800/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-red-400" />
                        <div>
                          <h4 className="font-medium text-slate-200">Logout Triggered</h4>
                          <p className="text-sm text-slate-400">
                            {status.global_logout_time ? formatDate(status.global_logout_time) : 'Unknown'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {status.global_logout_time ? formatRelativeTime(status.global_logout_time) : ''}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800/50 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-orange-400" />
                        <div>
                          <h4 className="font-medium text-slate-200">Impact</h4>
                          <p className="text-sm text-slate-400">All active sessions</p>
                          <p className="text-xs text-slate-500">Users must re-authenticate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Clear Logout Action */}
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-200">Clear Global Logout</h4>
                      <p className="text-sm text-slate-400">
                        Resume normal token validation and allow existing sessions to continue.
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Info className="w-3 h-3" />
                        <span>New logins will be accepted normally after clearing</span>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => setShowClearDialog(true)}
                      disabled={isClearing}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isClearing ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      {isClearing ? 'Clearing...' : 'Clear Logout'}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Inactive Status */
              <div className="space-y-4">
                <Alert className="bg-green-900/20 border-green-500/30">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <AlertDescription className="text-green-300">
                    <strong>System Operating Normally</strong>
                    <br />
                    No global logout is active. All user sessions are being validated normally.
                  </AlertDescription>
                </Alert>

                {/* Trigger Logout Action */}
                <div className="bg-slate-800/30 rounded-lg p-4 border border-red-500/30">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-200 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        Trigger Global Logout
                      </h4>
                      <p className="text-sm text-slate-400">
                        Immediately invalidate all existing JWT tokens system-wide. This will force all users to log in again.
                      </p>
                      <div className="space-y-1 text-xs text-slate-500">
                        <div className="flex items-center gap-2">
                          <span>•</span>
                          <span>All active user sessions will be terminated</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>•</span>
                          <span>Users will need to re-authenticate to continue</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>•</span>
                          <span>Use only in emergency situations or for security purposes</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => setShowTriggerDialog(true)}
                      disabled={isTriggering}
                      variant="outline"
                      className="bg-slate-800 border-red-500/50 text-red-400 hover:bg-red-900/20 hover:text-red-300"
                    >
                      {isTriggering ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4 mr-2" />
                      )}
                      {isTriggering ? 'Triggering...' : 'Trigger Logout'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Last Updated */}
            <Separator className="bg-slate-700" />
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              <span>Status updated: {formatDate(status.timestamp)} ({formatRelativeTime(status.timestamp)})</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Guidelines */}
      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Usage Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-slate-300">When to Use Global Logout</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
                  <p>Security breach or suspected token compromise</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
                  <p>System maintenance requiring all users to re-authenticate</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
                  <p>Role or permission changes requiring immediate effect</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-slate-500 rounded-full mt-2"></div>
                  <p>Emergency situations requiring immediate user session termination</p>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            <div className="space-y-3">
              <h4 className="font-medium text-slate-300">Important Considerations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h5 className="font-medium text-slate-400">User Impact</h5>
                  <ul className="space-y-1 text-slate-500">
                    <li>• All users logged out immediately</li>
                    <li>• Work in progress may be lost</li>
                    <li>• Users must log in again</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium text-slate-400">System Impact</h5>
                  <ul className="space-y-1 text-slate-500">
                    <li>• No service downtime</li>
                    <li>• New logins work normally</li>
                    <li>• Operation is logged and audited</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trigger Confirmation Dialog */}
      <ConfirmDialog
        open={showTriggerDialog}
        onClose={() => setShowTriggerDialog(false)}
        onConfirm={handleTriggerLogout}
        title="Trigger Global Logout"
        description="This will immediately invalidate ALL existing user sessions system-wide. All users will be forced to log in again. This action should only be used in emergency situations. Are you sure you want to proceed?"
        confirmText="Trigger Global Logout"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isTriggering}
      />

      {/* Clear Confirmation Dialog */}
      <ConfirmDialog
        open={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearLogout}
        title="Clear Global Logout"
        description="This will resume normal token validation and allow new user sessions. The global logout state will be deactivated. Continue?"
        confirmText="Clear Global Logout"
        cancelText="Cancel"
        variant="default"
        isLoading={isClearing}
      />
    </div>
  );
};

export default GlobalLogout;