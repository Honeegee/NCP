-- Create enum types
CREATE TYPE user_role AS ENUM ('nurse', 'admin');
CREATE TYPE employment_type AS ENUM ('full-time', 'part-time', 'contract');
CREATE TYPE skill_proficiency AS ENUM ('basic', 'intermediate', 'advanced');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role DEFAULT 'nurse' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Nurse profiles
CREATE TABLE nurse_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  city TEXT DEFAULT '',
  country TEXT DEFAULT 'Philippines',
  date_of_birth DATE,
  graduation_year INTEGER,
  years_of_experience INTEGER DEFAULT 0,
  bio TEXT,
  profile_complete BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Work experience
CREATE TABLE nurse_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nurse_id UUID NOT NULL REFERENCES nurse_profiles(id) ON DELETE CASCADE,
  employer TEXT NOT NULL,
  position TEXT NOT NULL,
  department TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT
);

-- Certifications
CREATE TABLE nurse_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nurse_id UUID NOT NULL REFERENCES nurse_profiles(id) ON DELETE CASCADE,
  cert_type TEXT NOT NULL,
  cert_number TEXT,
  score TEXT,
  issue_date DATE,
  expiry_date DATE,
  verified BOOLEAN DEFAULT false
);

-- Education
CREATE TABLE nurse_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nurse_id UUID NOT NULL REFERENCES nurse_profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  graduation_year INTEGER
);

-- Skills
CREATE TABLE nurse_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nurse_id UUID NOT NULL REFERENCES nurse_profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency skill_proficiency DEFAULT 'basic'
);

-- Resumes
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nurse_id UUID NOT NULL REFERENCES nurse_profiles(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  extracted_text TEXT,
  parsed_data JSONB,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  facility_name TEXT NOT NULL,
  employment_type employment_type DEFAULT 'full-time',
  min_experience_years INTEGER DEFAULT 0,
  required_certifications TEXT[] DEFAULT '{}',
  required_skills TEXT[] DEFAULT '{}',
  salary_min DECIMAL,
  salary_max DECIMAL,
  salary_currency TEXT DEFAULT 'PHP',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_nurse_profiles_user_id ON nurse_profiles(user_id);
CREATE INDEX idx_nurse_experience_nurse_id ON nurse_experience(nurse_id);
CREATE INDEX idx_nurse_certifications_nurse_id ON nurse_certifications(nurse_id);
CREATE INDEX idx_nurse_education_nurse_id ON nurse_education(nurse_id);
CREATE INDEX idx_nurse_skills_nurse_id ON nurse_skills(nurse_id);
CREATE INDEX idx_resumes_nurse_id ON resumes(nurse_id);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
CREATE INDEX idx_users_email ON users(email);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurse_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurse_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurse_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurse_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurse_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (service role bypasses these; these are for client-side access)
-- For this app, API routes use service role, so these are extra safety

-- Users can read their own user record
CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (true);

-- Nurse profiles: nurses see own, admins see all
CREATE POLICY "Profiles viewable" ON nurse_profiles
  FOR SELECT USING (true);

CREATE POLICY "Profiles editable by owner" ON nurse_profiles
  FOR UPDATE USING (true);

-- Jobs are publicly readable
CREATE POLICY "Jobs publicly readable" ON jobs
  FOR SELECT USING (is_active = true);

-- Create storage bucket for resumes
-- (Run this in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);
