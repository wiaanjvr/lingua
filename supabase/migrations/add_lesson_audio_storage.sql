-- Migration: Add lesson-audio storage bucket
-- This stores TTS-generated audio files for lessons in Supabase Storage

-- Create the lesson-audio bucket (public for easy playback)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lesson-audio', 'lesson-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for lesson-audio bucket

-- Anyone can read lesson audio (needed for audio playback)
CREATE POLICY "Lesson audio is publicly accessible" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'lesson-audio');

-- Users can upload audio to their own folder
CREATE POLICY "Users can upload their own lesson audio" 
  ON storage.objects FOR INSERT 
  WITH CHECK (
    bucket_id = 'lesson-audio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own audio files
CREATE POLICY "Users can update their own lesson audio" 
  ON storage.objects FOR UPDATE 
  USING (
    bucket_id = 'lesson-audio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own audio files
CREATE POLICY "Users can delete their own lesson audio" 
  ON storage.objects FOR DELETE 
  USING (
    bucket_id = 'lesson-audio' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
