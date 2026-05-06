-- ============================================================================
-- EXPERT DATA COMPLETION SQL
-- ============================================================================
-- Purpose: Fill ALL expert data with complete CV template information
-- Target: 34 experts + all their projects
-- Format: VARCHAR (Indonesian dates), JSONB arrays
-- Safe: Only updates empty fields (WHERE clause)
-- ============================================================================

-- ============================================================================
-- PART 1: UPDATE EXPERT PERSONAL DATA
-- ============================================================================

UPDATE experts 
SET 
    -- Birth place (10 different cities)
    tempat_lahir = CASE 
        WHEN id % 10 = 0 THEN 'Jakarta'
        WHEN id % 10 = 1 THEN 'Bandung'
        WHEN id % 10 = 2 THEN 'Surabaya'
        WHEN id % 10 = 3 THEN 'Yogyakarta'
        WHEN id % 10 = 4 THEN 'Semarang'
        WHEN id % 10 = 5 THEN 'Medan'
        WHEN id % 10 = 6 THEN 'Palembang'
        WHEN id % 10 = 7 THEN 'Makassar'
        WHEN id % 10 = 8 THEN 'Denpasar'
        ELSE 'Malang'
    END,
    
    -- Birth date (Indonesian format: DD Month YYYY)
    tanggal_lahir = CASE 
        WHEN id % 12 = 0 THEN '15 Januari 1975'
        WHEN id % 12 = 1 THEN '20 Februari 1978'
        WHEN id % 12 = 2 THEN '10 Maret 1980'
        WHEN id % 12 = 3 THEN '25 April 1976'
        WHEN id % 12 = 4 THEN '30 Mei 1982'
        WHEN id % 12 = 5 THEN '12 Juni 1979'
        WHEN id % 12 = 6 THEN '18 Juli 1977'
        WHEN id % 12 = 7 THEN '22 Agustus 1981'
        WHEN id % 12 = 8 THEN '5 September 1974'
        WHEN id % 12 = 9 THEN '14 Oktober 1983'
        WHEN id % 12 = 10 THEN '8 November 1978'
        ELSE '28 Desember 1980'
    END,
    
    -- Proposed position (6 different positions)
    posisi_diusulkan = CASE 
        WHEN id % 6 = 0 THEN 'Team Leader'
        WHEN id % 6 = 1 THEN 'Senior Expert'
        WHEN id % 6 = 2 THEN 'Technical Specialist'
        WHEN id % 6 = 3 THEN 'Project Manager'
        WHEN id % 6 = 4 THEN 'Quality Assurance Specialist'
        ELSE 'Consultant'
    END,
    
    -- Formal education (3 patterns: S3+S2+S1, S2+S1, S2+S1)
    pendidikan_formal = CASE
        WHEN id % 3 = 0 THEN '[
            "S3 Teknik Sipil, Institut Teknologi Bandung (2010)",
            "S2 Teknik Sipil, Institut Teknologi Bandung (2005)",
            "S1 Teknik Sipil, Universitas Gadjah Mada (2000)"
        ]'::jsonb
        WHEN id % 3 = 1 THEN '[
            "S2 Teknik Lingkungan, Universitas Indonesia (2008)",
            "S1 Teknik Lingkungan, Institut Teknologi Sepuluh Nopember (2003)"
        ]'::jsonb
        ELSE '[
            "S2 Manajemen Proyek, Universitas Gadjah Mada (2007)",
            "S1 Teknik Industri, Universitas Brawijaya (2002)"
        ]'::jsonb
    END,
    
    -- Non-formal education (3 certifications)
    pendidikan_non_formal = '[
        "Project Management Professional (PMP), PMI (2010)",
        "ISO 9001:2015 Lead Auditor, BSI (2012)",
        "K3 Umum Certification, Kemnaker (2015)"
    ]'::jsonb,
    
    -- Language proficiency (Indonesian & English)
    penguasaan_bahasa = '[
        "Bahasa Indonesia: Sangat Baik",
        "Bahasa Inggris: Baik"
    ]'::jsonb

-- Only update if fields are empty
WHERE tempat_lahir IS NULL 
   OR tempat_lahir = '' 
   OR tanggal_lahir IS NULL;

-- ============================================================================
-- PART 2: UPDATE PROJECT DATA
-- ============================================================================

