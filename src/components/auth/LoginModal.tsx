import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../context/AuthContext';
import { Github, Chrome, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TermsOfServiceModal from '../legal/TermsOfServiceModal';
import PrivacyPolicyModal from '../legal/PrivacyPolicyModal';
import GdprAgreementModal from '../legal/GdprAgreementModal';
import CopyrightAgreementModal from '../legal/CopyrightAgreementModal';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, isLoading, error, clearError } = useAuth();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showGdprModal, setShowGdprModal] = useState(false);
  const [showCopyrightModal, setShowCopyrightModal] = useState(false);

  const handleLogin = (provider: 'google' | 'github') => {
    clearError();
    login(provider);
    // Modal will stay open during redirect, but user will see loading state
  };

  const handleClose = () => {
    clearError();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white text-center text-2xl">
            Welcome to LabDojo
          </DialogTitle>
          <DialogDescription className="text-slate-300 text-center">
            Sign in to access personalized learning content and track your progress
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert className="bg-red-900/20 border-red-500/30">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              onClick={() => handleLogin('google')}
              disabled={isLoading}
              className="w-full bg-white text-slate-900 hover:bg-slate-100 transition-colors py-3 h-12"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-3" />
              ) : (
                <Chrome className="w-5 h-5 mr-3" />
              )}
              Continue with Google
            </Button>

            <Button
              onClick={() => handleLogin('github')}
              disabled={isLoading}
              className="w-full bg-slate-800 text-white hover:bg-slate-700 transition-colors py-3 h-12"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-3" />
              ) : (
                <Github className="w-5 h-5 mr-3" />
              )}
              Continue with GitHub
            </Button>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-2 text-slate-400">
                Secure OAuth Authentication
              </span>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 space-y-1">
            <p>
              By signing in, you acknowledge and agree to our{' '}
              <button
                onClick={() => setShowTermsModal(true)}
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                Terms of Service
              </button>
              ,{' '}
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                Privacy Policy
              </button>
              ,{' '}
              <button
                onClick={() => setShowCopyrightModal(true)}
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                Copyright Agreement
              </button>
              {' '}and{' '}
              <button
                onClick={() => setShowGdprModal(true)}
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                GDPR Agreement
              </button>
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="absolute inset-0 bg-slate-900/80 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-3" />
              <p className="text-slate-300">Redirecting to authentication...</p>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Legal Document Modals */}
      <TermsOfServiceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
      
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      <GdprAgreementModal
        isOpen={showGdprModal}
        onClose={() => setShowGdprModal(false)}
      />

      <CopyrightAgreementModal
        isOpen={showCopyrightModal}
        onClose={() => setShowCopyrightModal(false)}
      />
    </Dialog>
  );
};

export default LoginModal;