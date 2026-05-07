-- Contact Persons table + RLS
-- Stores divisi-grouped contact cards (FITI/FLP/SDA/Manajemen/Lainnya)

CREATE TABLE IF NOT EXISTS public.contact_persons (
    id            BIGSERIAL PRIMARY KEY,
    nama          TEXT NOT NULL,
    jabatan       TEXT,
    divisi        TEXT NOT NULL CHECK (divisi IN ('FITI','FLP','SDA','Manajemen','Lainnya')),
    no_wa         TEXT,
    email         TEXT,
    foto_url      TEXT,
    catatan       TEXT,
    created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_persons_divisi   ON public.contact_persons(divisi);
CREATE INDEX IF NOT EXISTS idx_contact_persons_created  ON public.contact_persons(created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_contact_persons_updated_at ON public.contact_persons;
CREATE TRIGGER trg_contact_persons_updated_at
    BEFORE UPDATE ON public.contact_persons
    FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

-- RLS
ALTER TABLE public.contact_persons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contact_persons_select ON public.contact_persons;
CREATE POLICY contact_persons_select ON public.contact_persons
    FOR SELECT TO public
    USING (true);

DROP POLICY IF EXISTS contact_persons_insert ON public.contact_persons;
CREATE POLICY contact_persons_insert ON public.contact_persons
    FOR INSERT TO public
    WITH CHECK (true);

DROP POLICY IF EXISTS contact_persons_update ON public.contact_persons;
CREATE POLICY contact_persons_update ON public.contact_persons
    FOR UPDATE TO public
    USING (true)
    WITH CHECK (true);

-- Only admin can delete
DROP POLICY IF EXISTS contact_persons_delete ON public.contact_persons;
CREATE POLICY contact_persons_delete ON public.contact_persons
    FOR DELETE TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );
