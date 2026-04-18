-- ==========================================================
-- Migration 002: Tenancy Drizzle sync + encryption columns
-- ==========================================================
-- This migration aligns the database with the Drizzle schema after PR-03
-- added tenantId columns to 12 tables and PR-06 added credentialsCiphertext
-- to enterprise_connectors.
--
-- It is idempotent and can be run after migration 001 (which already did
-- the tenant_id column adds + RLS policies). The IF NOT EXISTS guards make
-- it safe to run on any database state.
--
-- Apply: psql $DATABASE_URL -f scripts/migrations/002_tenancy_and_encryption.sql
-- ==========================================================

BEGIN;

-- ----------------------------------------
-- 1. tenants: dataResidencyRegion + allowedAiRegions
-- ----------------------------------------

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS data_residency_region text NOT NULL DEFAULT 'eu-west-1';

ALTER TABLE tenants
  ADD COLUMN IF NOT EXISTS allowed_ai_regions jsonb NOT NULL DEFAULT '["eu"]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_tenants_residency ON tenants(data_residency_region);

-- ----------------------------------------
-- 2. enterprise_connectors: encrypted credentials blob
-- ----------------------------------------

ALTER TABLE enterprise_connectors
  ADD COLUMN IF NOT EXISTS credentials_ciphertext text;

-- ----------------------------------------
-- 3. Ensure tenant_id exists on the 12 scoped tables
--    (identical to 001 but idempotent — safe if 001 already ran)
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
-- 4. Indexes — create if missing
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
-- 5. RLS function + policies (idempotent re-application)
-- ----------------------------------------

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

    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);
    EXECUTE format($pol$
      CREATE POLICY tenant_isolation ON %I
        USING (
          app_tenant_id() IS NULL
          OR app_tenant_id() = ''
          OR tenant_id = app_tenant_id()
        )
        WITH CHECK (
          app_tenant_id() IS NULL
          OR app_tenant_id() = ''
          OR tenant_id = app_tenant_id()
        )
    $pol$, t, t);

    RAISE NOTICE 'RLS policy refreshed on %', t;
  END LOOP;
END
$$;

COMMIT;
