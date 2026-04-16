# BigBoss Platform

Multi-tenant SaaS platform delivering vertical-specific applications to business owners and their end users.

## Products

| Product | Status |
|---|---|
| FastFood | In development |
| Gym | Planned |
| Restaurant | Planned |
| Store | Planned |
| Dental | Planned |

## Documentation

| Document | Description |
|---|---|
| [01 — Master Architecture](docs/01-master-architecture.md) | Platform overview, terminology glossary, monorepo structure, DB architecture, auth strategy, full tech stack |
| [02 — Development Workflow](docs/02-development-workflow.md) | Local setup, branching strategy, commit conventions, PR process, staging and production deployment |
| [03 — Backend Conventions](docs/03-backend-conventions.md) | Python/FastAPI naming rules, module structure, API design, ORM rules, error handling, forbidden patterns |
| [04 — Frontend Conventions](docs/04-frontend-conventions.md) | Next.js/TypeScript rules, feature folder architecture, CSS conventions, component rules, testing rules |
| [05 — FastFood Product Spec](docs/05-fastfood-product-spec.md) | Full spec: screens, flows, animations, entities, API contracts, back office modules, data strategy |
| [06 — Local Environment and Testing](docs/06-local-environment-and-testing.md) | Dev Containers setup, zero local dependencies, three-layer testing strategy, gate system, CI pipeline, E2E critical paths |

## Quick Start

See [02 — Development Workflow](docs/02-development-workflow.md) for full setup instructions.

## Terminology

Never use "customer", "client", or "user" without a qualifier.

| Term | Means |
|---|---|
| Tenant | A business subscribed to a BigBoss product |
| Tenant Admin | The person managing the Back Office |
| End User | The person using the End-User App |

Full glossary in [01 — Master Architecture § Terminology](docs/01-master-architecture.md#2-official-terminology-glossary).
