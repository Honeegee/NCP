"use client";

import { Button } from "@/components/ui/button";
import { Shield, Users, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  return (
    <div className="space-y-6">
      {/* Section Heading */}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Let&apos;s Build Your Professional Nursing Profile
        </h2>
        <p className="text-sm text-foreground/70 mt-1 leading-relaxed">
          This takes only a few minutes. Your profile helps international
          healthcare organizations understand your experience, credentials, and
          career goals.
        </p>
      </div>

      {/* Benefit Cards — vertical stack with distinct colors */}
      <div className="space-y-3 stagger-children">
        <div className="flex items-center gap-4 rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3.5 hover:border-amber-300 transition-colors">
          <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">No Placement Fees</p>
            <p className="text-xs text-foreground/60">Completely free to join and build your profile</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-sky-200/80 bg-sky-50/60 px-4 py-3.5 hover:border-sky-300 transition-colors">
          <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-sky-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">No Commitment Required</p>
            <p className="text-xs text-foreground/60">Explore opportunities at your own pace</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3.5 hover:border-emerald-300 transition-colors">
          <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Shield className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">You Control Your Data</p>
            <p className="text-xs text-foreground/60">Full control over your information at all times</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <Button
        onClick={onNext}
        size="lg"
        className="w-full h-12 text-base font-semibold rounded-xl gradient-primary hover:opacity-90 transition-opacity border-0 shadow-md shadow-primary/20"
      >
        Get Started
        <ArrowRight className="h-4 w-4 ml-1" />
      </Button>

      {/* Trust Footer */}
      <div className="text-center space-y-2 pt-1">
        <p className="text-xs text-foreground/50 leading-relaxed">
          Nurse Care Pro is a career support community created for Filipino nurses
          and nursing students. We are not a recruitment agency, and joining is
          completely free.
        </p>
        <div className="flex items-center justify-center gap-1.5 text-xs">
          <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
          <span className="text-foreground/30">&middot;</span>
          <Link href="/terms" className="text-primary hover:underline font-medium">Terms &amp; Conditions</Link>
        </div>
      </div>
    </div>
  );
}
