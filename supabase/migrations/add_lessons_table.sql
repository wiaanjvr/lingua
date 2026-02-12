-- Migration: Add lessons table for comprehensible input lesson tracking
-- Run this migration after the user_words migration

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Content
    title TEXT,
    target_text TEXT NOT NULL,
    translation TEXT,
    audio_url TEXT,
    
    -- Metadata
    language TEXT NOT NULL DEFAULT 'fr',
    level TEXT NOT NULL DEFAULT 'A1',
    
    -- Word analysis (stored as JSONB array)
    words JSONB DEFAULT '[]'::jsonb,
    total_words INTEGER DEFAULT 0,
    new_word_count INTEGER DEFAULT 0,
    review_word_count INTEGER DEFAULT 0,
    known_word_count INTEGER DEFAULT 0,
    comprehension_percentage REAL DEFAULT 0,
    
    -- Lesson progress
    current_phase TEXT DEFAULT 'audio-comprehension',
    listen_count INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    
    -- Evaluation data
    initial_comprehension_score INTEGER,
    final_comprehension_score INTEGER,
    conversation_history JSONB DEFAULT '[]'::jsonb,
    vocabulary_ratings JSONB DEFAULT '[]'::jsonb,
    exercise_results JSONB DEFAULT '[]'::jsonb,
    
    -- Generation parameters
    generation_params JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_lessons_user_id ON lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_language ON lessons(language);
CREATE INDEX IF NOT EXISTS idx_lessons_level ON lessons(level);
CREATE INDEX IF NOT EXISTS idx_lessons_completed ON lessons(completed);
CREATE INDEX IF NOT EXISTS idx_lessons_created_at ON lessons(created_at DESC);

-- Enable Row Level Security
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own lessons
CREATE POLICY "Users can view own lessons" ON lessons
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own lessons
CREATE POLICY "Users can create own lessons" ON lessons
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own lessons
CREATE POLICY "Users can update own lessons" ON lessons
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own lessons
CREATE POLICY "Users can delete own lessons" ON lessons
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_lessons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lessons_updated_at_trigger
    BEFORE UPDATE ON lessons
    FOR EACH ROW
    EXECUTE FUNCTION update_lessons_updated_at();

-- Add user_words table if not exists (for vocabulary tracking)
-- This may already exist from previous migration
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_words') THEN
        CREATE TABLE user_words (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            word TEXT NOT NULL,
            language TEXT NOT NULL DEFAULT 'fr',
            
            -- SRS fields
            rating INTEGER DEFAULT 0,
            interval INTEGER DEFAULT 0,
            ease_factor REAL DEFAULT 2.5,
            next_review TIMESTAMP WITH TIME ZONE,
            repetitions INTEGER DEFAULT 0,
            
            -- Metadata
            first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_rated_at TIMESTAMP WITH TIME ZONE,
            last_reviewed_at TIMESTAMP WITH TIME ZONE,
            times_seen INTEGER DEFAULT 1,
            times_correct INTEGER DEFAULT 0,
            
            -- Constraints
            CONSTRAINT user_words_unique UNIQUE (user_id, word, language)
        );

        CREATE INDEX idx_user_words_user_id ON user_words(user_id);
        CREATE INDEX idx_user_words_next_review ON user_words(next_review);
        CREATE INDEX idx_user_words_word ON user_words(word);

        ALTER TABLE user_words ENABLE ROW LEVEL SECURITY;

        CREATE POLICY "Users can view own words" ON user_words
            FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert own words" ON user_words
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update own words" ON user_words
            FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete own words" ON user_words
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create lesson_stats view for dashboard
CREATE OR REPLACE VIEW lesson_stats AS
SELECT 
    user_id,
    COUNT(*) as total_lessons,
    COUNT(*) FILTER (WHERE completed = true) as completed_lessons,
    SUM(new_word_count) as total_new_words_encountered,
    AVG(final_comprehension_score) as avg_final_score,
    MAX(created_at) as last_lesson_at
FROM lessons
GROUP BY user_id;

-- Grant permissions on view
GRANT SELECT ON lesson_stats TO authenticated;

COMMENT ON TABLE lessons IS 'Stores comprehensible input lessons with 6-phase learning flow';
COMMENT ON COLUMN lessons.words IS 'JSONB array of LessonWord objects with word, category, isNew, isDueForReview flags';
COMMENT ON COLUMN lessons.current_phase IS 'One of: audio-comprehension, verbal-check, conversation-feedback, text-reveal, interactive-exercises, final-assessment';
COMMENT ON COLUMN lessons.generation_params IS 'Parameters used to generate this lesson: targetWordCount, newWordPercentage, etc.';
