import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Nurse Care Pro",
  description: "Privacy policy for Nurse Care Pro platform",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Privacy Policy</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[var(--border)] p-6 md:p-8 shadow-sm">
          <div className="prose prose-sm max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">1. Introduction</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                Welcome to Nurse Care Pro. We are committed to protecting your personal information and your right to privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                healthcare recruitment platform.
              </p>
              <p className="text-[var(--muted-foreground)]">
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
                please do not access the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">2. Information We Collect</h2>
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Personal Information</h3>
              <p className="text-[var(--muted-foreground)] mb-4">
                We collect personal information that you voluntarily provide to us when you register on the platform, 
                express an interest in obtaining information about us or our products and services, or otherwise contact us.
              </p>
              <ul className="list-disc pl-5 text-[var(--muted-foreground)] mb-4 space-y-1">
                <li>Name and contact information (email address, phone number)</li>
                <li>Professional credentials and qualifications</li>
                <li>Employment history and work experience</li>
                <li>Educational background</li>
                <li>Certifications and licenses</li>
                <li>Resume/CV documents</li>
                <li>Profile picture (optional)</li>
              </ul>

              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Automatically Collected Information</h3>
              <p className="text-[var(--muted-foreground)]">
                We automatically collect certain information when you visit, use, or navigate the platform. 
                This information does not reveal your specific identity but may include device and usage information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">3. How We Use Your Information</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                We use personal information collected via our platform for a variety of business purposes described below:
              </p>
              <ul className="list-disc pl-5 text-[var(--muted-foreground)] space-y-1">
                <li>To facilitate account creation and login process</li>
                <li>To match nurses with relevant job opportunities</li>
                <li>To send administrative information and updates</li>
                <li>To protect our platform and prevent fraud</li>
                <li>To respond to legal requests and prevent harm</li>
                <li>For other business purposes with your consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">4. Sharing Your Information</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                We only share information with your consent, to comply with laws, to provide you with services, 
                to protect your rights, or to fulfill business obligations.
              </p>
              <p className="text-[var(--muted-foreground)]">
                We may share your professional profile information with healthcare employers for job matching purposes, 
                but only with your explicit consent through the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">5. Data Security</h2>
              <p className="text-[var(--muted-foreground)]">
                We have implemented appropriate technical and organizational security measures designed to protect 
                the security of any personal information we process. However, please also remember that we cannot 
                guarantee that the internet itself is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">6. Your Privacy Rights</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="list-disc pl-5 text-[var(--muted-foreground)] space-y-1">
                <li>The right to access and receive a copy of your personal information</li>
                <li>The right to rectify or update your personal information</li>
                <li>The right to request deletion of your personal information</li>
                <li>The right to restrict processing of your personal information</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">7. Contact Us</h2>
              <p className="text-[var(--muted-foreground)] mb-2">
                If you have questions or comments about this policy, you may contact us at:
              </p>
              <div className="bg-[var(--muted)] p-4 rounded-lg">
                <p className="text-[var(--foreground)] font-medium">Nurse Care Pro</p>
                <p className="text-[var(--muted-foreground)]">Email: privacy@nursecarepro.com</p>
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