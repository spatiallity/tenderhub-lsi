-- =============================================================
-- Clean Up Duplicate Experts
-- Run this in: Supabase Dashboard > SQL Editor
-- =============================================================

-- 1. Show duplicates first (for verification)
SELECT 
  nama,
  COUNT(*) as jumlah_duplikat,
  STRING_AGG(id::text, ', ') as ids
FROM public.experts
GROUP BY nama
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- 2. Delete experts with parentheses in name (e.g., "Name (1)", "Name (2)")
-- This keeps the original and removes the duplicates
DELETE FROM public.experts
WHERE nama ~ '\([0-9]+\)$';

-- 3. Alternative: Keep only the first occurrence of each name
-- Uncomment if you want to use this approach instead
/*
DELETE FROM public.experts
WHERE id NOT IN (
  SELECT MIN(id)
  FROM public.experts
  GROUP BY nama
);
*/

-- 4. Verify cleanup
SELECT 
  nama,
  COUNT(*) as jumlah
FROM public.experts
GROUP BY nama
HAVING COUNT(*) > 1;

-- If the result is empty, all duplicates are removed!
