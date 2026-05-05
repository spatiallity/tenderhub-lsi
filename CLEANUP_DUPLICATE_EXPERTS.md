# 🧹 Clean Up Duplicate Experts

## Problem
Ada data tenaga ahli yang duplikat dengan kurung-kurung di nama, contoh:
- "Ir. Bambang Sutrisno, M.T."
- "Ir. Bambang Sutrisno, M.T. (1)"
- "Ir. Bambang Sutrisno, M.T. (2)"

## Solution

### Cara 1: Clean Up via SQL (Rekomendasi) ⭐

#### Step 1: Cek Duplikat
Jalankan SQL ini di **Supabase Dashboard → SQL Editor**:

```sql
-- Lihat daftar nama yang duplikat
SELECT 
  nama,
  COUNT(*) as jumlah_duplikat,
  STRING_AGG(id::text, ', ') as ids
FROM public.experts
GROUP BY nama
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;
```

Ini akan menampilkan semua nama yang duplikat beserta jumlahnya.

#### Step 2: Hapus Duplikat
Jalankan SQL ini untuk hapus yang ada kurung-kurungnya:

```sql
-- Hapus expert yang namanya ada kurung (1), (2), dst
DELETE FROM public.experts
WHERE nama ~ '\([0-9]+\)$';
```

Atau gunakan file yang sudah saya buat:
- Buka file: `supabase/cleanup_duplicate_experts.sql`
- Copy semua isinya
- Paste di Supabase SQL Editor
- Run

#### Step 3: Verifikasi
Jalankan lagi query di Step 1 untuk memastikan tidak ada duplikat lagi.

### Cara 2: Hapus Manual via Supabase Dashboard

1. Buka **Supabase Dashboard**
2. Pilih **Table Editor**
3. Pilih table **experts**
4. Cari row yang ada kurung-kurungnya
5. Klik icon trash untuk hapus
6. Ulangi untuk semua duplikat

### Cara 3: Clean Up via Frontend (Coming Soon)

Bisa ditambahkan button "Clean Duplicates" di halaman Expert yang akan:
1. Fetch semua experts
2. Detect duplicates (nama yang sama)
3. Keep yang pertama, hapus sisanya
4. Refresh data

## Prevention

Untuk mencegah duplikat di masa depan:

### 1. Add Unique Constraint
Jalankan SQL ini:

```sql
-- Tambah unique constraint pada kolom nama
ALTER TABLE public.experts
ADD CONSTRAINT experts_nama_unique UNIQUE (nama);
```

⚠️ **Warning**: Jalankan ini SETELAH cleanup duplikat!

### 2. Update Add Expert Function
Tambah validasi di frontend sebelum save:

```javascript
// Check if expert with same name exists
const existingExpert = experts.find(e => 
  e.nama.toLowerCase() === newExpert.nama.toLowerCase()
);

if (existingExpert) {
  showToast('Tenaga ahli dengan nama ini sudah ada!', 'error');
  return;
}
```

## SQL Script File

Saya sudah buat file SQL lengkap di:
📄 **`supabase/cleanup_duplicate_experts.sql`**

File ini berisi:
1. Query untuk cek duplikat
2. Query untuk hapus duplikat
3. Query untuk verifikasi
4. Alternatif query (keep first occurrence)

## Testing After Cleanup

1. **Refresh halaman Expert**
   ```
   Klik tombol "Refresh" di halaman Expert
   ```

2. **Verify no duplicates**
   ```
   Cek apakah masih ada nama dengan kurung-kurung
   ```

3. **Test add new expert**
   ```
   Coba tambah expert baru
   Pastikan tidak ada duplikat yang terbuat
   ```

## Backup (Optional)

Sebelum hapus, bisa backup dulu:

```sql
-- Backup experts table
CREATE TABLE experts_backup AS
SELECT * FROM public.experts;

-- Restore if needed
INSERT INTO public.experts
SELECT * FROM experts_backup;
```

## Summary

### Quick Steps:
1. ✅ Buka Supabase SQL Editor
2. ✅ Copy isi file `supabase/cleanup_duplicate_experts.sql`
3. ✅ Paste dan Run
4. ✅ Refresh halaman Expert di aplikasi
5. ✅ Verify duplikat sudah hilang

### Files Created:
- ✅ `supabase/cleanup_duplicate_experts.sql` - SQL script lengkap
- ✅ `CLEANUP_DUPLICATE_EXPERTS.md` - Dokumentasi ini

## Need Help?

Jika masih ada masalah:
1. Screenshot hasil query duplikat
2. Berikan info berapa banyak duplikat
3. Saya bisa bantu buat script yang lebih spesifik
