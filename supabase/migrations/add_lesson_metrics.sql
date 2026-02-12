-- Add lesson metrics columns to profiles table
-- These track user progress and engagement

-- Learning streak (days in a row with completed lessons)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;

-- Last lesson completion date (to calculate streak)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_lesson_date DATE;

-- Total practice time in minutes
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_practice_minutes INTEGER DEFAULT 0;

-- Total completed sessions count
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sessions_completed INTEGER DEFAULT 0;

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_lesson_date ON profiles(last_lesson_date);

-- Comment for documentation
COMMENT ON COLUMN profiles.streak IS 'Number of consecutive days with completed lessons';
COMMENT ON COLUMN profiles.last_lesson_date IS 'Date of most recently completed lesson';
COMMENT ON COLUMN profiles.total_practice_minutes IS 'Total accumulated practice time in minutes';
COMMENT ON COLUMN profiles.sessions_completed IS 'Total number of completed lesson sessions';
