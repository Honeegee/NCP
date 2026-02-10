-- Job Applications table
CREATE TABLE job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nurse_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  applied_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(nurse_user_id, job_id)
);

-- Indexes
CREATE INDEX idx_job_applications_nurse ON job_applications(nurse_user_id);
CREATE INDEX idx_job_applications_job ON job_applications(job_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);

-- RLS
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view applications" ON job_applications
  FOR SELECT USING (true);

CREATE POLICY "Nurses can create applications" ON job_applications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Applications updatable" ON job_applications
  FOR UPDATE USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_job_application_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER job_application_updated_at_trigger
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_job_application_updated_at();
