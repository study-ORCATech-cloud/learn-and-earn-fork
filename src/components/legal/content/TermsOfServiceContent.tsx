// Reusable Terms of Service content component

import React from 'react';
import { Separator } from '@/components/ui/separator';

const TermsOfServiceContent: React.FC = () => {
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
          Welcome to LabDojo.io, operated by ORCA Tech ("Website," "Platform," "we," "us," or "our").<br/>
          By accessing or using this Website, you ("you," "user," or "member") agree to be bound by these Terms of Use ("Terms").<br/>
          If you do not agree, you must not use the Website.
        </p>
      </section>

      {/* Section 1 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">1. Intellectual Property Rights</h2>
        <p className="leading-relaxed">
          All content on this Website, including but not limited to text, tutorials, labs, images, graphics, software, and design ("Content"), is the property of ORCA Tech (operating LabDojo.io) or its licensors.<br/>
          The Content is protected by copyright, and other intellectual property laws.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>You may access and use the Content solely for your personal, non-commercial educational use.</li>
          <li>You may not reproduce, redistribute, republish, or create derivative works without our prior written consent.</li>
          <li>Automated scraping, bots, or use of Content for training AI/LLMs without written consent is strictly prohibited.</li>
        </ul>
      </section>

      {/* Section 2 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">2. Donations</h2>
        <p className="leading-relaxed">
          Users may voluntarily make donations to support the Platform. Donations are:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Non-refundable.</li>
          <li>Do not confer ownership, rights to profits, or any contractual benefits.</li>
          <li>Provided solely as goodwill contributions to support the Website's mission.</li>
        </ul>
      </section>

      {/* Section 3 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">3. Orca Coins (Virtual Tokens)</h2>
        <p className="leading-relaxed">
          The Platform offers "Orca Coins," a virtual token that allows access to premium labs, exercises, and features.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Purchase:</strong> Orca Coins may be purchased via third-party payment processors. We do not store payment details.</li>
          <li><strong>Use:</strong> Orca Coins may only be used within this Platform.</li>
          <li><strong>No Monetary Value:</strong> Orca Coins are not money, not cryptocurrency, and have no real-world monetary value. They cannot be redeemed, exchanged, or refunded.</li>
          <li><strong>Non-Transferable:</strong> Orca Coins cannot be sold, traded, or transferred to other users.</li>
          <li><strong>Finality:</strong> All Orca Coin purchases are final and non-refundable.</li>
        </ul>
      </section>

      {/* Section 4 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">4. User Accounts</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access to certain features may require registration via Single Sign-On (SSO).</li>
          <li>You are responsible for maintaining the confidentiality of your account access.</li>
          <li>We reserve the right to suspend or terminate accounts for violation of these Terms.</li>
        </ul>
      </section>

      {/* Section 5 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">5. Prohibited Activities</h2>
        <p className="leading-relaxed">
          You agree not to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Copy, reproduce, or redistribute Content without permission.</li>
          <li>Use automated systems (bots, scrapers, crawlers) to access or extract data.</li>
          <li>Attempt to hack, disrupt, or otherwise interfere with the Website's operation.</li>
          <li>Misuse Orca Coins, including attempts to trade or sell outside the Platform.</li>
        </ul>
      </section>

      {/* Section 6 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">6. Disclaimer of Warranties</h2>
        <p className="leading-relaxed">
          The Website and Content are provided "as is" and "as available," without warranties of any kind, whether express or implied.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>We do not guarantee uninterrupted or error-free operation.</li>
          <li>We do not guarantee that the Content will meet your expectations.</li>
        </ul>
      </section>

      {/* Section 7 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">7. Limitation of Liability</h2>
        <p className="leading-relaxed">
          To the maximum extent permitted by law:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.</li>
          <li>Our liability in any case is limited to the amount you paid (if any) in Orca Coins within the last 3 months prior to the claim.</li>
        </ul>
      </section>

      {/* Section 8 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">8. Payments</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>All payments are processed by secure third-party providers.</li>
          <li>We do not store, process, or have access to your payment credentials.</li>
        </ul>
      </section>

      {/* Section 9 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">9. Termination</h2>
        <p className="leading-relaxed">
          We reserve the right to suspend or terminate your account and access to the Website at any time, with or without cause.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>If terminated due to violation of these Terms, any remaining Orca Coins may be forfeited.</li>
        </ul>
      </section>

      {/* Section 10 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">10. Governing Law</h2>
        <p className="leading-relaxed">
          These Terms are governed by and construed under the laws of the State of Israel, without regard to conflict of laws principles.
        </p>
      </section>

      {/* Section 11 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">11. Changes to Terms</h2>
        <p className="leading-relaxed">
          We may update these Terms at any time. Changes will be posted with a new effective date. Continued use of the Website after changes constitutes acceptance.
        </p>
      </section>

      {/* Section 12 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">12. Contact Information</h2>
        <p className="leading-relaxed">
          For questions or concerns regarding these Terms, please contact us at:
        </p>
        <p className="text-blue-400">
          📧 labdojo.io@gmail.com
        </p>
      </section>

      <Separator className="bg-slate-700" />

      <div className="text-sm text-slate-500 italic">
        Last updated: 20.08.2025
      </div>
    </div>
  );
};

export default TermsOfServiceContent;