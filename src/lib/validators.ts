import { z } from "zod";

// Strong password validation schema
const strongPasswordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must not exceed 128 characters")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/\d/, "Password must contain at least one number")
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "Password must contain at least one special character (!@#$%^&* etc.)")
  .refine((password) => {
    // Check for consecutive identical characters (more than 3 in a row)
    return !/(.)\1\1\1/.test(password);
  }, "Password cannot contain 4 or more consecutive identical characters")
  .refine((password) => {
    // Common weak passwords to block
    const weakPasswords = [
      'password', 'password123', '12345678', '123456789', '1234567890',
      'qwerty', 'qwerty123', 'admin', 'admin123', 'letmein', 'welcome',
      'monkey', 'dragon', 'baseball', 'football', 'superman', 'iloveyou',
      'sunshine', 'master', 'hello', 'freedom', 'whatever', 'trustno1'
    ];
    return !weakPasswords.includes(password.toLowerCase());
  }, "Password is too common or easily guessable")
  .refine((password) => {
    // Check for common patterns
    const commonPatterns = [
      /^[a-zA-Z]+$/, // Only letters
      /^\d+$/, // Only numbers
      /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, // Only special characters
      /^(.)\1+$/, // All same character
      /^123456789/, // Sequential numbers
      /^qwerty/, // Keyboard patterns
      /^abcdef/, // Sequential letters
    ];
    return !commonPatterns.some(pattern => pattern.test(password));
  }, "Password follows a common pattern that is easy to guess");

// Registration Step 2 — Basic Information (for API validation without confirmPassword)
export const stepBasicInfoApiSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  password: strongPasswordSchema,
  mobile_number: z.string()
    .min(1, "Mobile number is required")
    .min(10, "Mobile number must be at least 10 digits")
    .max(20, "Mobile number must not exceed 20 characters")
    .regex(/^[\d\s+()-]+$/, "Mobile number can only contain digits, spaces, +, -, and parentheses"),
  location_type: z.enum(["philippines", "overseas"]),
});

// Registration Step 2 — Basic Information (for client-side with confirmPassword)
export const stepBasicInfoSchema = stepBasicInfoApiSchema.extend({
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Registration Step 3 — Nurse Credentials (for Registered Nurses)
export const stepNurseCredentialsSchema = z.object({
  employment_status: z.string().min(1, "Employment status is required"),
  certifications: z.array(z.object({
    cert_type: z.string().min(1, "Certification type is required"),
    cert_number: z.string().optional().default(""),
    score: z.string().optional().default(""),
  })).optional().default([]),
  years_of_experience: z.string().min(1, "Years of experience is required"),
  specialization: z.string().optional().default(""),
});

// Registration Step 3 — Student Info (for Nursing Students)
export const stepStudentInfoSchema = z.object({
  school_name: z.string().min(1, "School name is required"),
  graduation_year: z.string().min(1, "Expected graduation year is required"),
  internship_experience: z.string().optional().default(""),
  certifications: z.array(z.object({
    cert_type: z.string().min(1, "Certification type is required"),
    cert_number: z.string().optional().default(""),
    score: z.string().optional().default(""),
  })).optional().default([]),
});

// Legacy schemas kept for other parts of the app
export const stepPersonalSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  country: z.string().min(1, "Country is required"),
});

export const stepContactSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: strongPasswordSchema,
  phone: z.string()
    .min(1, "Phone number is required")
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must not exceed 20 characters")
    .regex(/^[\d\s+()-]+$/, "Phone number can only contain digits, spaces, +, -, and parentheses"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
});

export const experienceItemSchema = z.object({
  employer: z.string().min(1, "Employer name is required"),
  position: z.string().min(1, "Position is required"),
  department: z.string().optional().default(""),
  location: z.string().optional().default(""),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional().default(""),
  description: z.string().optional().default(""),
}).refine(
  (data) => {
    // If end_date is provided, ensure it's after start_date
    if (data.end_date && data.start_date) {
      return new Date(data.end_date) >= new Date(data.start_date);
    }
    return true;
  },
  {
    message: "End date must be after or equal to start date",
    path: ["end_date"], // This will attach the error to the end_date field
  }
);

export const certificationItemSchema = z.object({
  cert_type: z.string().min(1, "Certification type is required"),
  cert_number: z.string().optional().default(""),
  score: z.string().optional().default(""),
  issue_date: z.string().optional().nullable(),
  expiry_date: z.string().optional().nullable(),
  verified: z.boolean().default(false),
}).refine(
  (data) => {
    // If both dates are provided, ensure expiry_date is after issue_date
    if (data.expiry_date && data.issue_date) {
      return new Date(data.expiry_date) >= new Date(data.issue_date);
    }
    return true;
  },
  {
    message: "Expiry date must be after or equal to issue date",
    path: ["expiry_date"], // This will attach the error to the expiry_date field
  }
);

export const educationItemSchema = z.object({
  institution: z.string().min(1, "Institution name is required"),
  degree: z.string().min(1, "Degree is required"),
  field_of_study: z.string().optional().default(""),
  graduation_year: z.string().min(1, "Graduation year is required")
    .refine((val) => {
      const year = parseInt(val);
      return !isNaN(year) && year >= 1900 && year <= new Date().getFullYear() + 10;
    }, "Graduation year must be a valid year"),
});

export const skillItemSchema = z.object({
  skill_name: z.string().min(1, "Skill name is required"),
});

export const stepProfessionalSchema = z.object({
  graduation_year: z.coerce.number().nullable().optional(),
  experience: z.array(experienceItemSchema).optional().default([]),
  certifications: z.array(certificationItemSchema).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
});

export const loginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const jobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  facility_name: z.string().min(1, "Facility name is required"),
  employment_type: z.enum(["full-time", "part-time", "contract"]),
  min_experience_years: z.coerce.number().min(0),
  required_certifications: z.array(z.string()).default([]),
  required_skills: z.array(z.string()).default([]),
  salary_min: z.coerce.number().nullable().optional(),
  salary_max: z.coerce.number().nullable().optional(),
  salary_currency: z.string().default("PHP"),
});

export const profileUpdateSchema = z.object({
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must not exceed 20 characters")
    .regex(/^[\d\s+()-]+$/, "Phone number can only contain digits, spaces, +, -, and parentheses")
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  graduation_year: z.coerce.number().nullable().optional(),
  bio: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: strongPasswordSchema,
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Valid email is required"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: strongPasswordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type StepBasicInfoData = z.infer<typeof stepBasicInfoSchema>;
export type StepNurseCredentialsData = z.infer<typeof stepNurseCredentialsSchema>;
export type StepStudentInfoData = z.infer<typeof stepStudentInfoSchema>;
export type StepPersonalData = z.infer<typeof stepPersonalSchema>;
export type StepContactData = z.infer<typeof stepContactSchema>;
export type StepProfessionalData = z.infer<typeof stepProfessionalSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type JobData = z.infer<typeof jobSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
