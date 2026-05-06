# Expert Data Update Issue & Solution

## 🔴 Problem

CV yang di-generate masih kosong di beberapa field karena data expert di database belum lengkap.

### Missing Data:
- ❌ Tempat/Tanggal Lahir: "Belum diisi, Belum diisi"
- ❌ Pendidikan Formal: Kosong (hanya bullet points)
- ❌ Pendidikan Non-Formal: Kosong
- ❌ Lokasi Proyek: "Belum diisi"
- ❌ Uraian Tugas: "Belum diisi"

## 🔍 Root Cause

**PATCH Expert Endpoint Error (500 Internal Server Error)**

Endpoint: `PATCH /api/v1/experts/{expert_id}`

**Symptoms:**
- All PATCH requests return 500 error
- No detailed error logs in backend
- Both Python and PowerShell scripts fail
- Connection closes unexpectedly

**Possible Causes:**
1. Database schema mismatch
2. Async/await issue in endpoint
3. JSONB field validation error
4. Database connection pool exhausted

## 📝 Scripts Created (Ready but Can't Run)

### 1. `backend/fill_all_expert_data.py`
- Python version
- Complete data generation
- Personal, education, language, projects

### 2. `backend/fill_all_expert_data.ps1`
- PowerShell version
- Same functionality as Python
- Windows-friendly

### 3. `backend/complete_all_experts.py`
- Comprehensive version
- 10 expert profiles with detailed data
- Additional projects

## ✅ Alternative Solutions

### Solution 1: Direct SQL Update (Recommended)

Update via Supabase SQL Editor:

```sql
-- Update expert profile
UPDATE experts 
SET 
    tempat_lahir = 'Bandung',
    tanggal_lahir = '15 Maret 1975',
    posisi_diusulkan = 'Team Leader',
    pendidikan_formal = '[
        "S2 Teknik Sipil, Institut Teknologi Bandung (2005)",
        "S1 Teknik Sipil, Universitas Gadjah Mada (2000)"
    ]'::jsonb,
    pendidikan_non_formal = '[
        "Project Management Professional (PMP), PMI (2010)",
        "ISO 9001:2015 Lead Auditor, BSI (2012)"
    ]'::jsonb,
    penguasaan_bahasa = '[
        "Bahasa Indonesia: Sangat Baik",
        "Bahasa Inggris: Baik"
    ]'::jsonb
WHERE id = 108;

-- Update project data
UPDATE expert_projects
SET
    lokasi_proyek = 'Jakarta',
    pengguna_jasa = 'Kementerian PUPR',
    uraian_tugas = 'Melakukan survei lapangan, analisis data, penyusunan laporan teknis, koordinasi dengan stakeholder, dan presentasi hasil kajian',
    waktu_mulai = 'Januari 2023',
    waktu_selesai = 'Desember 2023',
    posisi_penugasan = 'Team Leader',
    status_kepegawaian = 'Tetap',
    surat_referensi = 'REF/123/SCF/2023'
WHERE expert_id = 108;
```

### Solution 2: Fix Backend API

Debug steps:
1. Check backend logs with verbose mode
2. Test PATCH endpoint with Postman
3. Verify database schema
4. Check async/await implementation
5. Test with minimal data first

### Solution 3: Manual Frontend Update

1. Open Expert page
2. Click Edit for each expert
3. Fill all CV template fields
4. Save

**Pros**: Works immediately
**Cons**: Time-consuming for 34 experts

## 🎯 Recommended Action Plan

### Immediate (Quick Fix):
1. **Use SQL Update** for top 5-10 experts with most projects
2. Generate CV to verify it works
3. Document the SQL pattern

### Short Term (Proper Fix):
1. Debug and fix PATCH endpoint
2. Run PowerShell script to update all experts
3. Verify all CVs generate correctly

### Long Term (Prevention):
1. Add data validation in frontend
2. Make CV template fields required
3. Add seed data with complete information
4. Add API endpoint health checks

## 📊 Current Status

| Item | Status | Notes |
|------|--------|-------|
| CV Generator | ✅ Working | Dynamic tables work perfectly |
| Expert Data | ❌ Incomplete | Missing personal & project details |
| PATCH Endpoint | ❌ Broken | Returns 500 error |
| Scripts Ready | ✅ Yes | Can't run due to API issue |
| SQL Solution | ⏳ Pending | Need to write and execute |

## 🔧 SQL Template for Bulk Update

```sql
-- Template for updating multiple experts
DO $$
DECLARE
    expert_record RECORD;
BEGIN
    FOR expert_record IN SELECT id FROM experts LOOP
        UPDATE experts
        SET
            tempat_lahir = CASE 
                WHEN id % 10 = 0 THEN 'Jakarta'
                WHEN id % 10 = 1 THEN 'Bandung'
                WHEN id % 10 = 2 THEN 'Surabaya'
                ELSE 'Yogyakarta'
            END,
            tanggal_lahir = '15 Maret 1975',
            posisi_diusulkan = 'Team Leader',
            pendidikan_formal = '[
                "S2 Teknik Sipil, ITB (2005)",
                "S1 Teknik Sipil, UGM (2000)"
            ]'::jsonb,
            pendidikan_non_formal = '[
                "PMP Certification (2010)",
                "ISO 9001 Lead Auditor (2012)"
            ]'::jsonb,
            penguasaan_bahasa = '[
                "Bahasa Indonesia: Sangat Baik",
                "Bahasa Inggris: Baik"
            ]'::jsonb
        WHERE id = expert_record.id;
    END LOOP;
END $$;
```

## 📝 Next Steps

1. ⏳ Fix PATCH endpoint OR use SQL update
2. ⏳ Update all expert data
3. ⏳ Update all project data
4. ⏳ Generate CV samples to verify
5. ⏳ Document the solution

## 💡 Lessons Learned

1. **Always test API endpoints** before building automation
2. **Have fallback plans** (SQL, manual, etc.)
3. **Seed data should be complete** from the start
4. **API error logging** needs improvement
5. **Data validation** should be enforced

## 🚀 When Fixed

Once data is complete, CV generation will show:
- ✅ Complete personal information
- ✅ Full education history
- ✅ Language skills
- ✅ Detailed project information
- ✅ All CV template fields filled
- ✅ Professional-looking CV ready for use

---

**Status**: Issue identified, solutions documented, awaiting implementation
**Priority**: High (blocks CV generation feature)
**Impact**: All 34 experts affected
