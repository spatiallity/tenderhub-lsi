# Next Steps - CV Generator

## ✅ What's Done

1. ✅ Database schema updated (models)
2. ✅ CV generator rewritten to follow template
3. ✅ Migrations created (Alembic + Supabase)
4. ✅ Documentation updated
5. ✅ Code pushed to GitHub

## 🚀 What You Need to Do

### Step 1: Run Database Migration in Supabase

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project TenderHub LSI
3. Klik **SQL Editor** di sidebar
4. Klik **New Query**
5. Copy-paste isi file `supabase/add_cv_template_fields.sql`
6. Klik **Run** atau tekan `Ctrl+Enter`
7. Pastikan muncul "Success. No rows returned"

### Step 2: Install python-docx di Backend

Jika deploy di Railway:
- Railway akan otomatis install dari `requirements.txt`
- Pastikan `python-docx==1.1.2` ada di `requirements.txt` ✅ (sudah ada)

Jika run lokal:
```bash
cd backend
pip install python-docx==1.1.2
```

### Step 3: Test CV Generator

#### Test dari Frontend:
1. Buka aplikasi TenderHub
2. Masuk ke halaman **Expert**
3. Klik salah satu expert
4. Klik tombol **"Generate CV"**
5. File CV akan ter-download

#### Test dari API (optional):
```bash
curl -X GET "https://your-backend-url.com/api/v1/cv/1/cv" \
  --output test_cv.docx
```

### Step 4: Update Expert Data (Optional)

Untuk hasil CV yang lebih baik, update data expert dengan field baru:

```sql
-- Example: Update expert ID 1
UPDATE experts 
SET 
  tempat_lahir = 'Jakarta',
  tanggal_lahir = '15 Agustus 1975',
  posisi_diusulkan = 'Team Leader',
  pendidikan_formal = '["S1 Teknik Sipil UI (1997)", "S2 Manajemen Konstruksi ITB (2002)"]'::jsonb,
  pendidikan_non_formal = '["Training Certificate PMP - 2015", "Sertifikat Ahli K3 - 2018"]'::jsonb,
  penguasaan_bahasa = '["Bahasa Indonesia Sangat Baik", "Bahasa Inggris Baik"]'::jsonb
WHERE id = 1;

-- Example: Update project data
UPDATE expert_projects
SET
  lokasi_proyek = 'Jakarta Pusat, DKI Jakarta',
  pengguna_jasa = 'Kementerian PUPR',
  uraian_tugas = 'Melakukan supervisi konstruksi dan quality control',
  waktu_mulai = 'Januari 2024',
  waktu_selesai = 'Desember 2025',
  posisi_penugasan = 'Team Leader Supervisi',
  status_kepegawaian = 'Tetap',
  surat_referensi = '123/SK/PUPR/2025'
WHERE id = 1;
```

## 📋 Verification Checklist

Setelah migration dan deployment:

- [ ] Database migration berhasil (no errors)
- [ ] Backend deploy berhasil (Railway/production)
- [ ] API endpoint `/api/v1/cv/{expert_id}/cv` bisa diakses
- [ ] Download CV berhasil (file .docx ter-download)
- [ ] File CV bisa dibuka di Microsoft Word
- [ ] Data expert muncul di CV (nama, tempat/tanggal lahir, dll)
- [ ] Data proyek muncul di CV (minimal 1 proyek)
- [ ] Format CV sesuai template Sucofindo
- [ ] Tidak ada text "Asep Hendy Sopyandi" (template default)

## ⚠️ Troubleshooting

### Error: "CV template not found"
**Penyebab**: File `TEMPLATE_CV_EXPERT.docx` tidak ada di root project

**Solusi**: 
- Pastikan file template ada di root project (sejajar dengan folder `backend` dan `frontend`)
- Jika deploy di Railway, pastikan file template ter-upload

### Error: "Failed to generate CV"
**Penyebab**: python-docx tidak terinstall atau template corrupt

**Solusi**:
- Cek log Railway untuk detail error
- Pastikan `python-docx==1.1.2` ada di `requirements.txt`
- Cek apakah template file corrupt (buka manual di Word)

### CV kosong atau data tidak muncul
**Penyebab**: Data expert belum lengkap di database

**Solusi**:
- Update data expert dengan field-field baru (lihat Step 4)
- Minimal isi: `tempat_lahir`, `tanggal_lahir`, `posisi_diusulkan`

### Format CV berantakan
**Penyebab**: Template file berubah atau corrupt

**Solusi**:
- Re-download template asli dari Sucofindo
- Jangan edit template secara manual

## 📞 Need Help?

Jika ada masalah:
1. Cek file `CV_TEMPLATE_GUIDE.md` untuk dokumentasi lengkap
2. Cek file `CV_GENERATOR_IMPLEMENTATION.md` untuk detail implementasi
3. Cek log backend untuk error messages

## 🎉 Success Criteria

CV Generator dianggap berhasil jika:
- ✅ CV ter-download dalam format .docx
- ✅ File bisa dibuka di Microsoft Word
- ✅ Data expert muncul dengan benar
- ✅ Format mengikuti template Sucofindo
- ✅ Tidak ada placeholder atau text template yang tersisa

**Good luck!** 🚀
