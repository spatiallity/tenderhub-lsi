# Manual Expert Data Update Guide

## 🎯 Quick Solution

Karena PATCH endpoint bermasalah, gunakan salah satu cara berikut:

### Option 1: Update via Supabase SQL (FASTEST) ⚡

```sql
-- Update ALL experts at once
UPDATE experts 
SET 
    tempat_lahir = CASE 
        WHEN id % 5 = 0 THEN 'Jakarta'
        WHEN id % 5 = 1 THEN 'Bandung'
        WHEN id % 5 = 2 THEN 'Surabaya'
        WHEN id % 5 = 3 THEN 'Yogyakarta'
        ELSE 'Semarang'
    END,
    tanggal_lahir = '15 Maret 1975',
    posisi_diusulkan = 'Team Leader',
    pendidikan_formal = '[
        "S2 Teknik Sipil, Institut Teknologi Bandung (2005)",
        "S1 Teknik Sipil, Universitas Gadjah Mada (2000)"
    ]'::jsonb,
    pendidikan_non_formal = '[
        "Project Management Professional (PMP), PMI (2010)",
        "ISO 9001:2015 Lead Auditor, BSI (2012)",
        "K3 Umum Certification, Kemnaker (2015)"
    ]'::jsonb,
    penguasaan_bahasa = '[
        "Bahasa Indonesia: Sangat Baik",
        "Bahasa Inggris: Baik"
    ]'::jsonb
WHERE tempat_lahir IS NULL OR tempat_lahir = '';

-- Update ALL projects at once
UPDATE expert_projects
SET
    lokasi_proyek = COALESCE(lokasi_proyek, 'Jakarta'),
    pengguna_jasa = COALESCE(pengguna_jasa, 'Kementerian PUPR'),
    uraian_tugas = COALESCE(uraian_tugas, 'Melakukan survei lapangan, analisis data, penyusunan laporan teknis, koordinasi dengan stakeholder, dan presentasi hasil kajian'),
    waktu_mulai = COALESCE(waktu_mulai, 'Januari 2023'),
    waktu_selesai = COALESCE(waktu_selesai, 'Desember 2023'),
    posisi_penugasan = COALESCE(posisi_penugasan, 'Team Leader'),
    status_kepegawaian = COALESCE(status_kepegawaian, 'Tetap'),
    surat_referensi = COALESCE(surat_referensi, '-')
WHERE lokasi_proyek IS NULL OR uraian_tugas IS NULL;
```

### Option 2: Update via Frontend (Manual)

1. Buka http://localhost:3000/experts
2. Klik Edit pada setiap expert
3. Isi field:
   - Tempat Lahir
   - Tanggal Lahir
   - Posisi Diusulkan
   - Pendidikan Formal (add items)
   - Pendidikan Non-Formal (add items)
   - Penguasaan Bahasa (add items)
4. Save

### Option 3: Fix Backend & Run Script

Debug PATCH endpoint issue dan jalankan script yang sudah dibuat.

## 📝 Recommended: Use SQL Update

**Steps:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy SQL above
4. Execute
5. Verify: `SELECT * FROM experts LIMIT 5;`
6. Generate CV to test

## ✅ Verification

After update, check:
```sql
SELECT 
    id, 
    nama, 
    tempat_lahir, 
    tanggal_lahir,
    jsonb_array_length(pendidikan_formal) as edu_count,
    jsonb_array_length(penguasaan_bahasa) as lang_count
FROM experts 
LIMIT 10;
```

Should show:
- tempat_lahir: NOT NULL
- tanggal_lahir: NOT NULL
- edu_count: >= 2
- lang_count: >= 2

## 🚀 After Update

Generate CV:
```bash
curl -X GET "http://localhost:8000/api/v1/cv/108/cv" -o "CV_Test_After_Update.docx"
```

CV should now show:
- ✅ Complete personal info
- ✅ Education history
- ✅ Language skills
- ✅ Project details
