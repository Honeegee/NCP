-- Add new columns to nurse_profiles for updated registration flow
ALTER TABLE nurse_profiles ADD COLUMN IF NOT EXISTS professional_status TEXT DEFAULT 'registered_nurse';
ALTER TABLE nurse_profiles ADD COLUMN IF NOT EXISTS location_type TEXT DEFAULT 'philippines';
ALTER TABLE nurse_profiles ADD COLUMN IF NOT EXISTS employment_status TEXT;
ALTER TABLE nurse_profiles ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE nurse_profiles ADD COLUMN IF NOT EXISTS school_name TEXT;
ALTER TABLE nurse_profiles ADD COLUMN IF NOT EXISTS internship_experience TEXT;
