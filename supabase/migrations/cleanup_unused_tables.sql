-- ============================================
-- CLEANUP MIGRATION: Remove Unused Tables
-- ============================================
-- This migration removes tables that are defined but never used
-- in the current Lingua 2.0 implementation.
--
-- SAFE TO RUN: These tables have no references in the codebase
--
-- Before running:
-- 1. Backup your database
-- 2. Verify these tables are truly unused in your environment
-- 3. Check for any custom queries you may have added
--
-- ============================================

-- Display what will be removed
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'REMOVING UNUSED TABLES';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'The following tables are not used in the current implementation:';
    RAISE NOTICE '1. comprehension_questions';
    RAISE NOTICE '2. user_progress';
    RAISE NOTICE '3. session_logs';
    RAISE NOTICE '4. speaking_attempts';
    RAISE NOTICE '============================================';
END $$;

-- Drop unused tables
-- CASCADE will remove dependent objects (foreign keys, policies, etc.)

DROP TABLE IF EXISTS comprehension_questions CASCADE;
RAISE NOTICE '✓ Dropped comprehension_questions';

DROP TABLE IF EXISTS user_progress CASCADE;
RAISE NOTICE '✓ Dropped user_progress';

DROP TABLE IF EXISTS session_logs CASCADE;
RAISE NOTICE '✓ Dropped session_logs';

DROP TABLE IF EXISTS speaking_attempts CASCADE;
RAISE NOTICE '✓ Dropped speaking_attempts';

-- Verify cleanup
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'CLEANUP COMPLETE';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Remaining tables in public schema: %', table_count;
    RAISE NOTICE 'Expected: 9 tables';
    RAISE NOTICE '============================================';
END $$;

-- List remaining tables for verification
SELECT 
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name)::regclass)) as size
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

COMMENT ON SCHEMA public IS 'Lingua 2.0 - Cleaned schema with only actively used tables';
