-- contact_persons v2: drop foto_url, allow free-form divisi (PDOS-PJL/PSD/etc)

ALTER TABLE public.contact_persons
    DROP COLUMN IF EXISTS foto_url;

-- Drop CHECK constraint on divisi so we can store any sub-porto string
-- (FITI / FLP / SDA / Manajemen / Lainnya / PDOS / PDOS-PJL / PDOS-PSD / Kepala SBU / …).
DO $$
DECLARE
    cn TEXT;
BEGIN
    SELECT con.conname INTO cn
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace ns ON ns.oid = rel.relnamespace
    WHERE ns.nspname = 'public'
      AND rel.relname = 'contact_persons'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) ILIKE '%divisi%'
    LIMIT 1;
    IF cn IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.contact_persons DROP CONSTRAINT %I', cn);
    END IF;
END $$;

-- contact_persons v3: optional sub-porto column for richer filtering.
-- We keep `divisi` for the broad bucket and add `sub_porto` for the exact LSI tag.
ALTER TABLE public.contact_persons
    ADD COLUMN IF NOT EXISTS sub_porto TEXT;

CREATE INDEX IF NOT EXISTS idx_contact_persons_sub_porto ON public.contact_persons(sub_porto);

-- RUP imports table — manual user uploads from SIRUP "Cari Paket Penyedia" excel.
-- Backend INAPROC fetch overrides imports on conflict (matched by kd_rup).
CREATE TABLE IF NOT EXISTS public.rup_imports (
    id              BIGSERIAL PRIMARY KEY,
    kd_rup          TEXT UNIQUE,
    nama_paket      TEXT,
    pagu            BIGINT,
    jenis_pengadaan TEXT,
    metode_pengadaan TEXT,
    tgl_awal_pemilihan TEXT,
    nama_klpd       TEXT,
    nama_satker     TEXT,
    lokasi          TEXT,
    provinsi        TEXT,
    kabupaten       TEXT,
    raw             JSONB,
    imported_by     UUID,
    imported_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rup_imports_kd_rup    ON public.rup_imports(kd_rup);
CREATE INDEX IF NOT EXISTS idx_rup_imports_imported  ON public.rup_imports(imported_at DESC);

ALTER TABLE public.rup_imports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rup_imports_select ON public.rup_imports;
CREATE POLICY rup_imports_select ON public.rup_imports
    FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS rup_imports_insert ON public.rup_imports;
CREATE POLICY rup_imports_insert ON public.rup_imports
    FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS rup_imports_update ON public.rup_imports;
CREATE POLICY rup_imports_update ON public.rup_imports
    FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS rup_imports_delete ON public.rup_imports;
CREATE POLICY rup_imports_delete ON public.rup_imports
    FOR DELETE TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );
