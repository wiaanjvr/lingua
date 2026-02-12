-- Migration: Add vocabulary exercises storage
-- This stores vocabulary exercises linked to content segments

-- Create vocabulary_exercises table
CREATE TABLE IF NOT EXISTS vocabulary_exercises (
    id TEXT PRIMARY KEY,
    segment_id UUID REFERENCES content_segments(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    definition TEXT NOT NULL,
    example TEXT,
    options TEXT[] NOT NULL,
    correct_answer INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for efficient lookup by segment
CREATE INDEX IF NOT EXISTS idx_vocab_exercises_segment_id ON vocabulary_exercises(segment_id);

-- Enable RLS
ALTER TABLE vocabulary_exercises ENABLE ROW LEVEL SECURITY;

-- Vocabulary exercises are publicly readable (like content segments)
CREATE POLICY "Vocabulary exercises are publicly readable"
    ON vocabulary_exercises FOR SELECT
    TO authenticated
    USING (true);

-- Alternatively, add vocabulary as JSONB to content_segments
-- This approach stores vocabulary exercises directly in the segments table
ALTER TABLE content_segments 
ADD COLUMN IF NOT EXISTS vocabulary_exercises JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN content_segments.vocabulary_exercises IS 'JSONB array of vocabulary exercises for this segment';
