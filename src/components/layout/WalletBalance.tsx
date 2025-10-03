import React from 'react';
import { Coins, Loader2 } from 'lucide-react';
import { useDojoWallet } from '../../context/DojoWalletContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';

const WalletBalance: React.FC = () => {
  const { balance, isLoadingBalance, formatCoins } = useDojoWallet();
  const navigate = useNavigate();

  const handleWalletClick = () => {
    navigate('/wallet');
  };

  // Don't show anything if balance is not available (backend unavailable)
  if (balance === null) {
    return null;
  }

  if (isLoadingBalance) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleWalletClick}
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 hover:bg-slate-800/50 transition-colors"
        >
          <Coins className="w-4 h-4" />
          <span className="font-semibold">{balance}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Dojo Coins Balance - Click to view wallet</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default WalletBalance;