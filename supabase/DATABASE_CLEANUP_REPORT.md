# Database Schema Analysis & Cleanup Report

## Executive Summary

Your database has **4 unused tables** and **multiple schema inconsistencies** that should be cleaned up for better performance and maintainability.

---

## 🗑️ UNUSED TABLES TO REMOVE

These tables are defined in `schema.sql` but **never referenced** in your codebase:

### 1. `comprehension_questions`

- **Defined in:** `schema.sql`
- **Purpose:** Store comprehension questions for content segments
- **Status:** ❌ Never used in application code
- **Action:** Safe to delete

### 2. `user_progress`

- **Defined in:** `schema.sql`
- **Purpose:** Track user progress per segment
- **Status:** ❌ Never used in application code
- **Action:** Safe to delete (progress tracked in `lessons` and `story_progress` instead)

### 3. `session_logs`

- **Defined in:** `schema.sql`
- **Purpose:** Log user sessions
- **Status:** ❌ Never used in application code
- **Action:** Safe to delete

### 4. `speaking_attempts`

- **Defined in:** `schema.sql`
- **Purpose:** Store user audio recordings and scores
- **Status:** ❌ Never used in application code
- **Action:** Safe to delete

---

## ⚠️ SCHEMA INCONSISTENCIES

### Issue 1: Duplicate `user_words` Definitions

**Problem:** Two different schemas exist for the same table:

**Migration: `add_word_tracking_srs.sql`**

```sql
easiness_factor DECIMAL(3,2)
interval_days DECIMAL(10,2)
first_seen TIMESTAMP
last_seen TIMESTAMP
```

**Migration: `COMPLETE_SETUP.sql` (CURRENT)**

```sql
ease_factor REAL
interval INTEGER
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Currently Used:** The code in `/api/words/rate/route.ts` uses:

- `ease_factor` ✓
- `interval` ✓
- Matches `COMPLETE_SETUP.sql`

**Action:**

- ✅ Keep `COMPLETE_SETUP.sql` version
- ❌ Remove/update `add_word_tracking_srs.sql`

---

## 📊 TABLES ACTUALLY IN USE

These are the **9 tables** your application actually uses:

| Table                  | Purpose                      | Used In                                |
| ---------------------- | ---------------------------- | -------------------------------------- |
| `profiles`             | User profiles & metrics      | Dashboard, settings, lesson generation |
| `user_words`           | SRS word tracking            | Word rating, lesson generation         |
| `word_interactions`    | Word rating history          | `/api/words/rate`                      |
| `lessons`              | Comprehensible input lessons | Lesson page, dashboard                 |
| `generated_stories`    | AI-generated stories         | Learn page, SRS page                   |
| `story_progress`       | Story completion tracking    | Story generation API                   |
| `content_segments`     | Pre-made lesson content      | Segments API                           |
| `vocabulary_exercises` | Vocabulary practice          | Vocabulary API                         |
| `foundation_lessons`   | A0 beginner phrases          | Foundation API                         |

---

## 🔧 RECOMMENDED ACTIONS

### Option 1: Clean Existing Database (Recommended)

```sql
-- Run this in Supabase SQL Editor to remove unused tables
DROP TABLE IF EXISTS comprehension_questions CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS session_logs CASCADE;
DROP TABLE IF EXISTS speaking_attempts CASCADE;
```

### Option 2: Fresh Schema Setup

If starting fresh or creating a new environment, use:

- **File:** `supabase/CLEAN_SCHEMA.sql` (newly created)
- **Contains:** Only the 9 tables actually used
- **Benefits:** Clean, consistent, well-documented

### Option 3: Keep Old Schema

If you plan to use these tables in the future:

- ⚠️ Warning: They're costing you storage and query overhead
- Add TODO comments to implement features
- Document why they're kept

---

## 📁 FILE CLEANUP RECOMMENDATIONS

### Files to Keep:

- ✅ `CLEAN_SCHEMA.sql` (newly created - use this for new setups)
- ✅ `COMPLETE_SETUP.sql` (current working schema)

### Files with Issues:

- ⚠️ `schema.sql` - Has 4 unused tables, outdated
- ⚠️ `add_word_tracking_srs.sql` - Inconsistent column names

### Suggested File Structure:

```
supabase/
├── CLEAN_SCHEMA.sql          # ← Use this for fresh setups
├── migrations/
│   ├── 001_cleanup_unused_tables.sql  # ← Delete unused tables
│   └── 002_verify_schema.sql          # ← Verification queries
└── archive/
    ├── schema.sql             # ← Archive old schemas
    └── old_migrations/        # ← Archive outdated migrations
```

---

## 🎯 BENEFITS OF CLEANUP

1. **Performance:** Fewer tables = faster queries
2. **Clarity:** Code matches database perfectly
3. **Maintenance:** Less confusion about what's used
4. **Storage:** Reduce unnecessary database size
5. **Security:** Fewer unused RLS policies to audit

---

## 📝 NEXT STEPS

1. **Backup your database** first (Supabase → Database → Backups)
2. Run the cleanup SQL to drop unused tables
3. Update your local development to use `CLEAN_SCHEMA.sql`
4. Archive old migration files for reference
5. Update documentation to reflect actual schema

---

## ✅ VERIFICATION

After cleanup, verify with:

```sql
-- Should return 9 tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected result:
-- 1. content_segments
-- 2. foundation_lessons
-- 3. generated_stories
-- 4. lessons
-- 5. profiles
-- 6. story_progress
-- 7. user_words
-- 8. vocabulary_exercises
-- 9. word_interactions
```
