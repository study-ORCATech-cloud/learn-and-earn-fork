// Footer component with copyright and legal links

import React, { useState } from 'react';
import TermsOfServiceModal from '../legal/TermsOfServiceModal';
import PrivacyPolicyModal from '../legal/PrivacyPolicyModal';
import CopyrightAgreementModal from '../legal/CopyrightAgreementModal';

const Footer: React.FC = () => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showCopyrightModal, setShowCopyrightModal] = useState(false);

  return (
    <>
      <footer className="bg-slate-900/95 border-t border-slate-800 py-4">
        <div className="container mx-auto px-4">
          <div className="text-center text-xs text-slate-400">
            <p>
              © 2025 Learn-and-Earn.online. All rights reserved.{' '}
              <button
                onClick={() => setShowTermsModal(true)}
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                Terms of Use
              </button>
              {' • '}
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                Privacy Policy
              </button>
              {' • '}
              <button
                onClick={() => setShowCopyrightModal(true)}
                className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                Copyright & DMCA Policy
              </button>
              .
            </p>
          </div>
        </div>
      </footer>

      {/* Legal Document Modals */}
      <TermsOfServiceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
      
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      <CopyrightAgreementModal
        isOpen={showCopyrightModal}
        onClose={() => setShowCopyrightModal(false)}
      />
    </>
  );
};

export default Footer;