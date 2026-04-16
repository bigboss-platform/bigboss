# BigBoss — Development Workflow Guide

**Version:** 1.0  
**Status:** Official  
**Last updated:** 2026-04-15

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Repository Setup](#2-repository-setup)
3. [Local Development — Backend](#3-local-development--backend)
4. [Local Development — Frontend](#4-local-development--frontend)
5. [Branching Strategy](#5-branching-strategy)
6. [Commit Conventions](#6-commit-conventions)
7. [Pull Request Process](#7-pull-request-process)
8. [Environment Variables](#8-environment-variables)
9. [Staging Deployment](#9-staging-deployment)
10. [Production Deployment](#10-production-deployment)
11. [Database Migrations in Each Environment](#11-database-migrations-in-each-environment)
12. [Hotfix Process](#12-hotfix-process)

---

## 1. Prerequisites

> **Local environment is fully containerized via Dev Containers. Read [06 — Local Environment and Testing](06-local-environment-and-testing.md) before this section.**

Every developer must have the following installed on their machine. Nothing else.

| Tool | Install |
|---|---|
| Git | https://git-scm.com |
| Docker Desktop | https://docker.com/products/docker-desktop |
| VS Code | https://code.visualstudio.com |
| Dev Containers extension | VS Code marketplace: `ms-vscode-remote.remote-containers` |

All other tools (Python, Poetry, Node.js, pnpm, Alembic, etc.) are installed inside the Dev Container. Developers must not install them directly on their machine.

---

## 2. Repository Setup

### Clone the monorepo

```bash
git clone git@github.com:bigboss-platform/bigboss.git
cd bigboss
```

### Install all frontend dependencies

```bash
pnpm install
```

### Set up individual app Git remotes

Each app folder tracks its own remote in addition to the monorepo root. After cloning the monorepo, link the remotes:

```bash
# Example for fastfood-app
cd apps/fastfood-app
git remote add origin git@github.com:bigboss-platform/fastfood-app.git

cd ../../backend/bigboss-api
git remote add origin git@github.com:bigboss-platform/bigboss-api.git
```

This allows each project to be pushed and pulled independently.

---

## 3. Local Development — Backend

### First-time setup

```bash
cd backend/bigboss-api

# Copy environment file
cp .env.example .env.local
# Edit .env.local with your local values (see Section 8)

# Start the infrastructure (Postgres, Redis, MailHog)
docker compose up -d bigboss-postgres bigboss-redis bigboss-mailhog

# Install Python dependencies
poetry install

# Activate virtual environment
poetry shell

# Run global migrations (public schema)
alembic upgrade head

# Start the API server with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Daily development startup

```bash
cd backend/bigboss-api
docker compose up -d bigboss-postgres bigboss-redis
poetry shell
uvicorn app.main:app --reload --port 8000
```

### Verify the API is running

- API base: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- MailHog (email catcher): http://localhost:8025

### Run backend tests

```bash
# All tests
pytest

# Specific module
pytest tests/unit/modules/orders/

# With coverage report
pytest --cov=app --cov-report=html
```

### Creating a new migration

```bash
# Auto-generate from model changes
alembic revision --autogenerate -m "add order_status column to orders"

# Review the generated file in migrations/ before running
alembic upgrade head
```

---

## 4. Local Development — Frontend

### First-time setup

```bash
# From monorepo root — installs all workspaces
pnpm install

cd apps/fastfood-app
cp .env.local.example .env.local
# Edit .env.local (see Section 8)
```

### Daily development startup

```bash
# Run a single app
cd apps/fastfood-app
pnpm dev

# Run multiple apps at once from monorepo root
pnpm --filter fastfood-app dev
pnpm --filter fastfood-backoffice dev
```

The apps will be available at:
- `fastfood-app`: http://localhost:3000
- `fastfood-backoffice`: http://localhost:3001

### Run frontend tests

```bash
# From the app directory
pnpm test

# Watch mode during development
pnpm test:watch

# Coverage
pnpm test:coverage
```

### Type checking

```bash
pnpm type-check
```

### Lint and format

```bash
# Lint
pnpm lint

# Format
pnpm format
```

---

## 5. Branching Strategy

BigBoss uses **Trunk-Based Development** with short-lived feature branches.

### Branch Types

| Branch | Purpose | Merges Into | Protected |
|---|---|---|---|
| `main` | Production code | — | Yes (requires PR + approval) |
| `develop` | Integration branch, deploys to staging | `main` | Yes (requires PR) |
| `feature/{ticket-id}-{short-description}` | New features | `develop` | No |
| `fix/{ticket-id}-{short-description}` | Bug fixes | `develop` | No |
| `hotfix/{ticket-id}-{short-description}` | Production-critical fixes | `main` AND `develop` | No |
| `chore/{short-description}` | Tooling, deps, docs | `develop` | No |

### Branch Name Examples

```
feature/BB-42-menu-item-card
fix/BB-88-order-total-rounding
hotfix/BB-99-payment-timeout
chore/update-pnpm-lockfile
```

### Branch Lifetime

Feature branches must not live longer than **3 days**. If a feature takes longer, break it into smaller branches with independent value. Long-lived branches cause painful merges and drift.

---

## 6. Commit Conventions

BigBoss follows the **Conventional Commits** specification.

### Format

```
{type}({scope}): {short description}

{optional body — explain WHY, not WHAT}

{optional footer — e.g., closes BB-42}
```

### Types

| Type | When to Use |
|---|---|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code change that is neither a fix nor a feature |
| `test` | Adding or updating tests |
| `chore` | Build process, tooling, dependency updates |
| `docs` | Documentation only |
| `style` | CSS/style changes only (no logic change) |
| `perf` | Performance improvement |

### Scope

The scope is the **module name** (backend) or **feature module name** (frontend).

### Examples

```
feat(orders): add order status polling with exponential backoff

fix(menus): correct category sort order when items are out of stock

Closes BB-72

refactor(auth): extract token rotation logic into dedicated service

test(orders): add integration tests for concurrent order creation

docs: update development workflow with staging deploy steps
```

### Rules

- Subject line max 72 characters
- Subject line is lowercase after the type/scope
- No period at end of subject line
- Body explains the **why**, not the what — the code shows the what

---

## 7. Pull Request Process

### Before Opening a PR

- All tests pass locally (`pytest` / `pnpm test`)
- Type check passes (`pnpm type-check`)
- Lint passes (`pnpm lint`)
- Self-review your own diff — remove debug logs, commented-out code, and TODO comments
- Migration files are included if models changed

### PR Template

Every PR must fill out this template (committed to `.github/pull_request_template.md`):

```markdown
## What does this PR do?
<!-- One paragraph summary -->

## Why is this change needed?
<!-- Business or technical motivation -->

## How was this tested?
<!-- Steps to verify the change locally -->

## Screenshots (if UI change)

## Checklist
- [ ] Tests pass
- [ ] Type check passes
- [ ] No new lint errors
- [ ] Migration included (if model changed)
- [ ] Documentation updated (if behavior changed)
- [ ] No `console.log` or debug code left
- [ ] No `any`, `null`, or `undefined` used in TypeScript
```

### Review Requirements

- `develop` branch: 1 approval required
- `main` branch: 2 approvals required, including team lead
- Auto-merge is not enabled — merges are always manual after approval

### Merging

- Use **Squash and Merge** for feature branches into `develop`
- Use **Merge Commit** for `develop` into `main` to preserve history
- Delete the source branch after merging

---

## 8. Environment Variables

### Backend `.env.local`

```bash
# Application
APP_ENV=local
APP_SECRET_KEY=changeme-local-secret-key
APP_DEBUG=true

# Database
DATABASE_URL=postgresql+asyncpg://bigboss:bigboss@localhost:5432/bigboss_db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# Email (MailHog in local)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USERNAME=
SMTP_PASSWORD=
```

### Frontend `.env.local`

```bash
# API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=local
NEXT_PUBLIC_TENANT_SLUG=demo-tenant
```

### Rules for Environment Variables

- Never commit `.env`, `.env.local`, or any file with real secrets
- Always commit `.env.example` with placeholder values and comments
- Production secrets are stored in the secrets manager of the hosting provider (not in the repo)
- Environment variables accessed in frontend code must be prefixed with `NEXT_PUBLIC_` only if they are safe to expose to the browser. All others are server-only.

---

## 9. Staging Deployment

### Trigger

A push to the `develop` branch automatically triggers a staging deployment via GitHub Actions.

### Pipeline Steps

```
develop push
    │
    ├─ backend/
    │   ├── Run pytest (all tests must pass)
    │   ├── Build Docker image
    │   ├── Push image to container registry
    │   ├── Deploy to staging server
    │   └── Run Alembic migrations against staging DB
    │
    └─ frontend/ (for each changed app)
        ├── Run pnpm type-check
        ├── Run pnpm test
        ├── Run pnpm build
        └── Deploy to Vercel (staging environment)
```

### Staging URLs

| App | Staging URL |
|---|---|
| fastfood-app | https://fastfood.staging.bigboss.io |
| fastfood-backoffice | https://fastfood-admin.staging.bigboss.io |
| API | https://api.staging.bigboss.io |

### Staging Data

- Staging uses a dedicated staging database — never shared with production
- A seed script populates a demo tenant and test accounts on every deploy
- Staging is reset weekly (Saturday midnight) to keep it clean

---

## 10. Production Deployment

### Trigger

A PR from `develop` into `main` requires 2 approvals. Once merged, production deployment is triggered.

### Pipeline Steps

```
main merge
    │
    ├─ backend/
    │   ├── Run all tests
    │   ├── Build and tag Docker image with git SHA
    │   ├── Push to container registry
    │   ├── Manual approval gate (team lead confirms in GitHub Actions UI)
    │   ├── Deploy to production server (rolling update)
    │   └── Run Alembic migrations (all tenant schemas)
    │
    └─ frontend/
        ├── Build and verify
        └── Deploy to Vercel (production environment)
```

### Production Rules

- No developer has direct SSH access to production servers in normal operations
- All production changes go through the pipeline
- Migrations must be reviewed by the team lead before production deploy
- The production deploy pipeline sends a notification to the team Slack channel
- A deployment is considered successful only after a smoke test passes (automated HTTP health checks)

### Rollback

If a production deployment fails:
1. Revert the merge commit on `main`
2. The pipeline re-deploys the previous Docker image
3. Run `alembic downgrade -1` if a migration was applied (only for non-destructive migrations)
4. A post-incident report is required for any production rollback

---

## 11. Database Migrations in Each Environment

| Environment | Who runs migrations | When |
|---|---|---|
| local | Developer manually | After pulling changes that include migration files |
| staging | CI/CD pipeline | Automatically on every deploy |
| production | CI/CD pipeline | Automatically, after manual approval gate |

### Before applying any migration, verify:

```bash
# See current revision
alembic current

# See pending migrations
alembic heads

# Preview SQL without executing
alembic upgrade head --sql
```

### Destructive migrations (DROP COLUMN, DROP TABLE, etc.)

- Must be split into two migrations across two separate deployments:
  1. First deploy: stop writing to the column/table (application code change)
  2. Second deploy: drop the column/table (schema change)
- This allows rollback without data loss

---

## 12. Hotfix Process

A hotfix is for production-critical bugs that cannot wait for the normal `develop → main` cycle.

### Steps

```bash
# 1. Branch from main (not develop)
git checkout main
git pull
git checkout -b hotfix/BB-99-payment-timeout

# 2. Make the fix

# 3. Open PR into main
# Requires 2 approvals — expedited review process

# 4. After merging into main, immediately merge into develop
git checkout develop
git merge main
git push
```

The hotfix is deployed to production via the normal `main` pipeline, but with expedited approval.

After a hotfix, a brief post-incident summary is added to the project's incident log.
