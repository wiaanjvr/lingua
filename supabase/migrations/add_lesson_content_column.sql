-- Migration: Add content column to lessons table for 10-phase lesson structure
-- This stores the structured lesson content with all 10 phases

-- Add content column to lessons table
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS content JSONB;

-- Add comment to document the column
COMMENT ON COLUMN lessons.content IS 'Structured 10-phase lesson content including warmup, prediction, audio, drills, etc.';
