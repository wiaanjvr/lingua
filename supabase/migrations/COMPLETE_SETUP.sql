-- COMPLETE DATABASE SETUP FOR LINGUA
-- Run this file in the Supabase SQL Editor to set up all required tables and columns
-- 
-- This combines:
-- 1. Lessons table
-- 2. Profile metrics columns (streak, practice time, etc.)
-- 3. User words table for SRS
-- 4. Storage bucket for lesson audio

-- ============================================
-- 1. LESSONS TABLE
-- ============================================

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lessons_user_id ON lessons(user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_completed ON lessons(completed);
CREATE INDEX IF NOT EXISTS idx_lessons_created_at ON lessons(created_at DESC);

-- Enable RLS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first if they exist)
DROP POLICY IF EXISTS "Users can view own lessons" ON lessons;
DROP POLICY IF EXISTS "Users can create own lessons" ON lessons;
DROP POLICY IF EXISTS "Users can update own lessons" ON lessons;

CREATE POLICY "Users can view own lessons" ON lessons
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own lessons" ON lessons
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lessons" ON lessons
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 2. PROFILE METRICS COLUMNS + RLS FIX
-- ============================================

-- Add metrics columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_lesson_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_practice_minutes INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sessions_completed INTEGER DEFAULT 0;

-- Add INSERT policy for profiles (missing from original schema)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure profile auto-creation trigger exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. USER WORDS TABLE (for SRS)
-- ============================================

CREATE TABLE IF NOT EXISTS user_words (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    lemma TEXT,
    language TEXT NOT NULL DEFAULT 'fr',
    
    -- SRS fields
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'known', 'mastered')),
    rating INTEGER DEFAULT 0,
    ease_factor REAL DEFAULT 2.5,
    interval INTEGER DEFAULT 0,
    repetitions INTEGER DEFAULT 0,
    
    -- Review tracking
    next_review TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_reviewed TIMESTAMP WITH TIME ZONE,
    last_rated_at TIMESTAMP WITH TIME ZONE,
    
    -- Context
    context_sentence TEXT,
    frequency_rank INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, word, language)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_words_user_id ON user_words(user_id);
CREATE INDEX IF NOT EXISTS idx_user_words_language ON user_words(language);
CREATE INDEX IF NOT EXISTS idx_user_words_next_review ON user_words(next_review);

-- Enable RLS
ALTER TABLE user_words ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own words" ON user_words;
DROP POLICY IF EXISTS "Users can create own words" ON user_words;
DROP POLICY IF EXISTS "Users can update own words" ON user_words;

CREATE POLICY "Users can view own words" ON user_words
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own words" ON user_words
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own words" ON user_words
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 4. STORAGE BUCKET FOR LESSON AUDIO
-- ============================================

-- Note: This needs to be done via Storage in Supabase dashboard or via API
-- The bucket 'lesson-audio' needs to be created with public access

-- ============================================
-- 5. VERIFY SETUP
-- ============================================

-- Run these queries to verify setup:
-- SELECT COUNT(*) FROM lessons;
-- SELECT streak, sessions_completed, total_practice_minutes FROM profiles LIMIT 1;
-- SELECT COUNT(*) FROM user_words;
