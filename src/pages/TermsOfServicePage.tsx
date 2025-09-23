// Terms of Service dedicated page

import React from 'react';
import { FileText } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import TermsOfServiceContent from '@/components/legal/content/TermsOfServiceContent';

const TermsOfServicePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | LabDojo</title>
        <meta name="description" content="Read LabDojo's Terms of Service, including user rights, intellectual property, Orca Coins, and platform usage policies." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${window.location.origin}/terms-of-service`} />
      </Helmet>
      
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
            </div>
            <p className="text-slate-400 text-lg">
              Please read our terms and conditions carefully
            </p>
          </div>

          {/* Content */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
            <TermsOfServiceContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsOfServicePage;