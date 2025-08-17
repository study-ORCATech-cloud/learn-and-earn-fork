
import React, { useState } from 'react';
import Logo from './Logo';
import Navigation from './Navigation';
import SearchBar from './SearchBar';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../auth/UserProfile';
import { LoginModal } from '../auth/LoginModal';
import WalletBalance from './WalletBalance';
import { Button } from '@/components/ui/button';
import { LogIn, Loader2 } from 'lucide-react';

const Header = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const renderAuthSection = () => {
    // Show loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-end w-32">
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        </div>
      );
    }

    // Show user profile if authenticated
    if (isAuthenticated && user) {
      return (
        <div className="flex items-center justify-end gap-3">
          <WalletBalance />
          <UserProfile />
        </div>
      );
    }

    // Show login button if not authenticated
    return (
      <div className="flex items-center justify-end w-32">
        <Button
          onClick={() => setShowLoginModal(true)}
          variant="outline"
          size="sm"
          className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span className="hidden sm:inline">Sign In</span>
        </Button>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16 gap-4">
          <div className="flex items-center gap-4">
            <Navigation />
            <Logo />
          </div>
          <div className="flex-1 flex justify-center">
            <SearchBar />
          </div>
          {renderAuthSection()}
        </div>
      </div>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </header>
  );
};

export default Header;
