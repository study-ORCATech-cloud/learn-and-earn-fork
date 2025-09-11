// Copyright Agreement modal component

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
import { X, Copyright } from 'lucide-react';

interface CopyrightAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CopyrightAgreementModal: React.FC<CopyrightAgreementModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Copyright className="w-5 h-5" />
            Copyright Agreement
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Intellectual property rights and content usage agreement
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
                Learn-and-Earn.online ("Website," "Platform," "we," "us," or "our") respects the intellectual property rights of others and expects users to do the same.<br/>
                This Copyright & DMCA Policy explains how our content may be used, how third-party materials are treated, and how we handle copyright infringement claims.
              </p>
            </section>

            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white">1. Copyright Ownership</h2>
              <p className="leading-relaxed">
                All original content available on the Platform, including but not limited to tutorials, labs, exercises, text, graphics, code snippets, and design elements ("Content"), is the property of Learn-and-Earn.online or its licensors and is protected by applicable copyright laws.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white">2. Licensed Content Usage</h2>
              <p className="leading-relaxed">
                Users are granted a limited, non-exclusive, non-transferable license to access and use the Content solely for their own personal educational purposes.
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Content may not be copied, reproduced, distributed, republished, or exploited for commercial purposes without our prior written consent.</li>
                <li>Content may not be used for training artificial intelligence systems or automated data harvesting without explicit authorization.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white">3. Prohibited Uses</h2>
              <p className="leading-relaxed">
                Users may not:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Reproduce, resell, or redistribute Content.</li>
                <li>Remove copyright or attribution notices from Content.</li>
                <li>Use automated systems (e.g., bots, scrapers) to access or download Content.</li>
                <li>Incorporate Content into other platforms, courses, or products without prior written permission.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white">4. Third-Party Content</h2>
              <p className="leading-relaxed">
                The Platform may reference or provide access to third-party materials, resources, or websites ("Third-Party Content").
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Such materials remain the property of their respective owners and may be subject to separate copyright notices and license terms.</li>
                <li>Users must comply with the applicable terms of use of such Third-Party Content.</li>
                <li>We are not responsible for the accuracy, availability, or continued accessibility of Third-Party Content.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white">5. DMCA Compliance</h2>
              <p className="leading-relaxed">
                We comply with the Digital Millennium Copyright Act (DMCA) and equivalent international laws.
              </p>
              <p className="leading-relaxed">
                If you believe that content available on this Website infringes your copyright, you may submit a notification that includes:
              </p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>A physical or electronic signature of the copyright owner or person authorized to act on their behalf.</li>
                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                <li>Identification of the material claimed to be infringing, and sufficient information to locate it.</li>
                <li>Your contact information (name, address, telephone number, email).</li>
                <li>A statement that you have a good faith belief the use is unauthorized.</li>
                <li>A statement, under penalty of perjury, that the information is accurate and you are authorized to act on behalf of the copyright owner.</li>
              </ol>
              <p className="leading-relaxed">
                Notices of claimed infringement should be sent to:
              </p>
              <p className="text-blue-400">
                📧 orca.tech.work@gmail.com
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white">6. Counter-Notification</h2>
              <p className="leading-relaxed">
                If you believe your content was removed or disabled by mistake or misidentification, you may file a counter-notification including:
              </p>
              <ol className="list-decimal pl-6 space-y-1">
                <li>Your physical or electronic signature.</li>
                <li>Identification of the removed/disabled content and its prior location.</li>
                <li>A statement, under penalty of perjury, that you have a good faith belief the removal was a mistake.</li>
                <li>Your contact information (name, address, telephone number, email).</li>
              </ol>
              <p className="leading-relaxed">
                Counter-notifications should be sent to:
              </p>
              <p className="text-blue-400">
                📧 orca.tech.work@gmail.com
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-white">7. Repeat Infringers</h2>
              <p className="leading-relaxed">
                We may, in appropriate circumstances, suspend or terminate the accounts of users who are determined to be repeat infringers.
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

export default CopyrightAgreementModal;