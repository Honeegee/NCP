"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { profileUpdateSchema } from "@/lib/validators";
import type { NurseFullProfile } from "@/types";

interface ProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: NurseFullProfile;
  onSave: (data: {
    first_name: string;
    last_name: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    graduation_year: number | null;
    bio: string;
    professional_status: "registered_nurse" | "nursing_student" | null;
  }) => Promise<void>;
}

export default function ProfileEditModal({
  open,
  onOpenChange,
  profile,
  onSave,
}: ProfileEditModalProps) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    graduation_year: "",
    bio: "",
    professional_status: "" as "registered_nurse" | "nursing_student" | "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        country: profile.country || "",
        graduation_year: profile.graduation_year?.toString() || "",
        bio: profile.bio || "",
        professional_status: profile.professional_status || "",
      });
      setErrors({});
    }
  }, [open, profile]);

  const handleSave = async () => {
    const validation = profileUpdateSchema.safeParse({
      ...form,
      graduation_year: form.graduation_year ? parseInt(form.graduation_year) : null,
      professional_status: form.professional_status || null,
    });

    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      await onSave({
        ...validation.data,
        graduation_year: validation.data.graduation_year ?? null,
        professional_status: (validation.data.professional_status as "registered_nurse" | "nursing_student" | null) ?? null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal information and professional status.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className={errors.first_name ? "border-red-500" : ""}
                autoComplete="given-name"
              />
              {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className={errors.last_name ? "border-red-500" : ""}
                autoComplete="family-name"
              />
              {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="professional_status">Professional Status</Label>
            <select
              id="professional_status"
              value={form.professional_status}
              onChange={(e) =>
                setForm({
                  ...form,
                  professional_status: e.target.value as "registered_nurse" | "nursing_student" | "",
                })
              }
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select status</option>
              <option value="registered_nurse">Registered Nurse</option>
              <option value="nursing_student">Nursing Student</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Professional Summary</Label>
            <Textarea
              id="bio"
              placeholder="Share your nursing experience, specialties, and professional goals..."
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => {
                setForm({ ...form, phone: e.target.value });
                if (errors.phone) setErrors({ ...errors, phone: "" });
              }}
              placeholder="+1 (555) 000-0000"
              className={errors.phone ? "border-red-500" : ""}
              autoComplete="tel"
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                autoComplete="address-level2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                autoComplete="country-name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Street address"
              autoComplete="street-address"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
