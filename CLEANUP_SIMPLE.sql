-- ========================================================================
-- SIMPLE CLEANUP: Delete Duplicate Experts
-- ========================================================================

-- STEP 1: View duplicates (check dulu sebelum delete)
-- Copy-paste dan run query ini:

SELECT 
    nama,
    COUNT(*) as jumlah,
    STRING_AGG(id::text, ', ' ORDER BY id) as semua_id
FROM experts
GROUP BY nama
HAVING COUNT(*) > 1
ORDER BY jumlah DESC, nama;


-- ========================================================================
-- STEP 2: Delete duplicates by name pattern
-- ========================================================================

-- Contoh: Delete semua "Dr. Ahmad" kecuali yang pertama
-- Ganti 'Dr. Ahmad%' dengan nama yang mau di-cleanup

DELETE FROM experts
WHERE id NOT IN (
    SELECT MIN(id)
    FROM experts
    WHERE nama LIKE 'Dr. Ahmad%'
)
AND nama LIKE 'Dr. Ahmad%';


-- ========================================================================
-- STEP 3: Delete ALL duplicates (keeps first occurrence)
-- ========================================================================

-- Query ini akan delete SEMUA duplicate, keep yang ID terkecil
-- HATI-HATI: Review dulu dengan STEP 1 sebelum run ini!

DELETE FROM experts
WHERE id IN (
    SELECT e1.id
    FROM experts e1
    INNER JOIN experts e2 ON e1.nama = e2.nama AND e1.id > e2.id
);


-- ========================================================================
-- STEP 4: Verify cleanup
-- ========================================================================

-- Check apakah masih ada duplicate
-- Harus return 0 rows jika sudah bersih

SELECT 
    nama,
    COUNT(*) as jumlah
FROM experts
GROUP BY nama
HAVING COUNT(*) > 1;


-- ========================================================================
-- STEP 5: Count total experts
-- ========================================================================

SELECT COUNT(*) as total_experts FROM experts;


-- ========================================================================
-- CONTOH PENGGUNAAN:
-- ========================================================================

-- Contoh 1: Delete duplicate "Ir. Budi Santoso"
/*
DELETE FROM experts
WHERE id NOT IN (
    SELECT MIN(id)
    FROM experts
    WHERE nama LIKE 'Ir. Budi Santoso%'
)
AND nama LIKE 'Ir. Budi Santoso%';
*/

-- Contoh 2: Delete duplicate yang namanya mengandung "Ahmad"
/*
DELETE FROM experts
WHERE id NOT IN (
    SELECT MIN(id)
    FROM experts
    WHERE nama LIKE '%Ahmad%'
)
AND nama LIKE '%Ahmad%';
*/

-- Contoh 3: Delete duplicate berdasarkan exact name
/*
DELETE FROM experts
WHERE id NOT IN (
    SELECT MIN(id)
    FROM experts
    WHERE nama = 'Dr. Ahmad Santoso'
)
AND nama = 'Dr. Ahmad Santoso';
*/
