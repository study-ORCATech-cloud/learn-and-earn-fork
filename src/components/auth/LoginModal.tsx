import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '../../context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Load terms acceptance from localStorage when modal opens
  React.useEffect(() => {
    if (isOpen) {
      try {
        const savedTermsAcceptance = localStorage.getItem('labdojo_terms_accepted');
        if (savedTermsAcceptance === 'true') {
          setTermsAccepted(true);
        }
      } catch (error) {
        console.warn('Failed to load terms acceptance from localStorage:', error);
        // If localStorage fails, keep checkbox unchecked for security
        setTermsAccepted(false);
      }
    }
  }, [isOpen]);

  const handleLogin = (provider: 'google' | 'github') => {
    if (!termsAccepted) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 10000); // Hide tooltip after 10 seconds
      return;
    }
    
    // Save terms acceptance to localStorage before login
    try {
      localStorage.setItem('labdojo_terms_accepted', 'true');
    } catch (error) {
      console.warn('Failed to save terms acceptance to localStorage:', error);
      // Continue with login even if localStorage fails
    }
    
    clearError();
    login(provider);
    // Modal will stay open during redirect, but user will see loading state
  };

  const handleClose = () => {
    clearError();
    setShowTooltip(false);
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
            <button
              onClick={() => handleLogin('google')}
              disabled={isLoading}
              className="w-full bg-[#24292f] text-white hover:bg-[#2f363d] active:bg-[#1f2328] disabled:opacity-55 disabled:cursor-not-allowed border border-[#1b1f24] rounded-md transition-all duration-150 py-3 h-12 font-semibold flex items-center justify-center gap-2 shadow-sm"
              style={{
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <span className="inline-flex w-4 h-4" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" className="w-full h-full">
                    <path fill="#4285F4" d="M18 9.2c0-.7-.1-1.4-.2-2H9.2v3.8h4.9c-.2 1.1-.8 2-1.7 2.7v2.2h2.7C16.7 14.2 18 11.9 18 9.2z"/>
                    <path fill="#34A853" d="M9.2 18c2.4 0 4.4-.8 5.9-2.1l-2.7-2.2c-.8.5-1.8.8-3.2.8-2.4 0-4.5-1.6-5.2-3.9H1.1v2.3C2.6 15.9 5.7 18 9.2 18z"/>
                    <path fill="#FBBC04" d="M4 10.5c-.2-.5-.2-1.1-.2-1.6s.1-1.1.2-1.6V4.9H1.1C.4 6.3 0 7.7 0 9.2s.4 2.9 1.1 4.3L4 10.5z"/>
                    <path fill="#EA4335" d="M9.2 3.6c1.4 0 2.6.5 3.6 1.4l2.7-2.7C14.6 1 12.5 0 9.2 0 5.7 0 2.6 2.1 1.1 5.1L4 7.4C4.7 5.2 6.8 3.6 9.2 3.6z"/>
                  </svg>
                </span>
              )}
              <span className="text-sm">Sign in with Google</span>
            </button>

            <button
              onClick={() => handleLogin('github')}
              disabled={isLoading}
              className="w-full bg-[#24292f] text-white hover:bg-[#2f363d] active:bg-[#1f2328] disabled:opacity-55 disabled:cursor-not-allowed border border-[#1b1f24] rounded-md transition-all duration-150 py-3 h-12 font-semibold flex items-center justify-center gap-2 shadow-sm"
              style={{
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <span className="inline-flex w-4 h-4" aria-hidden="true">
                  <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor" className="w-full h-full">
                    <path d="M8 0C3.58 0 0 3.73 0 8.33c0 3.68 2.39 6.8 5.71 7.9.42.08.58-.19.58-.42 0-.2-.01-.86-.01-1.56-2.08.47-2.52-.91-2.68-1.74-.09-.24-.48-.98-.82-1.18-.28-.15-.68-.52-.01-.53.63-.01 1.08.59 1.23.83.72 1.24 1.87.89 2.33.67.07-.54.28-.89.51-1.1-1.85-.22-3.79-.95-3.79-4.25 0-.94.33-1.72.87-2.33-.09-.22-.38-1.13.08-2.35 0 0 .7-.23 2.3.89a7.7 7.7 0 0 1 2.1-.29c.71 0 1.43.1 2.1.29 1.6-1.12 2.3-.89 2.3-.89.46 1.22.17 2.13.08 2.35.54.61.87 1.39.87 2.33 0 3.31-1.94 4.03-3.79 4.25.29.26.54.76.54 1.55 0 1.12-.01 2.02-.01 2.29 0 .23.15.5.58.42C13.61 15.13 16 12 16 8.33 16 3.73 12.42 0 8 0z"/>
                  </svg>
                </span>
              )}
              <span className="text-sm">Sign in with GitHub</span>
            </button>
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

          <div className="space-y-3">
            <div className="relative">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms-checkbox"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="mt-0.5 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                />
                <label htmlFor="terms-checkbox" className="text-xs text-slate-400 leading-relaxed cursor-pointer">
                  I acknowledge and agree to the{' '}
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
                </label>
              </div>
              {showTooltip && !termsAccepted && (
                <div className="mt-2 px-3 py-2 bg-red-900 text-red-200 text-sm rounded-md shadow-lg border border-red-700">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Approval of our terms and conditions is required to proceed.
                  </div>
                </div>
              )}
            </div>
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