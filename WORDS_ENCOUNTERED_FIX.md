# Dashboard wordsEncountered Issue - Root Cause Analysis

## Issue

The `wordsEncountered` metric on the dashboard shows 0 and doesn't update when users rate words during lessons.

## Root Cause - Schema Mismatch

### The Problem

The `user_words` table has **two conflicting definitions** across migration files:

#### Definition 1: `add_word_tracking_srs.sql` (OUTDATED)

```sql
CREATE TABLE user_words (
  easiness_factor DECIMAL(3,2),    -- ❌ Column name mismatch
  interval_days DECIMAL(10,2),     -- ❌ Column name mismatch
  first_seen TIMESTAMP,             -- ❌ Not used
  last_seen TIMESTAMP               -- ❌ Not used
)
```

#### Definition 2: `COMPLETE_SETUP.sql` (CURRENT)

```sql
CREATE TABLE user_words (
  ease_factor REAL,                 -- ✅ Matches code
  interval INTEGER,                 -- ✅ Matches code
  created_at TIMESTAMP,             -- ✅ Used
  updated_at TIMESTAMP              -- ✅ Used
)
```

### Code Expects (from `/api/words/rate/route.ts`):

```typescript
.update({
  ease_factor: srsUpdate.easiness_factor,    // ✅
  interval: srsUpdate.interval_days,          // ✅
  repetitions: srsUpdate.repetitions,         // ✅
  next_review: srsUpdate.next_review,         // ✅
})
```

## Impact

### If Wrong Schema Was Applied:

1. **Word rating fails silently** - Column names don't match
2. **No error logs** - Database accepts the request but doesn't update
3. **Dashboard shows 0** - No words are actually being saved
4. **User progress lost** - Words aren't tracked in SRS

### Debug Steps to Verify:

```sql
-- Check current schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_words'
ORDER BY ordinal_position;

-- Expected columns:
-- id, user_id, word, lemma, language
-- status, rating, ease_factor, interval, repetitions
-- next_review, last_reviewed, last_rated_at
-- context_sentence, frequency_rank, part_of_speech
-- created_at, updated_at
```

### If columns are wrong:

```sql
-- Fix column names
ALTER TABLE user_words RENAME COLUMN easiness_factor TO ease_factor;
ALTER TABLE user_words RENAME COLUMN interval_days TO interval;
ALTER TABLE user_words ALTER COLUMN interval TYPE INTEGER;
```

## Solution

### 1. Verify Current Schema

```sql
\d user_words
```

### 2. Check for Data

```sql
SELECT COUNT(*) FROM user_words;
SELECT * FROM user_words LIMIT 5;
```

### 3. Check Browser Console

Look for these logs we added:

- "Saving word rating: {...}"
- "Word rating saved successfully: {...}"
- Or errors like: "column 'ease_factor' does not exist"

### 4. Fix Database

If using wrong schema, run:

```sql
-- Use the CLEAN_SCHEMA.sql file we created
-- It has the correct, consistent schema
```

## Prevention

### Going Forward:

1. ✅ Use `CLEAN_SCHEMA.sql` for all new setups
2. ✅ Run `cleanup_unused_tables.sql` to remove confusion
3. ✅ Archive old migration files
4. ✅ Test word rating after any schema changes

## Testing the Fix

After applying correct schema:

```javascript
// Open browser console on lesson page
// 1. Go through a lesson to Text Reveal phase
// 2. Click a highlighted word
// 3. Rate it (0-5)
// 4. Look for console logs:
console.log("Saving word rating:", {...});
console.log("Word rating saved successfully:", {...});

// 5. Check database:
SELECT * FROM user_words WHERE user_id = auth.uid();

// 6. Refresh dashboard - wordsEncountered should update!
```

## Files Created for Fix

1. **`CLEAN_SCHEMA.sql`** - Correct, consolidated schema
2. **`DATABASE_CLEANUP_REPORT.md`** - Full analysis
3. **`cleanup_unused_tables.sql`** - Remove unused tables
4. **Enhanced logging in code** - Better debugging

The issue is likely that words ARE being rated, but the database schema doesn't match what the code expects, causing silent failures.
