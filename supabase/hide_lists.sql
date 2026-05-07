-- Admin hide lists. Tender / RUP from INAPROC cannot be deleted upstream;
-- store blacklisted kd values here and filter on the frontend.
-- Imported RUP (rup_imports) is deletable directly via existing policies.

CREATE TABLE IF NOT EXISTS public.tender_hidden (
    kd_tender   TEXT PRIMARY KEY,
    reason      TEXT,
    hidden_by   UUID,
    hidden_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rup_hidden (
    kd_rup      TEXT PRIMARY KEY,
    reason      TEXT,
    hidden_by   UUID,
    hidden_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tender_hidden ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rup_hidden    ENABLE ROW LEVEL SECURITY;

-- All clients can read (so frontend can filter).
DROP POLICY IF EXISTS tender_hidden_select ON public.tender_hidden;
CREATE POLICY tender_hidden_select ON public.tender_hidden FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS rup_hidden_select ON public.rup_hidden;
CREATE POLICY rup_hidden_select ON public.rup_hidden FOR SELECT TO public USING (true);

-- Only admin (via profiles.role='admin') can insert/delete.
DROP POLICY IF EXISTS tender_hidden_admin_write ON public.tender_hidden;
CREATE POLICY tender_hidden_admin_write ON public.tender_hidden
    FOR ALL TO public
    USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

DROP POLICY IF EXISTS rup_hidden_admin_write ON public.rup_hidden;
CREATE POLICY rup_hidden_admin_write ON public.rup_hidden
    FOR ALL TO public
    USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
    );

-- Audit triggers (only attach if fn_audit_trigger() exists).
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_audit_trigger') THEN
        EXECUTE 'CREATE TRIGGER trg_audit_tender_hidden AFTER INSERT OR DELETE ON public.tender_hidden FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger()';
        EXECUTE 'CREATE TRIGGER trg_audit_rup_hidden    AFTER INSERT OR DELETE ON public.rup_hidden    FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger()';
    END IF;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;
