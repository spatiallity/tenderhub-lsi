-- Cleanup duplicate experts with numbers in parentheses like (17), (18), etc.
-- This script removes all experts whose names contain patterns like " (1)", " (2)", etc.

-- First, let's see how many duplicates we have
SELECT COUNT(*) as duplicate_count 
FROM experts 
WHERE nama ~ '\s+\(\d+\)$';

-- Delete all duplicate experts (those with numbers in parentheses)
DELETE FROM experts 
WHERE nama ~ '\s+\(\d+\)$';

-- Verify cleanup
SELECT COUNT(*) as remaining_experts FROM experts;

-- Show remaining experts
SELECT id, nama, no_hp, instansi 
FROM experts 
ORDER BY id;
