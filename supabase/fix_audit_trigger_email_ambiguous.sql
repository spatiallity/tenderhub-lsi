-- ============================================================================
-- FIX AUDIT TRIGGER - Email Ambiguous Error
-- This fixes the "column reference 'email' is ambiguous" error
-- ============================================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS audit_current_user() CASCADE;
DROP FUNCTION IF EXISTS fn_audit_trigger() CASCADE;

-- Recreate audit_current_user with explicit column references
CREATE OR REPLACE FUNCTION audit_current_user()
RETURNS TABLE (uid uuid, user_email text, user_name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_uid uuid;
BEGIN
    v_uid := auth.uid();
    
    RETURN QUERY
    SELECT 
        v_uid,
        COALESCE(
            (SELECT p.email FROM public.profiles p WHERE p.id = v_uid),
            (SELECT u.email FROM auth.users u WHERE u.id = v_uid)
        ) AS user_email,
        (SELECT p.name FROM public.profiles p WHERE p.id = v_uid) AS user_name;
END;
$$;

-- Recreate audit trigger function
CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_uid uuid;
    v_email text;
    v_name text;
BEGIN
    -- Get current user info
    SELECT uid, user_email, user_name
    INTO v_uid, v_email, v_name
    FROM public.audit_current_user();
    
    -- Set audit fields on INSERT
    IF (TG_OP = 'INSERT') THEN
        NEW.created_by := v_uid;
        NEW.created_at := NOW();
        NEW.updated_by := v_uid;
        NEW.updated_at := NOW();
        RETURN NEW;
    END IF;
    
    -- Set audit fields on UPDATE
    IF (TG_OP = 'UPDATE') THEN
        NEW.updated_by := v_uid;
        NEW.updated_at := NOW();
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$;

-- Recreate triggers for tables that have audit fields
-- (Only if the tables have created_by, updated_by columns)

-- Check if tender_watchlist has audit columns
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tender_watchlist' 
        AND column_name = 'created_by'
    ) THEN
        DROP TRIGGER IF EXISTS trg_audit_tender_watchlist ON tender_watchlist;
        CREATE TRIGGER trg_audit_tender_watchlist
            BEFORE INSERT OR UPDATE ON tender_watchlist
            FOR EACH ROW
            EXECUTE FUNCTION fn_audit_trigger();
    END IF;
END $$;

-- Check if experts has audit columns
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'experts' 
        AND column_name = 'created_by'
    ) THEN
        DROP TRIGGER IF EXISTS trg_audit_experts ON experts;
        CREATE TRIGGER trg_audit_experts
            BEFORE INSERT OR UPDATE ON experts
            FOR EACH ROW
            EXECUTE FUNCTION fn_audit_trigger();
    END IF;
END $$;

-- Check if expert_projects has audit columns
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'expert_projects' 
        AND column_name = 'created_by'
    ) THEN
        DROP TRIGGER IF EXISTS trg_audit_expert_projects ON expert_projects;
        CREATE TRIGGER trg_audit_expert_projects
            BEFORE INSERT OR UPDATE ON expert_projects
            FOR EACH ROW
            EXECUTE FUNCTION fn_audit_trigger();
    END IF;
END $$;

-- Verify the fix
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
    AND action_statement LIKE '%fn_audit_trigger%'
ORDER BY event_object_table;

-- ============================================================================
-- NOTES:
-- ============================================================================
-- This script:
-- 1. Drops existing audit functions
-- 2. Recreates them with explicit table aliases (p.email, u.email)
-- 3. Recreates triggers only if tables have audit columns
-- 4. Verifies the triggers are created
--
-- After running this, the "email is ambiguous" error should be fixed
-- ============================================================================
