-- Fill ALL expert data with complete information using DATE format
-- Run this AFTER changing tanggal_lahir to DATE type

-- Update ALL experts with complete data
UPDATE experts 
SET 
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
    tanggal_lahir = DATE '1975-01-01' + (RANDOM() * 9125)::INTEGER,  -- Random date between 1975-2000
    posisi_diusulkan = CASE 
        WHEN id % 6 = 0 THEN 'Team Leader'
        WHEN id % 6 = 1 THEN 'Senior Expert'
        WHEN id % 6 = 2 THEN 'Technical Specialist'
        WHEN id % 6 = 3 THEN 'Project Manager'
        WHEN id % 6 = 4 THEN 'Quality Assurance Specialist'
        ELSE 'Consultant'
    END,
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
    pendidikan_non_formal = '[
        "Project Management Professional (PMP), PMI (2010)",
        "ISO 9001:2015 Lead Auditor, BSI (2012)",
        "K3 Umum Certification, Kemnaker (2015)"
    ]'::jsonb,
    penguasaan_bahasa = '[
        "Bahasa Indonesia: Sangat Baik",
        "Bahasa Inggris: Baik"
    ]'::jsonb
WHERE tempat_lahir IS NULL OR tempat_lahir = '' OR tanggal_lahir IS NULL;

-- Update ALL projects with complete CV template data
UPDATE expert_projects
SET
    lokasi_proyek = COALESCE(lokasi_proyek, CASE 
        WHEN id % 5 = 0 THEN 'Jakarta'
        WHEN id % 5 = 1 THEN 'Bandung, Jawa Barat'
        WHEN id % 5 = 2 THEN 'Surabaya, Jawa Timur'
        WHEN id % 5 = 3 THEN 'Semarang, Jawa Tengah'
        ELSE 'Medan, Sumatera Utara'
    END),
    pengguna_jasa = COALESCE(pengguna_jasa, CASE 
        WHEN id % 4 = 0 THEN 'Kementerian PUPR'
        WHEN id % 4 = 1 THEN 'Kementerian ESDM'
        WHEN id % 4 = 2 THEN 'PT PLN (Persero)'
        ELSE 'PT Jasa Marga (Persero) Tbk'
    END),
    uraian_tugas = COALESCE(uraian_tugas, 'Melakukan survei lapangan, analisis data, penyusunan laporan teknis, koordinasi dengan stakeholder, dan presentasi hasil kajian kepada klien'),
    waktu_mulai = COALESCE(waktu_mulai, 'Januari ' || (2020 + (id % 5))::TEXT),
    waktu_selesai = COALESCE(waktu_selesai, 'Desember ' || (2020 + (id % 5))::TEXT),
    posisi_penugasan = COALESCE(posisi_penugasan, CASE 
        WHEN id % 5 = 0 THEN 'Team Leader'
        WHEN id % 5 = 1 THEN 'Senior Engineer'
        WHEN id % 5 = 2 THEN 'Technical Specialist'
        WHEN id % 5 = 3 THEN 'Consultant'
        ELSE 'Coordinator'
    END),
    status_kepegawaian = COALESCE(status_kepegawaian, CASE 
        WHEN id % 2 = 0 THEN 'Tetap'
        ELSE 'Tidak Tetap'
    END),
    surat_referensi = COALESCE(surat_referensi, CASE 
        WHEN id % 3 = 0 THEN 'REF/' || LPAD((id % 999)::TEXT, 3, '0') || '/SCF/' || (2020 + (id % 5))::TEXT
        ELSE '-'
    END)
WHERE lokasi_proyek IS NULL OR uraian_tugas IS NULL;

-- Verify the updates
SELECT 
    id, 
    nama, 
    tempat_lahir, 
    tanggal_lahir,
    TO_CHAR(tanggal_lahir, 'DD Month YYYY') as tanggal_formatted,
    posisi_diusulkan,
    jsonb_array_length(pendidikan_formal) as edu_count,
    jsonb_array_length(penguasaan_bahasa) as lang_count
FROM experts 
ORDER BY id
LIMIT 10;

-- Verify projects
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
