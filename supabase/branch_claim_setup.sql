-- =============================================================
-- Branch Claim Migration — TenderHub LSI
-- Run in: Supabase Dashboard > SQL Editor
--
-- Adds:
--   1. profiles.unit_kerja, profiles.unit_kerja_region
--      (relax role CHECK to include 'cabang', 'pusat')
--   2. tender_watchlist.unit_kerja, unit_kerja_region
--      (one tender = one branch)
--   3. rup_watchlist (new) — same pattern for RUP
--   4. RLS policies enforcing one-tender = one-branch on writes
-- =============================================================

-- 1. PROFILES ---------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS unit_kerja        TEXT,
  ADD COLUMN IF NOT EXISTS unit_kerja_region TEXT;

-- Drop old CHECK and recreate with cabang/pusat allowed.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('admin', 'pusat', 'cabang', 'manager', 'user'));

-- Auto-fill unit_kerja_region whenever unit_kerja set.
CREATE OR REPLACE FUNCTION public.fill_unit_kerja_region()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.unit_kerja IS NOT NULL THEN
    NEW.unit_kerja_region := CASE
      WHEN NEW.unit_kerja IN ('Bandar Lampung','Bandung','Batam','Bekasi','Bengkulu','Cilacap','Cilegon','Cirebon','Dumai','Jakarta','Jambi','Medan','Padang','Palembang','Pekanbaru','Semarang') THEN 'Barat'
      WHEN NEW.unit_kerja IN ('Balikpapan','Banjarmasin','Batulicin','Bontang','Denpasar','Kendari','Makassar','Pontianak','Samarinda','Sangatta','Surabaya','Tarakan','Timika') THEN 'Timur'
      WHEN NEW.unit_kerja = 'SBU LSI' THEN 'Pusat'
      ELSE NULL
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_fill_region ON public.profiles;
CREATE TRIGGER profiles_fill_region
  BEFORE INSERT OR UPDATE OF unit_kerja ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.fill_unit_kerja_region();

-- 2. TENDER_WATCHLIST -------------------------------------------

ALTER TABLE public.tender_watchlist
  ADD COLUMN IF NOT EXISTS unit_kerja        TEXT,
  ADD COLUMN IF NOT EXISTS unit_kerja_region TEXT,
  ADD COLUMN IF NOT EXISTS claimed_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS claimed_at        TIMESTAMPTZ;

-- One tender = one watchlist row (already implied by code paths) — make it explicit.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_tender_watchlist_kd_tender
  ON public.tender_watchlist(kd_tender);

-- Auto-fill region from unit_kerja.
CREATE OR REPLACE FUNCTION public.fill_watchlist_region()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.unit_kerja IS NOT NULL THEN
    NEW.unit_kerja_region := CASE
      WHEN NEW.unit_kerja IN ('Bandar Lampung','Bandung','Batam','Bekasi','Bengkulu','Cilacap','Cilegon','Cirebon','Dumai','Jakarta','Jambi','Medan','Padang','Palembang','Pekanbaru','Semarang') THEN 'Barat'
      WHEN NEW.unit_kerja IN ('Balikpapan','Banjarmasin','Batulicin','Bontang','Denpasar','Kendari','Makassar','Pontianak','Samarinda','Sangatta','Surabaya','Tarakan','Timika') THEN 'Timur'
      WHEN NEW.unit_kerja = 'SBU LSI' THEN 'Pusat'
      ELSE NULL
    END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tender_watchlist_fill_region ON public.tender_watchlist;
CREATE TRIGGER tender_watchlist_fill_region
  BEFORE INSERT OR UPDATE OF unit_kerja ON public.tender_watchlist
  FOR EACH ROW EXECUTE PROCEDURE public.fill_watchlist_region();

-- Tighten RLS: only admin OR caller.unit_kerja matches row.unit_kerja can write.
DROP POLICY IF EXISTS "Watchlist is updatable by authenticated users" ON public.tender_watchlist;
DROP POLICY IF EXISTS "Watchlist is deletable by authenticated users" ON public.tender_watchlist;
DROP POLICY IF EXISTS "Watchlist is insertable by authenticated users" ON public.tender_watchlist;

CREATE POLICY "Watchlist insert by branch or admin"
  ON public.tender_watchlist FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.role = 'admin' OR p.unit_kerja = tender_watchlist.unit_kerja)
    )
  );

CREATE POLICY "Watchlist update by owner branch or admin"
  ON public.tender_watchlist FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.role = 'admin' OR p.unit_kerja = tender_watchlist.unit_kerja)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.role = 'admin' OR p.unit_kerja = tender_watchlist.unit_kerja)
    )
  );

CREATE POLICY "Watchlist delete by owner branch or admin"
  ON public.tender_watchlist FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.role = 'admin' OR p.unit_kerja = tender_watchlist.unit_kerja)
    )
  );

-- 3. RUP_WATCHLIST (new) ----------------------------------------

CREATE TABLE IF NOT EXISTS public.rup_watchlist (
  id                 SERIAL PRIMARY KEY,
  kd_rup             TEXT NOT NULL UNIQUE,
  nama_paket         TEXT,
  nama_klpd          TEXT,
  pagu               DOUBLE PRECISION,
  status_internal    TEXT DEFAULT 'Dipantau',
  catatan_internal   TEXT,
  unit_kerja         TEXT,
  unit_kerja_region  TEXT,
  claimed_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  claimed_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rup_watchlist_kd_rup ON public.rup_watchlist(kd_rup);

ALTER TABLE public.rup_watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "RUP watchlist read all"
  ON public.rup_watchlist FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "RUP watchlist insert by branch or admin"
  ON public.rup_watchlist FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.role = 'admin' OR p.unit_kerja = rup_watchlist.unit_kerja)
    )
  );

CREATE POLICY "RUP watchlist update by owner branch or admin"
  ON public.rup_watchlist FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.role = 'admin' OR p.unit_kerja = rup_watchlist.unit_kerja)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.role = 'admin' OR p.unit_kerja = rup_watchlist.unit_kerja)
    )
  );

CREATE POLICY "RUP watchlist delete by owner branch or admin"
  ON public.rup_watchlist FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.role = 'admin' OR p.unit_kerja = rup_watchlist.unit_kerja)
    )
  );

-- updated_at trigger. Define helper locally so this file doesn't depend on
-- tender_watchlist_setup.sql being run first.
CREATE OR REPLACE FUNCTION public.set_updated_at_now()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS rup_watchlist_updated_at ON public.rup_watchlist;
CREATE TRIGGER rup_watchlist_updated_at
  BEFORE UPDATE ON public.rup_watchlist
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at_now();

DROP TRIGGER IF EXISTS rup_watchlist_fill_region ON public.rup_watchlist;
CREATE TRIGGER rup_watchlist_fill_region
  BEFORE INSERT OR UPDATE OF unit_kerja ON public.rup_watchlist
  FOR EACH ROW EXECUTE PROCEDURE public.fill_watchlist_region();

-- Realtime — ignore if publication missing or already includes table.
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.rup_watchlist;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'realtime publication skipped: %', SQLERRM;
END $$;

-- =============================================================
-- DONE. Run supabase/seed_branch_users.sql next to seed accounts.
-- =============================================================
