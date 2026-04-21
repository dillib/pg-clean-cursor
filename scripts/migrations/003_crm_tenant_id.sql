-- CRM tenant isolation: tenant_id on internal sales / support tables.
-- Apply: psql $DATABASE_URL -f scripts/migrations/003_crm_tenant_id.sql
-- Idempotent (IF NOT EXISTS).

BEGIN;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS tenant_id text NOT NULL DEFAULT 'default';
ALTER TABLE customer_accounts ADD COLUMN IF NOT EXISTS tenant_id text NOT NULL DEFAULT 'default';
ALTER TABLE account_activities ADD COLUMN IF NOT EXISTS tenant_id text NOT NULL DEFAULT 'default';
ALTER TABLE next_best_actions ADD COLUMN IF NOT EXISTS tenant_id text NOT NULL DEFAULT 'default';
ALTER TABLE demo_instances ADD COLUMN IF NOT EXISTS tenant_id text NOT NULL DEFAULT 'default';
ALTER TABLE persona_templates ADD COLUMN IF NOT EXISTS tenant_id text NOT NULL DEFAULT 'default';
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS tenant_id text NOT NULL DEFAULT 'default';
ALTER TABLE platform_metrics ADD COLUMN IF NOT EXISTS tenant_id text NOT NULL DEFAULT 'default';

CREATE INDEX IF NOT EXISTS idx_leads_tenant ON leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_email ON leads(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_customer_accounts_tenant ON customer_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_account_activities_tenant ON account_activities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_next_best_actions_tenant ON next_best_actions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_demo_instances_tenant ON demo_instances(tenant_id);
CREATE INDEX IF NOT EXISTS idx_persona_templates_tenant ON persona_templates(tenant_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_tenant ON support_tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_platform_metrics_tenant ON platform_metrics(tenant_id);

COMMIT;
