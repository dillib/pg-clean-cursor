# Ticket #0006 — Wire CSV-lite upload affordance into connectors UI

**Status:** open
**Assignee:** Architect or future Coder-Feature agent
**Created:** 2026-04-23
**Depends on:** Ticket #0005 (CSV import test coverage), PR #6 merged

## Why this ticket exists

Brief 2026-17 opportunity #3 backend shipped in PR #6 (`feat/csv-lite-connector`). A `csv` ConnectorType exists, `POST /api/integrations/connectors/:id/upload` accepts a multipart CSV/XLSX, and `csv-import-service.ts` parses + maps + inserts. The brief's success metric requires a non-SAP prospect to "create a connector, upload a CSV, see ≥1 passport rendered, all in a single demo session" — that requires a UI affordance.

This ticket adds the minimal UI work to close that loop. Backend was deferred from PR #6 because the existing connectors page (`client/src/pages/sap-connector.tsx`) is SAP-shaped and adding CSV without restructuring would balloon scope.

## Scope

1. **Make the connector-create flow accept `connectorType: "csv"`.** Today the create form is SAP-only. Add a type selector or a separate "Add CSV connector" button that creates a connector with `connectorType: "csv"`, a sensible default name, and an empty `fieldMappings` array.
2. **Add an "Upload CSV" affordance** for connectors with `connectorType === "csv"`. File picker → multipart POST to `/api/integrations/connectors/:id/upload` → toast/banner showing the response (parsed / mapped / created / updated / failed counts + first error if any).
3. **Surface field-mapping editor for CSV connectors** — reuse the SAP mapping screen (per brief). User must be able to enter `sourceField → targetField` pairs (e.g. `Product Name → productName`, `SKU → sku`, `CO2 → carbonFootprint`).
4. **Show the connector's last sync log** for CSV connectors using the existing `/api/integrations/connectors/:id/logs` endpoint.

## Out of scope

- Drag-and-drop file upload (use a plain `<input type="file" />` for v0)
- Column-header preview / smart-mapping suggestions (use raw mapping table)
- Scheduled CSV pull from SFTP / S3 (separate feature spec)
- Mapping templates / per-industry presets
- Excel formula evaluation (xlsx already handles values, not formulas)

## Acceptance criteria

- A non-SAP user can create a CSV connector, configure 3+ field mappings, upload a CSV, and see at least one product rendered on `/products` — all without leaving the connectors page.
- `npm run check` clean.
- `npm run test:e2e` green (Playwright spec covering: create CSV connector → upload sample CSV → assert success toast).
- No regression to SAP connector flow.

## Notes

- The backend POST returns `{ success, syncLogId, parsed, mapped, created, updated, failed, firstError, errors[] }` — surface enough of this in a banner/toast that the user can debug without opening DevTools.
- The brand system (Eyebrow, Mono, BrandButton, Reveal) should be used for any new sections, not raw shadcn — this is a customer-facing onboarding moment.
- Reuse `client/src/lib/queryClient.ts` `apiRequest` for the upload POST; supports FormData natively if you pass a FormData body without setting Content-Type.

## Definition of done

A demo recording: user opens `/integrations/sap` (or wherever connectors live), clicks "Add CSV connector", configures 3 mappings, drops a 10-row CSV, sees "10 imported, 0 failed" banner, navigates to `/products` and sees the new rows.
