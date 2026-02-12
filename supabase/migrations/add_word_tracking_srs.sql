-- Migration: Add Word-Level Tracking and Spaced Repetition System
-- This enables comprehensible input with spaced repetition

-- User words table - tracks every word a user has encountered
CREATE TABLE user_words (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles ON DELETE CASCADE NOT NULL,
  
  word TEXT NOT NULL,
  language TEXT NOT NULL,
  lemma TEXT NOT NULL, -- base form of the word
  
  -- Spaced Repetition System (SM-2 algorithm)
  easiness_factor DECIMAL(3,2) DEFAULT 2.5, -- SM-2 easiness (1.3 - 2.5+)
  repetitions INTEGER DEFAULT 0, -- number of correct repetitions
  interval_days DECIMAL(10,2) DEFAULT 0, -- days until next review
  next_review TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Learning state
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'learning', 'known', 'mastered')),
  times_seen INTEGER DEFAULT 0,
  times_rated INTEGER DEFAULT 0,
  
  -- Tracking
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Metadata
  part_of_speech TEXT,
  frequency_rank INTEGER, -- word frequency in language (lower = more common)
  
  UNIQUE(user_id, word, language)
);

-- Word interactions - tracks each time user rates their knowledge
CREATE TABLE word_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles ON DELETE CASCADE NOT NULL,
  word_id UUID REFERENCES user_words ON DELETE CASCADE NOT NULL,
  story_id UUID, -- references generated_stories (created below)
  
  rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
  -- 0: Total blackout, 1: Wrong, 2: Hard, 3: Good, 4: Easy, 5: Perfect
  
  context_sentence TEXT, -- sentence where word appeared
  response_time_ms INTEGER, -- how long to rate
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Generated stories - stores AI-generated comprehensible input
CREATE TABLE generated_stories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- the story text
  language TEXT NOT NULL,
  level TEXT NOT NULL,
  
  -- Story metadata
  word_count INTEGER NOT NULL,
  new_words TEXT[] DEFAULT '{}', -- words user hasn't seen
  review_words TEXT[] DEFAULT '{}', -- words due for review
  known_words TEXT[] DEFAULT '{}', -- words user knows well
  
  -- Audio
  audio_url TEXT,
  
  -- User interaction
  completed BOOLEAN DEFAULT FALSE,
  listened BOOLEAN DEFAULT FALSE,
  read BOOLEAN DEFAULT FALSE,
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Generation parameters (for reproducibility)
  generation_params JSONB DEFAULT '{}'
);

-- Story progress - tracks user's progress through a story
CREATE TABLE story_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles ON DELETE CASCADE NOT NULL,
  story_id UUID REFERENCES generated_stories ON DELETE CASCADE NOT NULL,
  
  current_phase TEXT DEFAULT 'listen' CHECK (current_phase IN ('listen', 'read', 'interact', 'completed')),
  listen_count INTEGER DEFAULT 0,
  words_rated INTEGER DEFAULT 0,
  
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  UNIQUE(user_id, story_id)
);

-- Indexes for performance
CREATE INDEX idx_user_words_user_id ON user_words(user_id);
CREATE INDEX idx_user_words_next_review ON user_words(next_review);
CREATE INDEX idx_user_words_status ON user_words(status);
CREATE INDEX idx_user_words_language ON user_words(language);
CREATE INDEX idx_user_words_lemma ON user_words(lemma);
CREATE INDEX idx_word_interactions_user_id ON word_interactions(user_id);
CREATE INDEX idx_word_interactions_word_id ON word_interactions(word_id);
CREATE INDEX idx_word_interactions_created_at ON word_interactions(created_at);
CREATE INDEX idx_generated_stories_user_id ON generated_stories(user_id);
CREATE INDEX idx_generated_stories_created_at ON generated_stories(created_at);
CREATE INDEX idx_story_progress_user_story ON story_progress(user_id, story_id);

-- Row Level Security Policies

ALTER TABLE user_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own words"
  ON user_words FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own words"
  ON user_words FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own words"
  ON user_words FOR UPDATE
  USING (auth.uid() = user_id);

ALTER TABLE word_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions"
  ON word_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions"
  ON word_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

ALTER TABLE generated_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stories"
  ON generated_stories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stories"
  ON generated_stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories"
  ON generated_stories FOR UPDATE
  USING (auth.uid() = user_id);

ALTER TABLE story_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own story progress"
  ON story_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own story progress"
  ON story_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own story progress"
  ON story_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Helper function to get words due for review
CREATE OR REPLACE FUNCTION get_words_due_for_review(
  p_user_id UUID,
  p_language TEXT,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  word TEXT,
  lemma TEXT,
  status TEXT,
  days_overdue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uw.word,
    uw.lemma,
    uw.status,
    EXTRACT(EPOCH FROM (TIMEZONE('utc', NOW()) - uw.next_review)) / 86400 AS days_overdue
  FROM user_words uw
  WHERE uw.user_id = p_user_id
    AND uw.language = p_language
    AND uw.next_review <= TIMEZONE('utc', NOW())
    AND uw.status IN ('learning', 'known')
  ORDER BY uw.next_review ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's known words
CREATE OR REPLACE FUNCTION get_known_words(
  p_user_id UUID,
  p_language TEXT
)
RETURNS TABLE (
  word TEXT,
  lemma TEXT,
  easiness_factor DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uw.word,
    uw.lemma,
    uw.easiness_factor
  FROM user_words uw
  WHERE uw.user_id = p_user_id
    AND uw.language = p_language
    AND uw.status IN ('learning', 'known', 'mastered')
  ORDER BY uw.frequency_rank ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
