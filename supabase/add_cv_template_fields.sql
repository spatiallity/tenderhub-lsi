-- Add CV Template Fields to Experts and Expert Projects
-- Run this in Supabase SQL Editor

-- Add new fields to experts table
ALTER TABLE experts 
ADD COLUMN IF NOT EXISTS tempat_lahir VARCHAR(100),
ADD COLUMN IF NOT EXISTS tanggal_lahir VARCHAR(50),
ADD COLUMN IF NOT EXISTS pendidikan_formal JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS pendidikan_non_formal JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS penguasaan_bahasa JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS posisi_diusulkan VARCHAR(100);

-- Add new fields to expert_projects table
ALTER TABLE expert_projects
ADD COLUMN IF NOT EXISTS lokasi_proyek VARCHAR(200),
ADD COLUMN IF NOT EXISTS pengguna_jasa VARCHAR(200),
ADD COLUMN IF NOT EXISTS uraian_tugas TEXT,
ADD COLUMN IF NOT EXISTS waktu_mulai VARCHAR(50),
ADD COLUMN IF NOT EXISTS waktu_selesai VARCHAR(50),
ADD COLUMN IF NOT EXISTS posisi_penugasan VARCHAR(100),
ADD COLUMN IF NOT EXISTS status_kepegawaian VARCHAR(50),
ADD COLUMN IF NOT EXISTS surat_referensi VARCHAR(100);

-- Set default values for existing records
UPDATE experts 
SET 
  penguasaan_bahasa = '["Bahasa Indonesia Baik", "Bahasa Inggris Baik"]'::jsonb,
  posisi_diusulkan = 'Team Leader'
WHERE penguasaan_bahasa IS NULL OR penguasaan_bahasa = '[]'::jsonb;

UPDATE expert_projects
SET status_kepegawaian = 'Tidak Tetap'
WHERE status_kepegawaian IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN experts.tempat_lahir IS 'Tempat lahir expert untuk CV';
COMMENT ON COLUMN experts.tanggal_lahir IS 'Tanggal lahir expert (format: 7 Juli 1967)';
COMMENT ON COLUMN experts.pendidikan_formal IS 'Array pendidikan formal (S1, S2, dll)';
COMMENT ON COLUMN experts.pendidikan_non_formal IS 'Array pendidikan non formal (training, sertifikat)';
COMMENT ON COLUMN experts.penguasaan_bahasa IS 'Array penguasaan bahasa';
COMMENT ON COLUMN experts.posisi_diusulkan IS 'Posisi yang diusulkan dalam tender (Team Leader, Ahli, dll)';

COMMENT ON COLUMN expert_projects.lokasi_proyek IS 'Lokasi proyek (Kota, Provinsi)';
COMMENT ON COLUMN expert_projects.pengguna_jasa IS 'Pengguna jasa/klien proyek';
COMMENT ON COLUMN expert_projects.uraian_tugas IS 'Uraian tugas dalam proyek';
COMMENT ON COLUMN expert_projects.waktu_mulai IS 'Waktu mulai proyek (format: Agustus 2025)';
COMMENT ON COLUMN expert_projects.waktu_selesai IS 'Waktu selesai proyek (format: Desember 2025)';
COMMENT ON COLUMN expert_projects.posisi_penugasan IS 'Posisi penugasan dalam proyek';
COMMENT ON COLUMN expert_projects.status_kepegawaian IS 'Status kepegawaian (Tetap/Tidak Tetap)';
COMMENT ON COLUMN expert_projects.surat_referensi IS 'Nomor surat referensi atau "-"';
