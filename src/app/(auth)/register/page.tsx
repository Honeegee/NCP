"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { StepWelcome } from "@/components/registration/StepWelcome";
import { StepBasicInfo } from "@/components/registration/StepBasicInfo";
import { StepProfessionalStatus } from "@/components/registration/StepProfessionalStatus";
import { StepResume } from "@/components/registration/StepResume";
import { StepConsent } from "@/components/registration/StepConsent";
import { Navbar } from "@/components/shared/Navbar";
import type { RegistrationData } from "@/types";
import type { StepBasicInfoData } from "@/lib/validators";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Shield } from "lucide-react";

const STEPS = [
  { label: "Welcome", shortLabel: "Welcome" },
  { label: "Basic Info", shortLabel: "Info" },
  { label: "Professional", shortLabel: "Status" },
  { label: "Resume", shortLabel: "Resume" },
  { label: "Submit", shortLabel: "Submit" },
];

const defaultData: RegistrationData = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  mobile_number: "",
  location_type: "philippines",
  professional_status: "registered_nurse",
  employment_status: "",
  certifications: [],
  years_of_experience: "",
  specialization: "",
  school_name: "",
  graduation_year: "",
  internship_experience: "",
  resume_file: null,
  consent_agreed: false,
};

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<RegistrationData>(defaultData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleWelcomeNext = () => {
    setCurrentStep(1);
  };

  const handleBasicInfoNext = (data: StepBasicInfoData) => {
    // Exclude confirmPassword from form data (only needed for validation)
    const { confirmPassword, ...dataWithoutConfirm } = data;
    setFormData({ ...formData, ...dataWithoutConfirm });
    setCurrentStep(2);
  };

  const handleProfessionalNext = (data: Partial<RegistrationData>) => {
    setFormData({ ...formData, ...data });
    setCurrentStep(3);
  };

  const handleResumeNext = (file: File | null) => {
    setFormData({ ...formData, resume_file: file });
    setCurrentStep(4);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const first_name = formData.first_name || "";
      const last_name = formData.last_name || "";

      console.log("[Register] Creating account for:", formData.email);

      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name,
          last_name,
          mobile_number: formData.mobile_number,
          location_type: formData.location_type,
          professional_status: formData.professional_status,
          employment_status: formData.employment_status,
          certifications: formData.certifications,
          years_of_experience: formData.years_of_experience,
          specialization: formData.specialization,
          school_name: formData.school_name,
          graduation_year: formData.graduation_year,
          internship_experience: formData.internship_experience,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("[Register] Registration failed:", result.error);
        toast.error(result.error || "Registration failed");
        setLoading(false);
        return;
      }

      console.log("[Register] Account created, signing in...");

      // Sign in first so we have an auth token for the resume upload
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      console.log("[Register] Sign-in result:", signInResult?.ok ? "success" : "failed", signInResult?.error);

      if (signInResult?.ok) {
        console.log("[Register] Sign-in successful, uploading resume if needed...");
        
        // Upload resume after sign-in (now authenticated)
        if (formData.resume_file) {
          try {
            const resumeFormData = new FormData();
            resumeFormData.append("file", formData.resume_file);
            resumeFormData.append("profile_id", result.profile_id);

            await fetch("/api/resume/upload", {
              method: "POST",
              body: resumeFormData,
            });
          } catch (e) {
            console.error("Resume upload failed:", e);
          }
        }

        console.log("[Register] Redirecting to dashboard...");
        router.push("/dashboard");
        router.refresh();
      } else if (signInResult?.error) {
        console.error("[Register] Sign-in error:", signInResult.error);
        toast.error(`Sign-in failed: ${signInResult.error}. Please try logging in manually.`);
        setLoading(false);
        // Redirect to login after a brief delay
        setTimeout(() => router.push("/login"), 2000);
      } else {
        console.warn("[Register] Sign-in failed with unknown error");
        toast.error("Account created but auto-login failed. Please log in manually.");
        setLoading(false);
        // Redirect to login after a brief delay
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err) {
      console.error("[Register] Catch error:", err);
      const errorMessage = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-registration">
      <Navbar />

      <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-10">
        {/* Header + Banner — only on Welcome step */}
        {currentStep === 0 && (
          <>
            <div className="text-center mb-5 animate-fade-in">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Start Your International Nursing Journey Today
              </h1>
              <p className="text-foreground/60 mt-1.5 text-sm max-w-lg mx-auto leading-relaxed">
                Join a trusted community helping Filipino nurses and nursing students
                prepare for future healthcare opportunities in the United States and beyond.
              </p>
            </div>

            <div className="mb-6 bg-emerald-50/70 border border-emerald-200/60 rounded-xl px-4 py-2.5 flex items-center gap-2.5 animate-fade-in">
              <Shield className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-foreground/70">
                Your information is <span className="font-medium text-foreground/80">safe, private</span>, and only used to connect you with verified career opportunities.
              </p>
            </div>
          </>
        )}

        {/* Step Indicator */}
        <div className="mb-8 sm:mb-10">
          {/* Desktop stepper */}
          <div className="hidden sm:flex items-center justify-between relative">
            {/* Connecting line (background) */}
            <div className="absolute top-5 left-[40px] right-[40px] h-[2px] bg-border" />
            {/* Connecting line (progress) */}
            <div
              className="absolute top-5 left-[40px] h-[2px] gradient-primary transition-all duration-500 ease-out"
              style={{
                width: `calc(${(currentStep / (STEPS.length - 1)) * 100}% - ${currentStep === STEPS.length - 1 ? 80 : 0}px)`,
                maxWidth: `calc(100% - 80px)`,
              }}
            />

            {STEPS.map((step, i) => (
              <div key={step.label} className="flex flex-col items-center relative z-10">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    i < currentStep
                      ? "gradient-primary text-white shadow-md shadow-primary/20"
                      : i === currentStep
                      ? "bg-primary text-white shadow-md shadow-primary/20 ring-4 ring-primary/10"
                      : "bg-white text-muted-foreground border-2 border-border"
                  }`}
                >
                  {i < currentStep ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium transition-colors duration-300 ${
                    i <= currentStep
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Mobile stepper */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">
                Step {currentStep + 1} of {STEPS.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {STEPS[currentStep].label}
              </span>
            </div>
            <div className="flex gap-1.5">
              {STEPS.map((step, i) => (
                <div
                  key={step.label}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    i <= currentStep
                      ? "gradient-primary"
                      : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm shadow-black/[0.04] border border-border/60 overflow-hidden animate-fade-in">
           <div className="p-4 sm:p-6 lg:p-8">

            {currentStep === 0 && (
              <StepWelcome onNext={handleWelcomeNext} />
            )}
            {currentStep === 1 && (
              <StepBasicInfo
                data={formData}
                onNext={handleBasicInfoNext}
                onBack={() => setCurrentStep(0)}
              />
            )}
            {currentStep === 2 && (
              <StepProfessionalStatus
                data={formData}
                onNext={handleProfessionalNext}
                onBack={() => setCurrentStep(1)}
              />
            )}
            {currentStep === 3 && (
              <StepResume
                file={formData.resume_file}
                onNext={handleResumeNext}
                onBack={() => setCurrentStep(2)}
              />
            )}
            {currentStep === 4 && (
               <StepConsent
                data={formData}
                onSubmit={handleSubmit}
                onGoToStep={setCurrentStep}
                loading={loading}
              />
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Sign in
            </Link>
          </p>
          <p className="text-xs text-muted-foreground/60">
            Free registration &middot; Takes ~5 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
