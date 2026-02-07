"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stepBasicInfoSchema, type StepBasicInfoData } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import type { LocationType } from "@/types";

interface StepBasicInfoProps {
  data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    mobile_number: string;
    location_type: LocationType;
  };
  onNext: (data: StepBasicInfoData) => void;
  onBack: () => void;
}

export function StepBasicInfo({ data, onNext, onBack }: StepBasicInfoProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<StepBasicInfoData>({
    resolver: zodResolver(stepBasicInfoSchema),
    mode: "onChange", // Validate on change for real-time feedback
    defaultValues: {
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      email: data.email || "",
      password: data.password || "",
      confirmPassword: "",
      mobile_number: data.mobile_number || "",
      location_type: data.location_type || "philippines",
    },
  });

  const locationType = useWatch({
    control,
    name: "location_type",
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-5">
      {/* Section Header */}
      <div className="text-center space-y-2 mb-2">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-sky-100 mx-auto">
          <User className="h-6 w-6 text-sky-600" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Tell Us About Yourself</h3>
        <p className="text-sm text-foreground/60 max-w-md mx-auto leading-relaxed">
          This information will be used to create your own professional profile
        </p>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="first_name" className="text-foreground/80">First Name <span className="text-rose-500">*</span></Label>
            <Input
              id="first_name"
              placeholder="Maria"
              className="h-11 rounded-xl"
              {...register("first_name")}
            />
            {errors.first_name && (
              <p className="text-sm text-destructive">{errors.first_name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last_name" className="text-foreground/80">Last Name <span className="text-rose-500">*</span></Label>
            <Input
              id="last_name"
              placeholder="Santos"
              className="h-11 rounded-xl"
              {...register("last_name")}
            />
            {errors.last_name && (
              <p className="text-sm text-destructive">{errors.last_name.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-foreground/80">Email Address <span className="text-rose-500">*</span></Label>
          <Input
            id="email"
            type="email"
            placeholder="maria.santos@email.com"
            className="h-11 rounded-xl"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-foreground/80">Create Password <span className="text-rose-500">*</span></Label>
          <Input
            id="password"
            type="password"
            placeholder="Minimum 8 characters"
            className="h-11 rounded-xl"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-foreground/80">Confirm Password <span className="text-rose-500">*</span></Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            className="h-11 rounded-xl"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="mobile_number" className="text-foreground/80">Mobile Number <span className="text-rose-500">*</span></Label>
          <Input
            id="mobile_number"
            placeholder="+63 912 345 6789"
            className="h-11 rounded-xl"
            {...register("mobile_number")}
          />
          {errors.mobile_number && (
            <p className="text-sm text-destructive">{errors.mobile_number.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-foreground/80 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-amber-500" />
            Current Location <span className="text-rose-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue("location_type", "philippines")}
              className={`p-3 rounded-xl border-2 text-sm font-medium text-center transition-all ${
                locationType === "philippines"
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border hover:border-primary/30 text-foreground/70"
              }`}
            >
              Philippines
            </button>
            <button
              type="button"
              onClick={() => setValue("location_type", "overseas")}
              className={`p-3 rounded-xl border-2 text-sm font-medium text-center transition-all ${
                locationType === "overseas"
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : "border-border hover:border-primary/30 text-foreground/70"
              }`}
            >
              Overseas
            </button>
          </div>
          {errors.location_type && (
            <p className="text-sm text-destructive">{errors.location_type.message}</p>
          )}
        </div>
      </div>

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
        Your personal information is encrypted and securely stored. We&apos;ll never share your contact details without your permission.
      </p>
    </form>
  );
}
