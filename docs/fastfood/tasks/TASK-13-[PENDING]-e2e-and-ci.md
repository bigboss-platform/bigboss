# TASK-13 — E2E Tests & CI Validation

**Status:** PENDING  
**Depends on:** TASK-07, TASK-12  
**Blocks:** nothing (final task)

---

## Read Before Starting

- `apps/fastfood-app/tests/e2e/` — read all existing spec files
- `apps/fastfood-backoffice/tests/e2e/` — read all existing spec files
- `backend/bigboss-api/.github/workflows/` (if exists)
- `apps/fastfood-app/.github/workflows/` (if exists)
- `apps/fastfood-backoffice/.github/workflows/` (if exists)
- `backend/bigboss-api/.pre-commit-config.yaml`

Do NOT read feature code — this task is tests and CI only.

## Goal

All critical user paths pass in Playwright E2E tests against a staging environment with seeded data. The CI pipelines for all three repos run green. The gate system (pre-commit → CI → E2E) is fully operational.

---

## Checklist

### Staging Environment

- [ ] Backend deployed to staging (any cloud provider)
- [ ] `APP_ENV=staging` set in staging environment
- [ ] Staging database seeded with demo tenant, menu, and admin account
- [ ] `E2E_BASE_URL` env var set for each app pointing to staging URLs
- [ ] OTP bypass active on staging (`OTP_TEST_PHONE` and `OTP_TEST_CODE` set)

### FastFood App — E2E Tests

All tests in `apps/fastfood-app/tests/e2e/`:

**menu-navigation.spec.ts**
- [ ] Loading screen appears then transitions to menu
- [ ] Menu items display name, description, price
- [ ] Scroll down navigates to next item
- [ ] Scroll up disabled on first item
- [ ] Agregar button opens cart drawer

**auth-flow.spec.ts**
- [ ] Checkout triggers auth if not logged in
- [ ] Phone submission shows OTP code input
- [ ] Correct OTP authenticates and proceeds to delivery options
- [ ] Wrong OTP shows error message

**order-flow-pickup.spec.ts**
- [ ] Completes a pickup order end-to-end
- [ ] Active order view shows order items
- [ ] Active order view shows WhatsApp button

**order-flow-delivery.spec.ts**
- [ ] Selecting delivery shows address input
- [ ] Address entry shows map
- [ ] Delivery cost estimate displayed
- [ ] Completes a delivery order end-to-end

### Back Office — E2E Tests

All tests in `apps/fastfood-backoffice/tests/e2e/`:

**staff-order-management.spec.ts**
- [ ] Orders page loads with order list
- [ ] Can filter orders by status
- [ ] Can advance order status
- [ ] Can update payment information
- [ ] Chef view displays active orders as cards
- [ ] Chef view auto-refreshes (test waits 11 seconds)

**tenant-admin-menu.spec.ts**
- [ ] Menus page loads
- [ ] Dashboard shows all four stat cards
- [ ] Analytics placeholder page loads
- [ ] Settings placeholder page loads
- [ ] Sidebar navigation links all present

### Backend CI (`bigboss-api`)

- [ ] `.github/workflows/ci.yml` runs on every PR to `main`
- [ ] Steps: checkout → poetry install → ruff lint → black check → mypy → pytest unit → pytest integration
- [ ] All steps pass on a clean run against test database
- [ ] Coverage report generated (no minimum enforced yet — just the report)

### FastFood App CI (`fastfood-app`)

- [ ] `.github/workflows/ci.yml` runs on every PR to `main`
- [ ] Steps: pnpm install → type-check → lint → test:unit → build
- [ ] All steps pass

### Back Office CI (`fastfood-backoffice`)

- [ ] `.github/workflows/ci.yml` runs on every PR to `main`
- [ ] Steps: pnpm install → type-check → lint → test:unit → build
- [ ] All steps pass

### Pre-commit Hooks

- [ ] `backend/bigboss-api/.pre-commit-config.yaml` hooks run without errors on a clean commit
- [ ] `apps/fastfood-app/.husky/pre-commit` runs and blocks commit on test failure
- [ ] `apps/fastfood-backoffice/.husky/pre-commit` runs and blocks commit on test failure

### Branch Protection

- [ ] `main` branch protected on all 4 GitHub repos
- [ ] CI required to pass before merge
- [ ] At least 1 approval required
- [ ] Direct pushes to `main` blocked

### Final Acceptance

- [ ] A developer can clone any repo, open in Dev Container, and have a working environment in under 10 minutes
- [ ] A complete order flow (menu → cart → OTP → delivery → bill → order) works against staging
- [ ] Staff can log in to back office, see the order, advance status, and mark it paid
- [ ] All E2E tests pass in CI against staging
