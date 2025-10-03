import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  Loader2,
  Package,
  Trash2,
  RotateCcw,
  Power,
  PowerOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ActionType = 'delete' | 'sync' | 'activate' | 'deactivate' | 'bulk-delete' | 'bulk-activate' | 'bulk-deactivate';
export type ModalType = 'confirmation' | 'result' | 'loading';
export type ResultType = 'success' | 'error' | 'warning' | 'info';

interface PackageActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  type: ModalType;
  actionType?: ActionType;
  resultType?: ResultType;
  title?: string;
  description?: string;
  message?: string;
  packageName?: string;
  packageCount?: number;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

const PackageActionModal: React.FC<PackageActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  actionType,
  resultType = 'info',
  title,
  description,
  message,
  packageName,
  packageCount,
  isLoading = false,
  confirmText,
  cancelText = 'Cancel',
}) => {
  const getActionIcon = (action: ActionType) => {
    switch (action) {
      case 'delete':
      case 'bulk-delete':
        return <Trash2 className="w-5 h-5" />;
      case 'sync':
        return <RotateCcw className="w-5 h-5" />;
      case 'activate':
      case 'bulk-activate':
        return <Power className="w-5 h-5" />;
      case 'deactivate':
      case 'bulk-deactivate':
        return <PowerOff className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getResultIcon = (result: ResultType) => {
    switch (result) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getActionTitle = (action: ActionType) => {
    switch (action) {
      case 'delete':
        return 'Delete Package';
      case 'sync':
        return 'Sync Package';
      case 'activate':
        return 'Activate Package';
      case 'deactivate':
        return 'Deactivate Package';
      case 'bulk-delete':
        return 'Delete Packages';
      case 'bulk-activate':
        return 'Activate Packages';
      case 'bulk-deactivate':
        return 'Deactivate Packages';
      default:
        return 'Package Action';
    }
  };

  const getActionDescription = (action: ActionType) => {
    const isBulk = action.startsWith('bulk-');
    const count = packageCount || 1;
    const target = isBulk ? `${count} package${count > 1 ? 's' : ''}` : `"${packageName}"`;

    switch (action) {
      case 'delete':
      case 'bulk-delete':
        return `Are you sure you want to deactivate ${target}? This action cannot be undone.`;
      case 'sync':
        return `Retry Paddle synchronization for ${target}?`;
      case 'activate':
      case 'bulk-activate':
        return `Activate ${target}? This will make ${isBulk ? 'them' : 'it'} available for purchase.`;
      case 'deactivate':
      case 'bulk-deactivate':
        return `Deactivate ${target}? This will prevent new purchases.`;
      default:
        return `Perform action on ${target}?`;
    }
  };

  const getConfirmText = (action: ActionType) => {
    switch (action) {
      case 'delete':
      case 'bulk-delete':
        return 'Delete';
      case 'sync':
        return 'Sync';
      case 'activate':
      case 'bulk-activate':
        return 'Activate';
      case 'deactivate':
      case 'bulk-deactivate':
        return 'Deactivate';
      default:
        return 'Confirm';
    }
  };

  const getConfirmButtonStyle = (action: ActionType) => {
    switch (action) {
      case 'delete':
      case 'bulk-delete':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'sync':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'activate':
      case 'bulk-activate':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'deactivate':
      case 'bulk-deactivate':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };


  const renderConfirmationModal = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-slate-200 flex items-center gap-2">
          {actionType && getActionIcon(actionType)}
          {title || (actionType && getActionTitle(actionType))}
        </DialogTitle>
        <DialogDescription className="text-slate-400">
          {description || (actionType && getActionDescription(actionType))}
        </DialogDescription>
      </DialogHeader>

      <DialogFooter className="gap-2">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            actionType && getConfirmButtonStyle(actionType),
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            confirmText || (actionType && getConfirmText(actionType))
          )}
        </Button>
      </DialogFooter>
    </>
  );

  const renderLoadingModal = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-slate-200 flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          {title || 'Processing...'}
        </DialogTitle>
        <DialogDescription className="text-slate-400">
          {description || 'Please wait while we process your request.'}
        </DialogDescription>
      </DialogHeader>
    </>
  );

  const renderResultModal = () => (
    <>
      <DialogHeader>
        <DialogTitle className="text-slate-200 flex items-center gap-2">
          {getResultIcon(resultType)}
          {title || (resultType === 'success' ? 'Success' : resultType === 'error' ? 'Error' : 'Information')}
        </DialogTitle>
      </DialogHeader>

      {message && (
        <Alert className={cn(
          'bg-slate-800/50 border-slate-600',
          resultType === 'error' && 'bg-red-900/20 border-red-500/30',
          resultType === 'success' && 'bg-green-900/20 border-green-500/30',
          resultType === 'warning' && 'bg-yellow-900/20 border-yellow-500/30'
        )}>
          {getResultIcon(resultType)}
          <AlertDescription className={cn(
            'text-slate-300',
            resultType === 'error' && 'text-red-400',
            resultType === 'success' && 'text-green-400',
            resultType === 'warning' && 'text-yellow-400'
          )}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      <DialogFooter>
        <Button
          onClick={onClose}
          className="bg-slate-700 hover:bg-slate-600 text-white"
        >
          Close
        </Button>
      </DialogFooter>
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-slate-200">
        {type === 'confirmation' && renderConfirmationModal()}
        {type === 'loading' && renderLoadingModal()}
        {type === 'result' && renderResultModal()}
      </DialogContent>
    </Dialog>
  );
};

export default PackageActionModal;