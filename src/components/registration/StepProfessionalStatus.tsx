"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Stethoscope, GraduationCap, Award, ArrowRight, ArrowLeft } from "lucide-react";
import type { ProfessionalStatus, RegistrationData } from "@/types";

interface CertificationItem {
  cert_type: string;
  cert_number: string;
  score: string;
}

interface StepProfessionalStatusProps {
  data: RegistrationData;
  onNext: (data: Partial<RegistrationData>) => void;
  onBack: () => void;
}

const COMMON_CERTS = ["NCLEX", "IELTS", "TOEFL", "PRC License", "BLS", "ACLS"];

const EMPLOYMENT_OPTIONS = [
  "Currently Employed",
  "Unemployed / Looking for Work",
  "Self-Employed / Freelance",
];

export function StepProfessionalStatus({ data, onNext, onBack }: StepProfessionalStatusProps) {
  const [status, setStatus] = useState<ProfessionalStatus>(
    data.professional_status || "registered_nurse"
  );

  // RN fields
  const [employmentStatus, setEmploymentStatus] = useState(data.employment_status || "");
  const [certifications, setCertifications] = useState<CertificationItem[]>(
    data.certifications || []
  );
  const [yearsOfExperience, setYearsOfExperience] = useState(data.years_of_experience || "");
  const [specialization, setSpecialization] = useState(data.specialization || "");

  // Student fields
  const [schoolName, setSchoolName] = useState(data.school_name || "");
  const [graduationYear, setGraduationYear] = useState(data.graduation_year || "");
  const [internshipExperience, setInternshipExperience] = useState(data.internship_experience || "");
  const [studentCerts, setStudentCerts] = useState<CertificationItem[]>(
    data.professional_status === "nursing_student" ? data.certifications || [] : []
  );

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addCertification = (isStudent: boolean) => {
    const setter = isStudent ? setStudentCerts : setCertifications;
    const current = isStudent ? studentCerts : certifications;
    setter([...current, { cert_type: "", cert_number: "", score: "" }]);
  };

  const removeCertification = (index: number, isStudent: boolean) => {
    const setter = isStudent ? setStudentCerts : setCertifications;
    const current = isStudent ? studentCerts : certifications;
    setter(current.filter((_, i) => i !== index));
  };

  const updateCertification = (
    index: number,
    field: keyof CertificationItem,
    value: string,
    isStudent: boolean
  ) => {
    const setter = isStudent ? setStudentCerts : setCertifications;
    const current = isStudent ? studentCerts : certifications;
    const updated = [...current];
    updated[index] = { ...updated[index], [field]: value };
    setter(updated);
  };

  const quickAddCert = (certType: string, isStudent: boolean) => {
    const setter = isStudent ? setStudentCerts : setCertifications;
    const current = isStudent ? studentCerts : certifications;
    if (!current.some((c) => c.cert_type === certType)) {
      setter([...current, { cert_type: certType, cert_number: "", score: "" }]);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (status === "registered_nurse") {
      if (!employmentStatus) newErrors.employment_status = "Employment status is required";
      if (!yearsOfExperience) newErrors.years_of_experience = "Years of experience is required";
    } else {
      if (!schoolName) newErrors.school_name = "School name is required";
      if (!graduationYear) newErrors.graduation_year = "Graduation year is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (status === "registered_nurse") {
      onNext({
        professional_status: status,
        employment_status: employmentStatus,
        certifications,
        years_of_experience: yearsOfExperience,
        specialization,
        school_name: "",
        graduation_year: "",
        internship_experience: "",
      });
    } else {
      onNext({
        professional_status: status,
        certifications: studentCerts,
        school_name: schoolName,
        graduation_year: graduationYear,
        internship_experience: internshipExperience,
        employment_status: "",
        years_of_experience: "",
        specialization: "",
      });
    }
  };

  const renderCertificationsSection = (
    certs: CertificationItem[],
    isStudent: boolean
  ) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-foreground/80 flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-amber-500" />
          Certifications {isStudent && "(if any)"}
        </Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addCertification(isStudent)}
          className="rounded-lg text-primary border-primary/30 hover:bg-primary/5"
        >
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      {certs.length === 0 && (
        <div className="space-y-2">
          <p className="text-sm text-foreground/50">Quick add:</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_CERTS.map((cert) => (
              <Button
                key={cert}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => quickAddCert(cert, isStudent)}
                className="rounded-lg text-xs hover:border-primary/40 hover:text-primary"
              >
                + {cert}
              </Button>
            ))}
          </div>
        </div>
      )}
      {certs.map((cert, index) => (
        <div key={index} className="border border-amber-200/60 bg-amber-50/30 rounded-xl p-4 space-y-3 relative">
          <button
            type="button"
            onClick={() => removeCertification(index, isStudent)}
            className="absolute top-3 right-3 text-foreground/30 hover:text-destructive transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-foreground/60">Type <span className="text-rose-500">*</span></Label>
              <Input
                placeholder="NCLEX"
                value={cert.cert_type}
                onChange={(e) => updateCertification(index, "cert_type", e.target.value, isStudent)}
                className="h-9 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-foreground/60">License/Number</Label>
              <Input
                placeholder="Optional"
                value={cert.cert_number}
                onChange={(e) => updateCertification(index, "cert_number", e.target.value, isStudent)}
                className="h-9 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-foreground/60">Score</Label>
              <Input
                placeholder="e.g., 7.5"
                value={cert.score}
                onChange={(e) => updateCertification(index, "score", e.target.value, isStudent)}
                className="h-9 rounded-lg"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section Header */}
      <div className="text-center space-y-2 mb-2">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-violet-100 mx-auto">
          <Stethoscope className="h-6 w-6 text-violet-600" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Which Best Describes You?</h3>
        <p className="text-sm text-foreground/60 max-w-md mx-auto leading-relaxed">
          This helps us match you with the right opportunities
        </p>
      </div>

      {/* Status Toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setStatus("registered_nurse")}
          className={`p-4 rounded-xl border-2 text-center transition-all ${
            status === "registered_nurse"
              ? "border-teal-400 bg-teal-50/60 shadow-sm"
              : "border-border hover:border-teal-300/50"
          }`}
        >
          <Stethoscope
            className={`h-6 w-6 mx-auto mb-2 ${
              status === "registered_nurse" ? "text-teal-600" : "text-foreground/40"
            }`}
          />
          <span className={`text-sm font-medium ${
            status === "registered_nurse" ? "text-teal-700" : "text-foreground/70"
          }`}>
            Registered Nurse
          </span>
        </button>
        <button
          type="button"
          onClick={() => setStatus("nursing_student")}
          className={`p-4 rounded-xl border-2 text-center transition-all ${
            status === "nursing_student"
              ? "border-violet-400 bg-violet-50/60 shadow-sm"
              : "border-border hover:border-violet-300/50"
          }`}
        >
          <GraduationCap
            className={`h-6 w-6 mx-auto mb-2 ${
              status === "nursing_student" ? "text-violet-600" : "text-foreground/40"
            }`}
          />
          <span className={`text-sm font-medium ${
            status === "nursing_student" ? "text-violet-700" : "text-foreground/70"
          }`}>
            Nursing Student
          </span>
        </button>
      </div>

      {/* Conditional Fields */}
      {status === "registered_nurse" ? (
        <div className="space-y-5 animate-fade-in">
          <div className="border-t border-border/60 pt-5">
            <h4 className="text-base font-semibold text-foreground mb-4">Your Nursing Credentials</h4>
          </div>

          {/* Employment Status */}
          <div className="space-y-2">
            <Label className="text-foreground/80">Current Employment Status <span className="text-rose-500">*</span></Label>
            <div className="space-y-2">
              {EMPLOYMENT_OPTIONS.map((option) => (
                <label
                  key={option}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    employmentStatus === option
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="employment_status"
                    value={option}
                    checked={employmentStatus === option}
                    onChange={(e) => setEmploymentStatus(e.target.value)}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground/80">{option}</span>
                </label>
              ))}
            </div>
            {errors.employment_status && (
              <p className="text-sm text-destructive">{errors.employment_status}</p>
            )}
          </div>

          {/* Certifications */}
          {renderCertificationsSection(certifications, false)}

          {/* Years of Experience */}
          <div className="space-y-1.5">
            <Label htmlFor="years_of_experience" className="text-foreground/80">Years of Experience <span className="text-rose-500">*</span></Label>
            <Input
              id="years_of_experience"
              placeholder="e.g., 3"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              className="h-11 rounded-xl"
            />
            {errors.years_of_experience && (
              <p className="text-sm text-destructive">{errors.years_of_experience}</p>
            )}
          </div>

          {/* Specialization */}
          <div className="space-y-1.5">
            <Label htmlFor="specialization" className="text-foreground/80">Specialization <span className="text-foreground/40 text-xs font-normal">(Optional)</span></Label>
            <Input
              id="specialization"
              placeholder="e.g., Critical Care, Emergency, Pediatrics"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-5 animate-fade-in">
          <div className="border-t border-border/60 pt-5">
            <h4 className="text-base font-semibold text-foreground mb-4">Your Nursing Education</h4>
          </div>

          {/* School Name */}
          <div className="space-y-1.5">
            <Label htmlFor="school_name" className="text-foreground/80">School Name <span className="text-rose-500">*</span></Label>
            <Input
              id="school_name"
              placeholder="University of the Philippines Manila"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="h-11 rounded-xl"
            />
            {errors.school_name && (
              <p className="text-sm text-destructive">{errors.school_name}</p>
            )}
          </div>

          {/* Graduation Year */}
          <div className="space-y-1.5">
            <Label htmlFor="graduation_year" className="text-foreground/80">Expected Graduation Year <span className="text-rose-500">*</span></Label>
            <Input
              id="graduation_year"
              type="number"
              placeholder="2026"
              min="2020"
              max="2035"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              className="h-11 rounded-xl"
            />
            {errors.graduation_year && (
              <p className="text-sm text-destructive">{errors.graduation_year}</p>
            )}
          </div>

          {/* Internship / Clinical Experience */}
          <div className="space-y-1.5">
            <Label htmlFor="internship_experience" className="text-foreground/80">Internship / Clinical Experience <span className="text-foreground/40 text-xs font-normal">(Optional)</span></Label>
            <textarea
              id="internship_experience"
              placeholder="Describe any clinical rotations, internships, or hospital training you've completed..."
              value={internshipExperience}
              onChange={(e) => setInternshipExperience(e.target.value)}
              className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Certifications */}
          {renderCertificationsSection(studentCerts, true)}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button type="submit" className="rounded-xl">
          Next Step
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Trust Footer */}
      <p className="text-xs text-center text-foreground/40 leading-relaxed pt-2">
        Don&apos;t have all certifications yet? That&apos;s okay! We&apos;ll help you find opportunities that match your current qualifications.
      </p>
    </form>
  );
}
