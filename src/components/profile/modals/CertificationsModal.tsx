"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { certificationItemSchema } from "@/lib/validators";
import type { NurseCertification } from "@/types";

interface CertificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certification: NurseCertification | null;
  onSave: (data: {
    cert_type: string;
    cert_number: string;
    score: string;
    issue_date: string;
    expiry_date: string;
    verified: boolean;
  }) => Promise<void>;
}

export default function CertificationsModal({
  open,
  onOpenChange,
  certification,
  onSave,
}: CertificationsModalProps) {
  const [form, setForm] = useState({
    cert_type: "",
    cert_number: "",
    score: "",
    issue_date: "",
    expiry_date: "",
    verified: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (certification) {
      setForm({
        cert_type: certification.cert_type || "",
        cert_number: certification.cert_number || "",
        score: certification.score || "",
        issue_date: certification.issue_date || "",
        expiry_date: certification.expiry_date || "",
        verified: certification.verified || false,
      });
    } else {
      setForm({
        cert_type: "",
        cert_number: "",
        score: "",
        issue_date: "",
        expiry_date: "",
        verified: false,
      });
    }
    // Clear errors when modal opens or certification changes
    setErrors({});
  }, [certification, open]);

  const handleSave = async () => {
    // Validate form
    const validation = certificationItemSchema.safeParse(form);

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
      // Convert null/undefined to empty strings for API compatibility
      const data = {
        ...validation.data,
        issue_date: validation.data.issue_date || "",
        expiry_date: validation.data.expiry_date || "",
      };
      await onSave(data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{certification ? "Edit Certification" : "Add Certification"}</DialogTitle>
          <DialogDescription>
            Add a certification to your profile.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="cert_type">Certification Type</Label>
            <Input
              id="cert_type"
              value={form.cert_type}
              onChange={(e) => {
                setForm({ ...form, cert_type: e.target.value });
                // Clear error when user starts typing
                if (errors.cert_type) {
                  setErrors({ ...errors, cert_type: "" });
                }
              }}
              placeholder="e.g., BLS, ACLS, PALS, RN License"
              className={errors.cert_type ? "border-red-500" : ""}
            />
            {errors.cert_type && (
              <p className="text-sm text-red-500">{errors.cert_type}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cert_number">Certification Number (Optional)</Label>
            <Input
              id="cert_number"
              value={form.cert_number}
              onChange={(e) => setForm({ ...form, cert_number: e.target.value })}
              placeholder="License number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="score">Score (Optional)</Label>
            <Input
              id="score"
              value={form.score}
              onChange={(e) => setForm({ ...form, score: e.target.value })}
              placeholder="e.g., 95%"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue_date">Issue Date</Label>
              <DatePicker
                value={form.issue_date ? new Date(form.issue_date + "T00:00:00") : undefined}
                onChange={(date) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    setForm({ ...form, issue_date: `${year}-${month}-${day}` });
                  } else {
                    setForm({ ...form, issue_date: "" });
                  }
                  // Clear error when user selects a date
                  if (errors.issue_date) {
                    setErrors({ ...errors, issue_date: "" });
                  }
                }}
                placeholder="Select issue date"
                fromYear={1970}
                toYear={new Date().getFullYear()}
                className={errors.issue_date ? "border-red-500" : ""}
              />
              {errors.issue_date && (
                <p className="text-sm text-red-500">{errors.issue_date}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
              <DatePicker
                value={form.expiry_date ? new Date(form.expiry_date + "T00:00:00") : undefined}
                onChange={(date) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    setForm({ ...form, expiry_date: `${year}-${month}-${day}` });
                  } else {
                    setForm({ ...form, expiry_date: "" });
                  }
                  // Clear error when user selects a date
                  if (errors.expiry_date) {
                    setErrors({ ...errors, expiry_date: "" });
                  }
                }}
                placeholder="Select expiry date"
                fromYear={1970}
                toYear={new Date().getFullYear() + 10}
                className={errors.expiry_date ? "border-red-500" : ""}
              />
              {errors.expiry_date && (
                <p className="text-sm text-red-500">{errors.expiry_date}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="verified"
              checked={form.verified}
              onChange={(e) =>
                setForm({ ...form, verified: e.target.checked })
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="verified" className="text-sm font-normal">
              This certification is verified
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : certification ? "Update" : "Add"} Certification
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}