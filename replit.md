# PhotonicTag

## Overview

PhotonicTag is an AI-powered product identity platform that provides Digital Product Passports (DPP). It transforms product identity into a physics-rooted, tamper-proof signature, bridging physical and digital worlds for enhanced trust, traceability, and transparency. The platform includes an admin dashboard for product management and public scan pages for consumers to view DPPs via QR codes. Its core mission is to ensure secure, intelligent, and verifiable identities for every product, enabling brands, regulators, and consumers to trust product information, trace origins, and understand product lifecycles.

**Brand Philosophy:** Every product deserves a secure, intelligent, and verifiable identity — one that cannot be forged, erased, or lost. PhotonicTag bridges the physical and digital worlds, enabling brands, regulators, and consumers to trust what they see, trace what they buy, and understand the full story behind every product.

**Tagline:** "Identity, at the speed of light."

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled using Vite
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for theming (light/dark mode support)
- **Layout**: Admin dashboard with collapsible sidebar navigation pattern
- **Authentication**: Protected routes with landing page for unauthenticated users

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful JSON APIs under `/api/*` prefix
- **Authentication**: Replit Auth integration with PostgreSQL session storage
- **Build**: Custom esbuild script for production bundling with selective dependency bundling

### Authentication System
- **Provider**: Replit Auth (OAuth via OpenID Connect)
- **Session Storage**: PostgreSQL via connect-pg-simple
- **User Model**: OAuth-based with email, firstName, lastName, profileImageUrl

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` - shared between client and server
- **Validation**: Zod schemas generated from Drizzle schemas using drizzle-zod
- **Storage Abstraction**: Interface-based storage pattern (`IStorage`) designed for easy database migration

### Key Features and Models
- **Products**: Comprehensive EU DPP-compliant schema including identification, materials, environmental impact, durability, ownership, compliance, and end-of-life information.
- **Internal Admin Platform**: An internal operations dashboard at `/admin/internal` providing:
    - **AI-Driven CRM**: Customer account management with AI health scoring, next-best-action generation, activity tracking, MRR tracking, and at-risk account detection.
    - **POC Proposal Generator**: Multi-language (EN/DE/FR/ES) proposal creation with legal terms, SAP integration scope, commercial terms, and signature pages. Exports to editable Word (.docx).
    - **Demo Factory**: Generates demos using industry templates and custom prompts, with per-demo credentials and shareable URLs.
    - **User Management**: CRUD for internal team members with role assignment and password management.
    - **AI Support Triage**: Intelligent ticketing with AI auto-categorization, priority suggestion, tag generation, and summary analysis.
    - **Platform Ops**: Real-time health monitoring including uptime, memory usage, and entity counts.
- **Role-Based Access**: Distinct login flows and access levels for Super Admin, Internal Team, and Demo Viewers, controlling dashboard and navigation visibility.
- **Partner Portal & Demo System**: Partner authentication, dashboard for demo product browsing, and a quick demo generator.
- **Lead Capture & CRM**: Lead management system with a public contact form, protected CRM dashboard, and metrics for lead volume, velocity, and conversion.
- **SAP Integration**: Full enterprise connector for S/4HANA, ECC, Business One. Includes real HTTP OData client (`server/services/sap-odata-client.ts`) with Basic/OAuth2/SAML auth, mock fallback, and sync scheduler. **SAP Operations** dashboard (`/integrations/sap-operations`) provides sync health gauges, run history drill-down, editable field mapping UI (SAP material master → DPP fields with transformation options), alert threshold configuration, and per-connector status monitoring. Field mappings saved via the UI are applied during actual sync runs (`applyFieldMappings()` in `sap-odata-client.ts`); sync response includes `fieldMappingsUsed` count shown in the completion toast. Demo sync history (14 runs, mixed success/failure) auto-seeded on startup when fewer than 5 logs exist.
- **Pre-Sales Assessment Lead Flow**: Contact form includes collapsible Technical Assessment step (SAP system type, deployment model, EU markets, DPP categories, compliance status, timeline, use case). CRM enhanced with assessment score badges (color-coded % fit), SAP/DPP filter chips, tabbed lead detail dialog (Contact / Assessment / Pipeline), and **next-best-action hints** — each lead row shows a contextual action suggestion (e.g. "→ Book SAP demo", "→ Send ROI analysis") computed from status, score, and SAP profile.
- **EU ESPR DPP Compliance**: Full EU ESPR tab in product editor (`product-form.tsx`) — tabbed form with Basic Info + EU ESPR tabs. EU ESPR tab covers: ESPR Reg 2024/1781 (product category, compliance status, DPP version, validity dates), CE Marking toggle, EPR Registration ID, Repairability Index, Battery Regulation 2023/1542 (battery type, state of health, carbon footprint class, recycled content Co/Li/Ni), REACH compliance (SCIP ID, SVHC present, substance list). Data stored in `dpp_regional_extensions` table (EU payload). All EU fields visible in expanded Regional Compliance section on public product scan pages.
- **AI-Generated Insights**: System providing AI Summary, Sustainability Analysis, Repair Guide, Circularity Score, and Risk Assessment for products.
- **IoT Tagging System**: Management of NFC/RFID/BLE devices, including registration, sensor readings, and scan tracking.
- **Demo Scheduling Chatbot**: Self-hosted guided booking wizard at `/book-demo`. 5-step conversational UI (name/email/company → interest area → slot picker → confirm → success). Bookings stored in `demo_bookings` table, linked to CRM leads. Confirmation email with `.ics` calendar attachment sent to the user; team notification email sent to `NOTIFY_EMAIL`. ICS files are RFC 5545 compliant and import into any calendar app. Admin "Bookings" tab added to CRM.
- **Email Service** (`server/services/email.ts`): Nodemailer-based transactional email. Requires env vars: `SMTP_HOST`, `SMTP_PORT` (default 587), `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `NOTIFY_EMAIL`. Gracefully skipped if SMTP is not configured.
- **QR Code System**: Server-side generation of QR codes stored as data URLs, linking to public product scan pages.
- **Event-Driven Architecture**: In-process CloudEvents bus for decoupled event handling and audit logging.
- **PLM Bulk Import System** (`server/routes/product-import-routes.ts`): Enterprise-grade product registration with AI-assisted data enrichment.
  - `GET /api/products/import-template` — Download pre-formatted Excel template with all DPP columns and example row.
  - `POST /api/products/bulk-import` — Upload Excel/CSV (up to 25 MB); auto-maps 50+ column aliases (EN/DE); `?preview=true` returns column mapping + first 5 rows + all mapped rows for AI.
  - `POST /api/products/bulk-import/ai-analyze` — AI enrichment endpoint: sends parsed rows to GPT-4o, returns per-row suggestions for missing DPP fields (materials, carbon footprint, repairability, warranty, recycling) with confidence scores (0–1) and reasons. Flags suspicious values. Only enriches rows with missing data.
  - `POST /api/products/bulk-import/confirmed` — Accepts user-reviewed, AI-merged rows as JSON and creates products. Called after the human review step.
  - `POST /api/products/batch` — JSON batch creation API; up to 5,000 products per call; returns 207 with per-item success/failure.
  - `POST /api/products/qr-export` — Printable HTML page with all QR codes for given product IDs or importBatchId.
  - Products schema extended with `businessUnit` (text) and `importBatchId` (text) fields.
  - **5-step import dialog** (`client/src/pages/products.tsx`): Upload → Column Map Preview → AI Review → Importing → Done.
    - Step 2 (Column Map): shows detected aliases, first 5 rows, "Import without AI" escape hatch, or "Analyse with AI" trigger.
    - Step 3 (AI Review): summary stats (total / enriched / flagged / complete); per-row review cards with amber-highlighted AI suggestions; confidence dots (green/amber/red); inline field editing; per-row accept/reject toggles; "Accept all" / "Reject all" bulk actions; auto-accepts high-confidence rows (≥0.75) as default. Only data explicitly accepted or edited by the user is committed.
  - Export QR dropdown (all / selected / filtered), Business Unit filter, multi-select checkboxes in list view.

