-- Migration: Add foundation_lessons table
-- This stores foundation/survival phrases for beginners (A0 level)

CREATE TABLE IF NOT EXISTS foundation_lessons (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'foundation-phrase',
    language TEXT NOT NULL DEFAULT 'fr',
    level TEXT NOT NULL DEFAULT 'A0',
    phase TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    phrase_target TEXT NOT NULL,  -- The phrase in target language (e.g., French)
    phrase_native TEXT NOT NULL,  -- The phrase in native language (e.g., English)
    audio_url TEXT,
    phonetic TEXT,
    breakdown JSONB DEFAULT '[]'::jsonb,  -- Array of {part, meaning}
    usage_context TEXT,
    practice_sentences JSONB DEFAULT '[]'::jsonb,  -- Array of {french, english, audio_url}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_foundation_lessons_level ON foundation_lessons(level);
CREATE INDEX IF NOT EXISTS idx_foundation_lessons_phase ON foundation_lessons(phase);
CREATE INDEX IF NOT EXISTS idx_foundation_lessons_order ON foundation_lessons("order");

-- Enable RLS
ALTER TABLE foundation_lessons ENABLE ROW LEVEL SECURITY;

-- Foundation lessons are publicly readable
CREATE POLICY "Foundation lessons are publicly readable"
    ON foundation_lessons FOR SELECT
    TO authenticated
    USING (true);

COMMENT ON TABLE foundation_lessons IS 'Foundation/survival phrases for beginners learning a new language';
COMMENT ON COLUMN foundation_lessons.breakdown IS 'JSONB array breaking down the phrase into parts with meanings';
COMMENT ON COLUMN foundation_lessons.practice_sentences IS 'JSONB array of example sentences with translations and audio';
