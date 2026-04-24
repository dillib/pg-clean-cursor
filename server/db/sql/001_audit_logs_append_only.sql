-- Migration 001: enforce append-only on audit_logs at the database level.
--
-- Problem: the audit-service.ts hash chain detects tampering AFTER the fact,
-- but anyone with DB write access (e.g. a misconfigured connection string,
-- compromised app credentials, future ORM bug) can still UPDATE/DELETE rows.
-- Regulator-grade audit (EU Battery Reg Article 65, India BWM Rules) requires
-- DB-level immutability so the audit chain is provably untouched.
--
-- Solution: BEFORE UPDATE/DELETE trigger that raises an exception. Even
-- superusers calling DELETE will be blocked unless the trigger is explicitly
-- disabled (which is itself an audit event in any sensible deploy).
--
-- Idempotent: run on every server startup. DROP IF EXISTS before CREATE.

-- Drop existing first so re-runs don't fail when the function signature changes.
DROP TRIGGER IF EXISTS audit_logs_no_modify ON audit_logs;
DROP FUNCTION IF EXISTS audit_logs_block_modify();

CREATE FUNCTION audit_logs_block_modify() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION
    'audit_logs is append-only — % forbidden by trigger audit_logs_no_modify (chain integrity)',
    TG_OP
    USING HINT = 'If you genuinely need to remove logs (legal hold, GDPR erasure), drop the trigger explicitly within a transaction, perform the operation, log it elsewhere, and re-create the trigger.',
          ERRCODE = 'check_violation';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_no_modify
  BEFORE UPDATE OR DELETE ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION audit_logs_block_modify();
