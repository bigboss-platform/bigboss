# BigBoss — Master Architecture Document

**Version:** 1.0  
**Status:** Official  
**Last updated:** 2026-04-15

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Official Terminology Glossary](#2-official-terminology-glossary)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Multi-Tenant Database Architecture](#4-multi-tenant-database-architecture)
5. [Backend Architecture — Modular Monolith](#5-backend-architecture--modular-monolith)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Authentication Strategy](#7-authentication-strategy)
8. [Infrastructure Overview](#8-infrastructure-overview)
9. [Technology Stack](#9-technology-stack)
10. [Cross-Cutting Concerns](#10-cross-cutting-concerns)

---

## 1. Platform Overview

BigBoss is a multi-tenant SaaS platform that delivers vertical-specific applications to business owners and their end users. BigBoss owns and operates the platform. Businesses subscribe to use a product. Their end users consume that product.

### Products Roadmap

| Product | Status | Description |
|---|---|---|
| **BigBoss FastFood** | In development | Order management, menus, delivery for fast food tenants |
| **BigBoss Gym** | Planned | Memberships, classes, check-ins for gym tenants |
| **BigBoss Restaurant** | Planned | Full-service dining experience for restaurant tenants |
| **BigBoss Store** | Planned | Retail and inventory management for store tenants |
| **BigBoss Dental** | Planned | Appointments and records management for dental tenants |

Each product has two surfaces:
- **End-User App** — the public-facing application used by the tenant's end users
- **Back Office** — the private administration interface used by the tenant admin

---

## 2. Official Terminology Glossary

> **Rule:** These are the only accepted terms across all documentation, code, database schemas, and communication. Using any synonym without qualification is a convention violation.

| Term | Definition | Forbidden Synonyms |
|---|---|---|
| **BigBoss** | The company and platform owner | "us", "the system", "admin" |
| **Product** | A vertical application line (FastFood, Gym, etc.) | "app", "service", "solution" |
| **Tenant** | A business that has subscribed to a BigBoss product | "customer", "client", "business", "user" |
| **Tenant Admin** | The person managing the Back Office of a tenant | "owner", "manager", "customer", "client" |
| **End User** | The person using the End-User App of a product | "user", "customer", "client" (never alone) |
| **Back Office** | The admin interface for a tenant to manage their product | "admin panel", "dashboard", "CMS" |
| **Platform Admin** | BigBoss internal interface to manage all tenants | "super admin", "global admin" |
| **Tenant Schema** | The isolated Postgres schema for a tenant's data | "tenant DB", "tenant database" |
| **Module** | A self-contained domain unit in the backend | "service", "component", "feature" (backend) |
| **Feature** | The top-level folder in the frontend for product code | never used in backend context |

### Naming in Code

```
# Database
tenants           -- table of all tenants
tenant_id         -- foreign key column name, always
end_users         -- table of end users per tenant
tenant_admins     -- table of tenant admin accounts

# API routes
/tenants/{tenant_id}/...
/end-users/{end_user_id}/...
/tenant-admins/{tenant_admin_id}/...
```

---

## 3. Monorepo Structure

All BigBoss projects live in a single monorepo managed with **Turborepo** and **pnpm workspaces**. Each project folder has its own Git remote, but they share tooling, config, and the `packages/` layer.

```
bigboss/                          ← root monorepo
│
├── docs/                         ← all architecture and process documentation
│   ├── 01-master-architecture.md
│   ├── 02-development-workflow.md
│   ├── 03-backend-conventions.md
│   └── 04-frontend-conventions.md
│
├── backend/                      ← Python FastAPI backend (own Git remote)
│   └── bigboss-api/
│
├── apps/                         ← all Next.js frontend applications
│   ├── fastfood-app/             ← FastFood End-User App (own Git remote)
│   ├── fastfood-backoffice/      ← FastFood Back Office (own Git remote)
│   ├── gym-app/                  (future)
│   ├── gym-backoffice/           (future)
│   ├── restaurant-app/           (future)
│   ├── restaurant-backoffice/    (future)
│   ├── store-app/                (future)
│   ├── store-backoffice/         (future)
│   ├── dental-app/               (future)
│   ├── dental-backoffice/        (future)
│   └── platform-admin/           ← BigBoss internal admin (own Git remote)
│
├── packages/                     ← shared code, no own Git remote
│   ├── ui/                       ← shared component library and design tokens
│   ├── api-client/               ← auto-generated TypeScript API client from OpenAPI spec
│   ├── typescript-config/        ← shared tsconfig bases
│   └── eslint-config/            ← shared ESLint rules
│
├── turbo.json
├── pnpm-workspace.yaml
├── package.json
└── .gitignore
```

### Git Remote Strategy

Each folder listed with "(own Git remote)" maps to a separate repository under the BigBoss GitHub organization:

```
github.com/bigboss-platform/bigboss-api
github.com/bigboss-platform/fastfood-app
github.com/bigboss-platform/fastfood-backoffice
github.com/bigboss-platform/platform-admin
```

The root monorepo itself also has a remote:
```
github.com/bigboss-platform/bigboss (monorepo root)
```

---

## 4. Multi-Tenant Database Architecture

### Strategy: Shared Database, Separate Schemas

BigBoss uses PostgreSQL with **one schema per tenant** inside a single database. This provides:
- Data isolation between tenants (no accidental data leaks)
- Central analytics by querying across schemas
- Simple backup and restore per tenant
- Ability to migrate a high-value tenant to a dedicated database if needed

### Schema Layout

```
PostgreSQL Database: bigboss_db
│
├── schema: public                  ← platform-level tables only
│   ├── tenants
│   ├── products
│   ├── tenant_subscriptions
│   ├── tenant_admins
│   └── audit_logs
│
├── schema: tenant_{tenant_id}      ← one per tenant, e.g. tenant_a1b2c3
│   ├── end_users
│   ├── [product-specific tables]
│   └── ...
│
└── schema: analytics               ← aggregated, anonymized data for BigBoss use
    ├── daily_order_stats
    ├── tenant_activity_summaries
    └── ...
```

### Tenant Schema Provisioning

When a new tenant is created, the platform automatically:
1. Inserts a record into `public.tenants`
2. Creates a new schema `tenant_{tenant_id}`
3. Runs product-specific migrations against that schema
4. Creates a Postgres role scoped to that schema

### Data Monetization Architecture

All data written to tenant schemas is eligible for aggregation into the `analytics` schema. This process:
- Runs as a nightly background job (Celery)
- Anonymizes or aggregates before writing to `analytics`
- Requires tenants to accept BigBoss Terms of Service that explicitly state this usage
- Must comply with GDPR and CCPA — consent flags are stored on the `tenants` table

> **Legal note:** Data monetization terms must be reviewed by legal counsel before any production tenant is onboarded.

### Migration Strategy

- **Alembic** manages all migrations
- Global migrations (public schema changes) run once
- Tenant schema migrations run across all tenant schemas during deployment
- Migration scripts must be idempotent

---

## 5. Backend Architecture — Modular Monolith

### Philosophy: Modular Monolith, Microservice-Ready

The backend is a **modular monolith**. It runs as a single deployable process, but internally it is structured so that any module can be extracted into a standalone microservice with minimal friction.

The rules that enforce this:
- Modules never import from each other's internals — only through public interfaces (`module/public.py`)
- Modules never perform cross-module database joins — they call each other's service layer
- Each module owns its own tables and never writes to another module's tables
- All inter-module communication uses typed data contracts (Pydantic schemas), not ORM objects

### Backend Folder Structure

```
backend/bigboss-api/
│
├── app/
│   ├── main.py                   ← FastAPI app factory, router registration
│   ├── core/
│   │   ├── config.py             ← env vars, settings (Pydantic BaseSettings)
│   │   ├── database.py           ← SQLAlchemy engine, session factory, schema switching
│   │   ├── security.py           ← JWT creation, verification, password hashing
│   │   ├── middleware.py         ← tenant resolution, CORS, logging
│   │   ├── exceptions.py         ← global exception handlers
│   │   └── dependencies.py       ← shared FastAPI dependencies (get_db, get_current_tenant, etc.)
│   │
│   ├── modules/
│   │   ├── tenants/              ← tenant management (platform level)
│   │   │   ├── public.py         ← public interface — the only file other modules import
│   │   │   ├── router.py
│   │   │   ├── service.py
│   │   │   ├── repository.py
│   │   │   ├── models.py
│   │   │   ├── schemas.py
│   │   │   ├── exceptions.py
│   │   │   └── dependencies.py
│   │   │
│   │   ├── auth/                 ← authentication for all actor types
│   │   ├── end-users/            ← end user accounts and profiles
│   │   ├── tenant-admins/        ← tenant admin accounts
│   │   ├── products/             ← product catalog (menus, items, categories)
│   │   ├── orders/               ← order lifecycle
│   │   ├── notifications/        ← push, email, SMS dispatching
│   │   └── analytics/            ← aggregation jobs and read models
│   │
│   └── shared/
│       ├── base_model.py         ← SQLAlchemy declarative base
│       ├── base_schema.py        ← Pydantic base schemas
│       ├── base_repository.py    ← generic CRUD repository
│       ├── enums.py              ← platform-wide enums
│       └── utils.py              ← pure utility functions
│
├── migrations/
│   ├── env.py
│   ├── global/                   ← migrations for public schema
│   └── tenant/                   ← migrations applied to every tenant schema
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
│
├── Dockerfile
├── docker-compose.yml
├── pyproject.toml
├── alembic.ini
└── .env.example
```

### Module Anatomy

Every module follows this exact internal structure:

```python
# module/public.py — THE ONLY FILE OTHER MODULES IMPORT
from .service import ModuleService
from .schemas import ModuleReadSchema, ModuleCreateSchema
from .exceptions import ModuleNotFoundException

__all__ = ["ModuleService", "ModuleReadSchema", "ModuleCreateSchema", "ModuleNotFoundException"]
```

```python
# module/router.py
from fastapi import APIRouter, Depends
from .service import ModuleService
from .schemas import ModuleReadSchema, ModuleCreateSchema
from .dependencies import get_module_service

router = APIRouter(prefix="/module-name", tags=["module-name"])

@router.get("/{id}", response_model=ModuleReadSchema)
async def get_item(id: str, service: ModuleService = Depends(get_module_service)):
    return await service.get_by_id(id)
```

```python
# module/service.py — business logic only, no HTTP context
class ModuleService:
    def __init__(self, repository: ModuleRepository):
        self._repository = repository

    async def get_by_id(self, id: str) -> ModuleReadSchema:
        entity = await self._repository.find_by_id(id)
        if entity is None:
            raise ModuleNotFoundException(id)
        return ModuleReadSchema.model_validate(entity)
```

```python
# module/repository.py — database access only, no business logic
class ModuleRepository(BaseRepository):
    async def find_by_id(self, id: str) -> Module | None:
        result = await self._session.execute(
            select(Module).where(Module.id == id)
        )
        return result.scalar_one_or_none()
```

### Microservice Extraction Path

When a module needs to become a microservice:
1. The module folder moves to its own repository as-is
2. `public.py` becomes an HTTP client wrapper instead of a direct service call
3. No other file changes — callers still import from `public.py`
4. The router registers on its own FastAPI instance

---

## 6. Frontend Architecture

### Overview

All frontend projects are **Next.js 15** with **TypeScript**, using the **App Router**. Styling is **pure CSS** — no CSS-in-JS libraries and no animation libraries are approved at this time. The team will evaluate and document approved animation libraries in a future update.

### Feature Folder Architecture

All product-specific code lives in a `feature/` folder, isolated from Next.js framework files. This means Next.js routing files (`page.tsx`, `layout.tsx`) are thin shells that import from `feature/`.

```
apps/fastfood-app/
│
├── app/                          ← Next.js App Router (framework layer only)
│   ├── (public)/
│   │   ├── page.tsx              ← imports from feature/home/containers/
│   │   └── layout.tsx
│   ├── [tenant-slug]/
│   │   ├── menu/
│   │   │   └── page.tsx          ← imports from feature/menus/containers/
│   │   └── orders/
│   │       └── page.tsx          ← imports from feature/orders/containers/
│   ├── layout.tsx
│   └── globals.css
│
├── feature/                      ← ALL product logic lives here
│   ├── menus/                    ← module: menus (plural)
│   │   ├── containers/           ← page-level components connected to state/services
│   │   │   └── menu-page.container.tsx
│   │   ├── components/           ← presentational UI components
│   │   │   ├── menu-item.component.tsx
│   │   │   └── menu-category.component.tsx
│   │   ├── styles/               ← CSS modules scoped to this module
│   │   │   ├── menu-page.style.module.css
│   │   │   └── menu-item.style.module.css
│   │   ├── interfaces/           ← TypeScript interfaces
│   │   │   └── menu-item.interface.ts
│   │   ├── enums/                ← TypeScript enums
│   │   │   └── menu-category.enum.ts
│   │   ├── constants/            ← constant values and empty object patterns
│   │   │   └── menu-item.constant.ts
│   │   ├── hooks/                ← custom React hooks
│   │   │   └── use-menu.hook.ts
│   │   ├── services/             ← HTTP calls via Next.js Server Actions
│   │   │   └── menu.service.ts
│   │   └── tests/                ← unit and integration tests for this module
│   │       └── menu-item.test.tsx
│   │
│   ├── orders/                   ← module: orders
│   ├── end-users/                ← module: end-users
│   └── shared/                   ← cross-module shared code
│       ├── components/
│       ├── hooks/
│       ├── interfaces/
│       ├── enums/
│       ├── constants/
│       ├── styles/
│       └── services/
│
├── public/
├── package.json
├── tsconfig.json
├── next.config.ts
└── .env.local.example
```

### File Naming Convention

Files inside `feature/` follow this rule:

```
{descriptive-name}.{folder-name-singular}.{extension}
```

| Folder | File Example | Full Name |
|---|---|---|
| `components/` | `menu-item.component.tsx` | component |
| `containers/` | `menu-page.container.tsx` | container |
| `styles/` | `menu-item.style.module.css` | style |
| `interfaces/` | `menu-item.interface.ts` | interface |
| `enums/` | `menu-category.enum.ts` | enum |
| `constants/` | `menu-item.constant.ts` | constant |
| `hooks/` | `use-menu.hook.ts` | hook |
| `services/` | `menu.service.ts` | service |
| `tests/` | `menu-item.test.tsx` | test |

Rules:
- All names are **English**, **singular**, **lowercase**, **hyphen-separated**
- No abbreviations — `btn` is rejected, `button` is correct
- Module folder names are **plural** (`menus/`, `orders/`, `end-users/`)
- Vertical slice folder names are **plural** (`components/`, `hooks/`)
- File descriptor names are **singular** (`menu-item`, not `menu-items`)

---

## 7. Authentication Strategy

### Actor Types

| Actor | Auth Surface | Token Type |
|---|---|---|
| End User | End-User App | JWT (access + refresh) |
| Tenant Admin | Back Office | JWT (access + refresh) |
| BigBoss Staff | Platform Admin | JWT + MFA |

### JWT Strategy

- Access token: short-lived (15 minutes), stateless
- Refresh token: long-lived (7 days), stored in `httpOnly` cookie, rotated on use
- Tokens encode: `sub` (actor id), `role` (end_user / tenant_admin / platform_admin), `tenant_id`
- The `tenant_id` in the token drives schema switching in every request

### Tenant Resolution

Every API request resolves the tenant via:
1. JWT token `tenant_id` claim (authenticated routes)
2. `X-Tenant-Slug` header or subdomain for public routes (e.g., menu browsing before login)

---

## 8. Infrastructure Overview

### Environments

| Environment | Purpose | Deploy Trigger |
|---|---|---|
| **local** | Developer machines via Docker Compose | Manual |
| **staging** | Integration testing, QA | Push to `develop` branch |
| **production** | Live tenants | Push to `main` branch (with approval) |

### Local Development Stack (Docker Compose)

```
bigboss-api         ← FastAPI app on :8000
bigboss-postgres    ← PostgreSQL 16 on :5432
bigboss-redis       ← Redis 7 on :6379
bigboss-worker      ← Celery worker
bigboss-mailhog     ← local email catcher on :8025
```

Frontend apps run directly with `pnpm dev` (no Docker needed for frontend).

---

## 9. Technology Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Backend language | Python | 3.12 | |
| Backend framework | FastAPI | latest stable | |
| ORM | SQLAlchemy | 2.x | async mode |
| Migrations | Alembic | latest stable | |
| Validation | Pydantic | v2 | |
| Task queue | Celery | latest stable | |
| Database | PostgreSQL | 16 | |
| Cache / Broker | Redis | 7 | |
| Frontend framework | Next.js | 15 | App Router |
| Frontend language | TypeScript | 5.x | strict mode |
| Styling | Pure CSS (CSS Modules) | — | No CSS-in-JS |
| Animations | Pure CSS | — | Library TBD by team |
| Monorepo | Turborepo | latest stable | |
| Package manager | pnpm | latest stable | |
| Containerization | Docker + Compose | latest stable | |
| CI/CD | GitHub Actions | — | |
| API documentation | OpenAPI (auto) | — | via FastAPI |
| Testing (backend) | pytest + pytest-asyncio | latest stable | |
| Testing (frontend) | Vitest + Testing Library | latest stable | |

---

## 10. Cross-Cutting Concerns

### Error Handling

- Backend returns RFC 7807 Problem Detail responses for all errors
- Frontend never exposes raw API error messages to end users
- All unhandled exceptions are logged with a correlation ID

### Logging

- Structured JSON logging on all backend services
- Every request logs: `tenant_id`, `actor_id`, `actor_role`, `path`, `method`, `status`, `duration_ms`
- Frontend logs errors to a centralized error tracking service (tool TBD)

### Security Baseline

- All API endpoints require authentication unless explicitly marked public
- CORS is configured per-product, not globally permissive
- All user input is validated via Pydantic before reaching the service layer
- SQL is never constructed via string concatenation — SQLAlchemy ORM or parameterized queries only
- Secrets are never committed — `.env` files are gitignored, `.env.example` is committed

### Accessibility

- All end-user apps must meet WCAG 2.1 AA as a minimum
- Semantic HTML is required — no `div` soup
- Mobile-first responsive design is required on all frontend projects
