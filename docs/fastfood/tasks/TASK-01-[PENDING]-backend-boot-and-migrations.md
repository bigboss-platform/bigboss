# TASK-01 — Backend: Boot, Migrations & Seed

**Status:** PENDING  
**Depends on:** nothing  
**Blocks:** TASK-02

---

## Goal

The backend dev container boots cleanly, the database schema is created, and a demo tenant with real data exists so every other task has something to work with.

---

## Checklist

### Dev Container

- [ ] Open `backend/bigboss-api` in VS Code and reopen in Dev Container
- [ ] Container starts without errors
- [ ] `poetry install` runs successfully on first boot (check postCreateCommand output)
- [ ] All services healthy: `docker ps` shows postgres, redis, mailhog all running
- [ ] `http://localhost:8000/health` returns `{"status": "ok"}`

### Environment

- [ ] `.env.local` created from `.env.example`
- [ ] All required variables filled in (DATABASE_URL, SECRET_KEY, APP_ENV, OTP_TEST_PHONE, OTP_TEST_CODE)
- [ ] `SECRET_KEY` is a real random value (`openssl rand -hex 32`)

### Migrations

- [ ] Create file `migrations/versions/0001_initial_schema.py` with `alembic revision --autogenerate -m "initial schema"`
- [ ] Review generated migration — confirm all tables present: `tenants`, `tenant_themes`, `tenant_settings`, `tenant_admins`, `end_users`, `otp_verifications`, `menus`, `menu_sections`, `menu_items`, `orders`, `order_items`
- [ ] `alembic upgrade head` runs without errors
- [ ] All tables exist in the database (connect via any Postgres client to verify)

### Seed Script

- [ ] Create `scripts/seed.py` with the following data:
  - [ ] One tenant: `slug=demo-fastfood`, `product=fastfood`, `is_active=True`
  - [ ] Tenant theme: primary color `#E63946`, secondary `#F1FAEE`, font `Inter`, all CSS token fields populated
  - [ ] Tenant settings: business name, address, WhatsApp number, delivery enabled, delivery cost per km, max delivery radius, payment instructions
  - [ ] Two menu sections: `Hamburguesas` (sort_order=1), `Bebidas` (sort_order=2)
  - [ ] At least 4 menu items in Hamburguesas, 2 in Bebidas — all with name, description, price, is_available=True
  - [ ] One tenant admin: `email=admin@demo-fastfood.com`, `password=admin1234` (bcrypt hashed), `name=Demo Admin`
- [ ] `python scripts/seed.py` runs without errors
- [ ] Seed is idempotent — running it twice does not create duplicates

### Verification

- [ ] `GET http://localhost:8000/api/v1/tenants/demo-fastfood/theme` returns theme data
- [ ] `GET http://localhost:8000/api/v1/tenants/demo-fastfood/settings` returns settings data
- [ ] `GET http://localhost:8000/api/v1/tenants/demo-fastfood/menu` returns menu with sections and items
- [ ] `POST http://localhost:8000/api/v1/backoffice/auth/login` with `admin@demo-fastfood.com` / `admin1234` returns a token pair

---

## Files to create

- `backend/bigboss-api/scripts/__init__.py`
- `backend/bigboss-api/scripts/seed.py`
- `backend/bigboss-api/migrations/versions/0001_initial_schema.py` (auto-generated)
