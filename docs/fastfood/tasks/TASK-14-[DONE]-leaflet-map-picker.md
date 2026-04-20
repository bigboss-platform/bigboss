# TASK-14 — Leaflet Map Picker & Delivery Coordinates

**Status:** DONE  
**Depends on:** TASK-06  
**Blocks:** nothing

---

## Context

The original plan used Google Maps API for the delivery map. Decision changed: we do not use Google Maps API — it costs money. The replacement is Leaflet + OpenStreetMap, which is fully free and requires no API key.

**User flow for delivery:**
1. End user opens delivery options → selects "Delivery"
2. A map opens centered on their current GPS location (browser geolocation)
3. User drags a pin to confirm exact delivery spot
4. User types their address in a required text input
5. Coordinates (`lat`, `lng`) + address string are saved with the order

**Delivery guy:** receives a plain URL `https://maps.google.com/?q={lat},{lng}` — no API, just a link.

**Back office:** order detail shows coordinates + a "Ver en Google Maps" button that opens the same plain URL.

---

## Read Before Starting

- `apps/fastfood-app/feature/orders/components/delivery-map.component.tsx` — current map implementation to replace
- `apps/fastfood-app/feature/orders/components/delivery-address.component.tsx` — address input component
- `apps/fastfood-app/feature/orders/components/delivery-options.component.tsx` — parent that renders map + address
- `apps/fastfood-app/feature/orders/hooks/use-checkout.hook.ts` — checkout state (coordinates live here)
- `apps/fastfood-app/feature/orders/interfaces/geocode-result.interface.ts` — coordinate shape
- `apps/fastfood-app/feature/orders/services/delivery.service.ts` — delivery cost service
- `apps/fastfood-app/.env.local` — remove Google Maps key
- `apps/fastfood-app/.env.local.example` — remove Google Maps key
- `apps/fastfood-backoffice/feature/orders/` — read all files to understand order detail view

Do NOT read files outside `feature/orders/` in either app unless a direct import forces it.

---

## Checklist

### FastFood App — Leaflet map picker

- [ ] Install `leaflet` and `@types/leaflet` as dependencies in `apps/fastfood-app/package.json`
- [ ] Rewrite `delivery-map.component.tsx` using Leaflet:
  - [ ] On mount, call `navigator.geolocation.getCurrentPosition` to center the map on the user
  - [ ] Fall back to a default lat/lng (Bogotá: `4.7109, -74.0721`) if geolocation is denied
  - [ ] Render a draggable marker — when user drops it, emit the new `{ lat, lng }` to parent
  - [ ] Map tiles from OpenStreetMap: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
  - [ ] Add Leaflet CSS import (via `next/head` or global CSS import — whatever works with Next.js App Router)
  - [ ] Component must be `"use client"` and use dynamic import with `ssr: false` (Leaflet requires browser)
  - [ ] `data-testid="delivery-map"` on the map wrapper div
- [ ] `delivery-address.component.tsx`:
  - [ ] Address text input must be `required` — cannot submit order without it
  - [ ] `data-testid="address-input"` on the input
- [ ] Remove `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` from `apps/fastfood-app/.env.local`
- [ ] Remove `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` from `apps/fastfood-app/.env.local.example`

### Back Office — coordinates display

- [ ] In the order detail view, display the delivery coordinates if present (`lat`, `lng`)
- [ ] Add a "Ver en Google Maps" button/link: `href="https://maps.google.com/?q={lat},{lng}"`, `target="_blank"`, `rel="noopener noreferrer"`
- [ ] `data-testid="google-maps-link"` on that anchor element
- [ ] If the order is pickup (no coordinates), do not render the link

### E2E spec update

- [ ] Update `apps/fastfood-app/tests/e2e/order-flow-delivery.spec.ts`:
  - [ ] The "shows map after address is entered" test should now check for `[data-testid="delivery-map"]`
  - [ ] Add assertion that address input is present: `[data-testid="address-input"]`

---

## Acceptance Criteria

- No reference to `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` anywhere in the `fastfood-app` codebase
- `pnpm type-check` passes in both apps
- `pnpm lint` passes in both apps
- The delivery map opens centered on the user's location (or Bogotá fallback)
- Dragging the pin updates the coordinates sent with the order
- Address field is required — order cannot be placed without it
- Back office order detail shows a working "Ver en Google Maps" link for delivery orders
