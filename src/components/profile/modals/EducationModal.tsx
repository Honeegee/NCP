"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { educationItemSchema } from "@/lib/validators";
import type { NurseEducation } from "@/types";

interface EducationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  education: NurseEducation | null;
  onSave: (data: {
    institution: string;
    degree: string;
    field_of_study: string;
    graduation_year: string;
  }) => Promise<void>;
}

export default function EducationModal({
  open,
  onOpenChange,
  education,
  onSave,
}: EducationModalProps) {
  const [form, setForm] = useState({
    institution: "",
    degree: "",
    field_of_study: "",
    graduation_year: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (education) {
      setForm({
        institution: education.institution || "",
        degree: education.degree || "",
        field_of_study: education.field_of_study || "",
        graduation_year: education.graduation_year?.toString() || "",
      });
    } else {
      setForm({
        institution: "",
        degree: "",
        field_of_study: "",
        graduation_year: "",
      });
    }
    // Clear errors when modal opens or education changes
    setErrors({});
  }, [education, open]);

  const handleSave = async () => {
    // Validate form
    const validation = educationItemSchema.safeParse(form);
    
    if (!validation.success) {
      // Convert Zod errors to a simple error object
      const newErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    // Clear errors if validation passes
    setErrors({});
    
    setSaving(true);
    try {
      await onSave(validation.data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{education ? "Edit Education" : "Add Education"}</DialogTitle>
          <DialogDescription>
            Fill in the details of your education.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              value={form.institution}
              onChange={(e) => {
                setForm({ ...form, institution: e.target.value });
                // Clear error when user starts typing
                if (errors.institution) {
                  setErrors({ ...errors, institution: "" });
                }
              }}
              placeholder="University / College"
              className={errors.institution ? "border-red-500" : ""}
            />
            {errors.institution && (
              <p className="text-sm text-red-500">{errors.institution}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="degree">Degree</Label>
            <Input
              id="degree"
              value={form.degree}
              onChange={(e) => {
                setForm({ ...form, degree: e.target.value });
                if (errors.degree) {
                  setErrors({ ...errors, degree: "" });
                }
              }}
              placeholder="Bachelor of Science in Nursing"
              className={errors.degree ? "border-red-500" : ""}
            />
            {errors.degree && (
              <p className="text-sm text-red-500">{errors.degree}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="field_of_study">Field of Study (Optional)</Label>
            <Input
              id="field_of_study"
              value={form.field_of_study}
              onChange={(e) => setForm({ ...form, field_of_study: e.target.value })}
              placeholder="Nursing, Healthcare, etc."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="graduation_year">Graduation Year</Label>
            <Input
              id="graduation_year"
              type="number"
              value={form.graduation_year}
              onChange={(e) => {
                setForm({ ...form, graduation_year: e.target.value });
                if (errors.graduation_year) {
                  setErrors({ ...errors, graduation_year: "" });
                }
              }}
              placeholder="2020"
              className={errors.graduation_year ? "border-red-500" : ""}
            />
            {errors.graduation_year && (
              <p className="text-sm text-red-500">{errors.graduation_year}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : education ? "Update" : "Add"} Education
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}