- **Scan Intelligence System** (`server/routes.ts`, `shared/schema.ts`): Consumer engagement layer that creates the B2B2C flywheel.
  - `POST /api/products/:id/scan` — public, no auth. Records every QR scan with timestamp, country (from Accept-Language), user agent, and session ID for deduplication.
  - `GET /api/products/:id/scan-analytics` — authenticated. Returns 4 analytics datasets: stats (total/unique/last30d), recent scans, 30-day scan-by-day histogram, and product registrations. Auto-refreshes every 30s in the admin UI.
  - `POST /api/products/:id/register` — public. Consumer registers product ownership (name, email, purchase date/location, warranty activation, marketing opt-in).
  - `GET /api/products/:id/registrations` — authenticated. Lists all consumer registrations for a product.
  - Schema: `productScans` table (id, productId, scannedAt, country, userAgent, referrer, sessionId, isUnique) and `productRegistrations` table (id, productId, registeredAt, ownerName, ownerEmail, purchaseDate, purchaseLocation, warrantyActivated, marketingOptIn).
- **Consumer DPP Experience** (public scan page, `client/src/pages/public-scan.tsx`):
  - Auto-fires scan tracking on every page load (fire-and-forget, uses sessionStorage for unique visitor deduplication).
  - "Register This Product" card near the bottom of every product page — opens a dialog to capture consumer name, email, purchase details, warranty activation, marketing opt-in.
  - Registration success screen with warranty activation confirmation.
  - "Share This Passport" section with Copy link (clipboard), WhatsApp, and LinkedIn share buttons.
- **Scan Intelligence Tab** (admin product detail, `client/src/pages/product-detail.tsx`):
  - New "Scan Intelligence" tab (8th tab in product detail) showing:
    - 4 KPI cards: Total Scans, Unique Visitors, Last 30 Days, Registrations
    - CSS bar chart of daily scan volume over last 30 days
    - Recent scans timeline with country, device, and unique visitor indicator
    - Full registrations table with consumer name, email, purchase info, warranty/marketing flags

## External Dependencies

### Database
- PostgreSQL

### AI Services
- OpenAI-compatible API (Replit AI Integrations)

### Key NPM Packages
- `drizzle-orm` / `drizzle-zod`: Database ORM and schema validation
- `@tanstack/react-query`: Server state management
- `qrcode`: QR code generation
- `openai`: AI API client
- `express` / `express-session`: HTTP server and session management
- `connect-pg-simple`: PostgreSQL session store
- `openid-client`: OpenID Connect client for Replit Auth
- Radix UI primitives: Accessible component foundations
- `xlsx`, `multer`: For Excel bulk import functionality
- `pptxgenjs`: PowerPoint (.pptx) presentation generation
- `docx`: Word (.docx) document generation for POC proposals
- **Public Pages**: Presentation (/presentation) with PPT download, Product Documentation (/docs) with sidebar nav, FAQs (/faqs) with 6 categories and 45+ detailed Q&As