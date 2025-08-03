// Bulk user actions component for performing operations on multiple users

import React, { useState } from 'react';
import { 
  Users, 
  CheckCircle, 
  UserX, 
  Shield, 
  Trash2, 
  AlertTriangle,
  X,
  Play,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useManagement } from '../../context/ManagementContext';
import { useRoles } from '../../hooks/useRoles';
import { useBulkOperations } from '../../hooks/useBulkOperations';
import { formatRole } from '../../utils/formatters';
import type { BulkOperationType, BulkOperationResult } from '../../types/management';

interface BulkUserActionsProps {
  selectedUserIds: string[];
  onClearSelection: () => void;
  onComplete: () => void;
  className?: string;
}

const BulkUserActions: React.FC<BulkUserActionsProps> = ({
  selectedUserIds,
  onClearSelection,
  onComplete,
  className,
}) => {
  const management = useManagement();
  const { manageableRoles } = useRoles();
  const { executeBulkOperation, isExecuting, progress, results } = useBulkOperations();
  
  const [operation, setOperation] = useState<BulkOperationType | ''>('');
  const [targetRole, setTargetRole] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const operationOptions = [
    {
      value: 'ACTIVATE' as BulkOperationType,
      label: 'Activate Users',
      icon: <CheckCircle className="w-4 h-4" />,
      description: 'Reactivate selected inactive users',
      color: 'text-green-400',
      requiredPermission: 'delete_user' as const,
    },
    {
      value: 'DEACTIVATE' as BulkOperationType,
      label: 'Deactivate Users',
      icon: <UserX className="w-4 h-4" />,
      description: 'Deactivate selected active users',
      color: 'text-red-400',
      requiredPermission: 'delete_user' as const,
    },
    {
      value: 'ROLE_CHANGE' as BulkOperationType,
      label: 'Change Role',
      icon: <Shield className="w-4 h-4" />,
      description: 'Change role for all selected users',
      color: 'text-purple-400',
      requiredPermission: 'bulk_operations' as const,
    },
    {
      value: 'DELETE' as BulkOperationType,
      label: 'Delete Users',
      icon: <Trash2 className="w-4 h-4" />,
      description: 'Permanently delete selected users (dangerous)',
      color: 'text-red-500',
      requiredPermission: 'delete_user' as const,
    },
  ];

  const availableOperations = operationOptions.filter(op => 
    management.canPerformOperation(op.requiredPermission)
  );

  const selectedOperation = operationOptions.find(op => op.value === operation);

  const handleExecute = async () => {
    if (!operation || selectedUserIds.length === 0) return;

    const operationData = {
      operation,
      user_ids: selectedUserIds,
      reason: reason.trim() || undefined,
      ...(operation === 'ROLE_CHANGE' && targetRole ? { role: targetRole } : {}),
    };

    const success = await executeBulkOperation(operationData);
    
    if (success) {
      setShowConfirmation(false);
      setOperation('');
      setTargetRole('');
      setReason('');
      onComplete();
    }
  };

  const canExecute = () => {
    if (!operation || selectedUserIds.length === 0) return false;
    if (operation === 'ROLE_CHANGE' && !targetRole) return false;
    return true;
  };

  const getOperationSummary = () => {
    if (!selectedOperation) return '';
    
    let summary = `${selectedOperation.label} for ${selectedUserIds.length} user${selectedUserIds.length === 1 ? '' : 's'}`;
    
    if (operation === 'ROLE_CHANGE' && targetRole) {
      const roleInfo = formatRole(targetRole);
      summary += ` to ${roleInfo.text}`;
    }
    
    return summary;
  };

  if (isExecuting && progress) {
    return (
      <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Executing Bulk Operation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">{getOperationSummary()}</span>
              <span className="text-slate-400">
                {progress.completed} / {progress.total}
              </span>
            </div>
            <Progress 
              value={(progress.completed / progress.total) * 100} 
              className="h-2"
            />
          </div>

          {progress.current && (
            <div className="text-sm text-slate-400">
              Processing: {progress.current}
            </div>
          )}

          {progress.errors.length > 0 && (
            <Alert className="bg-red-900/20 border-red-500/30">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-red-400">
                {progress.errors.length} error{progress.errors.length === 1 ? '' : 's'} occurred
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  if (results && !isExecuting) {
    return (
      <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Bulk Operation Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{results.successful_count}</div>
              <div className="text-sm text-slate-400">Successful</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-red-400">{results.failed_count}</div>
              <div className="text-sm text-slate-400">Failed</div>
            </div>
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {Math.round(results.success_rate)}%
              </div>
              <div className="text-sm text-slate-400">Success Rate</div>
            </div>
          </div>

          {results.failed.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-slate-300 font-medium">Failed Operations:</h4>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {results.failed.map((failure, index) => (
                  <div key={index} className="text-sm bg-red-900/20 p-2 rounded border border-red-500/30">
                    <span className="text-red-400">User {failure.user_id}:</span>
                    <span className="text-slate-300 ml-2">{failure.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClearSelection}
              className="border-slate-600 text-slate-300"
            >
              Clear Selection
            </Button>
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showConfirmation && operation) {
    return (
      <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
        <CardHeader>
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Confirm Bulk Operation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-yellow-900/20 border-yellow-500/30">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription className="text-yellow-400">
              <strong>Warning:</strong> This action will affect {selectedUserIds.length} user{selectedUserIds.length === 1 ? '' : 's'} and cannot be easily undone.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <p className="text-slate-300 font-medium">{getOperationSummary()}</p>
            {reason && (
              <p className="text-sm text-slate-400">Reason: {reason}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              className="border-slate-600 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecute}
              disabled={isExecuting}
              className={cn(
                'text-white',
                operation === 'DELETE' || operation === 'DEACTIVATE'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              )}
            >
              <Play className="w-4 h-4 mr-2" />
              Execute Operation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('bg-slate-900/50 border-slate-700', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-200 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Bulk Actions
            <Badge variant="secondary" className="bg-blue-600 text-white">
              {selectedUserIds.length} selected
            </Badge>
          </CardTitle>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Operation Selection */}
        <div className="space-y-2">
          <Label className="text-slate-300">Select Operation</Label>
          <Select value={operation} onValueChange={(value) => setOperation(value as BulkOperationType)}>
            <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
              <SelectValue placeholder="Choose an operation..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {availableOperations.map((op) => (
                <SelectItem
                  key={op.value}
                  value={op.value}
                  className="text-slate-200 focus:bg-slate-700 focus:text-white"
                >
                  <div className="flex items-center gap-2">
                    <span className={op.color}>{op.icon}</span>
                    <div>
                      <div>{op.label}</div>
                      <div className="text-xs text-slate-500">{op.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Role Selection for Role Change */}
        {operation === 'ROLE_CHANGE' && (
          <div className="space-y-2">
            <Label className="text-slate-300">Target Role</Label>
            <Select value={targetRole} onValueChange={setTargetRole}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                <SelectValue placeholder="Select new role..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {manageableRoles.map((role) => {
                  const roleInfo = formatRole(role.name);
                  return (
                    <SelectItem
                      key={role.name}
                      value={role.name}
                      className="text-slate-200 focus:bg-slate-700 focus:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <span>{roleInfo.icon}</span>
                        <span>{roleInfo.text}</span>
                        <span className="text-xs text-slate-500">(Level {role.level})</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Reason */}
        <div className="space-y-2">
          <Label className="text-slate-300">
            Reason {operation === 'DELETE' && <span className="text-red-400">(Required)</span>}
          </Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for this bulk operation..."
            className="bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500"
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={onClearSelection}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          
          <Button
            onClick={() => setShowConfirmation(true)}
            disabled={!canExecute() || (operation === 'DELETE' && !reason.trim())}
            className={cn(
              'text-white',
              operation === 'DELETE' || operation === 'DEACTIVATE'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            )}
          >
            <Play className="w-4 h-4 mr-2" />
            Execute Operation
          </Button>
        </div>

        {/* Operation Info */}
        {selectedOperation && (
          <Alert className="bg-slate-800/50 border-slate-600">
            <selectedOperation.icon.type className="w-4 h-4" />
            <AlertDescription className="text-slate-300">
              <strong>{selectedOperation.label}:</strong> {selectedOperation.description}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkUserActions;