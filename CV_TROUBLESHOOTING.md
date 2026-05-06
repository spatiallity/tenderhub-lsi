# CV Generator Troubleshooting Guide

## 🔧 Common Issues & Solutions

### Issue 1: "Failed to generate CV" - Error 500

#### Kemungkinan Penyebab:
1. **Migration belum dijalankan** - Field CV baru belum ada di database
2. **Template file tidak ditemukan**
3. **Data expert corrupt atau format salah**

#### Solusi:

##### A. Jalankan Database Migration
```sql
-- Run di Supabase SQL Editor
-- File: supabase/add_cv_template_fields.sql

ALTER TABLE experts 
ADD COLUMN IF NOT EXISTS tempat_lahir VARCHAR(100),
ADD COLUMN IF NOT EXISTS tanggal_lahir VARCHAR(50),
ADD COLUMN IF NOT EXISTS pendidikan_formal JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS pendidikan_non_formal JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS penguasaan_bahasa JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS posisi_diusulkan VARCHAR(100);

-- ... (rest of migration)
```

##### B. Cek Template File
Pastikan file `TEMPLATE_CV_EXPERT.docx` ada di root project:
```
TenderHub LSIv2/
├── TEMPLATE_CV_EXPERT.docx  ← Harus ada di sini
├── backend/
├── frontend/
└── ...
```

##### C. Cek Backend Logs
Lihat error detail di Railway logs atau console backend:
```bash
# Local development
cd backend
uvicorn app.main:app --reload

# Cek logs untuk error message
```

### Issue 2: Button Layout Kacau

#### Gejala:
- Button "Edit Data CV" dan "Generate CV" tidak sejajar
- Button terpotong atau overlap
- Layout berantakan di mobile

#### Solusi:
✅ **Sudah diperbaiki** dengan:
- `shrink-0` pada container button
- `whitespace-nowrap` pada button text
- Reduced padding (px-3 py-2)
- Smaller icons (size={16})

### Issue 3: CV Kosong atau "Belum diisi"

#### Penyebab:
Data expert belum lengkap di database

#### Solusi:
1. **Gunakan "Edit Data CV"** untuk mengisi data:
   - Tempat Lahir
   - Tanggal Lahir
   - Posisi yang Diusulkan
   - Pendidikan Formal
   - Pendidikan Non Formal
   - Penguasaan Bahasa

2. **Atau update manual via SQL**:
```sql
UPDATE experts 
SET 
  tempat_lahir = 'Jakarta',
  tanggal_lahir = '15 Agustus 1975',
  posisi_diusulkan = 'Team Leader',
  pendidikan_formal = '["S1 Teknik Sipil UI (1997)"]'::jsonb,
  penguasaan_bahasa = '["Bahasa Indonesia Baik", "Bahasa Inggris Baik"]'::jsonb
WHERE id = 1;
```

### Issue 4: Template Format Berantakan

#### Penyebab:
Template file corrupt atau berubah

#### Solusi:
1. Re-download template asli dari Sucofindo
2. **JANGAN** edit template secara manual
3. Pastikan template memiliki struktur yang benar:
   - Table 0: Header info
   - Tables 1-3: Project entries
   - Last table: Signature

### Issue 5: "Request failed with status code 500"

#### Debug Steps:

##### 1. Cek Backend Running
```bash
# Pastikan backend berjalan
curl http://localhost:8000/api/v1/experts
```

##### 2. Cek Expert Exists
```bash
# Cek expert dengan ID tertentu
curl http://localhost:8000/api/v1/experts/1
```

##### 3. Test CV Generation
```bash
# Test generate CV
curl -X GET "http://localhost:8000/api/v1/cv/1/cv" \
  --output test_cv.docx
```

##### 4. Cek Error Message
Buka browser DevTools → Network → Cek response error:
```json
{
  "detail": "Error message here"
}
```

### Issue 6: Modal "Edit Data CV" Tidak Muncul

#### Solusi:
1. **Clear browser cache**
2. **Hard refresh**: Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)
3. **Cek console errors**: F12 → Console tab

### Issue 7: Data Tidak Tersimpan

#### Kemungkinan Penyebab:
1. Backend tidak running
2. CORS error
3. Authentication error
4. Validation error

#### Debug:
```javascript
// Cek di browser console
// Seharusnya ada request ke:
PATCH http://localhost:8000/api/v1/experts/{id}

// Dengan body:
{
  "tempat_lahir": "...",
  "tanggal_lahir": "...",
  // ...
}
```

## 🚀 Quick Fix Checklist

