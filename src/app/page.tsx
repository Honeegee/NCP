import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/shared/Navbar";
import {
  Heart,
  FileText,
  Briefcase,
  UserCheck,
  Globe,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Building,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 pattern-dots opacity-5" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div className="text-center lg:text-left animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white/90 text-sm mb-6 border border-white/20">
                <Zap className="h-4 w-4" />
                Trusted by 10,000+ nurses nationwide
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
                Your Nursing Career,{" "}
                <span className="text-sky-300">Simplified</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-xl mx-auto lg:mx-0">
                Register your profile, upload your resume, and discover nursing
                opportunities that match your experience &mdash; locally and
                internationally.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 w-full sm:w-auto bg-white text-primary hover:bg-white/90 shadow-lg"
                  >
                    Register as a Nurse
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-6 w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:text-white"
                  >
                    Sign In to Your Account
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 mt-10 justify-center lg:justify-start">
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <CheckCircle className="h-4 w-4 text-sky-300" />
                  Free registration
                </div>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <CheckCircle className="h-4 w-4 text-sky-300" />
                  AI resume parsing
                </div>
                <div className="flex items-center gap-2 text-white/70 text-sm">
                  <CheckCircle className="h-4 w-4 text-sky-300" />
                  Smart job matching
                </div>
              </div>
            </div>

            {/* Right - Visual */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Floating cards */}
                <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-xl p-5 animate-float z-10 w-56">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Profile Complete</p>
                      <p className="text-xs text-muted-foreground">100% verified</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl p-5 animate-float z-10 w-60" style={{ animationDelay: "1s" }}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">New Match Found!</p>
                      <p className="text-xs text-muted-foreground">ICU Nurse - 92% match</p>
                    </div>
                  </div>
                </div>

                {/* Main illustration card */}
                <div className="bg-white/10 border border-white/20 rounded-3xl p-8 backdrop-blur-sm">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
                      <div className="h-12 w-12 rounded-full bg-sky-300/20 flex items-center justify-center">
                        <UserCheck className="h-6 w-6 text-sky-200" />
                      </div>
                      <div>
                        <div className="h-3 w-32 bg-white/30 rounded" />
                        <div className="h-2 w-20 bg-white/20 rounded mt-2" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
                      <div className="h-12 w-12 rounded-full bg-sky-300/20 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-sky-200" />
                      </div>
                      <div>
                        <div className="h-3 w-28 bg-white/30 rounded" />
                        <div className="h-2 w-36 bg-white/20 rounded mt-2" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
                      <div className="h-12 w-12 rounded-full bg-sky-300/20 flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-sky-200" />
                      </div>
                      <div>
                        <div className="h-3 w-24 bg-white/30 rounded" />
                        <div className="h-2 w-16 bg-white/20 rounded mt-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-16 px-4 border-b">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 stagger-children">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-3">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">10,000+</p>
              <p className="text-sm text-muted-foreground mt-1">Registered Nurses</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-3">
                <Building className="h-7 w-7 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">500+</p>
              <p className="text-sm text-muted-foreground mt-1">Partner Facilities</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-3">
                <Globe className="h-7 w-7 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">15+</p>
              <p className="text-sm text-muted-foreground mt-1">Countries Served</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10 mb-3">
                <Star className="h-7 w-7 text-primary" />
              </div>
              <p className="text-3xl font-bold text-foreground">95%</p>
              <p className="text-sm text-muted-foreground mt-1">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 gradient-subtle">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm mb-2 tracking-wider uppercase">
              Simple Process
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              How It Works
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Get started in minutes with our streamlined registration process
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-8 border shadow-sm text-center hover-lift relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-md">
                1
              </div>
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <UserCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">
                Create Your Profile
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Complete a simple 5-step registration with your personal info,
                professional background, and certifications.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-8 border shadow-sm text-center hover-lift relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-md">
                2
              </div>
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">
                Upload Your Resume
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Upload your resume in PDF or Word format. We automatically
                extract your experience, certifications, and skills.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-8 border shadow-sm text-center hover-lift relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shadow-md">
                3
              </div>
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-3">
                Get Matched to Jobs
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                See job opportunities that match your qualifications &mdash; from
                Philippine hospitals to international placements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm mb-2 tracking-wider uppercase">
              Why Choose Us
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Why Nurse Care Pro?
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              We make the job search process easier, faster, and more effective for nursing professionals
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group p-6 rounded-2xl border bg-white hover-lift">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Automatic Resume Reading</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                No manual data entry. Upload your resume and we extract your
                details automatically using AI.
              </p>
            </div>
            <div className="group p-6 rounded-2xl border bg-white hover-lift">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Smart Job Matching</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get matched to positions based on your certifications,
                experience, and skills automatically.
              </p>
            </div>
            <div className="group p-6 rounded-2xl border bg-white hover-lift">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Local & International</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Find positions in Philippine hospitals, the Middle East, UK,
                and more across 15+ countries.
              </p>
            </div>
            <div className="group p-6 rounded-2xl border bg-white hover-lift">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">Free to Use</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Registration and profile creation is completely free for
                nurses. No hidden fees, ever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary font-semibold text-sm mb-2 tracking-wider uppercase">
              Testimonials
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold">
              What Nurses Say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border shadow-sm hover-lift">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                &ldquo;Nurse Care Pro helped me find an ICU position abroad in just 2 weeks.
                The resume parsing saved me hours of manual data entry!&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                  MA
                </div>
                <div>
                  <p className="text-sm font-semibold">Maria A.</p>
                  <p className="text-xs text-muted-foreground">ICU Nurse, Dubai</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border shadow-sm hover-lift">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                &ldquo;The matching algorithm is amazing! It found me a perfect fit
                based on my NCLEX and BLS certifications. Highly recommended.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                  JR
                </div>
                <div>
                  <p className="text-sm font-semibold">Jose R.</p>
                  <p className="text-xs text-muted-foreground">ER Nurse, Manila</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border shadow-sm hover-lift">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                &ldquo;So easy to use! I registered in 10 minutes and had job matches
                waiting for me. The platform truly understands what nurses need.&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                  SC
                </div>
                <div>
                  <p className="text-sm font-semibold">Sarah C.</p>
                  <p className="text-xs text-muted-foreground">OR Nurse, Singapore</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 pattern-dots opacity-5" />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Join thousands of nurses who have found their next opportunity
            through our platform. Registration takes less than 10 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-lg"
              >
                Register Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-lg">Nurse Care Pro</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm">
                Empowering nurses to find their next opportunity. Register your
                profile, upload your resume, and get matched with positions
                locally and internationally.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/register" className="hover:text-primary transition-colors">Register</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
                <li><Link href="/jobs" className="hover:text-primary transition-colors">Browse Jobs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><span className="cursor-pointer hover:text-primary transition-colors">About Us</span></li>
                <li><span className="cursor-pointer hover:text-primary transition-colors">Contact</span></li>
                <li><span className="cursor-pointer hover:text-primary transition-colors">Help Center</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Nurse Care Pro. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
