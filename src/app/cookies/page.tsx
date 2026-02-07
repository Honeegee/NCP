import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Cookie Policy | Nurse Care Pro",
  description: "Cookie policy for Nurse Care Pro platform",
};

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Cookie Policy</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-[var(--border)] p-6 md:p-8 shadow-sm">
          <div className="prose prose-sm max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">1. What Are Cookies</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
                They are widely used to make websites work more efficiently and provide information to the website owners.
              </p>
              <p className="text-[var(--muted-foreground)]">
                This Cookie Policy explains how Nurse Care Pro uses cookies and similar technologies to recognize you 
                when you visit our Platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">2. How We Use Cookies</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                We use cookies for several purposes, including:
              </p>
              <ul className="list-disc pl-5 text-[var(--muted-foreground)] space-y-1 mb-4">
                <li>Authentication: To keep you signed in to your account</li>
                <li>Security: To protect your account and our Platform</li>
                <li>Preferences: To remember your settings and preferences</li>
                <li>Analytics: To understand how our Platform is used</li>
                <li>Functionality: To enable core platform features</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">3. Types of Cookies We Use</h2>
              
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Essential Cookies</h3>
              <p className="text-[var(--muted-foreground)] mb-4">
                These cookies are necessary for the Platform to function and cannot be switched off. They are usually 
                only set in response to actions made by you such as logging in or filling in forms.
              </p>

              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Performance Cookies</h3>
              <p className="text-[var(--muted-foreground)] mb-4">
                These cookies allow us to count visits and traffic sources so we can measure and improve the performance 
                of our Platform. They help us know which pages are the most and least popular.
              </p>

              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Functionality Cookies</h3>
              <p className="text-[var(--muted-foreground)] mb-4">
                These cookies enable the Platform to provide enhanced functionality and personalization. They may be set 
                by us or by third-party providers whose services we have added to our pages.
              </p>

              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Targeting Cookies</h3>
              <p className="text-[var(--muted-foreground)]">
                These cookies may be set through our Platform by our advertising partners. They may be used to build a 
                profile of your interests and show you relevant advertisements on other sites.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">4. Third-Party Cookies</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics 
                of the Platform, deliver advertisements, and so on.
              </p>
              <p className="text-[var(--muted-foreground)]">
                These third-party cookies are subject to the respective privacy policies of these third parties. 
                We recommend that you review their privacy policies to understand how they use cookies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">5. How to Control Cookies</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                You have the right to decide whether to accept or reject cookies. You can set or amend your web browser 
                controls to accept or refuse cookies.
              </p>
              <p className="text-[var(--muted-foreground)] mb-4">
                Most web browsers allow some control of most cookies through the browser settings. To find out more about 
                cookies, including how to see what cookies have been set and how to manage and delete them, visit 
                <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:text-[var(--primary-dark)] ml-1">
                  www.allaboutcookies.org
                </a>.
              </p>
              <p className="text-[var(--muted-foreground)]">
                Please note that if you choose to disable cookies, some features of our Platform may not function properly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">6. Cookie Duration</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                Cookies can remain on your computer or mobile device for different periods of time:
              </p>
              <ul className="list-disc pl-5 text-[var(--muted-foreground)] space-y-1 mb-4">
                <li><strong>Session cookies:</strong> These cookies are temporary and expire when you close your browser</li>
                <li><strong>Persistent cookies:</strong> These cookies remain on your device until they expire or you delete them</li>
              </ul>
              <p className="text-[var(--muted-foreground)]">
                The length of time a cookie will stay on your device depends on whether it is a &quot;persistent&quot; or &quot;session&quot; cookie.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">7. Updates to This Cookie Policy</h2>
              <p className="text-[var(--muted-foreground)] mb-4">
                We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our 
                data processing activities. We will notify you of any material changes by posting the new Cookie Policy 
                on this page.
              </p>
              <p className="text-[var(--muted-foreground)]">
                We encourage you to review this Cookie Policy periodically to stay informed about our use of cookies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">8. Contact Us</h2>
              <p className="text-[var(--muted-foreground)] mb-2">
                If you have any questions about our use of cookies, please contact us:
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