-- Migration: Add A0 (absolute beginner) proficiency level
-- This migration adds A0 level support for absolute beginners who need foundation phrases

-- Update the CHECK constraint on profiles.proficiency_level to include A0
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_proficiency_level_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_proficiency_level_check 
  CHECK (proficiency_level IN ('A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'));

-- Update the default proficiency level to A0 for new users
ALTER TABLE profiles ALTER COLUMN proficiency_level SET DEFAULT 'A0';

-- Update the CHECK constraint on content_segments.level to include A0
ALTER TABLE content_segments DROP CONSTRAINT IF EXISTS content_segments_level_check;
ALTER TABLE content_segments ADD CONSTRAINT content_segments_level_check 
  CHECK (level IN ('A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'));

-- Optional: Update existing users with NULL or no level to A0
UPDATE profiles SET proficiency_level = 'A0' WHERE proficiency_level IS NULL;
