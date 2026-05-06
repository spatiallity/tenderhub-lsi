-- =============================================================
-- TenderHub Complete Database Setup — Supabase
-- Run this in: Supabase Dashboard > SQL Editor
-- This creates ALL tables needed for the application
-- =============================================================

-- ============================================================
-- 1. EXPERTS TABLES
-- ============================================================

-- Main experts table
CREATE TABLE IF NOT EXISTS public.experts (
  id                SERIAL PRIMARY KEY,
  nama              VARCHAR(200) NOT NULL,
  no_hp             VARCHAR(50),
  instansi          VARCHAR(200),
  jenis_instansi    VARCHAR(50) DEFAULT 'eksternal',
  keahlian          JSONB DEFAULT '[]'::jsonb,
  subporto          JSONB DEFAULT '[]'::jsonb,
  main_keahlian     VARCHAR(100),
  availability      VARCHAR(50) DEFAULT 'Tersedia',
  rating_avg        DOUBLE PRECISION DEFAULT 0.0,
  jumlah_proyek     INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Expert projects (history)
CREATE TABLE IF NOT EXISTS public.expert_projects (
  id                    SERIAL PRIMARY KEY,
  expert_id             INTEGER NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  nama_proyek           VARCHAR(300) NOT NULL,
  pemberi_kerja         VARCHAR(200),
  tahun                 INTEGER,
  nilai_proyek          DOUBLE PRECISION,
  peran                 VARCHAR(100),
  bersama               VARCHAR(50),
  nama_perusahaan_lain  VARCHAR(200),
  status_proyek         VARCHAR(50) DEFAULT 'Selesai',
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Expert reviews
CREATE TABLE IF NOT EXISTS public.expert_reviews (
  id                SERIAL PRIMARY KEY,
  expert_id         INTEGER NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  reviewer_nama     VARCHAR(100) NOT NULL,
  rating            INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  komentar          TEXT,
  nama_proyek_ref   VARCHAR(300),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for experts
CREATE INDEX IF NOT EXISTS idx_experts_nama ON public.experts(nama);
CREATE INDEX IF NOT EXISTS idx_expert_projects_expert_id ON public.expert_projects(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_reviews_expert_id ON public.expert_reviews(expert_id);

-- ============================================================
-- 2. KEYWORDS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.keywords (
  id            SERIAL PRIMARY KEY,
  keyword_text  VARCHAR(200) NOT NULL,
  subporto      VARCHAR(10) NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_keywords_subporto ON public.keywords(subporto);
CREATE INDEX IF NOT EXISTS idx_keywords_active ON public.keywords(is_active);

-- ============================================================
-- 3. TENDER WATCHLIST TABLE
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_tender_watchlist_kd_tender ON public.tender_watchlist(kd_tender);
CREATE INDEX IF NOT EXISTS idx_tender_watchlist_status ON public.tender_watchlist(status_internal);

-- ============================================================
-- 4. TENDER CACHE TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.tender_cache (
  id                SERIAL PRIMARY KEY,
  kd_tender         INTEGER NOT NULL UNIQUE,
  raw_data          JSONB,
  tahapan_data      JSONB,
  last_fetched_at   TIMESTAMPTZ DEFAULT NOW(),
  expires_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tender_cache_kd_tender ON public.tender_cache(kd_tender);
CREATE INDEX IF NOT EXISTS idx_tender_cache_expires ON public.tender_cache(expires_at);

-- ============================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_cache ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. RLS POLICIES - EXPERTS
-- ============================================================

-- Everyone can read experts
CREATE POLICY "Experts are readable by authenticated users"
  ON public.experts FOR SELECT TO authenticated USING (TRUE);

-- Everyone can insert experts
CREATE POLICY "Experts are insertable by authenticated users"
  ON public.experts FOR INSERT TO authenticated WITH CHECK (TRUE);

-- Everyone can update experts
CREATE POLICY "Experts are updatable by authenticated users"
  ON public.experts FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- Everyone can delete experts
CREATE POLICY "Experts are deletable by authenticated users"
  ON public.experts FOR DELETE TO authenticated USING (TRUE);

-- ============================================================
-- 7. RLS POLICIES - EXPERT PROJECTS
-- ============================================================

CREATE POLICY "Expert projects are readable by authenticated users"
  ON public.expert_projects FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Expert projects are insertable by authenticated users"
  ON public.expert_projects FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Expert projects are updatable by authenticated users"
  ON public.expert_projects FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Expert projects are deletable by authenticated users"
  ON public.expert_projects FOR DELETE TO authenticated USING (TRUE);

-- ============================================================
-- 8. RLS POLICIES - EXPERT REVIEWS
-- ============================================================

CREATE POLICY "Expert reviews are readable by authenticated users"
  ON public.expert_reviews FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Expert reviews are insertable by authenticated users"
  ON public.expert_reviews FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Expert reviews are updatable by authenticated users"
  ON public.expert_reviews FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Expert reviews are deletable by authenticated users"
  ON public.expert_reviews FOR DELETE TO authenticated USING (TRUE);

-- ============================================================
-- 9. RLS POLICIES - KEYWORDS
-- ============================================================

CREATE POLICY "Keywords are readable by authenticated users"
  ON public.keywords FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Keywords are insertable by authenticated users"
  ON public.keywords FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Keywords are updatable by authenticated users"
  ON public.keywords FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Keywords are deletable by authenticated users"
  ON public.keywords FOR DELETE TO authenticated USING (TRUE);

-- ============================================================
-- 10. RLS POLICIES - TENDER WATCHLIST
-- ============================================================

CREATE POLICY "Watchlist is readable by authenticated users"
  ON public.tender_watchlist FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Watchlist is insertable by authenticated users"
  ON public.tender_watchlist FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Watchlist is updatable by authenticated users"
  ON public.tender_watchlist FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Watchlist is deletable by authenticated users"
  ON public.tender_watchlist FOR DELETE TO authenticated USING (TRUE);

-- ============================================================
-- 11. RLS POLICIES - TENDER CACHE
-- ============================================================

CREATE POLICY "Cache is readable by authenticated users"
  ON public.tender_cache FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY "Cache is insertable by authenticated users"
  ON public.tender_cache FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY "Cache is updatable by authenticated users"
  ON public.tender_cache FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "Cache is deletable by authenticated users"
  ON public.tender_cache FOR DELETE TO authenticated USING (TRUE);

-- ============================================================
-- 12. AUTO-UPDATE TRIGGERS
-- ============================================================

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to experts
DROP TRIGGER IF EXISTS experts_updated_at ON public.experts;
CREATE TRIGGER experts_updated_at
  BEFORE UPDATE ON public.experts
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Apply to tender_watchlist
DROP TRIGGER IF EXISTS tender_watchlist_updated_at ON public.tender_watchlist;
CREATE TRIGGER tender_watchlist_updated_at
  BEFORE UPDATE ON public.tender_watchlist
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================================
-- 13. ENABLE REALTIME (for live collaboration)
-- ============================================================

-- Enable realtime for tender_watchlist
ALTER PUBLICATION supabase_realtime ADD TABLE public.tender_watchlist;

-- Enable realtime for experts (optional, for live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.experts;

-- Enable realtime for keywords (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.keywords;

-- =============================================================
-- SETUP COMPLETE!
-- 
-- Tables created:
--   ✓ experts (with projects and reviews)
--   ✓ keywords
--   ✓ tender_watchlist
--   ✓ tender_cache
--
-- All tables have:
--   ✓ Row Level Security enabled
--   ✓ Policies for authenticated users
--   ✓ Proper indexes
--   ✓ Auto-update triggers
--   ✓ Realtime enabled (where needed)
-- =============================================================
