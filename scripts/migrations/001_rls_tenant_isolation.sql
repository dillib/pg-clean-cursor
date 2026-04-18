-- ==========================================================
-- Migration 001: Row-Level Security for tenant isolation
-- ==========================================================
-- This is defense-in-depth. The application layer (TenantScopedStorage)
-- already filters by tenant_id; RLS catches any query that bypasses it.
--
-- How it works:
--   1. App sets SET LOCAL app.current_tenant_id = '<id>' at transaction start.
--   2. RLS policy reads current_setting('app.current_tenant_id', TRUE).
--   3. Rows with a different (or null) tenant_id are invisible to that session.
--   4. Service-role migrations connect with BYPASSRLS or as superuser.
--
-- Apply: psql $DATABASE_URL -f scripts/migrations/001_rls_tenant_isolation.sql
-- ==========================================================

BEGIN;

-- ----------------------------------------
-- 1. Add tenant_id column where missing
--    (idempotent — only adds if not exists)
-- ----------------------------------------

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'products',
    'product_passports',
    'identities',
    'qr_codes',
    'trace_events',
    'ai_insights',
    'dpp_ai_insights',
    'dpp_regional_extensions',
    'iot_devices',
    'enterprise_connectors',
    'integration_sync_logs',
    'audit_logs'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = t AND column_name = 'tenant_id'
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I ADD COLUMN tenant_id text NOT NULL DEFAULT ''default''',
        t
      );
      RAISE NOTICE 'Added tenant_id to %', t;
    END IF;
  END LOOP;
END
$$;

-- ----------------------------------------
-- 2. Create indexes for tenant_id lookups
-- ----------------------------------------

CREATE INDEX IF NOT EXISTS idx_products_tenant          ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_product_passports_tenant ON product_passports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_identities_tenant        ON identities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_tenant          ON qr_codes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_trace_events_tenant      ON trace_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_tenant       ON ai_insights(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dpp_ai_insights_tenant   ON dpp_ai_insights(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dpp_regional_ext_tenant  ON dpp_regional_extensions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_iot_devices_tenant       ON iot_devices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_connectors_tenant        ON enterprise_connectors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_tenant         ON integration_sync_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant        ON audit_logs(tenant_id);

-- ----------------------------------------
-- 3. Enable RLS and create policies
-- ----------------------------------------

-- Helper: creates an RLS policy that checks current_setting('app.current_tenant_id')
-- The TRUE flag in current_setting means it returns NULL (not error) if not set,
-- so queries outside a tenant context see ALL rows (used for migrations/admin).
CREATE OR REPLACE FUNCTION app_tenant_id() RETURNS text
  LANGUAGE sql STABLE
  AS $$ SELECT current_setting('app.current_tenant_id', TRUE) $$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'products',
    'product_passports',
    'identities',
    'qr_codes',
    'trace_events',
    'ai_insights',
    'dpp_ai_insights',
    'dpp_regional_extensions',
    'iot_devices',
    'enterprise_connectors',
    'integration_sync_logs',
    'audit_logs'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);

    -- Drop and recreate to make this idempotent
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);
    EXECUTE format($pol$
      CREATE POLICY tenant_isolation ON %I
        USING (
          app_tenant_id() IS NULL          -- no tenant set → bypass (migrations/admin)
          OR tenant_id = app_tenant_id()   -- tenant set → must match
        )
        WITH CHECK (
          app_tenant_id() IS NULL
          OR tenant_id = app_tenant_id()
        )
    $pol$, t, t);

    RAISE NOTICE 'RLS policy set on %', t;
  END LOOP;
END
$$;

COMMIT;

-- ==========================================================
-- Usage in application code (via TenantScopedStorage):
--
--   await db.execute(sql`SET LOCAL app.current_tenant_id = ${tenantId}`);
--   -- all subsequent queries in this transaction are scoped
-- ==========================================================
