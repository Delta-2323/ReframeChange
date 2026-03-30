-- Add per-field document columns to the projects table
-- Run this in your Supabase SQL Editor if your projects table already exists

ALTER TABLE projects ADD COLUMN IF NOT EXISTS bcip_doc_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS bcip_doc_path TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS logic_doc_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS logic_doc_path TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS strategy_doc_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS strategy_doc_path TEXT;
