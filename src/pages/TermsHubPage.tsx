// Terms hub page with navigation to all legal documents

import React, { useState } from 'react';
import { FileText, Shield, Copyright, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Import modals for inline viewing option
import TermsOfServiceModal from '@/components/legal/TermsOfServiceModal';
import PrivacyPolicyModal from '@/components/legal/PrivacyPolicyModal';
import CopyrightAgreementModal from '@/components/legal/CopyrightAgreementModal';
import GdprAgreementModal from '@/components/legal/GdprAgreementModal';

const TermsHubPage: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const legalDocuments = [
    {
      id: 'terms-of-service',
      title: 'Terms of Service',
      description: 'Platform usage rules, Orca Coins, intellectual property rights, and user agreements.',
      icon: FileText,
      path: '/terms-of-service',
      color: 'text-blue-400'
    },
    {
      id: 'privacy-policy',
      title: 'Privacy Policy',
      description: 'How we collect, use, and protect your personal information and data.',
      icon: Shield,
      path: '/privacy-policy',
      color: 'text-green-400'
    },
    {
      id: 'copyright-agreement',
      title: 'Copyright Agreement',
      description: 'Intellectual property rights, DMCA policy, and content usage terms.',
      icon: Copyright,
      path: '/copyright-agreement',
      color: 'text-purple-400'
    },
    {
      id: 'gdpr-agreement',
      title: 'GDPR Agreement',
      description: 'Your data protection rights under European Union regulations.',
      icon: Shield,
      path: '/gdpr-agreement',
      color: 'text-orange-400'
    }
  ];

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <Helmet>
        <title>Legal Documents | LabDojo</title>
        <meta name="description" content="Access all LabDojo legal documents including Terms of Service, Privacy Policy, Copyright Agreement, and GDPR compliance information." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`${window.location.origin}/terms`} />
      </Helmet>
      
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Legal Documents</h1>
            <p className="text-slate-400 text-xl max-w-3xl mx-auto">
              Access all our legal documents and policies. You can view them as dedicated pages or open them in modal dialogs.
            </p>
          </div>

          {/* Legal Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {legalDocuments.map((doc) => {
              const IconComponent = doc.icon;
              return (
                <Card key={doc.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <IconComponent className={`w-6 h-6 ${doc.color}`} />
                      <span className="text-white">{doc.title}</span>
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {doc.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Link to dedicated page */}
                      <Button asChild variant="default" className="flex-1">
                        <Link to={doc.path} className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          View Page
                        </Link>
                      </Button>
                      
                      {/* Modal trigger */}
                      <Button 
                        variant="outline" 
                        className="flex-1 bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
                        onClick={() => setActiveModal(doc.id)}
                      >
                        Quick View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional Information */}
          <div className="mt-12 bg-slate-900 rounded-lg border border-slate-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-3">About Our Legal Documents</h2>
            <div className="text-slate-300 space-y-2">
              <p>
                These documents outline your rights and responsibilities when using LabDojo. They are designed to be transparent and comprehensive.
              </p>
              <p>
                <strong>Last Updated:</strong> 20.08.2025
              </p>
              <p>
                <strong>Contact:</strong> For any questions regarding these documents, please contact us at{' '}
                <a href="mailto:labdojo.io@gmail.com" className="text-blue-400 hover:text-blue-300">
                  labdojo.io@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TermsOfServiceModal 
        isOpen={activeModal === 'terms-of-service'} 
        onClose={closeModal} 
      />
      <PrivacyPolicyModal 
        isOpen={activeModal === 'privacy-policy'} 
        onClose={closeModal} 
      />
      <CopyrightAgreementModal 
        isOpen={activeModal === 'copyright-agreement'} 
        onClose={closeModal} 
      />
      <GdprAgreementModal 
        isOpen={activeModal === 'gdpr-agreement'} 
        onClose={closeModal} 
      />
    </>
  );
};

export default TermsHubPage;