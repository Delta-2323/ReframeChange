-- Add department and survey frequency fields to surveys table
-- Run this in your Supabase SQL Editor

ALTER TABLE surveys ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS survey_frequency TEXT;
