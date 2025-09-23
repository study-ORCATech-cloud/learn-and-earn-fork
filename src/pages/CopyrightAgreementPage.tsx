// Copyright Agreement dedicated page

import React from 'react';
import { Copyright } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import CopyrightAgreementContent from '@/components/legal/content/CopyrightAgreementContent';

const CopyrightAgreementPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Copyright Agreement | LabDojo</title>
        <meta name="description" content="Read LabDojo's Copyright Agreement and DMCA policy. Understand intellectual property rights and content usage terms." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${window.location.origin}/copyright-agreement`} />
      </Helmet>
      
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Copyright className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Copyright Agreement</h1>
            </div>
            <p className="text-slate-400 text-lg">
              Intellectual property rights and content usage agreement
            </p>
          </div>

          {/* Content */}
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
            <CopyrightAgreementContent />
          </div>
        </div>
      </div>
    </>
  );
};

export default CopyrightAgreementPage;