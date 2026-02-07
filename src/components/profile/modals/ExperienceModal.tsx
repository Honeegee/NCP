"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { experienceItemSchema } from "@/lib/validators";
import type { NurseExperience } from "@/types";

interface ExperienceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experience: NurseExperience | null;
  onSave: (data: {
    employer: string;
    position: string;
    department: string;
    start_date: string;
    end_date: string;
    description: string;
  }) => Promise<void>;
}

export default function ExperienceModal({
  open,
  onOpenChange,
  experience,
  onSave,
}: ExperienceModalProps) {
  const [form, setForm] = useState({
    employer: "",
    position: "",
    department: "",
    start_date: "",
    end_date: "",
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (experience) {
      setForm({
        employer: experience.employer || "",
        position: experience.position || "",
        department: experience.department || "",
        start_date: experience.start_date || "",
        end_date: experience.end_date || "",
        description: experience.description || "",
      });
    } else {
      setForm({
        employer: "",
        position: "",
        department: "",
        start_date: "",
        end_date: "",
        description: "",
      });
    }
    // Clear errors when modal opens or experience changes
    setErrors({});
  }, [experience, open]);

  const handleSave = async () => {
    // Validate form
    const validation = experienceItemSchema.safeParse(form);

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
          <DialogTitle>{experience ? "Edit Experience" : "Add Experience"}</DialogTitle>
          <DialogDescription>
            Fill in the details of your work experience.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employer">Employer</Label>
              <Input
                id="employer"
                value={form.employer}
                onChange={(e) => {
                  setForm({ ...form, employer: e.target.value });
                  // Clear error when user starts typing
                  if (errors.employer) {
                    setErrors({ ...errors, employer: "" });
                  }
                }}
                placeholder="Hospital / Clinic"
                className={errors.employer ? "border-red-500" : ""}
              />
              {errors.employer && (
                <p className="text-sm text-red-500">{errors.employer}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={form.position}
                onChange={(e) => {
                  setForm({ ...form, position: e.target.value });
                  // Clear error when user starts typing
                  if (errors.position) {
                    setErrors({ ...errors, position: "" });
                  }
                }}
                placeholder="Registered Nurse"
                className={errors.position ? "border-red-500" : ""}
              />
              {errors.position && (
                <p className="text-sm text-red-500">{errors.position}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department (Optional)</Label>
            <Input
              id="department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="Emergency, ICU, etc."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <DatePicker
                value={form.start_date ? new Date(form.start_date + "T00:00:00") : undefined}
                onChange={(date) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    setForm({ ...form, start_date: `${year}-${month}-${day}` });
                  } else {
                    setForm({ ...form, start_date: "" });
                  }
                  // Clear error when user selects a date
                  if (errors.start_date) {
                    setErrors({ ...errors, start_date: "" });
                  }
                }}
                placeholder="Select start date"
                fromYear={1970}
                toYear={new Date().getFullYear()}
                className={errors.start_date ? "border-red-500" : ""}
              />
              {errors.start_date && (
                <p className="text-sm text-red-500">{errors.start_date}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date (Leave blank if current)</Label>
              <DatePicker
                value={form.end_date ? new Date(form.end_date + "T00:00:00") : undefined}
                onChange={(date) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    setForm({ ...form, end_date: `${year}-${month}-${day}` });
                  } else {
                    setForm({ ...form, end_date: "" });
                  }
                  // Clear error when user selects a date
                  if (errors.end_date) {
                    setErrors({ ...errors, end_date: "" });
                  }
                }}
                placeholder="Select end date"
                fromYear={1970}
                toYear={new Date().getFullYear()}
                className={errors.end_date ? "border-red-500" : ""}
              />
              {errors.end_date && (
                <p className="text-sm text-red-500">{errors.end_date}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Responsibilities, achievements..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : experience ? "Update" : "Add"} Experience
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}