// GDPR Agreement modal component

import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X, Shield } from 'lucide-react';

interface GdprAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GdprAgreementModal: React.FC<GdprAgreementModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5" />
            GDPR Agreement
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            European Union General Data Protection Regulation compliance
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6 text-slate-300">
            
            {/* Effective Date */}
            <div className="text-sm text-slate-500">
              Effective Date: 20.08.2025
            </div>

            <Separator className="bg-slate-700" />

            {/* Introduction */}
            <section className="space-y-3">
              <p className="leading-relaxed">
                This agreement outlines your rights and how to exercise them when using Learn-and-Earn.online.
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
                <span className="text-blue-400">📧 orca.tech.work@gmail.com</span>. 
                We may require verification of your identity before fulfilling your request.
              </p>
            </section>

            {/* Data Controller Information */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white">Data Controller</h2>
              <p className="leading-relaxed">
                Learn-and-Earn.online acts as the data controller for the personal data processed through this platform. 
                For any GDPR-related inquiries, please contact us using the information provided above.
              </p>
            </section>

            <Separator className="bg-slate-700" />

            <div className="text-sm text-slate-500 italic">
              Last updated: 20.08.2025
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t border-slate-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GdprAgreementModal;