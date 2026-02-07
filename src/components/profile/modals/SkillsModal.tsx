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
import { skillItemSchema } from "@/lib/validators";
import type { NurseSkill } from "@/types";

interface SkillsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skill: NurseSkill | null;
  onSave: (data: {
    skill_name: string;
  }) => Promise<void>;
}

export default function SkillsModal({
  open,
  onOpenChange,
  skill,
  onSave,
}: SkillsModalProps) {
  const [form, setForm] = useState({
    skill_name: "",
  });
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (skill) {
      setForm({
        skill_name: skill.skill_name || "",
      });
    } else {
      setForm({
        skill_name: "",
      });
    }
    // Clear error when modal opens or skill changes
    setError("");
  }, [skill, open]);

  const handleSave = async () => {
    // Validate form
    const validation = skillItemSchema.safeParse(form);
    
    if (!validation.success) {
      // Get the first error message
      const firstError = validation.error.issues[0]?.message || "Invalid skill data";
      setError(firstError);
      return;
    }

    // Clear error if validation passes
    setError("");
    
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
          <DialogTitle>{skill ? "Edit Skill" : "Add Skill"}</DialogTitle>
          <DialogDescription>
            Add a skill to your profile.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="skill_name">Skill Name</Label>
            <Input
              id="skill_name"
              value={form.skill_name}
              onChange={(e) => {
                setForm({ ...form, skill_name: e.target.value });
                // Clear error when user starts typing
                if (error) {
                  setError("");
                }
              }}
              placeholder="e.g., Patient Care, IV Therapy, EHR"
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : skill ? "Update" : "Add"} Skill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}