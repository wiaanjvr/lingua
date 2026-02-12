# Running the SRS Database Migration

## Quick Apply (Choose One Method)

### Method 1: Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left menu
3. Click **New Query**
4. Copy the entire contents of `add_word_tracking_srs.sql` file
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
7. ✅ You should see "Success" message

### Method 2: Supabase CLI

```bash
# Make sure you're in the lingua_2.0 directory
cd lingua_2.0

# Login to Supabase (if not already)
supabase login

# Link to your project (if not already)
supabase link --project-ref your-project-ref

# Push migration
supabase db push

# Or run migration directly
supabase db execute --file supabase/migrations/add_word_tracking_srs.sql
```

### Method 3: Direct SQL Connection

```bash
# Using psql (PostgreSQL command line)
psql postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres \
  -f supabase/migrations/add_word_tracking_srs.sql
```

## Verify Migration Success

After running the migration, verify it worked:

```sql
-- Run this in Supabase SQL Editor to check tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'user_words',
    'word_interactions',
    'generated_stories',
    'story_progress'
  )
ORDER BY table_name;
```

You should see all 4 tables listed.

## Check Functions

```sql
-- Verify helper functions were created
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_words_due_for_review',
    'get_known_words'
  );
```

## What This Migration Creates

### Tables (4)

1. **`user_words`** - Individual word tracking with SRS parameters
2. **`word_interactions`** - Historical log of all word ratings
3. **`generated_stories`** - AI-generated comprehensible input stories
4. **`story_progress`** - User's progress through each story

### Indexes (12)

Performance optimization for common queries:

- `idx_user_words_user_id`
- `idx_user_words_next_review` (for finding due words)
- `idx_user_words_status` (for filtering by learning status)
- And 9 more...

### Security Policies (12)

Row Level Security (RLS) ensures:

- Users can only see their own data
- Authentication required
- Proper CRUD permissions

### Helper Functions (2)

- `get_words_due_for_review()` - Find words needing review
- `get_known_words()` - Get user's vocabulary

## Rollback (If Needed)

If something goes wrong and you need to remove the migration:

```sql
-- WARNING: This will delete all SRS data!
DROP TABLE IF EXISTS story_progress CASCADE;
DROP TABLE IF EXISTS word_interactions CASCADE;
DROP TABLE IF EXISTS generated_stories CASCADE;
DROP TABLE IF EXISTS user_words CASCADE;

DROP FUNCTION IF EXISTS get_words_due_for_review;
DROP FUNCTION IF EXISTS get_known_words;
```

## Troubleshooting

### "relation already exists"

The tables were already created. This is fine - the migration is idempotent.

### "permission denied"

Make sure you're using the service_role key or are logged in as the database owner.

### "function does not exist"

Make sure the entire migration file was executed, not just parts of it.

### "syntax error"

Check that you copied the entire SQL file correctly without any truncation.

## Production Deployment

When deploying to production:

1. **Test on staging first!**
2. Backup your database
3. Run during low-traffic period
4. Monitor for errors
5. Verify with test queries
6. Test the `/learn/srs` route

## Migration File Location

```
lingua_2.0/
└── supabase/
    └── migrations/
        └── add_word_tracking_srs.sql  ← This file
```

## Next Steps

After successful migration:

1. ✅ Add `OPENAI_API_KEY` to `.env.local`
2. ✅ Restart your development server
3. ✅ Navigate to `/learn/srs`
4. ✅ Test story generation

## Support

If you encounter issues:

- Check [QUICKSTART_SRS.md](../QUICKSTART_SRS.md) for common issues
- Review [SRS_IMPLEMENTATION.md](../SRS_IMPLEMENTATION.md) for details
- Check Supabase logs in dashboard
