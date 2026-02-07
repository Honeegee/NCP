import Link from "next/link";
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="footer-background border-t border-[var(--border)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 lg:gap-6">
          {/* Brand & Description */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-sm">
                <Heart className="h-4.5 w-4.5 text-white fill-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">Nurse Care Pro</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed max-w-md mb-4">
              Empowering nurses to find their next opportunity. Register your
              profile, upload your resume, and get matched with positions
              locally and internationally.
            </p>

            {/* Newsletter - Below Brand Description */}
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <h5 className="font-semibold text-xs mb-1.5 text-gray-900">Stay Updated</h5>
              <p className="text-xs text-gray-700 mb-2">
                Get job opportunities & career tips
              </p>
              <div className="flex flex-col sm:flex-row gap-1.5">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="h-8 text-xs flex-1 bg-white border-[var(--input)] focus:border-[var(--primary)] focus:ring-[var(--primary)]"
                />
                <Button className="h-8 px-4 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white font-medium text-xs shadow-sm hover:shadow">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-sm mb-4 text-gray-900 uppercase tracking-wide">Platform</h4>
            <ul className="space-y-2.5">
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/jobs" 
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Job Matches</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/profile" 
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors inline-flex items-center gap-1 group"
                >
                  <span>My Profile</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/certifications" 
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Certifications</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-sm mb-3 text-gray-900">Resources</h4>
            <ul className="space-y-2.5">
              <li>
                <Link 
                  href="/help" 
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Help Center</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Career Blog</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/guides" 
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Career Guides</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/faq" 
                  className="text-sm text-gray-700 hover:text-gray-900 transition-colors inline-flex items-center gap-1 group"
                >
                  <span>FAQ</span>
                  <ArrowRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="font-semibold text-sm mb-3 text-gray-900">Contact Us</h4>
            <ul className="space-y-2.5 mb-5">
              <li className="flex items-start gap-3 group">
                <div className="section-icon mt-0.5 flex-shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-700 mb-0.5">Email</p>
                  <a 
                    href="mailto:support@nursecarepro.com" 
                    className="text-sm text-gray-900 hover:text-primary transition-colors"
                  >
                    support@nursecarepro.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="section-icon mt-0.5 flex-shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-700 mb-0.5">Phone</p>
                  <a 
                    href="tel:+6328888000" 
                    className="text-sm text-gray-900 hover:text-primary transition-colors"
                  >
                    +63 (2) 8888-0000
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="section-icon mt-0.5 flex-shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-700 mb-0.5">Location</p>
                  <p className="text-sm text-gray-900">
                    Manila, Philippines
                  </p>
                </div>
              </li>
            </ul>

            {/* Social Links */}
            <div>
              <h5 className="font-semibold text-xs mb-3 text-gray-900">Follow Us</h5>
              <div className="flex items-center gap-2">
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-9 w-9 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all"
                  asChild
                >
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-4 w-4" />
                  </a>
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-9 w-9 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all"
                  asChild
                >
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-9 w-9 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all"
                  asChild
                >
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="h-9 w-9 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all"
                  asChild
                >
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/90">
            &copy; {new Date().getFullYear()} Nurse Care Pro. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-xs text-white/90 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-white/90 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-xs text-white/90 hover:text-white transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}