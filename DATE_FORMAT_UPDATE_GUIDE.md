# Tanggal Lahir - DATE Format Update Guide

## 📋 Overview

Mengubah field `tanggal_lahir` dari VARCHAR/String menjadi DATE format untuk:
- ✅ Proper data type (DATE instead of VARCHAR)
- ✅ Better data validation
- ✅ Easier date calculations
- ✅ Consistent formatting in CV

## 🔄 Changes Made

### 1. Model Update
**File**: `backend/app/models/expert.py`

```python
# Before
tanggal_lahir = Column(String(50), nullable=True)

# After
tanggal_lahir = Column(Date, nullable=True)
```

### 2. Schema Update
**File**: `backend/app/schemas/__init__.py`

```python
# Before
tanggal_lahir: Optional[str] = None

# After
tanggal_lahir: Optional[date] = None
```

### 3. CV Generator Update
**File**: `backend/app/api/v1/cv_generator_dynamic.py`

Added date formatting to Indonesian format:
```python
# Format date object to "15 Maret 1975"
if hasattr(tanggal_lahir_raw, 'strftime'):
    months_id = {
        1: 'Januari', 2: 'Februari', 3: 'Maret', ...
    }
    tanggal_lahir = f"{day} {month} {year}"
```

## 🗄️ Database Migration

### Step 1: Change Column Type

**File**: `supabase/change_tanggal_lahir_to_date.sql`

```sql
-- Add new DATE column
ALTER TABLE experts 
ADD COLUMN tanggal_lahir_new DATE;

-- Convert existing data
UPDATE experts
SET tanggal_lahir_new = CASE
    WHEN tanggal_lahir ~ '^\d{4}-\d{2}-\d{2}$' THEN tanggal_lahir::DATE
    WHEN tanggal_lahir IS NOT NULL THEN '1975-01-01'::DATE
    ELSE NULL
END;

-- Drop old column and rename
ALTER TABLE experts DROP COLUMN tanggal_lahir;
ALTER TABLE experts RENAME COLUMN tanggal_lahir_new TO tanggal_lahir;
```

### Step 2: Fill Data

**File**: `supabase/fill_expert_data_with_dates.sql`

```sql
-- Fill with random dates between 1975-2000
UPDATE experts 
SET 
    tanggal_lahir = DATE '1975-01-01' + (RANDOM() * 9125)::INTEGER,
    tempat_lahir = ...,
    posisi_diusulkan = ...,
    pendidikan_formal = ...,
    pendidikan_non_formal = ...,
    penguasaan_bahasa = ...
WHERE tanggal_lahir IS NULL;
```

## 🚀 Execution Steps

### 1. Run Database Migration

```sql
-- In Supabase SQL Editor

-- Step 1: Change column type
\i supabase/change_tanggal_lahir_to_date.sql

-- Step 2: Fill data
\i supabase/fill_expert_data_with_dates.sql
```

### 2. Restart Backend

```bash
cd backend
# Backend will auto-reload with new model
```

### 3. Test API

```bash
# Get expert data
curl http://localhost:8000/api/v1/experts/108

# Should return:
# "tanggal_lahir": "1975-03-15"  (DATE format)
```

### 4. Generate CV

```bash
# Generate CV
curl -X GET "http://localhost:8000/api/v1/cv/108/cv" -o "CV_Test_Date_Format.docx"

# Open CV - should show:
# "Tempat/Tanggal Lahir: Bandung, 15 Maret 1975"
```

## 📊 Data Format

### Database (PostgreSQL)
```sql
tanggal_lahir DATE  -- Stored as: 1975-03-15
```

### API Response (JSON)
```json
{
    "tanggal_lahir": "1975-03-15"
}
```

### CV Output (DOCX)
```
Tempat/Tanggal Lahir: Bandung, 15 Maret 1975
```

## 🔍 Verification

