// Reusable GDPR Agreement content component

import React from 'react';
import { Separator } from '@/components/ui/separator';

const GdprAgreementContent: React.FC = () => {
  return (
    <div className="space-y-6 text-slate-300">
      {/* Effective Date */}
      <div className="text-sm text-slate-500">
        Effective Date: 20.08.2025
      </div>

      <Separator className="bg-slate-700" />

      {/* Introduction */}
      <section className="space-y-3">
        <p className="leading-relaxed">
          This agreement outlines your rights and how to exercise them when using LabDojo.io, operated by ORCA Tech.
        </p>
      </section>

      {/* GDPR Rights Section */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">GDPR Rights (EU/EEA Users)</h2>
        <p className="leading-relaxed">
          If you are located in the European Union (EU) or European Economic Area (EEA), you have specific rights under the General Data Protection Regulation (GDPR). These include:
        </p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">1. Right of Access</h3>
            <p className="leading-relaxed pl-4">
              You may request confirmation of whether we process your personal data and obtain a copy of that data.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">2. Right to Rectification</h3>
            <p className="leading-relaxed pl-4">
              You may request correction of inaccurate or incomplete personal data.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">3. Right to Erasure ("Right to be Forgotten")</h3>
            <p className="leading-relaxed pl-4">
              You may request deletion of your personal data in certain circumstances (e.g., if it is no longer necessary for the purposes for which it was collected).
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">4. Right to Restriction of Processing</h3>
            <p className="leading-relaxed pl-4">
              You may request that we restrict the processing of your personal data in certain cases (e.g., if you contest the accuracy of the data).
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">5. Right to Data Portability</h3>
            <p className="leading-relaxed pl-4">
              You may request to receive your personal data in a structured, commonly used, and machine-readable format, and to transmit that data to another controller where technically feasible.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">6. Right to Object</h3>
            <p className="leading-relaxed pl-4">
              You may object to the processing of your personal data for specific purposes, including direct marketing.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-white">7. Right to Withdraw Consent</h3>
            <p className="leading-relaxed pl-4">
              Where processing is based on your consent, you may withdraw that consent at any time without affecting the lawfulness of processing based on consent before its withdrawal.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Exercising Your Rights</h2>
        <p className="leading-relaxed">
          To exercise any of these rights, please contact us at{' '}
          <span className="text-blue-400">📧 labdojo.io@gmail.com</span>. 
          We may require verification of your identity before fulfilling your request.
        </p>
      </section>

      {/* Data Controller Information */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Data Controller</h2>
        <p className="leading-relaxed">
          ORCA Tech, operating LabDojo.io, acts as the data controller for the personal data processed through this platform.
          For any GDPR-related inquiries, please contact us using the information provided above.
        </p>
      </section>

      <Separator className="bg-slate-700" />

      <div className="text-sm text-slate-500 italic">
        Last updated: 20.08.2025
      </div>
    </div>
  );
};

export default GdprAgreementContent;