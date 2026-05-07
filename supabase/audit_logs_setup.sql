-- Audit log: who changed what (immutable, admin-only SELECT)
-- Generic polymorphic trigger fn_audit_trigger() — attach to any table.
--
-- WARNING: drops any pre-existing public.audit_logs table and old
-- fn_audit_trigger() (older migrations defined a row-mutating BEFORE trigger
-- with the same name — incompatible with this AFTER row-logging design).

-- CASCADE drops all triggers that reference the function.
DROP FUNCTION IF EXISTS public.fn_audit_trigger() CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;

CREATE TABLE public.audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    actor_user_id   UUID,
    actor_email     TEXT,
    action          TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
    entity_table    TEXT NOT NULL,
    entity_id       TEXT,
    old_data        JSONB,
    new_data        JSONB,
    changed_fields  JSONB,
    summary         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created  ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table    ON public.audit_logs(entity_table);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor    ON public.audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity   ON public.audit_logs(entity_table, entity_id);

-- Generic audit trigger
CREATE OR REPLACE FUNCTION public.fn_audit_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_actor_id    UUID;
    v_actor_email TEXT;
    v_old         JSONB;
    v_new         JSONB;
    v_changed     JSONB := '{}'::JSONB;
    v_entity_id   TEXT;
    v_summary     TEXT;
    v_key         TEXT;
BEGIN
    v_actor_id := auth.uid();

    BEGIN
        SELECT au.email INTO v_actor_email
        FROM auth.users au
        WHERE au.id = v_actor_id;
    EXCEPTION WHEN OTHERS THEN
        v_actor_email := NULL;
    END;

    IF (TG_OP = 'DELETE') THEN
        v_old := to_jsonb(OLD);
        v_new := NULL;
        v_entity_id := COALESCE(v_old->>'id', '');
        v_summary := format('User %s deleted %s id=%s',
            COALESCE(v_actor_email,'system'), TG_TABLE_NAME, v_entity_id);
    ELSIF (TG_OP = 'INSERT') THEN
        v_old := NULL;
        v_new := to_jsonb(NEW);
        v_entity_id := COALESCE(v_new->>'id', '');
        v_summary := format('User %s created %s id=%s',
            COALESCE(v_actor_email,'system'), TG_TABLE_NAME, v_entity_id);
    ELSE
        v_old := to_jsonb(OLD);
        v_new := to_jsonb(NEW);
        v_entity_id := COALESCE(v_new->>'id', v_old->>'id', '');
        FOR v_key IN SELECT jsonb_object_keys(v_new) LOOP
            IF v_old->v_key IS DISTINCT FROM v_new->v_key THEN
                v_changed := v_changed || jsonb_build_object(
                    v_key, jsonb_build_object('old', v_old->v_key, 'new', v_new->v_key)
                );
            END IF;
        END LOOP;
        IF v_changed = '{}'::JSONB THEN
            RETURN COALESCE(NEW, OLD);
        END IF;
        v_summary := format('User %s updated %s id=%s fields=%s',
            COALESCE(v_actor_email,'system'),
            TG_TABLE_NAME,
            v_entity_id,
            (SELECT string_agg(k, ',') FROM jsonb_object_keys(v_changed) k));
    END IF;

    INSERT INTO public.audit_logs(
        actor_user_id, actor_email, action, entity_table,
        entity_id, old_data, new_data, changed_fields, summary
    ) VALUES (
        v_actor_id, v_actor_email, TG_OP, TG_TABLE_NAME,
        v_entity_id, v_old, v_new,
        CASE WHEN TG_OP = 'UPDATE' THEN v_changed ELSE NULL END,
        v_summary
    );

    RETURN COALESCE(NEW, OLD);
END $$;

-- RLS: admin-only SELECT, immutable
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_logs_select ON public.audit_logs;
CREATE POLICY audit_logs_select ON public.audit_logs
    FOR SELECT TO public
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.role = 'admin'
        )
    );

-- No INSERT/UPDATE/DELETE policies → immutable from client
-- Trigger writes via SECURITY DEFINER bypassing RLS on insert.

-- Attach triggers (only on tables that exist).
DO $$
DECLARE
    t TEXT;
    tables TEXT[] := ARRAY['tender_watchlist','experts','profiles','contact_persons'];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = t
        ) THEN
            EXECUTE format(
                'CREATE TRIGGER trg_audit_%I AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.fn_audit_trigger()',
                t, t
            );
        ELSE
            RAISE NOTICE 'Skipped audit trigger: table public.% not found', t;
        END IF;
    END LOOP;
END $$;
