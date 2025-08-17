import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  LogOut, 
  Settings, 
  Github, 
  Chrome,
  Loader2,
  ChevronDown,
  Wallet
} from 'lucide-react';
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

interface UserProfileProps {
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ className = '' }) => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!user) return null;

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleWalletClick = () => {
    navigate('/wallet');
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  const getProviderIcon = () => {
    switch (user.provider) {
      case 'google':
        return <Chrome className="w-3 h-3" />;
      case 'github':
        return <Github className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getUserInitials = () => {
    return user.name
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        <span className="text-sm text-slate-400">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className={`flex items-center gap-2 px-2 py-1 h-auto hover:bg-slate-800 ${className}`}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div className="hidden md:flex flex-col items-start min-w-0">
              <span className="text-sm font-medium text-white truncate max-w-[120px]">
                {user.name}
              </span>
              <div className="flex items-center gap-1">
                {getProviderIcon()}
                <span className="text-xs text-slate-400 capitalize">
                  {user.provider}
                </span>
              </div>
            </div>
            
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-slate-900 border-slate-800"
        >
          <DropdownMenuLabel className="text-white">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator className="bg-slate-700" />
          
          <DropdownMenuItem 
            onClick={handleProfileClick}
            className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800 cursor-pointer"
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleWalletClick}
            className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800 cursor-pointer"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Wallet
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={handleSettingsClick}
            className="text-slate-300 hover:bg-slate-800 focus:bg-slate-800 cursor-pointer"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
          
          <DropdownMenuSeparator className="bg-slate-700" />
          
          <DropdownMenuItem 
            onClick={() => setShowLogoutDialog(true)}
            className="text-red-400 hover:bg-slate-800 focus:bg-slate-800 cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Sign out of your account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              You will be signed out of your ORCATech account. Any unsaved progress may be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-slate-800 text-white hover:bg-slate-700"
              disabled={isLoggingOut}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing out...
                </>
              ) : (
                'Sign out'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserProfile;