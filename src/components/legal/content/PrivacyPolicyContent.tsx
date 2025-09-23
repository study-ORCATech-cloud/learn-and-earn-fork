// Reusable Privacy Policy content component

import React from 'react';
import { Separator } from '@/components/ui/separator';

const PrivacyPolicyContent: React.FC = () => {
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
          LabDojo.io ("Website," "Platform," "we," "us," or "our") respects your privacy.<br/>
          This Privacy Policy explains how we collect, use, and protect your information when you use the Website.<br/>
          By accessing or using the Website, you agree to the practices described below.
        </p>
      </section>

      {/* Section 1 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
        <p className="leading-relaxed">
          We collect only the information necessary to operate and improve the Platform:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Account Information:</strong> When you register using Single Sign-On (SSO) providers (such as Google or GitHub), we receive limited profile data (e.g., name, email address). We do not store your passwords.</li>
          <li><strong>User Progress Data:</strong> We track your activities on the Platform, including completed labs, exercises, and usage statistics.</li>
          <li><strong>Authentication Cookies:</strong> We use a cookie containing a JSON Web Token (JWT) to authenticate sessions and identify users between frontend and backend.</li>
          <li><strong>Payments:</strong> Payments for Orca Coins are processed by third-party providers. We do not collect or store payment card or banking information.</li>
        </ul>
      </section>

      {/* Section 2 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">2. How We Use Information</h2>
        <p className="leading-relaxed">
          We use your information to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Provide and manage your access to labs, tutorials, and premium content.</li>
          <li>Track progress to personalize your learning experience.</li>
          <li>Authenticate sessions using JWT cookies.</li>
          <li>Process Orca Coin purchases via secure third-party payment processors.</li>
          <li>Maintain the security and functionality of the Platform.</li>
        </ul>
      </section>

      {/* Section 3 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">3. Cookies and Tracking</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>We use cookies solely for <strong>authentication and security</strong>.</li>
          <li>Our JWT cookie contains only session-related information and user identifiers; it does not store sensitive personal or financial data.</li>
          <li>Disabling cookies may prevent access to certain features of the Website.</li>
        </ul>
      </section>

      {/* Section 4 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">4. Data Sharing</h2>
        <p className="leading-relaxed">
          We do not sell, rent, or trade your personal data.
          We may share limited data only with:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>SSO providers</strong> (Google, GitHub) to facilitate login.</li>
          <li><strong>Payment processors</strong> (e.g., Stripe, PayPal) to complete transactions.</li>
          <li><strong>Legal authorities</strong> if required by law.</li>
        </ul>
      </section>

      {/* Section 5 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">5. Data Retention</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>We retain user progress data for as long as the account is active.</li>
          <li>Upon account deletion, associated progress data is deleted.</li>
          <li>JWT cookies are temporary and expire automatically.</li>
        </ul>
      </section>

      {/* Section 6 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">6. User Rights</h2>
        <p className="leading-relaxed">
          Depending on your jurisdiction, you may have the right to:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your account and associated data.</li>
          <li>Restrict or object to certain processing activities.</li>
        </ul>
        <p className="leading-relaxed">
          Requests can be submitted to <span className="text-blue-400">labdojo.io@gmail.com</span>.
        </p>
      </section>

      {/* Section 7 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">7. Security</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>We implement reasonable measures to protect your data.</li>
          <li>Authentication is handled using secure JWT cookies.</li>
          <li>Payments are handled entirely by third-party processors; we do not store payment credentials.</li>
        </ul>
      </section>

      {/* Section 8 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">8. Children's Privacy</h2>
        <p className="leading-relaxed">
          This Platform is intended for users aged 13 and above, in line with our SSO providers' requirements.<br/>
          We do not knowingly collect personal data from children under 13. If you believe a child has created an account, please contact us to have the data removed.
        </p>
      </section>

      {/* Section 9 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">9. International Users</h2>
        <p className="leading-relaxed">
          The Website is operated from Israel, and user data is stored and processed on servers located in European Union.<br/>
          If you access the Website from outside of the EU/EEA, you acknowledge that your data may be transferred and processed in Israel or other jurisdictions.
        </p>
        <p className="leading-relaxed">
          For users in the EU/EEA, we process personal data in accordance with the General Data Protection Regulation (GDPR).<br/>
          This means you have the right to access, correct, or request deletion of your data, and in certain cases, request data portability.
        </p>
        <p className="leading-relaxed">
          By using the Website, you consent to the collection and transfer of your data as described in this Privacy Policy.
        </p>
      </section>

      {/* Section 10 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">10. Changes to this Policy</h2>
        <p className="leading-relaxed">
          We may update this Privacy Policy from time to time.<br/>
          Updates will be posted on this page with a new effective date. Continued use of the Website after changes constitutes acceptance.
        </p>
      </section>

      {/* Section 11 */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">11. Contact Information</h2>
        <p className="leading-relaxed">
          For privacy-related inquiries, please contact us at:
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

export default PrivacyPolicyContent;