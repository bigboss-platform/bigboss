# TASK-05 — FastFood App: OTP Auth Flow

**Status:** PENDING  
**Depends on:** TASK-04  
**Blocks:** TASK-06

---

## Read Before Starting

- `apps/fastfood-app/feature/auth/` — read all existing files
- `apps/fastfood-app/feature/cart/hooks/use-cart.hook.ts`
- `apps/fastfood-app/feature/cart/components/cart-drawer.component.tsx`

Do NOT read menus, loading, or orders features.

## Goal

When an unauthenticated user tries to check out, they are shown the OTP phone flow. On success the session is stored and they continue to the delivery options step. The flow handles all error states.

---

## Checklist

### Auth Flow Entry

- [ ] OTP flow appears inside the cart drawer (replaces the item list) or as a full-screen overlay — pick one and be consistent
- [ ] Flow is triggered when user taps "Ir a pagar" without an active session
- [ ] If session already exists (token in storage), skip the flow entirely

### Step 1 — Phone Input

- [ ] Phone number input field — numeric keyboard on mobile (`inputMode="tel"`)
- [ ] Input accepts `+52XXXXXXXXXX` format
- [ ] "Enviar código" button submits the phone number
- [ ] `data-testid="otp-phone-input"` on the input
- [ ] `data-testid="otp-request-button"` on the submit button
- [ ] Button disabled while request is in flight
- [ ] On success → transitions to Step 2
- [ ] On API error → shows error message below input
- [ ] Empty phone → inline validation message, no API call

### Step 2 — OTP Code Input

- [ ] 6-digit code input — numeric keyboard (`inputMode="numeric"`, `maxLength={6}`)
- [ ] "Verificar" button submits the code
- [ ] `data-testid="otp-code-input"` on the input
- [ ] `data-testid="otp-verify-button"` on the verify button
- [ ] `data-testid="otp-error"` on the error message element
- [ ] Button disabled while request is in flight
- [ ] On success → stores tokens, updates auth state, continues to delivery options
- [ ] On wrong code → `data-testid="otp-error"` visible with "Código incorrecto" message
- [ ] On expired code → error message "Código expirado, solicita uno nuevo" + back to step 1
- [ ] On max attempts → error message "Demasiados intentos, solicita un nuevo código" + back to step 1
- [ ] "Cambiar número" link returns to Step 1

### Session Storage

- [ ] Access token stored in `localStorage` (key: `bb_access_token`)
- [ ] Refresh token stored in `localStorage` (key: `bb_refresh_token`)
- [ ] Session available immediately after verification (no page reload needed)
- [ ] On subsequent visits, token read from storage and user is considered authenticated

### Token Refresh

- [ ] If API returns 401 on any authenticated call → attempt token refresh
- [ ] On successful refresh → retry original request
- [ ] On refresh failure → clear storage, show auth flow again

### `useAuth` Hook

- [ ] `useAuth()` exposes: `session`, `isAuthenticated`, `login(tokenPair)`, `logout()`
- [ ] `isAuthenticated` is `true` if a valid (non-expired) access token exists in storage
- [ ] `logout()` clears storage and resets state

---

## Files to create or update

- `feature/auth/hooks/use-auth.hook.ts` (new)
- `feature/auth/components/otp-phone-step.component.tsx` (new)
- `feature/auth/components/otp-code-step.component.tsx` (new)
- `feature/auth/components/auth-flow.component.tsx` (new — orchestrates steps)
- `feature/auth/styles/auth-flow.style.module.css` (new)
- `feature/auth/services/auth.service.ts` — wire to real API endpoints
- `feature/auth/constants/auth.constant.ts` — add storage key constants
- `feature/cart/hooks/use-cart.hook.ts` — call auth check before checkout
