-- ============================================================================
-- FIX RLS AND DATABASE ERRORS
-- Run this in Supabase SQL Editor to fix current issues
-- ============================================================================

-- 1. DISABLE RLS temporarily for testing
-- ============================================================================
ALTER TABLE tender_watchlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE tender_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE keywords DISABLE ROW LEVEL SECURITY;
ALTER TABLE experts DISABLE ROW LEVEL SECURITY;
ALTER TABLE expert_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE expert_reviews DISABLE ROW LEVEL SECURITY;

-- 2. DROP existing policies that might cause issues
-- ============================================================================
DROP POLICY IF EXISTS "Allow public read access" ON tender_watchlist;
DROP POLICY IF EXISTS "Allow public update access" ON tender_watchlist;
DROP POLICY IF EXISTS "Allow public insert access" ON tender_watchlist;
DROP POLICY IF EXISTS "Allow public delete access" ON tender_watchlist;

DROP POLICY IF EXISTS "Allow public read access" ON keywords;
DROP POLICY IF EXISTS "Allow public update access" ON keywords;
DROP POLICY IF EXISTS "Allow public insert access" ON keywords;
DROP POLICY IF EXISTS "Allow public delete access" ON keywords;

DROP POLICY IF EXISTS "Allow public read access" ON experts;
DROP POLICY IF EXISTS "Allow public update access" ON experts;
DROP POLICY IF EXISTS "Allow public insert access" ON experts;
DROP POLICY IF EXISTS "Allow public delete access" ON experts;

DROP POLICY IF EXISTS "Allow public read access" ON expert_projects;
DROP POLICY IF EXISTS "Allow public update access" ON expert_projects;
DROP POLICY IF EXISTS "Allow public insert access" ON expert_projects;
DROP POLICY IF EXISTS "Allow public delete access" ON expert_projects;

DROP POLICY IF EXISTS "Allow public read access" ON expert_reviews;
DROP POLICY IF EXISTS "Allow public update access" ON expert_reviews;
DROP POLICY IF EXISTS "Allow public insert access" ON expert_reviews;
DROP POLICY IF EXISTS "Allow public delete access" ON expert_reviews;

-- 3. Check for triggers that might cause "email is ambiguous" error
-- ============================================================================
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 4. Verify table structures
-- ============================================================================
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('tender_watchlist', 'experts', 'expert_projects', 'profiles')
ORDER BY table_name, ordinal_position;

-- 5. Test update on tender_watchlist
-- ============================================================================
-- This should work now without RLS
UPDATE tender_watchlist 
SET status_internal = 'Dipantau' 
WHERE kd_tender = 1;

-- Verify the update
SELECT id, kd_tender, status_internal, updated_at 
FROM tender_watchlist 
WHERE kd_tender = 1;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- After running this script:
-- 1. RLS is disabled on all tables (for testing)
-- 2. All policies are dropped
-- 3. You can see all triggers and table structures
-- 4. Test update should work
-- 
-- To re-enable RLS later, run:
-- ALTER TABLE tender_watchlist ENABLE ROW LEVEL SECURITY;
-- Then add back the policies from add_rls_policies_all_tables.sql
-- ============================================================================
