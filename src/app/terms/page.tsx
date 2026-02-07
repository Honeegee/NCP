import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Terms of Service | Nurse Care Pro",
  description: "Terms and conditions for using Nurse Care Pro platform",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Terms of Service</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Effective date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[var(--border)] p-6 md:p-8 shadow-sm">
          <div className="prose prose-sm max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">1. Agreement to Terms</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                By accessing or using Nurse Care Pro Platform, you agree to be bound by these Terms of Service. 
                If you disagree with any part of the terms, you may not access the Platform.
              </p>
              <p className="text-[var(--muted-foreground)]">
                These Terms apply to all visitors, users, and others who access or use the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">2. Description of Service</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                Nurse Care Pro is a healthcare recruitment platform that connects nurses with job opportunities. 
                The Platform provides:
              </p>
              <ul className="list-disc pl-5 text-[var(--muted-foreground)] space-y-1 mb-4">
                <li>Profile creation and management for healthcare professionals</li>
                <li>Job matching and opportunity discovery</li>
                <li>Resume/CV upload and management</li>
                <li>Professional credential verification</li>
                <li>Communication tools between nurses and employers</li>
              </ul>
              <p className="text-[var(--muted-foreground)]">
                We reserve the right to modify, suspend, or discontinue the Platform at any time without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">3. User Accounts</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                When you create an account with us, you must provide accurate, complete, and current information. 
                Failure to do so constitutes a breach of the Terms.
              </p>
              <p className="text-[var(--muted-foreground)] mb-4">
                You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
              <p className="text-[var(--muted-foreground)]">
                You agree not to disclose your password to any third party. You must notify us immediately upon becoming 
                aware of any breach of security or unauthorized use of your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">4. User Responsibilities</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                As a user of the Platform, you agree to:
              </p>
              <ul className="list-disc pl-5 text-[var(--muted-foreground)] space-y-1 mb-4">
                <li>Provide accurate and truthful information in your profile</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the Platform only for lawful purposes</li>
                <li>Not engage in any fraudulent or misleading activities</li>
                <li>Not impersonate any person or entity</li>
                <li>Not interfere with or disrupt the Platform</li>
                <li>Not attempt to gain unauthorized access to any part of the Platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">5. Content</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                Our Platform allows you to post, link, store, share, and otherwise make available certain information, 
                text, graphics, videos, or other material.
              </p>
              <p className="text-[var(--muted-foreground)] mb-4">
                You are responsible for the Content that you post on the Platform, including its legality, reliability, 
                and appropriateness.
              </p>
              <p className="text-[var(--muted-foreground)]">
                By posting Content on the Platform, you grant us the right and license to use, modify, publicly perform, 
                publicly display, reproduce, and distribute such Content on and through the Platform for the purpose of 
                providing the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">6. Intellectual Property</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                The Platform and its original content, features, and functionality are and will remain the exclusive 
                property of Nurse Care Pro and its licensors. The Platform is protected by copyright, trademark, and 
                other laws.
              </p>
              <p className="text-[var(--muted-foreground)]">
                Our trademarks and trade dress may not be used in connection with any product or service without the 
                prior written consent of Nurse Care Pro.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">7. Termination</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason 
                whatsoever, including without limitation if you breach the Terms.
              </p>
              <p className="text-[var(--muted-foreground)]">
                Upon termination, your right to use the Platform will immediately cease. If you wish to terminate your 
                account, you may simply discontinue using the Platform or contact us to request account deletion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">8. Limitation of Liability</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                In no event shall Nurse Care Pro, nor its directors, employees, partners, agents, suppliers, or affiliates, 
                be liable for any indirect, incidental, special, consequential or punitive damages, including without 
                limitation, loss of profits, data, use, goodwill, or other intangible losses.
              </p>
              <p className="text-[var(--muted-foreground)]">
                Our liability is limited to the maximum extent permitted by law. We make no warranties about the 
                completeness, reliability, or accuracy of job matches or opportunities presented through the Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">9. Governing Law</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                These Terms shall be governed and construed in accordance with the laws of the Philippines, without 
                regard to its conflict of law provisions.
              </p>
              <p className="text-[var(--muted-foreground)]">
                Our failure to enforce any right or provision of these Terms will not be considered a waiver of those 
                rights. If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions 
                will remain in effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">10. Changes to Terms</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                We will provide notice of any changes by posting the new Terms on this page.
              </p>
              <p className="text-[var(--muted-foreground)]">
                By continuing to access or use our Platform after those revisions become effective, you agree to be 
                bound by the revised terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">11. Contact Information</h2>
              <p className="text-[var(--muted-foreground)] mb-2">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-[var(--muted)] p-4 rounded-lg">
                <p className="text-[var(--foreground)] font-medium">Nurse Care Pro</p>
                <p className="text-[var(--muted-foreground)]">Email: legal@nursecarepro.com</p>
                <p className="text-[var(--muted-foreground)]">Phone: +63 (2) 8888-0000</p>
                <p className="text-[var(--muted-foreground)]">Address: Manila, Philippines</p>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}