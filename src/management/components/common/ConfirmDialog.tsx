// Confirmation dialog component

import React, { useState } from 'react';
import { AlertTriangle, Trash2, UserX, Power, RotateCcw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void> | void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  icon?: 'delete' | 'deactivate' | 'activate' | 'power' | 'warning';
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  requireReason = false,
  reasonLabel = 'Reason',
  reasonPlaceholder = 'Enter a reason for this action...',
  icon = 'warning',
  isLoading = false,
}) => {
  const [reason, setReason] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleClose = () => {
    if (!isConfirming && !isLoading) {
      setReason('');
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      return;
    }

    try {
      setIsConfirming(true);
      await onConfirm(reason.trim() || undefined);
      setReason('');
      onClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const getIcon = () => {
    const iconClass = "w-6 h-6";
    
    switch (icon) {
      case 'delete':
        return <Trash2 className={cn(iconClass, 'text-red-400')} />;
      case 'deactivate':
        return <UserX className={cn(iconClass, 'text-orange-400')} />;
      case 'activate':
        return <RotateCcw className={cn(iconClass, 'text-green-400')} />;
      case 'power':
        return <Power className={cn(iconClass, 'text-yellow-400')} />;
      case 'warning':
      default:
        return <AlertTriangle className={cn(iconClass, 'text-yellow-400')} />;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          headerClass: 'text-red-400',
        };
      case 'warning':
        return {
          confirmButton: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
          headerClass: 'text-orange-400',
        };
      case 'info':
        return {
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          headerClass: 'text-blue-400',
        };
      default:
        return {
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          headerClass: 'text-red-400',
        };
    }
  };

  const styles = getTypeStyles();
  const isDisabled = isConfirming || isLoading || (requireReason && !reason.trim());

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="bg-slate-900 border-slate-700">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <AlertDialogTitle className={cn('text-xl', styles.headerClass)}>
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-300 leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {requireReason && (
          <div className="py-4">
            <Label htmlFor="reason" className="text-slate-300 mb-2 block">
              {reasonLabel} {requireReason && <span className="text-red-400">*</span>}
            </Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              disabled={isConfirming || isLoading}
              className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[80px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-slate-500 mt-1">
              {reason.length}/500 characters
            </div>
          </div>
        )}

        <AlertDialogFooter className="flex gap-3">
          <AlertDialogCancel
            onClick={handleClose}
            disabled={isConfirming || isLoading}
            className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white focus:ring-slate-500"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDisabled}
            className={cn(
              styles.confirmButton,
              'text-white font-medium',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isConfirming || isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;