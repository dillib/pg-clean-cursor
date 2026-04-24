/**
 * runSqlMigrations — coverage for the lightweight SQL migration runner.
 *
 * Source under test: server/db/migrate.ts
 *
 * Mocks:
 *   - `../../server/db` so we can supply a fake `pool` whose `query()` and
 *     `connect()` are vi.fn()s. The fake client returned by `connect()`
 *     exposes `query` + `release` to mirror pg.PoolClient.
 *   - `node:fs/promises` (via `fs/promises`, the path the source imports) so
 *     `readdir` and `readFile` return controlled fixtures without touching
 *     the real filesystem.
 *   - `../../server/logger` to silence noisy info/error logs during tests.
 *
 * Mapping to ticket-#0009 behaviour table is noted on each `it(...)`.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── pool / db mock ────────────────────────────────────────────────────────
const poolQueryMock = vi.fn();
const clientQueryMock = vi.fn();
const clientReleaseMock = vi.fn();
const poolConnectMock = vi.fn(async () => ({
  query: clientQueryMock,
  release: clientReleaseMock,
}));

vi.mock("../../server/db", () => ({
  pool: {
    query: (...args: unknown[]) => poolQueryMock(...args),
    connect: (...args: unknown[]) => poolConnectMock(...args),
  },
}));

// ─── fs/promises mock ──────────────────────────────────────────────────────
const readdirMock = vi.fn();
const readFileMock = vi.fn();

vi.mock("fs/promises", () => ({
  readdir: (...args: unknown[]) => readdirMock(...args),
  readFile: (...args: unknown[]) => readFileMock(...args),
}));

// ─── logger mock (silence noise) ───────────────────────────────────────────
vi.mock("../../server/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

// Import AFTER vi.mock so the runner binds to the mocked pool/fs/logger.
import { runSqlMigrations } from "../../server/db/migrate";

describe("runSqlMigrations()", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    poolQueryMock.mockReset();
    clientQueryMock.mockReset();
    clientReleaseMock.mockReset();
    poolConnectMock.mockClear();
    poolConnectMock.mockImplementation(async () => ({
      query: clientQueryMock,
      release: clientReleaseMock,
    }));
    readdirMock.mockReset();
    readFileMock.mockReset();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  // Behaviour #8
  it("is a no-op in NODE_ENV=test without { force: true }", async () => {
    process.env.NODE_ENV = "test";

    const result = await runSqlMigrations();

    expect(result).toEqual({ applied: [], skipped: [] });
    expect(poolQueryMock).not.toHaveBeenCalled();
    expect(poolConnectMock).not.toHaveBeenCalled();
    expect(readdirMock).not.toHaveBeenCalled();
    expect(readFileMock).not.toHaveBeenCalled();
  });

  // Behaviour #9
  it("force-applies a new SQL file in test env: runs BEGIN → SQL → INSERT → COMMIT and records the filename", async () => {
    process.env.NODE_ENV = "test";

    // Pool-level queries: ensureMigrationsTable() (CREATE), then SELECT applied.
    poolQueryMock.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // CREATE
    poolQueryMock.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT

    readdirMock.mockResolvedValueOnce(["001_audit_logs_append_only.sql", "README.md"]);
    readFileMock.mockResolvedValueOnce("CREATE TRIGGER fake_trigger ...;");

    // Client queries inside the transaction: BEGIN, SQL body, INSERT, COMMIT.
    clientQueryMock.mockResolvedValue({ rows: [], rowCount: 0 });

    const result = await runSqlMigrations({ force: true });

    expect(result.applied).toEqual(["001_audit_logs_append_only.sql"]);
    expect(result.skipped).toEqual([]);

    // README.md is filtered out → only the one .sql file was read.
    expect(readFileMock).toHaveBeenCalledTimes(1);
    expect(readFileMock.mock.calls[0][1]).toBe("utf8");

    // pool.connect() was called exactly once for that file.
    expect(poolConnectMock).toHaveBeenCalledTimes(1);

    // Inside the transaction we see BEGIN → SQL body → INSERT → COMMIT in order.
    const calls = clientQueryMock.mock.calls;
    expect(calls.length).toBe(4);
    expect(calls[0][0]).toBe("BEGIN");
    expect(calls[1][0]).toBe("CREATE TRIGGER fake_trigger ...;");
    expect(calls[2][0]).toMatch(/INSERT INTO _pt_sql_migrations/);
    expect(calls[2][1]).toEqual(["001_audit_logs_append_only.sql"]);
    expect(calls[3][0]).toBe("COMMIT");

    // Client must always be released.
    expect(clientReleaseMock).toHaveBeenCalledTimes(1);
  });

  // Behaviour #10
  it("skips files already recorded in _pt_sql_migrations and does not open a connection for them", async () => {
    // We need to be OUTSIDE the test-env early-return AND not pass force, so
    // the already-applied set is consulted. Stub NODE_ENV to "production".
    process.env.NODE_ENV = "production";

    // ensureMigrationsTable() CREATE, then SELECT returns one already-applied filename.
    poolQueryMock.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // CREATE
    poolQueryMock.mockResolvedValueOnce({
      rows: [{ filename: "001_audit_logs_append_only.sql" }],
      rowCount: 1,
    }); // SELECT

    readdirMock.mockResolvedValueOnce(["001_audit_logs_append_only.sql"]);

    const result = await runSqlMigrations();

    expect(result.applied).toEqual([]);
    expect(result.skipped).toEqual(["001_audit_logs_append_only.sql"]);

    // Skipped path: we never read the file content, never opened a client,
    // never issued BEGIN/SQL/COMMIT.
    expect(readFileMock).not.toHaveBeenCalled();
    expect(poolConnectMock).not.toHaveBeenCalled();
    expect(clientQueryMock).not.toHaveBeenCalled();
    expect(clientReleaseMock).not.toHaveBeenCalled();
  });

  // Behaviour #11
  it("rolls back and rejects when a SQL file throws; INSERT INTO _pt_sql_migrations is NOT executed", async () => {
    process.env.NODE_ENV = "test";

    poolQueryMock.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // CREATE
    poolQueryMock.mockResolvedValueOnce({ rows: [], rowCount: 0 }); // SELECT

    readdirMock.mockResolvedValueOnce(["001_audit_logs_append_only.sql"]);
    readFileMock.mockResolvedValueOnce("THIS WILL EXPLODE;");

    const sqlError = new Error("syntax error at or near \"EXPLODE\"");

    // BEGIN succeeds; the SQL body throws; ROLLBACK then succeeds. We sequence
    // these via the call order, NOT by inspecting the SQL string, so the test
    // is robust to whitespace changes in the source.
    let call = 0;
    clientQueryMock.mockImplementation(async () => {
      call++;
      if (call === 1) return { rows: [], rowCount: 0 }; // BEGIN
      if (call === 2) throw sqlError;                    // SQL body
      if (call === 3) return { rows: [], rowCount: 0 }; // ROLLBACK
      throw new Error(`unexpected client.query call #${call}`);
    });

    await expect(runSqlMigrations({ force: true })).rejects.toBe(sqlError);

    // Order: BEGIN → SQL → ROLLBACK. No COMMIT. No INSERT INTO _pt_sql_migrations.
    const calls = clientQueryMock.mock.calls;
    expect(calls.length).toBe(3);
    expect(calls[0][0]).toBe("BEGIN");
    expect(calls[1][0]).toBe("THIS WILL EXPLODE;");
    expect(calls[2][0]).toBe("ROLLBACK");

    const allSql = calls.map(c => String(c[0])).join("\n");
    expect(allSql).not.toMatch(/INSERT INTO _pt_sql_migrations/);
    expect(allSql).not.toContain("COMMIT");

    // Client is still released even on failure (the finally block).
    expect(clientReleaseMock).toHaveBeenCalledTimes(1);
  });
});
