-- Supabase Migration for Game Changer / REM16™
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id SERIAL PRIMARY KEY,
  stakeholder_name TEXT NOT NULL,
  stakeholder_email TEXT NOT NULL,
  role TEXT NOT NULL,
  thinking_focus TEXT NOT NULL,
  orientation TEXT NOT NULL,
  change_role TEXT NOT NULL,
  mental_model TEXT NOT NULL,
  mental_model_description TEXT NOT NULL,
  project_id INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  bcip_canvas TEXT,
  change_logic TEXT,
  change_strategy TEXT,
  manager_name TEXT,
  document_name TEXT,
  document_mime_type TEXT,
  document_data TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. AI Messages table
CREATE TABLE IF NOT EXISTS ai_messages (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER NOT NULL,
  project_id INTEGER NOT NULL,
  stakeholder_name TEXT NOT NULL,
  mental_model TEXT NOT NULL,
  generated_content TEXT NOT NULL,
  edited_content TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disable RLS on all tables (this app uses PIN-based auth, not Supabase Auth)
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all operations (no auth required)
CREATE POLICY "Allow all on surveys" ON surveys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on ai_messages" ON ai_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on messages" ON messages FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for project documents
INSERT INTO storage.buckets (id, name, public) VALUES ('project-documents', 'project-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to project documents bucket
CREATE POLICY "Allow public read on project-documents" ON storage.objects FOR SELECT USING (bucket_id = 'project-documents');
CREATE POLICY "Allow public insert on project-documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-documents');
CREATE POLICY "Allow public update on project-documents" ON storage.objects FOR UPDATE USING (bucket_id = 'project-documents');
CREATE POLICY "Allow public delete on project-documents" ON storage.objects FOR DELETE USING (bucket_id = 'project-documents');
