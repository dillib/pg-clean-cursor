# Photonictag

## Overview

Photonictag is an AI-powered product identity platform for Digital Product Passports (DPP). It enables businesses to create, manage, and share comprehensive product information through QR-based identities, supporting supply-chain traceability, sustainability tracking, and product authentication.

The platform provides an admin dashboard for product management and public scan pages where consumers can view Digital Product Passports by scanning QR codes.

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

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful JSON APIs under `/api/*` prefix
- **Build**: Custom esbuild script for production bundling with selective dependency bundling

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` - shared between client and server
- **Validation**: Zod schemas generated from Drizzle schemas using drizzle-zod
- **Storage Abstraction**: Interface-based storage pattern (`IStorage`) currently using in-memory implementation, designed for easy database migration

### Key Data Models
- **Products**: Digital Product Passport data including manufacturer info, materials, carbon footprint, repairability scores, warranty details, ownership history, and recycling instructions
- **Users**: Basic authentication schema with username/password
- **Conversations/Messages**: Chat functionality schema for AI interactions

### AI Integration Pattern
- OpenAI-compatible API integration via environment variables (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)
- Modular integration structure under `server/replit_integrations/` for:
  - Chat completions with conversation persistence
  - Image generation using gpt-image-1 model
  - Batch processing with rate limiting and retries
- AI endpoints for product summarization, sustainability scoring, and repair instruction generation

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
- Radix UI primitives: Accessible component foundations