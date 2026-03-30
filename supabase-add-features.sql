-- Add project management, key dates, and concerns features
-- Run this in your Supabase SQL Editor

-- 1. Add new columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS go_live_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS communication_start_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS assessment_end_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS communication_plan TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS stakeholder_impact TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS comm_plan_doc_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS comm_plan_doc_path TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_doc_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_doc_path TEXT;

-- 2. Concerns table
CREATE TABLE IF NOT EXISTS concerns (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  stakeholder_name TEXT NOT NULL,
  concern_text TEXT NOT NULL,
  assigned_to_sme_email TEXT,
  assigned_to_sme_name TEXT,
  sme_response TEXT,
  manager_response TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. RLS for concerns
ALTER TABLE concerns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on concerns" ON concerns FOR ALL USING (true) WITH CHECK (true);
