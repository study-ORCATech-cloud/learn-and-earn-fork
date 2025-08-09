// Bulk action bar component for user management

import React, { useState } from 'react';
import { Users, Trash2, UserCheck, UserX, UserCog, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRoles } from '../../hooks/useRoles';
import { useBulkOperations } from '../../hooks/useBulkOperations';
import ConfirmDialog from './ConfirmDialog';
import type { UserRole } from '../../types/role';
import type { BulkOperation } from '../../types/management';

interface BulkActionBarProps {
  selectedCount: number;
  selectedUserIds: string[];
  onClearSelection: () => void;
  onRefresh?: () => void;
  className?: string;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  selectedUserIds,
  onClearSelection,
  onRefresh,
  className,
}) => {
  const { getAvailableRoles } = useRoles();
  const { 
    performBulkActivate, 
    performBulkDeactivate, 
    performBulkRoleChange, 
    performBulkDelete,
    canPerformOperation,
    isInProgress 
  } = useBulkOperations();

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: BulkOperation;
    title: string;
    description: string;
    targetRole?: UserRole;
    confirmText: string;
    requireReason: boolean;
  }>({
    isOpen: false,
    type: 'ACTIVATE',
    title: '',
    description: '',
    confirmText: '',
    requireReason: false,
  });

  const availableRoles = getAvailableRoles();

  if (selectedCount === 0) {
    return null;
  }

  const handleBulkAction = (action: BulkOperation, targetRole?: UserRole) => {
    let title = '';
    let description = '';
    let confirmText = '';
    let requireReason = false;

    switch (action) {
      case 'ACTIVATE':
        title = 'Activate Users';
        description = `Are you sure you want to activate ${selectedCount} selected user(s)? This will restore their access to the system.`;
        confirmText = 'Activate Users';
        requireReason = false;
        break;
      
      case 'DEACTIVATE':
        title = 'Deactivate Users';
        description = `Are you sure you want to deactivate ${selectedCount} selected user(s)? This will suspend their access to the system.`;
        confirmText = 'Deactivate Users';
        requireReason = true;
        break;
      
      case 'ROLE_CHANGE':
        title = 'Change User Roles';
        description = `Are you sure you want to change the role of ${selectedCount} selected user(s) to "${targetRole}"?`;
        confirmText = 'Change Roles';
        requireReason = false;
        break;
      
      case 'DELETE':
        title = 'Delete Users';
        description = `Are you sure you want to delete ${selectedCount} selected user(s)? This action cannot be undone.`;
        confirmText = 'Delete Users';
        requireReason = true;
        break;
    }

    setConfirmDialog({
      isOpen: true,
      type: action,
      title,
      description,
      targetRole,
      confirmText,
      requireReason,
    });
  };

  const handleConfirmAction = async (reason?: string) => {
    const { type, targetRole } = confirmDialog;
    let success = false;

    try {
      switch (type) {
        case 'ACTIVATE':
          success = await performBulkActivate(selectedUserIds, reason);
          break;
        
        case 'DEACTIVATE':
          success = await performBulkDeactivate(selectedUserIds, reason);
          break;
        
        case 'ROLE_CHANGE':
          if (targetRole) {
            success = await performBulkRoleChange(selectedUserIds, targetRole, reason);
          }
          break;
        
        case 'DELETE':
          success = await performBulkDelete(selectedUserIds, reason);
          break;
      }

      if (success) {
        onClearSelection();
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      console.error('Bulk operation failed:', error);
    }
  };

  const handleCloseDialog = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const canActivate = canPerformOperation('ACTIVATE');
  const canDeactivate = canPerformOperation('DEACTIVATE');
  const canChangeRoles = canPerformOperation('ROLE_CHANGE');
  const canDelete = canPerformOperation('DELETE');

  return (
    <>
      <Card className={cn(
        'p-4 bg-slate-900/50 border-slate-700 backdrop-blur-sm',
        'sticky top-0 z-10 shadow-lg',
        className
      )}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-blue-400">
              <Users className="w-5 h-5" />
              <span className="font-medium">
                {selectedCount} user{selectedCount === 1 ? '' : 's'} selected
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-8 text-slate-400 hover:text-white hover:bg-slate-700"
              disabled={isInProgress}
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Activate button */}
            {canActivate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('ACTIVATE')}
                disabled={isInProgress}
                className="bg-slate-800 border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
              >
                <UserCheck className="w-4 h-4 mr-1" />
                Activate
              </Button>
            )}

            {/* Deactivate button */}
            {canDeactivate && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('DEACTIVATE')}
                disabled={isInProgress}
                className="bg-slate-800 border-orange-600 text-orange-400 hover:bg-orange-600 hover:text-white"
              >
                <UserX className="w-4 h-4 mr-1" />
                Deactivate
              </Button>
            )}

            {/* Role change dropdown */}
            {canChangeRoles && availableRoles.length > 0 && (
              <Select
                onValueChange={(role) => handleBulkAction('ROLE_CHANGE', role as UserRole)}
                disabled={isInProgress}
              >
                <SelectTrigger className="w-[140px] h-9 bg-slate-800 border-slate-600 text-slate-200">
                  <UserCog className="w-4 h-4 mr-1" />
                  <SelectValue placeholder="Change Role" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {availableRoles.map((role) => (
                    <SelectItem 
                      key={role} 
                      value={role}
                      className="text-slate-200 focus:bg-slate-700 focus:text-white"
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Delete button */}
            {canDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('DELETE')}
                disabled={isInProgress}
                className="bg-slate-800 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        {isInProgress && (
          <div className="mt-3 pt-3 border-t border-slate-700">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              Processing bulk operation...
            </div>
          </div>
        )}
      </Card>

      {/* Confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmText={confirmDialog.confirmText}
        type={confirmDialog.type === 'DELETE' ? 'danger' : 'warning'}
        requireReason={confirmDialog.requireReason}
        reasonLabel={
          confirmDialog.type === 'DEACTIVATE'
            ? 'Reason for deactivation'
            : confirmDialog.type === 'DELETE'
            ? 'Reason for deletion'
            : 'Reason'
        }
        icon={
          confirmDialog.type === 'DELETE'
            ? 'delete'
            : confirmDialog.type === 'DEACTIVATE'
            ? 'deactivate'
            : confirmDialog.type === 'ACTIVATE'
            ? 'activate'
            : 'warning'
        }
        isLoading={isInProgress}
      />
    </>
  );
};

export default BulkActionBar;