Jika CV generator error, coba langkah berikut secara berurutan:

- [ ] **Step 1**: Jalankan database migration di Supabase
- [ ] **Step 2**: Pastikan template file ada di root project
- [ ] **Step 3**: Restart backend server
- [ ] **Step 4**: Clear browser cache & hard refresh
- [ ] **Step 5**: Isi data CV via "Edit Data CV"
- [ ] **Step 6**: Test generate CV lagi

## 📝 Error Messages & Meanings

### "CV template not found at: ..."
**Artinya**: File template tidak ditemukan
**Solusi**: Copy `TEMPLATE_CV_EXPERT.docx` ke root project

### "Failed to load template: ..."
**Artinya**: Template file corrupt atau tidak bisa dibaca
**Solusi**: Re-download template asli

### "Error processing template: ..."
**Artinya**: Error saat mengisi data ke template
**Solusi**: Cek format data (terutama array fields)

### "Expert not found"
**Artinya**: Expert dengan ID tersebut tidak ada
**Solusi**: Cek ID expert yang benar

## 🔍 Advanced Debugging

### Enable Debug Mode

**Backend** (`backend/app/api/v1/cv_generator.py`):
```python
# Add print statements
print(f"Expert data: {expert_data}")
print(f"Template path: {template_path}")
print(f"Projects: {len(expert_data['projects'])}")
```

**Frontend** (`frontend/src/components/Expert/CVGeneratorModal.jsx`):
```javascript
// Add console.log
console.log('Generating CV for expert:', expert);
console.log('API response:', response);
```

### Check Database Fields

```sql
-- Cek apakah field CV ada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'experts' 
  AND column_name IN (
    'tempat_lahir', 
    'tanggal_lahir', 
    'pendidikan_formal',
    'pendidikan_non_formal',
    'penguasaan_bahasa',
    'posisi_diusulkan'
  );
```

### Check Expert Data

```sql
-- Cek data expert lengkap
SELECT 
  id, 
  nama,
  tempat_lahir,
  tanggal_lahir,
  posisi_diusulkan,
  pendidikan_formal,
  pendidikan_non_formal,
  penguasaan_bahasa
FROM experts 
WHERE id = 1;
```

## 💡 Best Practices

### 1. Always Fill CV Data First
Sebelum generate CV, pastikan data sudah lengkap:
- ✅ Tempat & Tanggal Lahir
- ✅ Posisi yang Diusulkan
- ✅ Minimal 1 Pendidikan Formal
- ✅ Minimal 2 Bahasa

### 2. Test with Sample Data
Gunakan data sample untuk testing:
```javascript
{
  tempat_lahir: "Jakarta",
  tanggal_lahir: "15 Agustus 1975",
  posisi_diusulkan: "Team Leader",
  pendidikan_formal: ["S1 Teknik Sipil UI (1997)"],
  penguasaan_bahasa: ["Bahasa Indonesia Baik", "Bahasa Inggris Baik"]
}
```

### 3. Check Template Regularly
Pastikan template tidak berubah atau corrupt:
- File size harus konsisten
- Bisa dibuka di Microsoft Word
- Struktur table masih sama

### 4. Monitor Backend Logs
Selalu cek logs untuk error messages yang lebih detail

## 📞 Still Having Issues?

Jika masih ada masalah setelah mengikuti guide ini:

1. **Cek dokumentasi**:
   - `CV_TEMPLATE_GUIDE.md` - Panduan lengkap
   - `CV_GENERATOR_IMPLEMENTATION.md` - Detail implementasi
   - `CV_DATA_EDIT_MODAL.md` - Panduan edit data

2. **Cek file-file penting**:
   - `backend/app/api/v1/cv_generator.py` - CV generator logic
   - `backend/app/models/expert.py` - Database models
   - `supabase/add_cv_template_fields.sql` - Migration SQL

3. **Test step-by-step**:
   - Test backend API manual dengan curl
   - Test frontend dengan console.log
   - Test database dengan SQL query

## ✅ Success Indicators

CV Generator berfungsi dengan baik jika:
- ✅ Button "Edit Data CV" dan "Generate CV" tampil dengan baik
- ✅ Modal "Edit Data CV" bisa dibuka dan data bisa disimpan
- ✅ Generate CV tidak error
- ✅ File CV ter-download dalam format .docx
- ✅ File CV bisa dibuka di Microsoft Word
- ✅ Data expert muncul dengan benar di CV
- ✅ Format CV sesuai template Sucofindo

**Good luck!** 🚀
