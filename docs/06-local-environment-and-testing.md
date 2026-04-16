# BigBoss — Local Environment and Testing Strategy

**Version:** 1.0  
**Status:** Official  
**Last updated:** 2026-04-15

---

## Table of Contents

1. [Philosophy](#1-philosophy)
2. [Dev Containers — Zero Local Dependencies](#2-dev-containers--zero-local-dependencies)
3. [What Each Developer Installs](#3-what-each-developer-installs)
4. [Dev Container Structure](#4-dev-container-structure)
5. [How the Local Environment Works End to End](#5-how-the-local-environment-works-end-to-end)
6. [Testing Strategy — The Three Layers](#6-testing-strategy--the-three-layers)
7. [Backend Testing](#7-backend-testing)
8. [Frontend Testing](#8-frontend-testing)
9. [The Gate System](#9-the-gate-system)
10. [Pre-Commit Hook Configuration](#10-pre-commit-hook-configuration)
11. [CI Pipeline — GitHub Actions](#11-ci-pipeline--github-actions)
12. [E2E Tests — Critical Paths Only](#12-e2e-tests--critical-paths-only)
13. [Coverage Rules](#13-coverage-rules)
14. [Rules and Constraints](#14-rules-and-constraints)

---

## 1. Philosophy

### No Local Dependencies

Developers must not be required to install any language runtime, package manager, or tool directly on their machine in order to work on any BigBoss project. The only exceptions are Docker Desktop and VS Code.

Every other dependency — Python, Poetry, Node.js, pnpm, Alembic, the Postgres client — lives inside a container. This guarantees:

- Two developers on different machines and different operating systems get identical environments
- A new developer is productive within 10 minutes of cloning the repo
- "Works on my machine" is not a valid bug report
- Dependency version conflicts between projects do not exist

### Tests Are a Gate, Not a Suggestion

Tests are not written for coverage metrics. They are written to protect the business. A feature is not done until its critical paths have tests. A bug fix is not done until a test that would have caught the bug exists. Tests block bad code from reaching staging. Staging blocks bad code from reaching production.

---

## 2. Dev Containers — Zero Local Dependencies

**Dev Containers** is an open standard for defining a reproducible development environment inside a Docker container. VS Code (and JetBrains) support it natively.

When a developer opens any BigBoss project in VS Code, the editor detects the `.devcontainer/` folder and offers to reopen the project inside the container. Once inside:

- The terminal in VS Code is a shell inside the container
- All CLI tools are available: `python`, `poetry`, `uvicorn`, `node`, `pnpm`, `alembic`, `pytest`, `playwright`
- The source code files are volume-mounted from the host machine — editing a file in VS Code on the host instantly reflects inside the container
- Hot reload works normally because the app watches the mounted file system
- The container connects to the Docker Compose infrastructure services (Postgres, Redis, MailHog) on a shared Docker network

### How a Developer Runs the App

The devcontainer provides the tools. The developer runs the app manually inside the container terminal. This is intentional — it gives full visibility and control:

```bash
# Backend — inside the devcontainer terminal
uvicorn app.main:app --reload --port 8000

# Frontend — inside the devcontainer terminal
pnpm dev
```

The developer never opens a system terminal. Everything happens inside VS Code's integrated terminal, which is the container shell.

---

## 3. What Each Developer Installs

This is the complete list. Nothing else is needed.

| Tool | Purpose | Install |
|---|---|---|
| Docker Desktop | Runs all containers | https://docker.com/products/docker-desktop |
| VS Code | Editor with Dev Containers support | https://code.visualstudio.com |
| Dev Containers extension | VS Code extension that enables devcontainer support | VS Code extension marketplace: `ms-vscode-remote.remote-containers` |

That is the entire machine setup. Every other tool is inside the container.

---

## 4. Dev Container Structure

Each project has its own `.devcontainer/` folder. The backend and each frontend app have separate devcontainer configurations because they need different runtimes.

### Backend Dev Container

```
backend/bigboss-api/
└── .devcontainer/
    ├── devcontainer.json      ← main config
    ├── Dockerfile.dev         ← development image
    └── docker-compose.dev.yml ← wires the app container to infra services
```

**`Dockerfile.dev` (backend):**
```dockerfile
FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    curl git build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN pip install poetry

WORKDIR /workspace

COPY pyproject.toml poetry.lock ./
RUN poetry install --no-root

ENV PATH="/root/.local/bin:$PATH"
```

**`devcontainer.json` (backend):**
```json
{
    "name": "BigBoss API",
    "dockerComposeFile": "docker-compose.dev.yml",
    "service": "api",
    "workspaceFolder": "/workspace",
    "customizations": {
        "vscode": {
            "extensions": [
                "ms-python.python",
                "ms-python.pylance",
                "ms-python.black-formatter",
                "charliermarsh.ruff",
                "mtxr.sqltools"
            ],
            "settings": {
                "python.defaultInterpreterPath": "/workspace/.venv/bin/python",
                "editor.formatOnSave": true,
                "editor.defaultFormatter": "ms-python.black-formatter"
            }
        }
    },
    "postCreateCommand": "poetry install",
    "remoteUser": "root"
}
```

**`docker-compose.dev.yml` (backend):**
```yaml
services:
  api:
    build:
      context: ..
      dockerfile: .devcontainer/Dockerfile.dev
    volumes:
      - ..:/workspace:cached
    command: sleep infinity
    environment:
      - DATABASE_URL=postgresql+asyncpg://bigboss:bigboss@postgres:5432/bigboss_db
      - REDIS_URL=redis://redis:6379/0
    networks:
      - bigboss-dev

  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: bigboss
      POSTGRES_PASSWORD: bigboss
      POSTGRES_DB: bigboss_db
    ports:
      - "5432:5432"
    volumes:
      - postgres-dev-data:/var/lib/postgresql/data
    networks:
      - bigboss-dev

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - bigboss-dev

  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"
      - "8025:8025"
    networks:
      - bigboss-dev

networks:
  bigboss-dev:

volumes:
  postgres-dev-data:
```

### Frontend Dev Container

```
apps/fastfood-app/
└── .devcontainer/
    ├── devcontainer.json
    └── Dockerfile.dev
```

**`Dockerfile.dev` (frontend):**
```dockerfile
FROM node:20-slim

RUN npm install -g pnpm

WORKDIR /workspace

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
```

**`devcontainer.json` (frontend):**
```json
{
    "name": "BigBoss FastFood App",
    "build": {
        "dockerfile": "Dockerfile.dev"
    },
    "workspaceFolder": "/workspace",
    "mounts": [
        "source=${localWorkspaceFolder},target=/workspace,type=bind,consistency=cached",
        "source=node_modules_cache,target=/workspace/node_modules,type=volume"
    ],
    "customizations": {
        "vscode": {
            "extensions": [
                "dbaeumer.vscode-eslint",
                "esbenp.prettier-vscode",
                "bradlc.vscode-tailwindcss",
                "ms-playwright.playwright"
            ],
            "settings": {
                "editor.formatOnSave": true,
                "editor.defaultFormatter": "esbenp.prettier-vscode",
                "typescript.tsdk": "node_modules/typescript/lib"
            }
        }
    },
    "postCreateCommand": "pnpm install",
    "remoteUser": "root"
}
```

> **Note on node_modules:** `node_modules` is mounted as a named Docker volume (not from the host). This prevents macOS and Windows host filesystem performance issues with large `node_modules` directories and avoids platform-specific binary conflicts.

---

## 5. How the Local Environment Works End to End

### First Time Setup (one time per project)

```bash
# 1. Clone the monorepo
git clone git@github.com:bigboss-platform/bigboss.git
cd bigboss

# 2. Open the backend project in VS Code
code backend/bigboss-api

# 3. VS Code detects .devcontainer/ and shows a notification:
#    "Reopen in Container" — click it

# 4. Container builds (3–5 minutes the first time, cached after)

# 5. Inside the container terminal:
cp .env.example .env.local
alembic upgrade head

# 6. Start the API
uvicorn app.main:app --reload --port 8000
```

For a frontend app:
```bash
# 1. Open the app in VS Code
code apps/fastfood-app

# 2. Reopen in Container

# 3. Inside the container terminal:
cp .env.local.example .env.local
pnpm dev
```

### Daily Startup (after first time)

```bash
# VS Code reopens the container automatically
# Inside the terminal:
uvicorn app.main:app --reload --port 8000   # backend
pnpm dev                                     # frontend
```

Container startup after the first build takes under 10 seconds.

### Available Local URLs

| Service | URL |
|---|---|
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| FastFood App | http://localhost:3000 |
| FastFood Back Office | http://localhost:3001 |
| MailHog (email) | http://localhost:8025 |
| Postgres | localhost:5432 |

---

## 6. Testing Strategy — The Three Layers

BigBoss uses a three-layer testing pyramid. More tests at the bottom (fast, cheap), fewer at the top (slow, expensive).

```
         /\
        /  \
       / E2E \          ← Few. Critical user journeys only. Runs against staging.
      /────────\
     / Integr. \        ← Moderate. Full stack per module. Runs in CI on every PR.
    /────────────\
   /  Unit Tests  \     ← Many. Fast. Runs locally on save and blocks commits.
  /────────────────\
```

### The Pyramid Rule

Write many unit tests. Write fewer integration tests. Write very few E2E tests. A large E2E suite is a maintenance trap — they are slow, they break on UI changes, and they give vague failure messages. Use E2E only for the flows that if broken would stop revenue.

---

## 7. Backend Testing

### Unit Tests

**What they test:** The service layer in isolation. Repositories are mocked. No database, no HTTP server, no network.

**Tool:** `pytest` + `pytest-asyncio` + `unittest.mock`

**Speed:** Under 1 second per test. The full unit suite runs in under 30 seconds.

**Location:** `tests/unit/modules/{module_name}/`

**Naming convention:** `test_{what}_{scenario}_{expected_result}`

```python
# tests/unit/modules/orders/test_order_service.py

import pytest
from unittest.mock import AsyncMock
from app.modules.orders.service import OrderService
from app.modules.orders.exceptions import OrderNotFoundException
from app.modules.orders.schemas import OrderCreateSchema

@pytest.mark.asyncio
async def test_get_order_by_id_when_order_exists_returns_order_schema():
    mock_repository = AsyncMock()
    mock_repository.find_by_id.return_value = build_order_fixture()
    service = OrderService(repository=mock_repository)

    result = await service.get_by_id("order-001")

    assert result.id == "order-001"
    mock_repository.find_by_id.assert_called_once_with("order-001")


@pytest.mark.asyncio
async def test_get_order_by_id_when_order_not_found_raises_exception():
    mock_repository = AsyncMock()
    mock_repository.find_by_id.return_value = None
    service = OrderService(repository=mock_repository)

    with pytest.raises(OrderNotFoundException):
        await service.get_by_id("nonexistent-id")
```

### Integration Tests

**What they test:** The full request path — HTTP request → router → service → repository → real Postgres database. Tests real SQL, real schema switching, real constraint enforcement.

**Tool:** `pytest` + `pytest-asyncio` + `httpx.AsyncClient` + real Postgres test database

**Speed:** 1–5 seconds per test. The full integration suite runs in 2–5 minutes.

**Location:** `tests/integration/modules/{module_name}/`

**Test database strategy:**
- A dedicated Postgres database is used for tests: `bigboss_test_db`
- Before each test session, all migrations are applied fresh
- Each test runs inside a transaction that is rolled back after the test — the database stays clean between tests with zero cost
- The test database runs inside the devcontainer's Postgres service

```python
# tests/integration/modules/orders/test_order_router.py

import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_order_returns_201_and_order_id(
    async_client: AsyncClient,
    authenticated_end_user_headers: dict,
    seeded_menu_item: dict,
):
    response = await async_client.post(
        "/api/v1/tenants/test-tenant/orders",
        json={
            "items": [{"menu_item_id": seeded_menu_item["id"], "quantity": 2}],
            "delivery_type": "pickup",
        },
        headers=authenticated_end_user_headers,
    )

    assert response.status_code == 201
    assert response.json()["data"]["id"] != ""
    assert response.json()["data"]["status"] == "pending"
```

### Contract Tests

**What they test:** That the actual HTTP responses match what is documented in the OpenAPI spec. Serialization bugs, missing fields, wrong field types.

**Tool:** `pytest` + `schemathesis` (auto-generates tests from the OpenAPI spec)

**When:** Runs in CI on every PR. Not run locally by default.

---

## 8. Frontend Testing

### Unit Tests

**What they test:** Individual components and custom hooks in isolation. No network, no router, no real browser.

**Tool:** `Vitest` + `@testing-library/react` + `@testing-library/user-event`

**Speed:** Under 500ms per test. The full unit suite runs in under 20 seconds.

**Location:** `feature/{module}/tests/{component-or-hook}.test.tsx`

```tsx
// feature/cart/tests/cart-item.test.tsx

import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { CartItem } from "../components/cart-item.component"
import { EMPTY_CART_ITEM } from "../constants/cart-item.constant"

const testCartItem = {
    ...EMPTY_CART_ITEM,
    id: "cart-item-001",
    menuItemName: "Classic Burger",
    price: 8.99,
    quantity: 2,
}

describe("CartItem", () => {
    it("renders item name and calculated price", () => {
        render(
            <CartItem
                cartItem={testCartItem}
                onIncrease={() => {}}
                onDecrease={() => {}}
                onNoteChange={() => {}}
            />
        )

        expect(screen.getByText("Classic Burger")).toBeInTheDocument()
        expect(screen.getByText("$17.98")).toBeInTheDocument()
    })

    it("calls onDecrease with item id when minus button is clicked", () => {
        const handleDecrease = vi.fn()
        render(
            <CartItem
                cartItem={testCartItem}
                onIncrease={() => {}}
                onDecrease={handleDecrease}
                onNoteChange={() => {}}
            />
        )

        fireEvent.click(screen.getByRole("button", { name: /decrease quantity/i }))

        expect(handleDecrease).toHaveBeenCalledWith("cart-item-001")
    })
})
```

### Integration Tests

**What they test:** Feature module flows — multiple components working together, hooks interacting with mocked services, state transitions.

**Tool:** `Vitest` + `@testing-library/react` + `msw` (Mock Service Worker — intercepts fetch calls)

```tsx
// feature/auth/tests/otp-flow.test.tsx

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { http, HttpResponse } from "msw"
import { setupServer } from "msw/node"
import { PhoneEntryContainer } from "../containers/phone-entry.container"

const server = setupServer(
    http.post("/api/v1/auth/otp/request", () => {
        return HttpResponse.json({ data: { expires_in_seconds: 60 } })
    })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe("Phone Entry Flow", () => {
    it("shows otp input after successful phone submission", async () => {
        render(<PhoneEntryContainer onVerified={() => {}} />)

        fireEvent.change(screen.getByLabelText(/número de teléfono/i), {
            target: { value: "+573001234567" },
        })
        fireEvent.click(screen.getByRole("button", { name: /enviar código/i }))

        await waitFor(() => {
            expect(screen.getByLabelText(/código de verificación/i)).toBeInTheDocument()
        })
    })
})
```

### E2E Tests

See [Section 12](#12-e2e-tests--critical-paths-only).

---

## 9. The Gate System

Code goes through three mandatory gates before it can reach production. Each gate blocks if anything fails.

```
┌─────────────────────────────────────────────────────────┐
│  GATE 1 — Pre-Commit Hook (local, before every commit)  │
│                                                         │
│  Backend:   pytest unit tests (unit/ only)              │
│  Frontend:  vitest unit tests + type-check + lint       │
│                                                         │
│  Duration: under 60 seconds                             │
│  Blocked commit = fix locally, do not push broken code  │
└────────────────────────┬────────────────────────────────┘
                         │ commit allowed
                         ▼
┌─────────────────────────────────────────────────────────┐
│  GATE 2 — CI Pipeline (GitHub Actions, on every PR)     │
│                                                         │
│  Backend:   pytest unit + integration + contract tests  │
│  Frontend:  vitest unit + integration + build check     │
│                                                         │
│  Duration: 5–10 minutes                                 │
│  Failed CI = PR cannot be merged, no exceptions         │
└────────────────────────┬────────────────────────────────┘
                         │ PR merged to develop
                         ▼
┌─────────────────────────────────────────────────────────┐
│  GATE 3 — E2E on Staging (Playwright, after deploy)     │
│                                                         │
│  Playwright runs critical path tests against the live   │
│  staging environment                                    │
│                                                         │
│  Duration: 5–15 minutes                                 │
│  Failed E2E = alert sent, merge to main is blocked      │
└────────────────────────┬────────────────────────────────┘
                         │ staging validated
                         ▼
                    Production deploy
                  (manual approval gate)
```

---

## 10. Pre-Commit Hook Configuration

Pre-commit hooks run automatically before every `git commit`. If they fail, the commit is rejected. The developer must fix the issues and commit again.

**Tool:** `pre-commit` (Python) for the backend. `husky` + `lint-staged` for the frontend.

### Backend Pre-Commit Config

```yaml
# backend/bigboss-api/.pre-commit-config.yaml

repos:
  - repo: local
    hooks:
      - id: ruff-lint
        name: Ruff linter
        entry: poetry run ruff check
        language: system
        types: [python]
        pass_filenames: true

      - id: black-format
        name: Black formatter
        entry: poetry run black --check
        language: system
        types: [python]
        pass_filenames: true

      - id: unit-tests
        name: Unit tests
        entry: poetry run pytest tests/unit --tb=short -q
        language: system
        pass_filenames: false
        always_run: true
```

### Frontend Pre-Commit Config

```json
// apps/fastfood-app/package.json (relevant section)
{
    "scripts": {
        "test:unit": "vitest run",
        "type-check": "tsc --noEmit",
        "lint": "eslint . --max-warnings 0"
    }
}
```

```js
// apps/fastfood-app/.husky/pre-commit
pnpm type-check && pnpm lint && pnpm test:unit
```

### What is NOT in the Pre-Commit Hook

- Integration tests — too slow for a commit hook (2–5 minutes would make developers bypass the hook)
- E2E tests — these run against a real environment, not possible locally in a hook
- Build — too slow

These run in CI where speed is not a blocker on developer flow.

---

## 11. CI Pipeline — GitHub Actions

One workflow file per project. All pipelines follow the same structure.

### Backend Pipeline

```yaml
# backend/bigboss-api/.github/workflows/ci.yml

name: CI

on:
  pull_request:
    branches: [develop, main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: bigboss
          POSTGRES_PASSWORD: bigboss
          POSTGRES_DB: bigboss_test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install Poetry
        run: pip install poetry

      - name: Install dependencies
        run: poetry install

      - name: Lint
        run: poetry run ruff check .

      - name: Format check
        run: poetry run black --check .

      - name: Type check
        run: poetry run mypy app

      - name: Unit tests
        run: poetry run pytest tests/unit -v

      - name: Integration tests
        run: poetry run pytest tests/integration -v
        env:
          DATABASE_URL: postgresql+asyncpg://bigboss:bigboss@localhost:5432/bigboss_test_db
          REDIS_URL: redis://localhost:6379/0

      - name: Contract tests
        run: poetry run pytest tests/contract -v
```

### Frontend Pipeline

```yaml
# apps/fastfood-app/.github/workflows/ci.yml

name: CI

on:
  pull_request:
    branches: [develop, main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"

      - uses: pnpm/action-setup@v3
        with:
          version: latest

      - name: Install dependencies
        run: pnpm install

      - name: Type check
        run: pnpm type-check

      - name: Lint
        run: pnpm lint

      - name: Unit and integration tests
        run: pnpm test:ci

      - name: Build check
        run: pnpm build
```

---

## 12. E2E Tests — Critical Paths Only

**Tool:** Playwright  
**When:** Runs automatically after every staging deploy  
**Target:** The live staging environment (`https://fastfood.staging.bigboss.io`)

### Critical Paths — FastFood End-User App

These are the only E2E tests in v1. They cover the flows that if broken would stop revenue.

| Test | Flow |
|---|---|
| Full order flow — pickup | Load app → view menu → add item → open cart → authenticate via OTP → select pickup → confirm bill → order created |
| Full order flow — delivery | Load app → add item → authenticate → select delivery → set address on map → confirm cost → confirm bill → order created |
| Menu navigation | Load app → loading screen completes → first item visible → scroll to next item → scroll back |
| Auth — new end user | Enter new phone number → receive OTP → verify → account created → logged in state visible |
| Auth — returning end user | Enter existing phone number → OTP → logged in → previous order history accessible |

### Critical Paths — FastFood Back Office

| Test | Flow |
|---|---|
| Staff advances order status | Login as staff → see active orders → tap confirm → order moves to preparing |
| Staff records payment | Login → open order → fill payment fields → save → payment status updated |
| Tenant admin updates menu | Login as admin → open menu manager → edit item price → save → price reflects in end-user app |

### E2E Test Location

```
tests/
└── e2e/
    ├── fastfood-app/
    │   ├── order-flow-pickup.spec.ts
    │   ├── order-flow-delivery.spec.ts
    │   ├── menu-navigation.spec.ts
    │   └── auth-flow.spec.ts
    └── fastfood-backoffice/
        ├── staff-order-management.spec.ts
        └── tenant-admin-menu.spec.ts
```

### OTP in E2E Tests

The OTP flow requires receiving an SMS, which is not possible in automated tests. In the staging environment, a test phone number (`+57 300 000 0000`) is configured to always accept the code `123456`. This bypass is active **only in the staging environment** and is blocked in production.

---

## 13. Coverage Rules

Coverage is measured but enforced selectively. Chasing a global percentage leads to useless tests written to hit a number. BigBoss enforces coverage only where it matters.

### Backend Coverage Requirements

| Module | Minimum Coverage | Reason |
|---|---|---|
| `auth` | 90% | Security-critical |
| `orders` | 85% | Revenue-critical |
| `end-users` | 80% | Data integrity |
| `menus` | 75% | Core product |
| All other modules | No minimum enforced | Team discipline |

Coverage is checked in CI using `pytest-cov`. A PR that drops a enforced module below its threshold fails the pipeline.

### Frontend Coverage Requirements

No global minimum. The following features must have tests:

| Feature | Required Tests |
|---|---|
| `cart/` | Add item, remove item, quantity changes, empty state |
| `auth/` | Phone entry validation, OTP input behavior, success state |
| `orders/` | Bill calculation display, status display per enum value |
| `delivery/` | Delivery type selection, address confirmation |

All other features: at least one render test per component.

---

## 14. Rules and Constraints

| Rule | Detail |
|---|---|
| No local runtime installations | Developers install only Docker Desktop, VS Code, and the Dev Containers extension |
| Pre-commit hook is mandatory | All team members must run `pre-commit install` (backend) or `pnpm prepare` (frontend) after cloning. This is documented in each project's README. |
| Failed pre-commit = fix before commit | The hook must not be skipped with `--no-verify`. If there is a legitimate reason to bypass, it requires team lead approval and a comment in the PR. |
| Failed CI = no merge | A PR with a failing CI pipeline cannot be merged under any circumstances. There are no exceptions for "quick fixes" or "I'll fix the test in the next PR". |
| Failed E2E on staging = no production deploy | If Playwright tests fail after a staging deploy, the issue must be resolved before the staging → main PR is opened. |
| Integration tests use a real database | No mocking of the database in integration tests. The test database is real Postgres with real migrations applied. This was a deliberate decision to catch schema and query issues that mocks would miss. |
| E2E tests run against staging only | E2E tests are never run against production. |
| OTP bypass is staging-only | The test OTP code (`123456` for the test number) must never be active in production. This is enforced by environment variable guard in the backend. |
