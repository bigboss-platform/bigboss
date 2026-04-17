# TASK-08 — Back Office: Auth & Route Protection

**Status:** PENDING  
**Depends on:** TASK-02  
**Blocks:** TASK-09

---

## Read Before Starting

- `apps/fastfood-backoffice/feature/auth/` — read all existing files
- `apps/fastfood-backoffice/feature/shared/` — read all existing files
- `apps/fastfood-backoffice/app/(dashboard)/layout.tsx`
- `apps/fastfood-backoffice/app/middleware.ts` (if it exists)

Do NOT read orders, menus, dashboard, or settings features.

## Goal

The back office login page works against the real API. All dashboard routes are protected — unauthenticated users are redirected to login. The session persists across page refreshes. Logging out clears everything.

---

## Checklist

### Login Page

- [ ] Email input — `data-testid="email-input"`, `type="email"`, `autoComplete="email"`
- [ ] Password input — `data-testid="password-input"`, `type="password"`, `autoComplete="current-password"`
- [ ] "Iniciar sesión" button — `data-testid="login-button"`
- [ ] Form submits on Enter key
- [ ] Button disabled and shows spinner while API call is in flight
- [ ] On success → redirect to `/dashboard`
- [ ] On wrong credentials → error message below form (`data-testid="login-error"`)
- [ ] On inactive account → error message "Tu cuenta está inactiva"
- [ ] Empty fields → inline validation, no API call made
- [ ] `POST /api/v1/backoffice/auth/login` called with email + password

### Session Storage

- [ ] Access token stored in `localStorage` (key: `bb_admin_access_token`)
- [ ] Refresh token stored in `localStorage` (key: `bb_admin_refresh_token`)
- [ ] Admin profile stored in `localStorage` (key: `bb_admin_profile`) as JSON
- [ ] Session read on app mount — if token exists and valid, user is authenticated

### Route Protection

- [ ] All routes under `/(dashboard)` require authentication
- [ ] Unauthenticated access to any dashboard route → redirect to `/login`
- [ ] Authenticated access to `/login` → redirect to `/dashboard`
- [ ] Middleware or layout-level check (not per-page) — single implementation

### `useAdminSession` Hook

- [ ] Exposes: `session`, `isAuthenticated`, `login(tokenPair, admin)`, `logout()`
- [ ] `login()` saves tokens and admin profile to storage, updates state
- [ ] `logout()` clears all storage keys, redirects to `/login`
- [ ] `isAuthenticated` checks token existence (not expiry — server will return 401 if expired)

### Token Refresh

- [ ] Shared API client (fetch wrapper) intercepts 401 responses
- [ ] On 401 → attempts refresh via `POST /api/v1/auth/token/refresh`
- [ ] On successful refresh → retries original request with new token
- [ ] On refresh failure → calls `logout()`

### Sidebar — Auth State

- [ ] Admin name shown in sidebar (from stored profile)
- [ ] "Cerrar sesión" button in sidebar calls `logout()`
- [ ] `data-testid="logout-button"` on the logout button

---

## Files to create or update

- `feature/auth/hooks/use-admin-session.hook.ts` (new)
- `feature/auth/containers/login.container.tsx` — wire to real API
- `feature/auth/services/auth.service.ts` — wire login call
- `feature/auth/constants/auth.constant.ts` — storage key constants
- `feature/shared/lib/api-client.ts` (new — fetch wrapper with 401 interceptor)
- `feature/shared/components/sidebar.component.tsx` — add admin name + logout button
- `app/(dashboard)/layout.tsx` — add auth check + redirect
- `app/middleware.ts` (new — Next.js middleware for route protection)
