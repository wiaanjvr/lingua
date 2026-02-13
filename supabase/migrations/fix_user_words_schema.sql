-- ============================================
-- FIX USER_WORDS SCHEMA MIGRATION
-- ============================================
-- This migration fixes the user_words table to match the expected schema
-- Adds missing columns and renames inconsistent ones
--
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add ALL potentially missing columns
ALTER TABLE user_words ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
ALTER TABLE user_words ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE user_words ADD COLUMN IF NOT EXISTS word TEXT NOT NULL;
ALTER TABLE user_words ADD COLUMN IF NOT EXISTS lemma TEXT;
ALTER TABLE user_words ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'fr';

-- SRS columns
ALTER TABLE user_words ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'known', 'mastered'));
ALTER TABLE user_words ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0;
ALTER TABLE user_words ADD COLUMN IF NOT EXISTS ease_factor REAL DEFAULT 2.5;
ALTER TABLE user_words ADD COLUMN IF NOT EXISTS interval INTEGER DEFAULT 0;
ALTER TABLE user_words ADD COLUMN IF NOT EXISTS repetitions INTEGER DEFAULT 0;

-- Review tracking
ALTER TABLE user_words ADD COLUMN IF NOT EXISTS next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE user_words ADD COLUMN IF NOT EXISTS last_reviewed TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_words ADD COLUMN IF NOT EXISTS last_rated_at TIMESTAMP WITH TIME ZONE;

-- Context & metadata
ALTER TABLE user_words ADD COLUMN IF NOT EXISTS context_sentence TEXT;
ALTER TABLE user_words ADD COLUMN IF NOT EXISTS frequency_rank INTEGER;
ALTER TABLE user_words ADD COLUMN IF NOT EXISTS part_of_speech TEXT;

-- Timestamps
ALTER TABLE user_words ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE user_words ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fix column name inconsistencies (if old schema was used)
DO $$
BEGIN
    -- Rename easiness_factor to ease_factor if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_words' AND column_name = 'easiness_factor'
    ) THEN
        ALTER TABLE user_words RENAME COLUMN easiness_factor TO ease_factor;
        RAISE NOTICE '✓ Renamed easiness_factor to ease_factor';
    END IF;

    -- Rename interval_days to interval if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_words' AND column_name = 'interval_days'
    ) THEN
        ALTER TABLE user_words RENAME COLUMN interval_days TO interval;
        RAISE NOTICE '✓ Renamed interval_days to interval';
    END IF;
    
    -- Convert interval to INTEGER if it's DECIMAL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_words' 
        AND column_name = 'interval' 
        AND data_type = 'numeric'
    ) THEN
        ALTER TABLE user_words ALTER COLUMN interval TYPE INTEGER USING interval::INTEGER;
        RAISE NOTICE '✓ Converted interval to INTEGER';
    END IF;

    -- Rename first_seen to created_at if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_words' AND column_name = 'first_seen'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_words' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE user_words RENAME COLUMN first_seen TO created_at;
        RAISE NOTICE '✓ Renamed first_seen to created_at';
    END IF;

    -- Rename last_seen to updated_at if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_words' AND column_name = 'last_seen'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_words' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE user_words RENAME COLUMN last_seen TO updated_at;
        RAISE NOTICE '✓ Renamed last_seen to updated_at';
    END IF;

    -- Remove old columns that shouldn't exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_words' AND column_name = 'times_seen'
    ) THEN
        ALTER TABLE user_words DROP COLUMN times_seen;
        RAISE NOTICE '✓ Dropped times_seen column';
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_words' AND column_name = 'times_rated'
    ) THEN
        ALTER TABLE user_words DROP COLUMN times_rated;
        RAISE NOTICE '✓ Dropped times_rated column';
    END IF;

END $$;

-- Set defaults for columns that exist (conditional)
DO $$
BEGIN
    -- Only set defaults if columns exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_words' AND column_name = 'rating') THEN
        ALTER TABLE user_words ALTER COLUMN rating SET DEFAULT 0;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_words' AND column_name = 'ease_factor') THEN
        ALTER TABLE user_words ALTER COLUMN ease_factor SET DEFAULT 2.5;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_words' AND column_name = 'interval') THEN
        ALTER TABLE user_words ALTER COLUMN interval SET DEFAULT 0;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_words' AND column_name = 'repetitions') THEN
        ALTER TABLE user_words ALTER COLUMN repetitions SET DEFAULT 0;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_words' AND column_name = 'next_review') THEN
        ALTER TABLE user_words ALTER COLUMN next_review SET DEFAULT NOW();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_words' AND column_name = 'created_at') THEN
        ALTER TABLE user_words ALTER COLUMN created_at SET DEFAULT NOW();
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_words' AND column_name = 'updated_at') THEN
        ALTER TABLE user_words ALTER COLUMN updated_at SET DEFAULT NOW();
    END IF;
END $$;

-- Ensure unique constraint exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_words_user_id_word_language_key'
    ) THEN
        ALTER TABLE user_words ADD CONSTRAINT user_words_user_id_word_language_key UNIQUE(user_id, word, language);
        RAISE NOTICE '✓ Added unique constraint';
    END IF;
END $$;

-- Ensure updated_at trigger exists
DROP TRIGGER IF EXISTS update_user_words_updated_at ON user_words;
CREATE TRIGGER update_user_words_updated_at 
    BEFORE UPDATE ON user_words
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Display final schema
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_words'
ORDER BY ordinal_position;

-- Verification
DO $$
DECLARE
    required_columns TEXT[] := ARRAY[
        'id', 'user_id', 'word', 'lemma', 'language',
        'status', 'rating', 'ease_factor', 'interval', 'repetitions',
        'next_review', 'last_reviewed', 'last_rated_at',
        'context_sentence', 'frequency_rank', 'part_of_speech',
        'created_at', 'updated_at'
    ];
    col TEXT;
    missing_columns TEXT[] := '{}';
BEGIN
    FOREACH col IN ARRAY required_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'user_words' AND column_name = col
        ) THEN
            missing_columns := array_append(missing_columns, col);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE WARNING 'Missing columns: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE '✓ All required columns present!';
    END IF;
END $$;
