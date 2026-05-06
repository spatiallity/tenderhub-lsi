# Fix: Duplicate Experts dengan Angka dalam Kurung

## 🔍 Masalah

Data expert muncul duplikat dengan angka dalam kurung seperti:
- Prof. Hendra Santoso, Ph.D. **(17)**
- Maya Putri, S.Kom., M.T.I. **(18)**
- Ir. Bambang Sutrisno, M.T. **(19)**
- Dr. Siti Rahayu, S.E., M.M. **(20)**
- Agus Purnomo, S.T., M.T. **(21)**
- Dra. Lestari Wulandari, M.Kes. **(22)**

**Kenapa selalu balik setelah push/run?**
Karena data ini di-seed otomatis dari backend ke database Supabase setiap kali backend start.

## 🔎 Root Cause

### 1. Backend Seeding (`backend/app/services/dummy_data.py`)
```python
# Fungsi ini meng-expand 16 experts asli menjadi 100 experts
def _expand_experts_to_100(rows):
    # ... code ...
    item["nama"] = f"{base['nama']} ({seq})"  # ❌ Menambahkan (1), (2), (3), dst
    # ...

EXPERTS_RAW = _expand_experts_to_100(EXPERTS_RAW)  # ❌ Ini yang bikin duplikat!
```

### 2. Auto-Seeding di Startup (`backend/app/main.py`)
```python
async def seed_data():
    # Seed experts dari EXPERTS_RAW yang sudah di-expand ke 100
    if existing_count == 0:
        for e_raw in EXPERTS_RAW[:100]:  # ❌ Seed 100 experts termasuk duplikat
            expert_db = Expert(...)
```

### 3. Flow Duplikasi
```
Backend Start
    ↓
Load EXPERTS_RAW (sudah 100 experts dengan duplikat)
    ↓
Check database: 0 experts
    ↓
Seed 100 experts ke database (termasuk yang ber-angka)
    ↓
Frontend load dari database
    ↓
Tampil duplikat dengan angka (17), (18), dst
```

## ✅ Solusi

### Step 1: Disable Expand Function
**File**: `backend/app/services/dummy_data.py`

```python
RUP_RAW = _expand_rup_to_50(RUP_RAW)
# DISABLED: Don't expand experts to prevent duplicates
# EXPERTS_RAW = _expand_experts_to_100(EXPERTS_RAW)  # ✅ Di-comment
```

**Hasil**: Backend hanya akan seed 16 experts asli, tanpa duplikat.

### Step 2: Cleanup Database
**File**: `supabase/cleanup_duplicate_experts.sql`

Jalankan SQL script ini di Supabase SQL Editor:

```sql
-- Hapus semua expert dengan angka dalam kurung
DELETE FROM experts 
WHERE nama ~ '\s+\(\d+\)$';
```

**Cara menjalankan**:
1. Buka Supabase Dashboard
2. Pilih project TenderHub
3. Klik "SQL Editor" di sidebar
4. Copy-paste script dari `supabase/cleanup_duplicate_experts.sql`
5. Klik "Run"

### Step 3: Restart Backend (Opsional)
Jika backend sedang running dan database sudah kosong, restart backend untuk re-seed dengan data yang benar:

```bash
# Stop backend (Ctrl+C)
# Start backend
cd backend
uvicorn app.main:app --reload
```

Backend akan detect database kosong dan seed 16 experts asli (tanpa duplikat).

## 🧪 Verifikasi

### 1. Check Database
```sql
-- Harus return 0
SELECT COUNT(*) FROM experts WHERE nama ~ '\s+\(\d+\)$';

-- Harus return 16 (atau jumlah expert asli)
SELECT COUNT(*) FROM experts;
```

### 2. Check Frontend
1. Hard refresh browser (Ctrl+Shift+R)
2. Buka halaman Expert
3. Tidak ada lagi expert dengan angka dalam kurung
4. Total expert: 16 (bukan 100)

## 📋 Files Modified

1. ✅ `backend/app/services/dummy_data.py` - Disable expand function
2. ✅ `supabase/cleanup_duplicate_experts.sql` - SQL script untuk cleanup
3. ✅ `DUPLICATE_EXPERTS_FIX.md` - Dokumentasi ini

## 🚨 Important Notes

### Kenapa Tidak Hapus Fungsi `_expand_experts_to_100`?
Fungsi tetap ada (di-comment) untuk jaga-jaga kalau nanti butuh generate dummy data banyak untuk testing. Tapi **tidak digunakan** di production.

### Apa yang Terjadi Setelah Fix?
- ✅ Database hanya punya 16 experts asli
- ✅ Tidak ada duplikat dengan angka (17), (18), dst
- ✅ Data tidak akan "balik" lagi setelah push/run
- ✅ Frontend dan backend sync dengan data yang sama

### Bagaimana Kalau Mau Tambah Expert Baru?
Ada 2 cara:
1. **Via Frontend**: Klik "Tambah Tenaga Ahli" di halaman Expert
2. **Via Dummy Data**: Tambahkan ke `FALLBACK_EXPERTS` di `frontend/src/data/demoData.js` DAN `EXPERTS_RAW` di `backend/app/services/dummy_data.py`

## 🔄 Commit Message
```
fix: remove duplicate experts with numbers in parentheses

- Disable _expand_experts_to_100() in backend/app/services/dummy_data.py
- Add SQL cleanup script for removing duplicate experts from database
- Backend now seeds only 16 original experts (not 100 with duplicates)
- Add comprehensive documentation in DUPLICATE_EXPERTS_FIX.md

Fixes: duplicate experts showing as "Name (17)", "Name (18)", etc.
Root cause: auto-expansion function creating 100 experts from 16 originals
```
