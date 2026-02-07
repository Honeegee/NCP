"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, CheckCircle, Shield, Mail, User, Briefcase, FileText, Globe } from "lucide-react";
import Link from "next/link";
import type { RegistrationData } from "@/types";

interface StepConsentProps {
  data: RegistrationData;
  onSubmit: () => void;
  onGoToStep: (step: number) => void;
  loading: boolean;
}

export function StepConsent({ data, onSubmit, onGoToStep, loading }: StepConsentProps) {
  const [agreed, setAgreed] = useState(false);
  const [optIn, setOptIn] = useState(false);

  const statusLabel =
    data.professional_status === "registered_nurse"
      ? "Registered Nurse"
      : "Nursing Student";

  const experienceLabel =
    data.professional_status === "registered_nurse"
      ? data.years_of_experience
        ? `${data.years_of_experience} Years`
        : "—"
      : data.school_name || "—";

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center space-y-2 mb-2">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-sky-100 mx-auto">
          <ClipboardCheck className="h-6 w-6 text-sky-600" />
        </div>
        <h3 className="text-lg font-bold text-foreground">
          Review &amp; Submit Your Profile
        </h3>
        <p className="text-sm text-foreground/60 max-w-md mx-auto leading-relaxed">
          Please review your information and agree to our terms before submitting
        </p>
      </div>

      {/* Profile Summary */}
      <div className="border border-sky-200/60 rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-sky-50/50 border-b border-sky-200/40">
          <p className="text-sm font-semibold text-foreground">Profile Summary</p>
        </div>
        <div className="divide-y divide-border/40">
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-foreground/60 flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-sky-500" />
              Name:
            </span>
            <span className="text-sm font-medium text-foreground">{data.first_name && data.last_name ? `${data.first_name} ${data.last_name}` : data.first_name || data.last_name || "—"}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-foreground/60 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-violet-500" />
              Email:
            </span>
            <span className="text-sm font-medium text-foreground">{data.email || "—"}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-foreground/60 flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5 text-amber-500" />
              Status:
            </span>
            <span className="text-sm font-medium text-foreground">{statusLabel}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-foreground/60 flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-teal-500" />
              {data.professional_status === "registered_nurse" ? "Experience:" : "School:"}
            </span>
            <span className="text-sm font-medium text-foreground">{experienceLabel}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-foreground/60 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-rose-500" />
              Resume:
            </span>
            {data.resume_file ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <CheckCircle className="h-4 w-4" />
                Uploaded
              </span>
            ) : (
              <span className="text-sm text-foreground/40">Not uploaded</span>
            )}
          </div>
        </div>
        <div className="px-5 py-3 border-t border-sky-200/40 bg-sky-50/30 text-center">
          <button
            type="button"
            onClick={() => onGoToStep(1)}
            className="text-sm text-primary hover:underline font-medium"
          >
            Go back to edit
          </button>
        </div>
      </div>

      {/* Consent Checkbox */}
      <div className="border border-amber-200/60 bg-amber-50/30 rounded-xl p-4 hover:border-amber-300/60 transition-colors">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-primary flex-shrink-0 rounded"
          />
          <span className="text-xs text-foreground/70 leading-relaxed">
            I agree that Nurse Care Pro may securely store my profile and contact
            me about nursing career opportunities and updates. I confirm that my
            resume and all its contents are true to the best of my knowledge. I
            agree to share the contents with possible employers and/or staffing
            agencies.
          </span>
        </label>
      </div>

      {/* Optional Opt-In */}
      <div className="border border-violet-200/60 bg-violet-50/30 rounded-xl p-4 hover:border-violet-300/60 transition-colors">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={optIn}
            onChange={(e) => setOptIn(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-primary flex-shrink-0 rounded"
          />
          <span className="text-xs text-foreground/70 leading-relaxed">
            Yes, I&apos;d like to receive updates about new job opportunities, industry news, and career tips via email.{" "}
            <span className="text-foreground/40">(Optional)</span>
          </span>
        </label>
      </div>

      {/* Motivational Text */}
      <p className="text-center text-base font-semibold text-foreground">
        You&apos;re One Step Close to Your Global Nursing Career
      </p>

      {/* Submit Button */}
      <Button
        onClick={onSubmit}
        disabled={!agreed || loading}
        size="lg"
        className="w-full h-12 text-base font-semibold rounded-xl gradient-primary hover:opacity-90 transition-opacity border-0 shadow-md shadow-primary/20"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
            Submitting...
          </>
        ) : (
          "Submit My Profile"
        )}
      </Button>

      {/* Trust Footer */}
      <div className="text-center space-y-2 pt-1">
        <div className="flex items-start gap-2.5 bg-emerald-50/50 border border-emerald-200/40 rounded-xl p-3 text-left">
          <Shield className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/50 leading-relaxed">
            Nurse Care Pro is a career support community created for Filipino nurses and nursing students.
            We are not a recruitment agency, and joining is completely free.
          </p>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs">
          <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
          <span className="text-foreground/20">&middot;</span>
          <Link href="/terms" className="text-primary hover:underline font-medium">Terms &amp; Conditions</Link>
          <span className="text-foreground/20">&middot;</span>
          <Link href="/contact" className="text-primary hover:underline font-medium">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
