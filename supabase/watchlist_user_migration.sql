-- =============================================================
-- Migration: Add user_id to tender_watchlist for per-user isolation
-- Run this in: Supabase Dashboard > SQL Editor
-- =============================================================

-- 1. Add user_id column
ALTER TABLE public.tender_watchlist
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_tender_watchlist_user_id
  ON public.tender_watchlist(user_id);

-- 2. Add unique constraint so upsert works on (kd_tender, user_id)
ALTER TABLE public.tender_watchlist
  DROP CONSTRAINT IF EXISTS tender_watchlist_kd_tender_user_id_key;

ALTER TABLE public.tender_watchlist
  ADD CONSTRAINT tender_watchlist_kd_tender_user_id_key
  UNIQUE (kd_tender, user_id);

-- 3. Drop old permissive policies
DROP POLICY IF EXISTS "Watchlist is readable by authenticated users" ON public.tender_watchlist;
DROP POLICY IF EXISTS "Watchlist is insertable by authenticated users" ON public.tender_watchlist;
DROP POLICY IF EXISTS "Watchlist is updatable by authenticated users" ON public.tender_watchlist;
DROP POLICY IF EXISTS "Watchlist is deletable by authenticated users" ON public.tender_watchlist;

-- 4. New per-user RLS policies
CREATE POLICY "Users can view own watchlist"
  ON public.tender_watchlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist"
  ON public.tender_watchlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist"
  ON public.tender_watchlist FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist"
  ON public.tender_watchlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Remove orphan rows (no user_id) — they are no longer accessible anyway
DELETE FROM public.tender_watchlist WHERE user_id IS NULL;

-- =============================================================
-- NOTES:
-- - Setelah migration, setiap user hanya melihat watchlist miliknya sendiri
-- - Status, catatan, dan PIC tidak akan saling terlihat antar user
-- - Realtime events hanya dikirim ke user yang bersangkutan (via RLS)
-- =============================================================
