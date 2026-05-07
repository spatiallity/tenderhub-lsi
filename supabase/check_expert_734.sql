-- Check if expert 734 exists and has complete data for CV generation

-- 1. Check if expert exists
SELECT 
    id,
    nama,
    no_hp,
    instansi,
    keahlian,
    availability,
    subporto,
    posisi_diusulkan,
    tempat_lahir,
    tanggal_lahir
FROM experts 
WHERE id = 734;

-- 2. Check expert's projects
SELECT 
    id,
    nama_proyek,
    pemberi_kerja,
    tahun,
    nilai_proyek,
    peran,
    lokasi_proyek,
    pengguna_jasa,
    uraian_tugas,
    waktu_mulai,
    waktu_selesai,
    posisi_penugasan,
    status_kepegawaian
FROM expert_projects 
WHERE expert_id = 734
ORDER BY tahun DESC;

-- 3. Check if expert has pendidikan_formal
SELECT 
    id,
    nama,
    pendidikan_formal,
    pendidikan_non_formal,
    penguasaan_bahasa
FROM experts 
WHERE id = 734;

-- 4. Count projects
SELECT 
    COUNT(*) as total_projects
FROM expert_projects 
WHERE expert_id = 734;

-- If expert doesn't exist, list available experts
SELECT 
    id,
    nama,
    instansi,
    (SELECT COUNT(*) FROM expert_projects WHERE expert_id = experts.id) as project_count
FROM experts 
ORDER BY id 
LIMIT 10;
