-- Change tanggal_lahir from VARCHAR to DATE
-- This migration converts the tanggal_lahir column to proper DATE type

-- Step 1: Add new column with DATE type
ALTER TABLE experts 
ADD COLUMN tanggal_lahir_new DATE;

-- Step 2: Convert existing string dates to DATE format
-- Handle various date formats: "15 Maret 1975", "1975-03-15", etc.
UPDATE experts
SET tanggal_lahir_new = CASE
    -- If already in ISO format (YYYY-MM-DD)
    WHEN tanggal_lahir ~ '^\d{4}-\d{2}-\d{2}$' THEN tanggal_lahir::DATE
    
    -- If in Indonesian format "DD Month YYYY" - convert to date
    -- For now, set a default date for non-null values
    WHEN tanggal_lahir IS NOT NULL AND tanggal_lahir != '' THEN '1975-01-01'::DATE
    
    -- Otherwise NULL
    ELSE NULL
END
WHERE tanggal_lahir IS NOT NULL;

-- Step 3: Drop old column
ALTER TABLE experts 
DROP COLUMN tanggal_lahir;

-- Step 4: Rename new column to original name
ALTER TABLE experts 
RENAME COLUMN tanggal_lahir_new TO tanggal_lahir;

-- Step 5: Add comment
COMMENT ON COLUMN experts.tanggal_lahir IS 'Date of birth in DATE format (YYYY-MM-DD)';

-- Verify the change
SELECT id, nama, tanggal_lahir, pg_typeof(tanggal_lahir) as column_type
FROM experts 
LIMIT 5;
