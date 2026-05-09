-- =============================================================
-- Seed branch users (Section 6 of TASKS.md)
-- Run AFTER branch_claim_setup.sql.
--
-- Approach: this script ONLY upserts profile rows. Auth users must be
-- created first via the FastAPI endpoint /api/v1/users (admin SDK) or
-- the Supabase Dashboard. The companion script
-- backend/scripts/seed_branch_users.py does both auth + profile in one go.
--
-- This SQL file is a fallback for when auth.users already exist (e.g.
-- imported via dashboard) and only profiles need backfilling.
-- =============================================================

-- Cabang Wilayah Barat
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active)
SELECT u.id, u.email, 'Admin Bandar Lampung', 'cabang', 'Bandar Lampung', TRUE FROM auth.users u WHERE u.email = 'bandarlampung@lsi.co.id'
ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Bandar Lampung', name='Admin Bandar Lampung';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Bandung', 'cabang', 'Bandung', TRUE FROM auth.users u WHERE u.email = 'bandung@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Bandung', name='Admin Bandung';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Batam', 'cabang', 'Batam', TRUE FROM auth.users u WHERE u.email = 'batam@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Batam', name='Admin Batam';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Bekasi', 'cabang', 'Bekasi', TRUE FROM auth.users u WHERE u.email = 'bekasi@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Bekasi', name='Admin Bekasi';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Bengkulu', 'cabang', 'Bengkulu', TRUE FROM auth.users u WHERE u.email = 'bengkulu@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Bengkulu', name='Admin Bengkulu';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Cilacap', 'cabang', 'Cilacap', TRUE FROM auth.users u WHERE u.email = 'cilacap@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Cilacap', name='Admin Cilacap';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Cilegon', 'cabang', 'Cilegon', TRUE FROM auth.users u WHERE u.email = 'cilegon@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Cilegon', name='Admin Cilegon';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Cirebon', 'cabang', 'Cirebon', TRUE FROM auth.users u WHERE u.email = 'cirebon@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Cirebon', name='Admin Cirebon';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Dumai', 'cabang', 'Dumai', TRUE FROM auth.users u WHERE u.email = 'dumai@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Dumai', name='Admin Dumai';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Jakarta', 'cabang', 'Jakarta', TRUE FROM auth.users u WHERE u.email = 'jakarta@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Jakarta', name='Admin Jakarta';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Jambi', 'cabang', 'Jambi', TRUE FROM auth.users u WHERE u.email = 'jambi@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Jambi', name='Admin Jambi';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Medan', 'cabang', 'Medan', TRUE FROM auth.users u WHERE u.email = 'medan@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Medan', name='Admin Medan';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Padang', 'cabang', 'Padang', TRUE FROM auth.users u WHERE u.email = 'padang@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Padang', name='Admin Padang';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Palembang', 'cabang', 'Palembang', TRUE FROM auth.users u WHERE u.email = 'palembang@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Palembang', name='Admin Palembang';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Pekanbaru', 'cabang', 'Pekanbaru', TRUE FROM auth.users u WHERE u.email = 'pekanbaru@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Pekanbaru', name='Admin Pekanbaru';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Semarang', 'cabang', 'Semarang', TRUE FROM auth.users u WHERE u.email = 'semarang@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Semarang', name='Admin Semarang';

-- Cabang Wilayah Timur
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Balikpapan', 'cabang', 'Balikpapan', TRUE FROM auth.users u WHERE u.email = 'balikpapan@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Balikpapan', name='Admin Balikpapan';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Banjarmasin', 'cabang', 'Banjarmasin', TRUE FROM auth.users u WHERE u.email = 'banjarmasin@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Banjarmasin', name='Admin Banjarmasin';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Batulicin', 'cabang', 'Batulicin', TRUE FROM auth.users u WHERE u.email = 'batulicin@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Batulicin', name='Admin Batulicin';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Bontang', 'cabang', 'Bontang', TRUE FROM auth.users u WHERE u.email = 'bontang@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Bontang', name='Admin Bontang';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Denpasar', 'cabang', 'Denpasar', TRUE FROM auth.users u WHERE u.email = 'denpasar@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Denpasar', name='Admin Denpasar';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Kendari', 'cabang', 'Kendari', TRUE FROM auth.users u WHERE u.email = 'kendari@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Kendari', name='Admin Kendari';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Makassar', 'cabang', 'Makassar', TRUE FROM auth.users u WHERE u.email = 'makassar@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Makassar', name='Admin Makassar';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Pontianak', 'cabang', 'Pontianak', TRUE FROM auth.users u WHERE u.email = 'pontianak@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Pontianak', name='Admin Pontianak';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Samarinda', 'cabang', 'Samarinda', TRUE FROM auth.users u WHERE u.email = 'samarinda@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Samarinda', name='Admin Samarinda';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Sangatta', 'cabang', 'Sangatta', TRUE FROM auth.users u WHERE u.email = 'sangatta@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Sangatta', name='Admin Sangatta';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Surabaya', 'cabang', 'Surabaya', TRUE FROM auth.users u WHERE u.email = 'surabaya@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Surabaya', name='Admin Surabaya';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Tarakan', 'cabang', 'Tarakan', TRUE FROM auth.users u WHERE u.email = 'tarakan@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Tarakan', name='Admin Tarakan';
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin Timika', 'cabang', 'Timika', TRUE FROM auth.users u WHERE u.email = 'timika@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='cabang', unit_kerja='Timika', name='Admin Timika';

-- Pusat
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Admin SBU LSI', 'pusat', 'SBU LSI', TRUE FROM auth.users u WHERE u.email = 'sbulsi@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='pusat', unit_kerja='SBU LSI', name='Admin SBU LSI';

-- Super Admin
INSERT INTO public.profiles (id, email, name, role, unit_kerja, is_active) SELECT u.id, u.email, 'Super Admin', 'admin', NULL, TRUE FROM auth.users u WHERE u.email = 'admin@lsi.co.id' ON CONFLICT (id) DO UPDATE SET role='admin', name='Super Admin';
