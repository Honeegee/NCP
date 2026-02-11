-- Add type column to nurse_experience to categorize entries
-- Values: 'employment' (default), 'clinical_placement', 'ojt', 'volunteer'
ALTER TABLE nurse_experience
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'employment';

COMMENT ON COLUMN nurse_experience.type IS 'Type of experience: employment, clinical_placement, ojt, volunteer';
