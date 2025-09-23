// Privacy Policy dedicated page

import React from 'react';
import { Shield } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import PrivacyPolicyContent from '@/components/legal/content/PrivacyPolicyContent';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | LabDojo</title>
        <meta name="description" content="Learn how LabDojo collects, uses, and protects your personal information. Read our comprehensive privacy policy." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${window.location.origin}/privacy-policy`} />
      </Helmet>
      
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
            </div>
            <p className="text-slate-400 text-lg">
              Learn how we collect, use, and protect your information
            </p>
          </div>

          {/* Content */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
            <PrivacyPolicyContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;