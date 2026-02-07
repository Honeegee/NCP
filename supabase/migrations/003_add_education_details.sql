-- Add additional fields to nurse_education table to capture all resume information
ALTER TABLE nurse_education
  ADD COLUMN IF NOT EXISTS institution_location TEXT,
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS end_date DATE,
  ADD COLUMN IF NOT EXISTS status TEXT;

-- Add location field to nurse_experience table
ALTER TABLE nurse_experience
  ADD COLUMN IF NOT EXISTS location TEXT;

-- Add comments to explain fields
COMMENT ON COLUMN nurse_education.institution_location IS 'Location of the educational institution (e.g., "Talisay City, Negros Occidental")';
COMMENT ON COLUMN nurse_education.start_date IS 'Start date of education';
COMMENT ON COLUMN nurse_education.end_date IS 'End date of education (NULL if current)';
COMMENT ON COLUMN nurse_education.status IS 'Current status (e.g., "4th Year Student", "Graduated")';
COMMENT ON COLUMN nurse_experience.location IS 'Location of the employer/workplace (e.g., "Manila, Philippines", "New York, USA")';
