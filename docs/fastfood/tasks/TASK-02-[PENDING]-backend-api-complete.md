# TASK-02 — Backend: Complete API

**Status:** PENDING  
**Depends on:** TASK-01  
**Blocks:** TASK-03, TASK-08

---

## Goal

Every API endpoint the FastFood app and back office need is implemented, returns correct data, and handles errors with RFC 7807 responses. No frontend task should be blocked by a missing endpoint.

---

## Checklist

### Auth Module

- [ ] `POST /api/v1/auth/otp/request` — creates OTP, sends code via email (MailHog in dev), returns 200
- [ ] `POST /api/v1/auth/otp/verify` — validates code, returns `access_token` + `refresh_token`
- [ ] OTP staging bypass works: test phone + `000000` resolves correctly when `APP_ENV != production`
- [ ] OTP expires after 10 minutes
- [ ] OTP max 5 attempts then locked
- [ ] `POST /api/v1/auth/token/refresh` — returns new access token from refresh token

### Tenant Admin Auth Module

- [ ] `POST /api/v1/backoffice/auth/login` — email/password, returns token pair + admin object
- [ ] Wrong credentials → 401 with RFC 7807 body
- [ ] Inactive admin → 403

### Tenants Module

- [ ] `GET /api/v1/tenants/{tenant_slug}/theme` — public, no auth required
- [ ] `GET /api/v1/tenants/{tenant_slug}/settings` — public, no auth required
- [ ] `PUT /api/v1/backoffice/theme` — tenant admin auth required, updates theme
- [ ] `PUT /api/v1/backoffice/settings` — tenant admin auth required, updates settings
- [ ] Unknown slug → 404

### End Users Module

- [ ] `GET /api/v1/end-users/me` — returns authenticated end user profile
- [ ] `PUT /api/v1/end-users/me` — updates name, returns updated profile

### Menus Module

- [ ] `GET /api/v1/tenants/{tenant_slug}/menu` — returns full menu tree (sections → items), only active sections and available items
- [ ] Items sorted by `sort_order` within each section
- [ ] Sections sorted by `sort_order`
- [ ] Unavailable items excluded from end-user response

### Backoffice Menus Module (new endpoints)

- [ ] `GET /api/v1/backoffice/menu` — returns full menu including unavailable items (for editing)
- [ ] `POST /api/v1/backoffice/menu/sections` — create section
- [ ] `PUT /api/v1/backoffice/menu/sections/{section_id}` — update section (name, sort_order, is_active)
- [ ] `DELETE /api/v1/backoffice/menu/sections/{section_id}` — soft delete section
- [ ] `POST /api/v1/backoffice/menu/sections/{section_id}/items` — create item
- [ ] `PUT /api/v1/backoffice/menu/items/{item_id}` — update item (all fields including is_available)
- [ ] `DELETE /api/v1/backoffice/menu/items/{item_id}` — soft delete item
- [ ] `PUT /api/v1/backoffice/menu/items/{item_id}/photo` — upload photo, store URL, return updated item

### Orders Module — End User

- [ ] `POST /api/v1/tenants/{tenant_slug}/orders` — creates order, returns 201 with order object
- [ ] `GET /api/v1/tenants/{tenant_slug}/orders/active` — returns current active order or 404
- [ ] `GET /api/v1/tenants/{tenant_slug}/orders/{order_id}` — returns order detail
- [ ] `POST /api/v1/tenants/{tenant_slug}/delivery/calculate` — accepts lat/lng + tenant_slug, returns delivery cost using Haversine

### Orders Module — Back Office

- [ ] `GET /api/v1/backoffice/orders` — list all orders for tenant, supports `?status=` filter, paginated
- [ ] `GET /api/v1/backoffice/orders/{order_id}` — order detail with all payment fields
- [ ] `PUT /api/v1/backoffice/orders/{order_id}/status` — advance status, returns updated order
- [ ] `PATCH /api/v1/backoffice/orders/{order_id}/payment` — update payment fields, records updated_by

### Dashboard Stats (new endpoint)

- [ ] `GET /api/v1/backoffice/dashboard/stats` — returns:
  - `orders_today` (count of orders created today)
  - `revenue_today` (sum of `total` for paid orders today)
  - `active_orders` (count of orders not in DELIVERED or CANCELLED)
  - `pending_payments` (count of orders with payment_status = pending)

### Delivery Cost Calculation

- [ ] `calculate_haversine_distance_km()` used in delivery calculate endpoint
- [ ] Response includes `distance_km`, `cost`, `is_within_range` (bool)
- [ ] If outside max radius → `is_within_range: false`, cost still returned

### Error Handling

- [ ] All 404s return RFC 7807 JSON (not HTML)
- [ ] All 422s (validation errors) return RFC 7807 JSON
- [ ] All 401/403s return RFC 7807 JSON
- [ ] Unhandled exceptions return RFC 7807 500

### File Upload

- [ ] Photo upload for menu items works (multipart/form-data)
- [ ] Files stored locally in `media/` in development
- [ ] `MEDIA_BASE_URL` config variable controls the public URL prefix

### Integration Tests

- [ ] `tests/integration/test_menu_api.py` — GET menu returns correct shape
- [ ] `tests/integration/test_orders_api.py` — create order, get active order, advance status
- [ ] `tests/integration/test_auth_api.py` — request OTP, verify OTP, get me
- [ ] All integration tests use a real test database (separate from dev DB)

---

## Files to create or update

- `app/modules/menus/router.py` — add backoffice CRUD routes
- `app/modules/menus/service.py` — add CRUD methods
- `app/modules/menus/schemas.py` — add create/update schemas
- `app/modules/orders/router.py` — add delivery calculate + backoffice list
- `app/modules/orders/service.py` — fix delivery cost wiring, add list, add dashboard stats
- `app/modules/orders/schemas.py` — add list response, dashboard stats schema
- `app/core/config.py` — add MEDIA_BASE_URL
- `app/core/storage.py` — file save utility (new file)
- `tests/integration/test_menu_api.py` (new)
- `tests/integration/test_orders_api.py` (new)
- `tests/integration/test_auth_api.py` (new)