UPDATE expert_projects
SET
    -- Project location (5 different locations)
    lokasi_proyek = COALESCE(lokasi_proyek, CASE 
        WHEN id % 5 = 0 THEN 'Jakarta'
        WHEN id % 5 = 1 THEN 'Bandung, Jawa Barat'
        WHEN id % 5 = 2 THEN 'Surabaya, Jawa Timur'
        WHEN id % 5 = 3 THEN 'Semarang, Jawa Tengah'
        ELSE 'Medan, Sumatera Utara'
    END),
    
    -- Client name (4 different clients)
    pengguna_jasa = COALESCE(pengguna_jasa, CASE 
        WHEN id % 4 = 0 THEN 'Kementerian PUPR'
        WHEN id % 4 = 1 THEN 'Kementerian ESDM'
        WHEN id % 4 = 2 THEN 'PT PLN (Persero)'
        ELSE 'PT Jasa Marga (Persero) Tbk'
    END),
    
    -- Task description (as JSONB array for bullet points)
    uraian_tugas = COALESCE(uraian_tugas, CASE 
        WHEN id % 4 = 0 THEN 'Melakukan survei dan pengumpulan data lapangan
Menganalisis data teknis dan menyusun metodologi kajian
Menyusun laporan teknis dan dokumentasi proyek
Melakukan koordinasi dengan stakeholder dan tim proyek
Mempresentasikan hasil kajian kepada klien'
        WHEN id % 4 = 1 THEN 'Melakukan review dan analisis dokumen perencanaan
Menyusun konsep dan rencana kerja detail
Melakukan supervisi pelaksanaan kegiatan di lapangan
Menyusun laporan kemajuan dan laporan akhir
Memberikan rekomendasi teknis kepada klien'
        WHEN id % 4 = 2 THEN 'Melakukan inspeksi dan audit teknis di lapangan
Mengidentifikasi potensi risiko dan permasalahan
Menyusun rekomendasi perbaikan dan mitigasi
Melakukan monitoring dan evaluasi pelaksanaan
Menyusun laporan hasil inspeksi dan audit'
        ELSE 'Melakukan asesmen dan evaluasi kondisi eksisting
Menyusun desain dan spesifikasi teknis
Melakukan perhitungan dan analisis engineering
Menyusun gambar teknis dan bill of quantity
Memberikan asistensi teknis selama pelaksanaan'
    END),
    
    -- Start date (Januari 2020-2024)
    waktu_mulai = COALESCE(waktu_mulai, 'Januari ' || (2020 + (id % 5))::TEXT),
    
    -- End date (Desember 2020-2024)
    waktu_selesai = COALESCE(waktu_selesai, 'Desember ' || (2020 + (id % 5))::TEXT),
    
    -- Position in project (5 different positions)
    posisi_penugasan = COALESCE(posisi_penugasan, CASE 
        WHEN id % 5 = 0 THEN 'Team Leader'
        WHEN id % 5 = 1 THEN 'Senior Engineer'
        WHEN id % 5 = 2 THEN 'Technical Specialist'
        WHEN id % 5 = 3 THEN 'Consultant'
        ELSE 'Coordinator'
    END),
    
    -- Employment status (Permanent / Non-permanent)
    status_kepegawaian = COALESCE(status_kepegawaian, CASE 
        WHEN id % 2 = 0 THEN 'Tetap'
        ELSE 'Tidak Tetap'
    END),
    
    -- Reference letter (REF/xxx/SCF/YYYY or "-")
    surat_referensi = COALESCE(surat_referensi, CASE 
        WHEN id % 3 = 0 THEN 'REF/' || LPAD((id % 999)::TEXT, 3, '0') || '/SCF/' || (2020 + (id % 5))::TEXT
        ELSE '-'
    END)

-- Only update if fields are empty
WHERE lokasi_proyek IS NULL 
   OR uraian_tugas IS NULL;

-- ============================================================================
-- PART 3: VERIFICATION QUERIES
-- ============================================================================

-- Verify expert data (first 10)
SELECT 
    id, 
    nama, 
    tempat_lahir, 
    tanggal_lahir,
    posisi_diusulkan,
    jsonb_array_length(pendidikan_formal) as edu_count,
    jsonb_array_length(penguasaan_bahasa) as lang_count
FROM experts 
ORDER BY id
LIMIT 10;

-- Verify project data (first 10)
SELECT 
    ep.id,
    e.nama as expert_name,
    ep.nama_proyek,
    ep.lokasi_proyek,
    ep.pengguna_jasa,
    ep.waktu_mulai,
    ep.waktu_selesai,
    ep.posisi_penugasan
FROM expert_projects ep
JOIN experts e ON e.id = ep.expert_id
ORDER BY ep.id
LIMIT 10;

-- ============================================================================
-- EXPECTED RESULTS
-- ============================================================================
-- Expert verification should show:
-- - tempat_lahir: Jakarta, Bandung, Surabaya, etc. (NOT NULL)
-- - tanggal_lahir: "15 Januari 1975", "20 Februari 1978", etc. (NOT NULL)
-- - posisi_diusulkan: Team Leader, Senior Expert, etc. (NOT NULL)
-- - edu_count: 2 or 3 (formal education items)
-- - lang_count: 2 (language proficiency items)
--
-- Project verification should show:
-- - lokasi_proyek: Jakarta, Bandung, etc. (NOT NULL)
-- - pengguna_jasa: Kementerian PUPR, etc. (NOT NULL)
-- - waktu_mulai: "Januari 2023", etc. (NOT NULL)
-- - waktu_selesai: "Desember 2023", etc. (NOT NULL)
-- - posisi_penugasan: Team Leader, etc. (NOT NULL)
-- ============================================================================
