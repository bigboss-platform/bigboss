# FastFood — Getting Started

## Prerequisites

Install these once on your machine. Nothing else.

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — running and with at least 4 GB RAM allocated
- [VS Code](https://code.visualstudio.com/)
- VS Code extension: **Dev Containers** (`ms-vscode-remote.remote-containers`)

---

## Repositories

Clone each repo into the same parent folder:

```bash
git clone https://github.com/bigboss-platform/bigboss-api-.git   backend/bigboss-api
git clone https://github.com/bigboss-platform/fastfood-app.git    apps/fastfood-app
git clone https://github.com/bigboss-platform/fastfood-backoffice.git apps/fastfood-backoffice
```

---

## 1. Start the Backend

```
VS Code → File → Open Folder → backend/bigboss-api
```

When VS Code detects the Dev Container config it will show a popup — click **Reopen in Container**.  
First boot downloads the Python image and installs dependencies (~3 min). Subsequent boots are instant.

### Set up environment variables

Inside the container terminal:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

```
DATABASE_URL=postgresql+asyncpg://bigboss:bigboss@postgres:5432/bigboss
REDIS_URL=redis://redis:6379
SECRET_KEY=change-me-use-openssl-rand-hex-32
APP_ENV=development
OTP_TEST_PHONE=+521234567890
OTP_TEST_CODE=000000
```

### Run migrations

```bash
alembic upgrade head
```

### Seed demo data

```bash
python scripts/seed.py
```

This creates:
- One demo tenant (`slug: demo-fastfood`)
- Tenant theme and settings
- Sample menu with 2 sections and 6 items
- One tenant admin account (`admin@demo-fastfood.com` / `admin1234`)

### Start the API

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

API is available at `http://localhost:8000`  
Swagger docs at `http://localhost:8000/docs`  
MailHog (email preview) at `http://localhost:8025`

---

## 2. Start the FastFood App

```
VS Code → File → Open Folder → apps/fastfood-app
```

Reopen in Container when prompted.

### Set up environment variables

```bash
cp .env.local.example .env.local
```

`.env.local`:

```
API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

### Start the dev server

```bash
pnpm dev
```

App runs at `http://localhost:3001/demo-fastfood`

---

## 3. Start the Back Office

```
VS Code → File → Open Folder → apps/fastfood-backoffice
```

Reopen in Container when prompted.

### Set up environment variables

```bash
cp .env.local.example .env.local
```

`.env.local`:

```
API_BASE_URL=http://localhost:8000
```

### Start the dev server

```bash
pnpm dev
```

Back office runs at `http://localhost:3002`  
Login with: `admin@demo-fastfood.com` / `admin1234`

---

## Running Tests

### Backend unit tests

Inside the backend container:

```bash
pytest tests/unit -v
```

### Backend integration tests

```bash
pytest tests/integration -v
```

### Frontend unit tests (either app)

```bash
pnpm test:unit
```

### E2E tests (against staging only)

Requires staging environment to be running.

```bash
E2E_BASE_URL=https://staging.your-domain.com pnpm test:e2e
```

---

## Ports Reference

| Service | Port | URL |
|---|---|---|
| Backend API | 8000 | http://localhost:8000 |
| FastFood App | 3001 | http://localhost:3001 |
| Back Office | 3002 | http://localhost:3002 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| MailHog | 8025 | http://localhost:8025 |

---

## Troubleshooting

**Container won't start** — Make sure Docker Desktop is running and has enough memory (4 GB minimum).

**`alembic upgrade head` fails** — Check that the PostgreSQL container is healthy: `docker ps`. Wait 10 seconds and retry.

**`pnpm dev` shows API errors** — The backend must be running first. Check `http://localhost:8000/health` returns `{"status": "ok"}`.

**OTP code not received** — In development, check MailHog at `http://localhost:8025`. OTP is also logged to the API console in development.

**Google Maps not loading** — Add a valid `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`. Maps display and geocoding require a key; the app degrades gracefully without it (address input still works, no map preview).
