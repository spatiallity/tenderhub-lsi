-- =============================================================
-- TenderHub Watchlist & Cache Tables — Supabase Setup
-- Run this in: Supabase Dashboard > SQL Editor
-- =============================================================

-- 1. Create tender_watchlist table
CREATE TABLE IF NOT EXISTS public.tender_watchlist (
  id                    SERIAL PRIMARY KEY,
  kd_tender             INTEGER NOT NULL,
  nama_paket            VARCHAR(400),
  nama_klpd             VARCHAR(300),
  hps                   DOUBLE PRECISION,
  status_internal       VARCHAR(50) DEFAULT 'Dipantau',
  catatan_internal      TEXT,
  assigned_pic          VARCHAR(100),
  assigned_expert_ids   JSONB DEFAULT '[]'::jsonb,
  subporto_rekomendasi  VARCHAR(10),
  relevance_score       DOUBLE PRECISION,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on kd_tender for faster lookups
CREATE INDEX IF NOT EXISTS idx_tender_watchlist_kd_tender 
  ON public.tender_watchlist(kd_tender);

-- 2. Create tender_cache table
CREATE TABLE IF NOT EXISTS public.tender_cache (
  id                SERIAL PRIMARY KEY,
  kd_tender         INTEGER NOT NULL UNIQUE,
  raw_data          JSONB,
  tahapan_data      JSONB,
  last_fetched_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at        TIMESTAMPTZ
);

-- Create index on kd_tender for faster lookups
CREATE INDEX IF NOT EXISTS idx_tender_cache_kd_tender 
  ON public.tender_cache(kd_tender);

-- 3. Enable Row Level Security
ALTER TABLE public.tender_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_cache ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for tender_watchlist

-- Everyone can read watchlist
CREATE POLICY "Watchlist is readable by authenticated users"
  ON public.tender_watchlist
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Everyone can insert to watchlist
CREATE POLICY "Watchlist is insertable by authenticated users"
  ON public.tender_watchlist
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Everyone can update watchlist
CREATE POLICY "Watchlist is updatable by authenticated users"
  ON public.tender_watchlist
  FOR UPDATE
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Everyone can delete from watchlist
CREATE POLICY "Watchlist is deletable by authenticated users"
  ON public.tender_watchlist
  FOR DELETE
  TO authenticated
  USING (TRUE);

-- 5. RLS Policies for tender_cache

-- Everyone can read cache
CREATE POLICY "Cache is readable by authenticated users"
  ON public.tender_cache
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- Everyone can insert to cache
CREATE POLICY "Cache is insertable by authenticated users"
  ON public.tender_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Everyone can update cache
CREATE POLICY "Cache is updatable by authenticated users"
  ON public.tender_cache
  FOR UPDATE
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Everyone can delete from cache
CREATE POLICY "Cache is deletable by authenticated users"
  ON public.tender_cache
  FOR DELETE
  TO authenticated
  USING (TRUE);

-- 6. Auto-update updated_at for tender_watchlist
CREATE OR REPLACE FUNCTION public.handle_tender_watchlist_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tender_watchlist_updated_at ON public.tender_watchlist;
CREATE TRIGGER tender_watchlist_updated_at
  BEFORE UPDATE ON public.tender_watchlist
  FOR EACH ROW EXECUTE PROCEDURE public.handle_tender_watchlist_updated_at();

-- 7. Enable Realtime for tender_watchlist (for live sync)
ALTER PUBLICATION supabase_realtime ADD TABLE public.tender_watchlist;

-- =============================================================
-- NOTES:
-- - tender_watchlist stores user tracking data (status, notes, PIC)
-- - tender_cache stores raw tender data from INAPROC API
-- - Realtime is enabled for tender_watchlist for live collaboration
-- =============================================================
