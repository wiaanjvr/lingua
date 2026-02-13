-- ============================================
-- LESSON TEMPLATES TABLE MIGRATION
-- ============================================
-- This migration creates a lesson_templates table to cache and reuse
-- generated lesson content across users with similar profiles.
--
-- Benefits:
-- - Reduces OpenAI API calls for text generation
-- - Reduces TTS generation costs
-- - Faster lesson delivery for common level/topic combinations
--
-- Template matching criteria:
-- - Same language
-- - Same proficiency level
-- - Same topic (interest)
-- ============================================

-- Create lesson_templates table
CREATE TABLE IF NOT EXISTS lesson_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Template matching criteria
    language TEXT NOT NULL DEFAULT 'fr',
    level TEXT NOT NULL,
    topic TEXT, -- Can be null for general lessons
    
    -- Cached content (reusable across users)
    title TEXT NOT NULL,
    target_text TEXT NOT NULL,
    translation TEXT,
    audio_url TEXT,
    
    -- Generation metadata
    word_count INTEGER DEFAULT 0,
    generation_params JSONB,
    
    -- Usage tracking
    times_used INTEGER DEFAULT 1,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Unique constraint for template matching
    CONSTRAINT unique_template_key UNIQUE (language, level, topic)
);

-- Create indexes for efficient lookup
CREATE INDEX IF NOT EXISTS idx_lesson_templates_lookup 
    ON lesson_templates(language, level, topic);

CREATE INDEX IF NOT EXISTS idx_lesson_templates_level 
    ON lesson_templates(level);

CREATE INDEX IF NOT EXISTS idx_lesson_templates_topic 
    ON lesson_templates(topic);

-- RLS Policies - Templates are shared resources, readable by all authenticated users
ALTER TABLE lesson_templates ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view templates
DROP POLICY IF EXISTS "Authenticated users can view templates" ON lesson_templates;
CREATE POLICY "Authenticated users can view templates" ON lesson_templates
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- All authenticated users can create templates
DROP POLICY IF EXISTS "Authenticated users can create templates" ON lesson_templates;
CREATE POLICY "Authenticated users can create templates" ON lesson_templates
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only allow updating usage stats (times_used, last_used_at)
DROP POLICY IF EXISTS "Authenticated users can update template usage" ON lesson_templates;
CREATE POLICY "Authenticated users can update template usage" ON lesson_templates
    FOR UPDATE USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Add comment to table
COMMENT ON TABLE lesson_templates IS 
    'Cached lesson content that can be reused across users with similar profiles (level, topic, language)';

-- Add comments to columns
COMMENT ON COLUMN lesson_templates.times_used IS 
    'Number of times this template has been used to create lessons';
COMMENT ON COLUMN lesson_templates.topic IS 
    'Interest/topic this lesson covers. NULL means general lesson.';
