-- Script to cleanup duplicate experts in Supabase
-- This script will keep the first occurrence (lowest ID) and delete duplicates

-- Step 1: View duplicates (run this first to see what will be deleted)
SELECT 
    nama,
    COUNT(*) as duplicate_count,
    ARRAY_AGG(id ORDER BY id) as all_ids,
    MIN(id) as keep_id,
    ARRAY_AGG(id ORDER BY id)[2:] as delete_ids
FROM experts
GROUP BY LOWER(TRIM(nama))
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, nama;

-- Step 2: Delete duplicates (run this after reviewing Step 1)
-- UNCOMMENT THE LINES BELOW TO EXECUTE DELETION

/*
WITH duplicates AS (
    SELECT 
        id,
        nama,
        ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(nama)) ORDER BY id) as row_num
    FROM experts
)
DELETE FROM experts
WHERE id IN (
    SELECT id 
    FROM duplicates 
    WHERE row_num > 1
);
*/

-- Step 3: Verify cleanup (run this after deletion)
-- Should return 0 rows if all duplicates are removed
/*
SELECT 
    nama,
    COUNT(*) as count
FROM experts
GROUP BY LOWER(TRIM(nama))
HAVING COUNT(*) > 1;
*/
