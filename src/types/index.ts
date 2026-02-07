export type UserRole = "nurse" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface NurseProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  date_of_birth: string | null;
  graduation_year: number | null;
  years_of_experience: number | null;
  bio: string | null;
  profile_picture_url: string | null;
  profile_complete: boolean;
  updated_at: string;
}

export interface NurseExperience {
  id: string;
  nurse_id: string;
  employer: string;
  position: string;
  department: string | null;
  start_date: string;
  end_date: string | null;
  description: string | null;
  location: string | null;
}

export interface NurseCertification {
  id: string;
  nurse_id: string;
  cert_type: string;
  cert_number: string | null;
  score: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  verified: boolean;
}

export interface NurseEducation {
  id: string;
  nurse_id: string;
  institution: string;
  degree: string;
  field_of_study: string | null;
  graduation_year: number | null;
  institution_location: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
}

export interface NurseSkill {
  id: string;
  nurse_id: string;
  skill_name: string;
  proficiency: "basic" | "intermediate" | "advanced";
}

export interface Resume {
  id: string;
  nurse_id: string;
  file_path: string;
  original_filename: string;
  file_type: string;
  extracted_text: string | null;
  parsed_data: ParsedResumeData | null;
  uploaded_at: string;
}

export interface ParsedResumeData {
  summary?: string;
  graduation_year?: number;
  years_of_experience?: number;
  certifications?: {
    type: string;
    number?: string;
    score?: string;
  }[];
  hospitals?: string[];
  skills?: string[];
  salary?: string;
  education?: {
    institution?: string;
    degree?: string;
    field_of_study?: string;
    year?: number;
    institution_location?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
  }[];
  address?: string;
  experience?: {
    employer?: string;
    position?: string;
    start_date?: string;
    end_date?: string;
    department?: string;
    description?: string;
    location?: string;
  }[];
}

export type EmploymentType = "full-time" | "part-time" | "contract";

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  facility_name: string;
  employment_type: EmploymentType;
  min_experience_years: number;
  required_certifications: string[];
  required_skills: string[];
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  is_active: boolean;
  created_at: string;
}

export interface JobMatch {
  job: Job;
  match_score: number;
  matched_certifications: string[];
  matched_skills: string[];
  experience_match: boolean;
}

// Registration wizard data
export type ProfessionalStatus = "registered_nurse" | "nursing_student";
export type LocationType = "philippines" | "overseas";

export interface RegistrationData {
  // Step 2: Basic Information
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  mobile_number: string;
  location_type: LocationType;
  // Step 3: Professional Status
  professional_status: ProfessionalStatus;
  // RN fields
  employment_status: string;
  certifications: {
    cert_type: string;
    cert_number: string;
    score: string;
  }[];
  years_of_experience: string;
  specialization: string;
  // Student fields
  school_name: string;
  graduation_year: string;
  internship_experience: string;
  // Step 4: Resume
  resume_file: File | null;
  // Step 5: Consent
  consent_agreed: boolean;
}

export interface NurseFullProfile extends NurseProfile {
  experience: NurseExperience[];
  certifications: NurseCertification[];
  education: NurseEducation[];
  skills: NurseSkill[];
  resumes: Resume[];
  user: Pick<User, "email" | "role">;
}
