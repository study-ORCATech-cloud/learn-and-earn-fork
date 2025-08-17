import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Coins, AlertTriangle, Loader2, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { orcaCoinsService } from '../../../services/orcaCoinsService';
import { GrantCoinsRequest, GrantCoinsResponse } from '../../../types/orcaCoins';
import { User } from '../../../management/types/user';

interface GrantCoinsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess?: (response: GrantCoinsResponse) => void;
}

const GrantCoinsDialog: React.FC<GrantCoinsDialogProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess
}) => {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isGranting, setIsGranting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleClose = () => {
    setAmount('');
    setReason('');
    setError(null);
    setIsGranting(false);
    onClose();
  };

  const handleGrant = async () => {
    if (!user || !amount || !reason) {
      setError('Please fill in all required fields');
      return;
    }

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Amount must be a positive number');
      return;
    }

    if (amountNum > 1000) {
      setError('Maximum grant amount is 1000 coins');
      return;
    }

    setIsGranting(true);
    setError(null);

    try {
      const grantData: GrantCoinsRequest = {
        user_id: user.id,
        amount: amountNum,
        reason: reason.trim()
      };

      const response = await orcaCoinsService.grantCoins(grantData);

      if (response.success) {
        toast({
          title: "Coins Granted Successfully! 🎉",
          description: `Successfully granted ${amountNum} Orca Coins to ${user.name}`,
          className: "bg-green-800 border-green-600 text-green-100",
        });
        onSuccess?.(response);
        handleClose();
      } else {
        const errorMessage = response.error || response.message || 'Failed to grant coins';
        setError(errorMessage);
        toast({
          title: "Failed to Grant Coins",
          description: errorMessage,
          className: "bg-red-800 border-red-600 text-red-100",
        });
      }
    } catch (error) {
      console.error('Failed to grant coins:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Error Granting Coins",
        description: errorMessage,
        className: "bg-red-800 border-red-600 text-red-100",
      });
    } finally {
      setIsGranting(false);
    }
  };

  const getPresetReasons = () => [
    'Welcome bonus for new user',
    'Promotional bonus',
    'Compensation for technical issues',
    'Contest prize',
    'Achievement reward',
    'Customer service goodwill'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Gift className="w-5 h-5 text-amber-400" />
            Grant Orca Coins
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Grant Orca Coins to {user?.name || 'user'}. This action will be logged and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          {user && (
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="text-sm text-slate-400">{user.email}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-slate-300">
              Amount <span className="text-red-400">*</span>
            </Label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-400" />
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                max="1000"
                className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-slate-400"
              />
            </div>
            <p className="text-xs text-slate-400">
              Enter a value between 1 and 1000 Orca Coins
            </p>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-slate-300">
              Reason <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for granting coins..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 min-h-[80px]"
              maxLength={500}
            />
            <p className="text-xs text-slate-400">
              {reason.length}/500 characters - This will be visible in the user's transaction history
            </p>
          </div>

          {/* Preset Reasons */}
          <div className="space-y-2">
            <Label className="text-slate-300">Quick Reasons</Label>
            <div className="flex flex-wrap gap-2">
              {getPresetReasons().map((presetReason) => (
                <Button
                  key={presetReason}
                  variant="outline"
                  size="sm"
                  onClick={() => setReason(presetReason)}
                  className="h-auto py-1 px-2 text-xs bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  {presetReason}
                </Button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert className="bg-red-900/30 border-red-500/30">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Summary */}
          {amount && reason && (
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-3">
              <h4 className="font-medium text-amber-300 mb-2">Grant Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">User:</span>
                  <span className="text-white">{user?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Amount:</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    {amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reason:</span>
                  <span className="text-white text-right max-w-[200px] truncate">{reason}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isGranting}
            className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGrant}
            disabled={!amount || !reason || isGranting}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isGranting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Granting...
              </>
            ) : (
              <>
                <Gift className="w-4 h-4 mr-2" />
                Grant {amount || '0'} Coins
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GrantCoinsDialog;