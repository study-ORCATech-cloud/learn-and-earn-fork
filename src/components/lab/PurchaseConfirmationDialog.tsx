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
import { Coins, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { useOrcaWallet } from '../../context/OrcaWalletContext';
import { PurchaseRequest } from '../../types/orcaCoins';

interface PurchaseConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  labData: {
    title: string;
    difficulty: string;
    cost: number;
    description?: string;
    premiumFilesCount: number;
  };
  isPurchasing: boolean;
  purchaseError: string | null;
}

const PurchaseConfirmationDialog: React.FC<PurchaseConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  labData,
  isPurchasing,
  purchaseError
}) => {
  const { balance, canAffordLab, formatCoins } = useOrcaWallet();

  const canAfford = canAffordLab(labData.cost);
  const currentBalance = balance || 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-blue-400';
      case 'professional': return 'text-purple-400';
      case 'expert': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-900/30 border-green-500/30 text-green-300';
      case 'intermediate': return 'bg-blue-900/30 border-blue-500/30 text-blue-300';
      case 'professional': return 'bg-purple-900/30 border-purple-500/30 text-purple-300';
      case 'expert': return 'bg-red-900/30 border-red-500/30 text-red-300';
      default: return 'bg-gray-900/30 border-gray-500/30 text-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Lock className="w-5 h-5 text-amber-400" />
            Purchase Premium Access
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Unlock all premium files and solutions for this lab
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lab Info */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">{labData.title}</h3>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-1 rounded text-xs border ${getDifficultyBadgeColor(labData.difficulty)}`}>
                {labData.difficulty.charAt(0).toUpperCase() + labData.difficulty.slice(1)}
              </span>
              <span className="text-slate-400 text-sm">
                {labData.premiumFilesCount} premium files
              </span>
            </div>
            {labData.description && (
              <p className="text-slate-300 text-sm">{labData.description}</p>
            )}
          </div>

          {/* Cost and Balance */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">Cost:</span>
              <div className="flex items-center gap-1 text-amber-400 font-semibold">
                <Coins className="w-4 h-4" />
                <span>{labData.cost}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">Your Balance:</span>
              <div className="flex items-center gap-1 text-amber-400">
                <Coins className="w-4 h-4" />
                <span>{currentBalance}</span>
              </div>
            </div>
            <div className="border-t border-slate-700 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">After Purchase:</span>
                <div className="flex items-center gap-1 text-amber-400">
                  <Coins className="w-4 h-4" />
                  <span>{currentBalance - labData.cost}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {purchaseError && (
            <Alert className="bg-red-900/30 border-red-500/30">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-300">
                {purchaseError}
              </AlertDescription>
            </Alert>
          )}

          {/* Insufficient Balance Warning */}
          {!canAfford && (
            <Alert className="bg-orange-900/30 border-orange-500/30">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-orange-300">
                Insufficient Orca Coins. You need {labData.cost - currentBalance} more coins to purchase this lab.
              </AlertDescription>
            </Alert>
          )}

          {/* Premium Features */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">What you'll get:</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>✓ Lifetime access to the lab's premium content</li>
              <li>✓ Future premium content updates</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPurchasing}
            className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!canAfford || isPurchasing}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isPurchasing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Purchasing...
              </>
            ) : (
              <>
                <Coins className="w-4 h-4 mr-2" />
                Purchase for {labData.cost} Coins
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseConfirmationDialog;