// GDPR Agreement dedicated page

import React from 'react';
import { Shield } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import GdprAgreementContent from '@/components/legal/content/GdprAgreementContent';

const GdprAgreementPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>GDPR Agreement | LabDojo</title>
        <meta name="description" content="Understand your GDPR rights as an EU/EEA user. Learn about data protection and how to exercise your privacy rights." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${window.location.origin}/gdpr-agreement`} />
      </Helmet>
      
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">GDPR Agreement</h1>
            </div>
            <p className="text-slate-400 text-lg">
              European Union General Data Protection Regulation compliance
            </p>
          </div>

          {/* Content */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
            <GdprAgreementContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default GdprAgreementPage;