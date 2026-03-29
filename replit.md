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
- **SAP Integration**: Full enterprise connector for S/4HANA, ECC, Business One. Includes real HTTP OData client (`server/services/sap-odata-client.ts`) with Basic/OAuth2/SAML auth, mock fallback, and sync scheduler. **SAP Operations** dashboard (`/integrations/sap-operations`) provides sync health gauges, run history drill-down, editable field mapping UI (SAP material master → DPP fields with transformation options), alert threshold configuration, and per-connector status monitoring.
- **Pre-Sales Assessment Lead Flow**: Contact form includes collapsible Technical Assessment step (SAP system type, deployment model, EU markets, DPP categories, compliance status, timeline, use case). CRM enhanced with assessment score badges, SAP/DPP filter chips, and tabbed lead detail dialog (Contact / Assessment / Pipeline).
- **EU ESPR DPP Compliance**: Full EU ESPR tab in product editor (ESPR Reg 2024/1781, EU Battery Reg 2023/1542, REACH/SCIP ID, CE marking, EPR registration, repairability index). All EU fields visible in expanded Regional Compliance section on public product scan pages.
- **AI-Generated Insights**: System providing AI Summary, Sustainability Analysis, Repair Guide, Circularity Score, and Risk Assessment for products.
- **IoT Tagging System**: Management of NFC/RFID/BLE devices, including registration, sensor readings, and scan tracking.
- **Demo Scheduling Chatbot**: Self-hosted guided booking wizard at `/book-demo`. 5-step conversational UI (name/email/company → interest area → slot picker → confirm → success). Bookings stored in `demo_bookings` table, linked to CRM leads. Confirmation email with `.ics` calendar attachment sent to the user; team notification email sent to `NOTIFY_EMAIL`. ICS files are RFC 5545 compliant and import into any calendar app. Admin "Bookings" tab added to CRM.
- **Email Service** (`server/services/email.ts`): Nodemailer-based transactional email. Requires env vars: `SMTP_HOST`, `SMTP_PORT` (default 587), `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `NOTIFY_EMAIL`. Gracefully skipped if SMTP is not configured.
- **QR Code System**: Server-side generation of QR codes stored as data URLs, linking to public product scan pages.
- **Event-Driven Architecture**: In-process CloudEvents bus for decoupled event handling and audit logging.

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