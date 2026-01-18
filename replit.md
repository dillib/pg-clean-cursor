# PhotonicTag

## Overview

PhotonicTag is an AI-powered product identity platform for Digital Product Passports (DPP). Inspired by the precision of photonics — the science of light — PhotonicTag transforms identity from a printed label into a physics-rooted, tamper-proof signature.

**Brand Philosophy:** Every product deserves a secure, intelligent, and verifiable identity — one that cannot be forged, erased, or lost. PhotonicTag bridges the physical and digital worlds, enabling brands, regulators, and consumers to trust what they see, trace what they buy, and understand the full story behind every product.

**Tagline:** "Identity, at the speed of light."

The platform provides an admin dashboard for product management and public scan pages where consumers can view Digital Product Passports by scanning QR codes.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### January 2026
- **Enterprise SAP Integration**: Complete SAP connector configuration for enterprise ERP integration:
  - SAP Connector admin page with connection configuration (S/4HANA, ECC, Business One)
  - Field mapping between SAP material master fields and DPP fields
  - Sync status monitoring with products synced count and last sync time
  - Support for OData, RFC, and IDoc API types
  - Bidirectional sync options (inbound, outbound, bidirectional)
  - Sync frequency options (real-time, hourly, daily, manual)
  - Added enterpriseConnectors and integrationSyncLogs tables to schema
  - API endpoints: /api/integrations/connectors (CRUD), /test, /sync, /logs
- **AI-Generated Insights**: Complete 5-type AI insights system with fetch-or-generate pattern:
  - AI Summary: Product highlights and key features
  - AI Sustainability Analysis: Carbon footprint scoring and circularity recommendations
  - AI Repair Guide: Repairability rating, instructions, and parts availability
  - AI Circularity Score: Recyclability grade (A+ to F), material efficiency, end-of-life options
  - AI Risk Assessment: Overall risk level, data completeness %, counterfeit risk, compliance issues
- Pre-generated AI insights for all 8 demo products for immediate demo visibility
- Added CircularityScore and RiskAssessment TypeScript interfaces to schema
- Added API endpoints: /api/ai/circularity, /api/ai/risk-assessment
- **IoT Tagging System**: Complete NFC/RFID/BLE device management with 9 API endpoints, device registration, sensor readings, and scan tracking
- Added IoT Devices admin page with device type breakdown and status tracking in sidebar navigation
- Added IoT Devices tab to product detail view showing linked devices with proper filtering
- Seeded 8 realistic demo products across industries (Batteries, Textiles, IoT Devices, Packaging, EV Accessories, Consumer Electronics, Fashion Accessories, Smart Home) with linked IoT devices and stock images
- Secured all IoT write endpoints with isAuthenticated middleware
- **GTM Complete**: All 6 core categories fully implemented (DPP, QR Identity, Supply Chain Traceability, Authentication, IoT Tagging, AI Intelligence)
- Integrated brand story: "Physics-rooted identity" and "Illumination" theme throughout landing page
- Updated hero section with core messaging: "Every Product Deserves a Secure Identity"
- Added "This is not just tagging. This is illumination." CTA section
- Implemented Replit Auth integration for OAuth-based authentication (Google, GitHub, X, Apple, email)
- Created premium landing page with hero section, feature showcase, sustainability metrics, and branding
- Added protected routes showing landing page for logged-out users
- Updated sidebar with user profile display (avatar, name, email) and logout functionality
- Removed legacy username/password authentication in favor of OAuth

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
- **Auth Routes**: `/api/login`, `/api/logout`, `/api/auth/user`
- **Integration Files**: `server/replit_integrations/auth/`

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` - shared between client and server
- **Validation**: Zod schemas generated from Drizzle schemas using drizzle-zod
- **Storage Abstraction**: Interface-based storage pattern (`IStorage`) currently using in-memory implementation, designed for easy database migration

### Key Data Models
- **Products**: Comprehensive EU DPP-compliant schema with 7 categories:
  - Product Identification: name, category, modelNumber, SKU, manufacturer, address, countryOfOrigin, batch/lot numbers
  - Materials & Composition: materials list, materialBreakdown (JSONB), recycledContentPercent, recyclabilityPercent, hazardousMaterials
  - Environmental Impact: carbonFootprint, waterUsage, energyConsumption, environmentalCertifications
  - Durability & Repairability: repairabilityScore, expectedLifespanYears, sparePartsAvailable, repairInstructions, serviceCenters
  - Ownership & Lifecycle: dateOfManufacture, dateOfFirstSale, ownershipHistory
  - Compliance & Certifications: ceMarking, safetyCertifications
  - End-of-Life & Recycling: recyclingInstructions, disassemblyInstructions, hazardWarnings, takeBackPrograms
- **Users**: OAuth-based user model with Replit Auth fields (email, firstName, lastName, profileImageUrl)
- **IoT Devices**: NFC/RFID/BLE device registry with device ID, type, status, manufacturer, model, firmware version, linked product ID, and last seen timestamp
- **Enterprise Connectors**: SAP and other ERP system integrations with connector type, status, config, field mappings, and sync history
- **Integration Sync Logs**: Sync operation history with records processed/created/updated/failed counts
- **Conversations/Messages**: Chat functionality schema for AI interactions
- **Audit Logs**: Event tracking for compliance and traceability

### AI Integration Pattern
- OpenAI-compatible API integration via environment variables (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)
- Modular integration structure under `server/replit_integrations/` for:
  - Chat completions with conversation persistence
  - Image generation using gpt-image-1 model
  - Batch processing with rate limiting and retries
- AI endpoints for product summarization, sustainability scoring, and repair instruction generation

### Event-Driven Architecture
- In-process CloudEvents bus for decoupled event handling
- Event types: product.created, product.updated, qr.generated, identity.assigned, trace.recorded, ai.insights_generated
- Audit logging for all events

### QR Code System
- Server-side QR code generation using `qrcode` library
- QR codes stored as data URLs in the product record
- Public scan pages accessible at `/product/:id`

## External Dependencies

### Database
- PostgreSQL (configured via `DATABASE_URL` environment variable)
- Drizzle Kit for migrations (`npm run db:push`)

### AI Services
- OpenAI-compatible API (Replit AI Integrations)
- Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Key NPM Packages
- `drizzle-orm` / `drizzle-zod`: Database ORM and schema validation
- `@tanstack/react-query`: Server state management
- `qrcode`: QR code generation
- `openai`: AI API client
- `express` / `express-session`: HTTP server and session management
- `connect-pg-simple`: PostgreSQL session store
- `openid-client`: OpenID Connect client for Replit Auth
- Radix UI primitives: Accessible component foundations
