# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spot is a SaaS multi-tenant booking system for barbershops/hair salons. It's an Nx 22 monorepo with a NestJS backend, two Next.js frontends, a Flutter mobile app, and shared libraries.

## Common Commands

### Development

```bash
# Start infrastructure (PostgreSQL, Redis, PgAdmin, Mailpit)
docker compose up -d

# Serve apps
npx nx serve api                  # Backend on :3000
npx nx serve web-business         # Business dashboard on :4200
npx nx serve web-marketplace      # Public marketplace on :4201

# Mobile app
cd apps/mobile-app && flutter run
```

### Database (Prisma via db-prisma lib)

```bash
npx nx prisma-generate db-prisma  # Generate Prisma Client after schema changes
npx nx prisma-migrate db-prisma   # Run migrations
npx nx prisma-studio db-prisma    # Open Prisma Studio GUI
npx nx seed db-prisma             # Seed database
```

### Testing

```bash
npx nx test <project>             # Unit tests (Jest)
npx nx e2e api-e2e                # API end-to-end (Playwright)
npx nx e2e web-business-e2e       # web-business E2E (Playwright)
npx nx e2e web-marketplace-e2e    # web-marketplace E2E (Playwright)
```

### Build & Lint

```bash
npx nx build <project>
npx nx lint <project>
npx nx run-many --target=build --all
npx nx run-many --target=lint --all
```

## Architecture

### Apps

| App | Framework | Purpose | Port |
|-----|-----------|---------|------|
| `api` | NestJS 11 | REST API with JWT auth, booking engine | 3000 |
| `web-business` | Next.js 16 / React 19 | Business owner dashboard (FullCalendar) | 4200 |
| `web-marketplace` | Next.js 16 / React 19 | Client-facing booking marketplace (SSR) | 4201 |
| `mobile-app` | Flutter 3.16+ | Cross-platform mobile app | — |

### Shared Libraries

| Lib | Import Path | Purpose |
|-----|-------------|---------|
| `db-prisma` | `@spot-monorepo/db-prisma` | Prisma ORM, schema, migrations, PrismaModule/PrismaService |
| `shared-dtos` | `@spot-monorepo/shared-dtos` | Type-safe DTOs shared between frontend and backend |
| `ui-kit` | `@spot-monorepo/ui-kit` | Reusable React component library |
| `shared` | `@spot-monorepo/shared` | Shared utilities and helpers |

### Dependency Flow

- **web-business / web-marketplace** → shared-dtos, ui-kit, shared
- **api** → db-prisma, shared-dtos
- **mobile-app** → independent (Dart, uses Dio HTTP client)

### Backend Module Structure (apps/api/src/app/)

- `auth/` — JWT + Passport authentication (login, register, token validation)
- `business/` — Multi-tenant salon management (CRUD, slug-based lookup)
- `availability/` — Weekly schedule templates, time slot availability algorithm
- `booking/` — Reservations with collision detection, status management
- `booking/notification.processor.ts` — Async email notifications via BullMQ + Redis

### Database

PostgreSQL 16 via Prisma. Schema at `libs/db-prisma/prisma/schema.prisma`.

Key models: User (with roles: SUPER_ADMIN, OWNER, STAFF, CLIENT), Business, Service, Staff, StaffService, Availability, Booking (with statuses: PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW).

### Infrastructure (docker-compose.yml)

- **PostgreSQL** :5432 — Main database
- **Redis** :6379 — BullMQ job queue for async notifications
- **PgAdmin** :5050 — Database admin UI
- **Mailpit** :1025 (SMTP) / :8025 (Web UI) — Email testing

## Code Style

- **Prettier**: singleQuote enabled
- **ESLint**: Flat config with `@nx/enforce-module-boundaries` — respect library boundaries
- **Frontend**: Tailwind CSS, React Hook Form + Zod for validation, TanStack Query for data fetching
- **Backend**: class-validator + class-transformer for DTO validation pipes
- **TypeScript path aliases** defined in `tsconfig.base.json`
