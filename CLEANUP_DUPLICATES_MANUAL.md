# 🧹 Manual Cleanup: Duplicate Experts

## ⚠️ Python Environment Issue

Python di sistem Anda menggunakan OSGeo4W yang tidak compatible. Kita akan gunakan **Supabase SQL Editor** untuk cleanup duplicates.

---

## 📋 Langkah-Langkah Manual Cleanup

### Step 1: Buka Supabase SQL Editor

1. **Buka browser** dan go to: https://supabase.com/dashboard
2. **Login** ke account Anda
3. **Pilih project** TenderHub
4. **Klik "SQL Editor"** di sidebar kiri
5. **Klik "New query"**

---

### Step 2: Check Duplicates (View Only)

**Copy-paste SQL ini ke SQL Editor:**

```sql
-- View all duplicate experts
SELECT 
    nama,
    COUNT(*) as duplicate_count,
    ARRAY_AGG(id ORDER BY id) as all_ids,
    MIN(id) as keep_id
FROM experts
GROUP BY LOWER(TRIM(nama))
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, nama;
```

**Klik "Run"** atau tekan `Ctrl+Enter`

**Expected output:**
```
nama                    | duplicate_count | all_ids      | keep_id
------------------------|-----------------|--------------|--------
Dr. Ahmad Santoso       | 3               | {1, 45, 89}  | 1
Ir. Budi Setiawan       | 2               | {5, 67}      | 5
...
```

**Catat:**
- Berapa banyak duplicate names
- ID mana yang akan di-keep (keep_id)
- ID mana yang akan di-delete (all_ids kecuali keep_id)

---

### Step 3: Delete Duplicates

**⚠️ BACKUP DULU!** (Optional tapi recommended)

**Copy-paste SQL ini ke SQL Editor:**

```sql
-- Delete duplicate experts (keeps the first occurrence by ID)
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
)
RETURNING id, nama;
```

**Klik "Run"** atau tekan `Ctrl+Enter`

**Expected output:**
```
id  | nama
----|------------------
45  | Dr. Ahmad Santoso
89  | Dr. Ahmad Santoso
67  | Ir. Budi Setiawan
...

Query returned successfully: X rows affected
```

**Artinya:** X duplicate experts telah dihapus!

---

### Step 4: Verify Cleanup

**Copy-paste SQL ini ke SQL Editor:**

```sql
-- Verify no duplicates remaining
SELECT 
    nama,
    COUNT(*) as count
FROM experts
GROUP BY LOWER(TRIM(nama))
HAVING COUNT(*) > 1;
```

**Klik "Run"**

**Expected output:**
```
(No rows returned)
```

**Artinya:** ✅ Tidak ada duplicate lagi!

Jika masih ada rows yang muncul, ulangi Step 3.

---

### Step 5: Count Total Experts

**Copy-paste SQL ini:**

```sql
-- Count total experts after cleanup
SELECT COUNT(*) as total_experts FROM experts;
```

**Expected output:**
```
total_experts
-------------
100
```

---

## 🎯 Alternative: Delete Specific Duplicates

Jika Anda ingin **pilih manual** expert mana yang di-delete:

```sql
-- Delete specific expert by ID
DELETE FROM experts WHERE id = 45;
DELETE FROM experts WHERE id = 89;
-- ... dst
```

**Atau delete by name (keeps lowest ID):**

```sql
-- Delete all duplicates of "Dr. Ahmad Santoso" except the first one
WITH duplicates AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(nama)) ORDER BY id) as row_num
    FROM experts
    WHERE LOWER(TRIM(nama)) = 'dr. ahmad santoso'
)
DELETE FROM experts
WHERE id IN (
    SELECT id FROM duplicates WHERE row_num > 1
);
```

---

## 📊 Summary SQL Queries

### Quick Reference:

```sql
-- 1. View duplicates
SELECT nama, COUNT(*) as count, ARRAY_AGG(id ORDER BY id) as ids
FROM experts
GROUP BY LOWER(TRIM(nama))
HAVING COUNT(*) > 1;

-- 2. Delete all duplicates (keeps first)
WITH duplicates AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY LOWER(TRIM(nama)) ORDER BY id) as row_num
    FROM experts
)
DELETE FROM experts WHERE id IN (SELECT id FROM duplicates WHERE row_num > 1);

-- 3. Verify cleanup
SELECT nama, COUNT(*) FROM experts GROUP BY LOWER(TRIM(nama)) HAVING COUNT(*) > 1;

-- 4. Count total
SELECT COUNT(*) FROM experts;
```

---

## ⚠️ Important Notes

### Before Deletion:

1. **Backup database** (optional tapi recommended)
2. **Review duplicates** dengan Step 2
3. **Catat ID yang akan di-delete**
4. **Pastikan Anda yakin** sebelum run Step 3

### After Deletion:

1. **Verify cleanup** dengan Step 4
2. **Check total count** dengan Step 5
3. **Test aplikasi** - buka frontend dan check expert list
4. **Refresh browser** (F5) untuk lihat perubahan

### What Gets Deleted:

- ✅ **Keeps:** Expert dengan ID terkecil (first occurrence)
- 🗑️ **Deletes:** Expert dengan ID lebih besar (duplicates)

**Example:**
```
Dr. Ahmad Santoso - ID 1  ✅ KEPT
Dr. Ahmad Santoso - ID 45 🗑️ DELETED
Dr. Ahmad Santoso - ID 89 🗑️ DELETED
```

---

## 🚀 After Cleanup

### Test di Frontend:

1. **Buka aplikasi** di browser
2. **Go to Experts page**
3. **Refresh** (F5)
4. **Verify:**
   - ✅ Tidak ada duplicate names
   - ✅ Semua expert unique
   - ✅ Data masih lengkap

### If Issues:

Jika ada masalah setelah cleanup:
1. Check Supabase logs
2. Run verification query (Step 4)
3. Check total count (Step 5)
4. Screenshot dan kirim ke developer

---

## 📖 Files Created

1. **cleanup_duplicates.sql** - SQL queries untuk copy-paste
2. **cleanup_experts_simple.py** - Python script (tidak bisa dijalankan karena env issue)
3. **CLEANUP_DUPLICATES_MANUAL.md** - This file (manual instructions)

---

## 💡 Prevention

Untuk mencegah duplicate di masa depan:

1. ✅ **addExpert function sudah di-fix** - return true/false
2. ✅ **Button protection** - disabled saat saving
3. ✅ **Form reset** - setelah berhasil save
4. ✅ **Validation** - nama dan keahlian wajib diisi

Duplicate seharusnya tidak terjadi lagi setelah fix yang sudah diterapkan.

---

**Status:** ✅ Ready for manual cleanup via Supabase SQL Editor  
**Action Required:** Follow Step 1-5 above  
**Estimated Time:** 5-10 minutes
