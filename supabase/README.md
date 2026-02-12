# Supabase Setup for Lingua

This directory contains the database schema and configuration for Supabase.

## Setup Instructions

1. **Create a Supabase project**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Run the schema**
   - In your Supabase dashboard, go to the SQL Editor
   - Copy and paste the contents of `schema.sql`
   - Execute the query

3. **Configure environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Then edit `.env.local` and add your Supabase credentials:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Set up Storage (for audio files)**
   - In Supabase dashboard, go to Storage
   - Create a bucket named `audio`
   - Set it to public or configure RLS as needed
   - Create a bucket named `recordings` for user speech
   - This should be private with RLS

## Database Structure

- **profiles**: User accounts and learning preferences
- **content_segments**: Audio content library
- **comprehension_questions**: Questions for each segment
- **user_progress**: Tracking what users have encountered
- **session_logs**: Record of learning sessions
- **speaking_attempts**: User recordings and analysis

## Row Level Security

All tables have RLS enabled. Users can only access their own data (progress, sessions, recordings). Content is publicly readable for authenticated users.

## Next Steps

After setting up the database:

1. Seed initial content (create some French audio segments)
2. Test authentication flow
3. Implement real data fetching in the app (currently using mock data)
