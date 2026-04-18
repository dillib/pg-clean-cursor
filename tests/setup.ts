// Global test setup — sets environment variables needed before any import
process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test-secret-not-for-prod";
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgresql://localhost/photonictag_test";
process.env.AUDIT_CHAIN_HMAC_KEY = "test-hmac-key";
process.env.MASTER_ADMIN_EMAILS = "test-admin@example.com";
process.env.CONNECTOR_ENCRYPTION_KEY = process.env.CONNECTOR_ENCRYPTION_KEY ?? "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