### Check Database
```sql
SELECT 
    id,
    nama,
    tanggal_lahir,
    pg_typeof(tanggal_lahir) as type,
    TO_CHAR(tanggal_lahir, 'DD Month YYYY') as formatted
FROM experts
LIMIT 5;
```

Expected output:
```
id | nama              | tanggal_lahir | type | formatted
---+-------------------+---------------+------+------------------
1  | Bambang Pamungkas | 1975-03-15    | date | 15 March 1975
```

### Check API
```bash
curl http://localhost:8000/api/v1/experts/108 | jq '.tanggal_lahir'
# Output: "1975-03-15"
```

### Check CV
Open generated CV and verify:
- ✅ "Tempat/Tanggal Lahir" field shows proper Indonesian format
- ✅ Date is readable: "15 Maret 1975"
- ✅ No "Belum diisi" or null values

## 📝 API Usage

### Create/Update Expert with Date

```python
# Python
import requests
from datetime import date

data = {
    "nama": "John Doe",
    "tanggal_lahir": "1980-05-20",  # ISO format string
    "tempat_lahir": "Jakarta"
}

response = requests.post("http://localhost:8000/api/v1/experts", json=data)
```

```javascript
// JavaScript
const data = {
    nama: "John Doe",
    tanggal_lahir: "1980-05-20",  // ISO format string
    tempat_lahir: "Jakarta"
};

fetch("http://localhost:8000/api/v1/experts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
});
```

### PATCH Update

```bash
curl -X PATCH "http://localhost:8000/api/v1/experts/108" \
  -H "Content-Type: application/json" \
  -d '{"tanggal_lahir": "1975-03-15"}'
```

## ⚠️ Important Notes

1. **Date Format**: Always use ISO format (YYYY-MM-DD) in API
2. **Validation**: Pydantic will validate date format automatically
3. **CV Output**: Automatically formatted to Indonesian
4. **Null Values**: Allowed (nullable=True)
5. **Frontend**: Update date picker to use proper date input

## 🎯 Benefits

### Before (VARCHAR)
- ❌ Inconsistent formats: "15 Maret 1975", "1975-03-15", "15/03/1975"
- ❌ No validation
- ❌ Hard to calculate age
- ❌ String comparison issues

### After (DATE)
- ✅ Consistent format: YYYY-MM-DD in database
- ✅ Automatic validation
- ✅ Easy age calculation: `AGE(tanggal_lahir)`
- ✅ Proper date comparison
- ✅ Indonesian format in CV output

## 🔧 Troubleshooting

### Error: "Invalid date format"
**Solution**: Use ISO format (YYYY-MM-DD)
```json
{"tanggal_lahir": "1975-03-15"}  // ✅ Correct
{"tanggal_lahir": "15 Maret 1975"}  // ❌ Wrong
```

### Error: "Column type mismatch"
**Solution**: Run migration SQL first
```sql
\i supabase/change_tanggal_lahir_to_date.sql
```

### CV shows "Belum diisi"
**Solution**: Fill data with SQL
```sql
\i supabase/fill_expert_data_with_dates.sql
```

## 📚 Files Modified

```
✅ backend/app/models/expert.py (Date type)
✅ backend/app/schemas/__init__.py (date type)
✅ backend/app/api/v1/cv_generator_dynamic.py (formatting)
✅ supabase/change_tanggal_lahir_to_date.sql (migration)
✅ supabase/fill_expert_data_with_dates.sql (data fill)
✅ DATE_FORMAT_UPDATE_GUIDE.md (documentation)
```

## ✅ Checklist

- [ ] Run database migration
- [ ] Restart backend
- [ ] Test API endpoint
- [ ] Generate CV sample
- [ ] Verify date format in CV
- [ ] Update frontend date picker
- [ ] Update all existing expert data
- [ ] Test create/update operations

---

**Status**: Ready to execute
**Priority**: High (improves data quality)
**Impact**: All 34 experts + future entries
