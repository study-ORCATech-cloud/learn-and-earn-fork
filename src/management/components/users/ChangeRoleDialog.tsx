// Change Role Dialog component for individual users

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useManagement } from '../../context/ManagementContext';
import { useRoles } from '../../hooks/useRoles';
import { formatRole } from '../../utils/formatters';
import { userManagementService } from '../../services/userManagementService';
import type { ManagementUser } from '../../types/user';

interface ChangeRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: ManagementUser | null;
}

const ChangeRoleDialog: React.FC<ChangeRoleDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user,
}) => {
  const management = useManagement();
  const { manageableRoles, roleHierarchy } = useRoles();
  
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (isOpen && user) {
      setSelectedRole(user.role);
      setReason('');
      setError(null);
    } else {
      setSelectedRole('');
      setReason('');
      setError(null);
    }
  }, [isOpen, user]);

  const handleClose = () => {
    if (!isChanging) {
      onClose();
    }
  };

  const handleChangeRole = async () => {
    if (!user || !selectedRole || selectedRole === user.role) {
      return;
    }

    setIsChanging(true);
    setError(null);

    try {
      const response = await userManagementService.changeUserRole(user.id, {
        role: selectedRole,
        reason: reason.trim() || undefined,
      });

      if (response.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(response.error || 'Failed to change user role');
      }
    } catch (err) {
      console.error('Failed to change user role:', err);
      setError('An unexpected error occurred while changing the user role');
    } finally {
      setIsChanging(false);
    }
  };

  const currentRoleInfo = user ? formatRole(user.role, roleHierarchy) : null;
  const newRoleInfo = selectedRole ? formatRole(selectedRole, roleHierarchy) : null;
  const hasChanges = selectedRole && selectedRole !== user?.role;
  const canConfirm = hasChanges && !isChanging;

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-900 border-slate-700 sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-purple-400" />
            <DialogTitle className="text-xl text-purple-400">
              Change User Role
            </DialogTitle>
          </div>
          <DialogDescription className="text-slate-300">
            Change the role for <strong>{user.name}</strong> ({user.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Role */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Current Role</Label>
            <div className="flex items-center gap-2 p-3 bg-slate-800 rounded-md border border-slate-600">
              {currentRoleInfo && (
                <>
                  <span className="text-lg">{currentRoleInfo.icon}</span>
                  <span className="text-slate-200 font-medium">{currentRoleInfo.text}</span>
                </>
              )}
            </div>
          </div>

          {/* New Role Selection */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">New Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole} disabled={isChanging}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-200">
                <SelectValue placeholder="Select new role..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {manageableRoles?.manageable_roles?.map((roleName) => {
                  // Safety check to prevent undefined role
                  if (!roleName) {
                    console.warn('Role name is undefined:', roleName);
                    return null;
                  }
                  
                  const roleInfo = formatRole(roleName, roleHierarchy);
                  const isCurrentRole = roleName === user.role;
                  
                  // Find detailed role info for level display
                  const detailedRole = manageableRoles?.detailed_roles?.find(r => r.name === roleName);
                  
                  return (
                    <SelectItem
                      key={roleName}
                      value={roleName}
                      disabled={isCurrentRole}
                      className={cn(
                        "text-slate-200 focus:bg-slate-700 focus:text-white",
                        isCurrentRole && "opacity-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span>{roleInfo.icon}</span>
                        <span>{roleInfo.text}</span>
                        {detailedRole && (
                          <span className="text-xs text-slate-500">(Level {detailedRole.level})</span>
                        )}
                        {isCurrentRole && (
                          <span className="text-xs text-blue-400 ml-1">(Current)</span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Role Change Preview */}
          {hasChanges && newRoleInfo && currentRoleInfo && (
            <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-md">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-400">Change:</span>
                <span className="flex items-center gap-1">
                  {currentRoleInfo.icon} {currentRoleInfo.text}
                </span>
                <span className="text-slate-400">→</span>
                <span className="flex items-center gap-1">
                  {newRoleInfo.icon} {newRoleInfo.text}
                </span>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Reason (Optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for role change..."
              disabled={isChanging}
              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 min-h-[80px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-slate-500">
              {reason.length}/500 characters
            </div>
          </div>

          {/* Warning */}
          {hasChanges && (
            <Alert className="bg-yellow-900/20 border-yellow-500/30">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-yellow-400">
                This action will change the user's permissions and capabilities within the system.
              </AlertDescription>
            </Alert>
          )}

          {/* Error */}
          {error && (
            <Alert className="bg-red-900/20 border-red-500/30">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-red-400">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isChanging}
            className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleChangeRole}
            disabled={!canConfirm}
            className={cn(
              'text-white font-medium',
              'bg-purple-600 hover:bg-purple-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isChanging ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Changing Role...
              </div>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Change Role
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeRoleDialog;