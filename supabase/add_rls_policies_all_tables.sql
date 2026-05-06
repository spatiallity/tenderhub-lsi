-- ============================================================================
-- ADD RLS POLICIES FOR ALL TABLES
-- This script adds UPDATE, INSERT, and DELETE policies to all tables
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. TENDER_WATCHLIST
-- ============================================================================

-- Allow UPDATE
CREATE POLICY "Allow public update access"
ON tender_watchlist
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow INSERT
CREATE POLICY "Allow public insert access"
ON tender_watchlist
FOR INSERT
TO public
WITH CHECK (true);

-- Allow DELETE
CREATE POLICY "Allow public delete access"
ON tender_watchlist
FOR DELETE
TO public
USING (true);


-- ============================================================================
-- 2. TENDER_CACHE
-- ============================================================================

-- Allow UPDATE
CREATE POLICY "Allow public update access"
ON tender_cache
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow INSERT
CREATE POLICY "Allow public insert access"
ON tender_cache
FOR INSERT
TO public
WITH CHECK (true);

-- Allow DELETE
CREATE POLICY "Allow public delete access"
ON tender_cache
FOR DELETE
TO public
USING (true);


-- ============================================================================
-- 3. KEYWORDS
-- ============================================================================

-- Allow UPDATE
CREATE POLICY "Allow public update access"
ON keywords
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow INSERT
CREATE POLICY "Allow public insert access"
ON keywords
FOR INSERT
TO public
WITH CHECK (true);

-- Allow DELETE
CREATE POLICY "Allow public delete access"
ON keywords
FOR DELETE
TO public
USING (true);


-- ============================================================================
-- 4. EXPERTS
-- ============================================================================

-- Allow UPDATE
CREATE POLICY "Allow public update access"
ON experts
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow INSERT
CREATE POLICY "Allow public insert access"
ON experts
FOR INSERT
TO public
WITH CHECK (true);

-- Allow DELETE
CREATE POLICY "Allow public delete access"
ON experts
FOR DELETE
TO public
USING (true);


-- ============================================================================
-- 5. EXPERT_PROJECTS
-- ============================================================================

-- Allow UPDATE
CREATE POLICY "Allow public update access"
ON expert_projects
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow INSERT
CREATE POLICY "Allow public insert access"
ON expert_projects
FOR INSERT
TO public
WITH CHECK (true);

-- Allow DELETE
CREATE POLICY "Allow public delete access"
ON expert_projects
FOR DELETE
TO public
USING (true);


-- ============================================================================
-- 6. EXPERT_REVIEWS
-- ============================================================================

-- Allow UPDATE
CREATE POLICY "Allow public update access"
ON expert_reviews
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow INSERT
CREATE POLICY "Allow public insert access"
ON expert_reviews
FOR INSERT
TO public
WITH CHECK (true);

-- Allow DELETE
CREATE POLICY "Allow public delete access"
ON expert_reviews
FOR DELETE
TO public
USING (true);


-- ============================================================================
-- 7. PROFILES (if exists)
-- ============================================================================

-- Allow UPDATE
CREATE POLICY "Allow public update access"
ON profiles
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow INSERT
CREATE POLICY "Allow public insert access"
ON profiles
FOR INSERT
TO public
WITH CHECK (true);

-- Allow DELETE
CREATE POLICY "Allow public delete access"
ON profiles
FOR DELETE
TO public
USING (true);


-- ============================================================================
-- 8. USERS (if exists)
-- ============================================================================

-- Allow UPDATE
CREATE POLICY "Allow public update access"
ON users
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Allow INSERT
CREATE POLICY "Allow public insert access"
ON users
FOR INSERT
TO public
WITH CHECK (true);

-- Allow DELETE
CREATE POLICY "Allow public delete access"
ON users
FOR DELETE
TO public
USING (true);


-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check all policies for all tables
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. These policies allow PUBLIC access for all operations
-- 2. For production, you should restrict access based on user roles
-- 3. Example for authenticated users only:
--    USING (auth.role() = 'authenticated')
-- 4. Example for specific user:
--    USING (auth.uid() = user_id)
-- ============================================================================
