# TASK-12 — Back Office: Dashboard & Settings

**Status:** PENDING  
**Depends on:** TASK-11  
**Blocks:** TASK-13

---

## Goal

The dashboard shows real business stats pulled from the API. The settings module allows tenant admins to update all business configuration — contact info, delivery rules, payment instructions, and tenant theme — without any code change or redeploy.

---

## Checklist

### Dashboard

- [ ] `GET /api/v1/backoffice/dashboard/stats` called on mount
- [ ] Auto-refreshes every 60 seconds
- [ ] Four stat cards displayed:
  - "Pedidos hoy" — `data-testid="stat-orders-today"`
  - "Ingresos hoy" — formatted as `$XX.XX` — `data-testid="stat-revenue-today"`
  - "Pedidos activos" — `data-testid="stat-active-orders"`
  - "Pagos pendientes" — `data-testid="stat-pending-payments"`
- [ ] Each stat card shows label, value, and a relevant icon (CSS-drawn or Unicode symbol — no icon library)
- [ ] Loading skeleton shown while API is fetching (CSS animation, no JS library)
- [ ] On API error → cards show `--` with an error indicator, no crash

### Settings — Business Info

- [ ] Form fields:
  - Business name (required)
  - Business address (required)
  - Phone number
  - WhatsApp number (required — used for the WhatsApp button in the FastFood app)
  - Description / about
- [ ] "Guardar" → `PUT /api/v1/backoffice/settings` with updated fields
- [ ] On success → success toast
- [ ] On error → inline error message

### Settings — Delivery Config

- [ ] Delivery enabled toggle (true/false)
- [ ] When delivery enabled:
  - Cost per km (numeric, required)
  - Maximum delivery radius in km (numeric, required)
  - Business latitude (required — used as origin for Haversine)
  - Business longitude (required)
- [ ] Latitude/longitude can be entered manually or via a small embedded map (click to set location)
- [ ] "Guardar" → `PUT /api/v1/backoffice/settings`
- [ ] Inline validation: lat must be between -90 and 90, lng between -180 and 180

### Settings — Payment Instructions

- [ ] Textarea for `payment_instructions` (shown to end user on bill screen)
- [ ] Placeholder: "Ej: Solo aceptamos efectivo y transferencia"
- [ ] Max 500 characters, character counter shown
- [ ] "Guardar" → `PUT /api/v1/backoffice/settings`

### Settings — Social Links

- [ ] Fields for: Instagram URL, Facebook URL, TikTok URL (all optional)
- [ ] URL validation (must start with https:// or be empty)
- [ ] "Guardar" → `PUT /api/v1/backoffice/settings`

### Settings — Theme Editor

- [ ] Color pickers for:
  - Primary color (`--color-primary`)
  - Primary foreground (`--color-primary-foreground`)
  - Background (`--color-background`)
  - Surface (`--color-surface`)
  - Text primary (`--color-text-primary`)
  - Text secondary (`--color-text-secondary`)
  - Border (`--color-border`)
- [ ] Live preview panel showing a simulated menu item card with selected colors applied
- [ ] Font URL input (Google Fonts link)
- [ ] Font name input (e.g. "Inter")
- [ ] "Guardar" → `PUT /api/v1/backoffice/theme`
- [ ] After save → CSS variables injected in the preview update immediately

### Settings Navigation

- [ ] Settings page has tabs or sections: Negocio, Entrega, Pagos, Redes sociales, Apariencia
- [ ] Each section has its own "Guardar" button — sections save independently
- [ ] Unsaved changes indicator if user tries to navigate away (browser `beforeunload` + in-page warning)

---

## Files to create or update

- `feature/dashboard/containers/dashboard.container.tsx` — wire to real API
- `feature/dashboard/components/stat-card.component.tsx` (new)
- `feature/dashboard/services/dashboard.service.ts` (new)
- `feature/dashboard/styles/dashboard.style.module.css` — update for real layout
- `feature/settings/containers/settings.container.tsx` — replace placeholder
- `feature/settings/components/business-info-form.component.tsx` (new)
- `feature/settings/components/delivery-config-form.component.tsx` (new)
- `feature/settings/components/payment-instructions-form.component.tsx` (new)
- `feature/settings/components/social-links-form.component.tsx` (new)
- `feature/settings/components/theme-editor.component.tsx` (new)
- `feature/settings/components/theme-preview.component.tsx` (new)
- `feature/settings/hooks/use-settings.hook.ts` (new)
- `feature/settings/services/settings.service.ts` (new)
- `feature/settings/styles/settings.style.module.css` — replace placeholder
- `feature/settings/styles/theme-editor.style.module.css` (new)
