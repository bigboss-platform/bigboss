# TASK-10 — Back Office: Chef View

**Status:** PENDING  
**Depends on:** TASK-09  
**Blocks:** TASK-11

---

## Goal

The chef view displays active orders as large, easy-to-read cards on a kitchen screen. Staff can advance order status with a single tap. Cards auto-refresh. This screen is designed to be used on a tablet mounted in the kitchen.

---

## Checklist

### Board Layout

- [ ] `data-testid="chef-board"` on the root container
- [ ] Orders displayed in a card grid (2 columns on tablet, 1 on mobile)
- [ ] Only active orders shown: status is `confirmed` or `preparing` (not `pending`, `ready`, `delivered`, `cancelled`)
- [ ] Orders sorted by `created_at` ascending (oldest first — most urgent)
- [ ] Empty state shown when no active orders: "Sin pedidos activos" message

### Order Cards

- [ ] Each card displays:
  - Order ID (last 6 characters, large font)
  - Time elapsed since creation (e.g. "hace 5 min"), updates every minute
  - Delivery type badge: "Recoger" or "Envío"
  - All items listed: quantity + name + note (if any)
  - One action button
- [ ] Cards visually change color after 15 minutes (warning: order is taking long) — CSS class toggle only
- [ ] `data-testid="chef-order-card"` on each card

### Advance Status Button

- [ ] Each card has a single large action button:
  - `confirmed` → button says "Empezar a preparar" → advances to `preparing`
  - `preparing` → button says "Listo" → advances to `ready`
- [ ] `data-testid="chef-advance-button"` on each card's button
- [ ] After advancing to `ready`, card disappears from the board (filter removes it)
- [ ] Button disabled while API call is in flight for that card
- [ ] Other cards remain interactive during the API call

### Auto-Refresh

- [ ] Board polls `GET /api/v1/backoffice/orders?status=confirmed,preparing` every 10 seconds
- [ ] New orders appear without manual refresh
- [ ] `data-testid="chef-board"` remains mounted during refresh (no flicker)

### Optimistic Updates

- [ ] When staff taps the action button, the card's status updates immediately in the UI
- [ ] If the API call fails → card reverts to previous status + shows brief error indicator

---

## Files to create or update

- `feature/chef-view/containers/chef-board.container.tsx` — wire to real API
- `feature/chef-view/components/chef-order-card.component.tsx` (new)
- `feature/chef-view/hooks/use-chef-board.hook.ts` (new — polling + advance logic)
- `feature/chef-view/styles/chef-board.style.module.css` — update for real layout
- `feature/chef-view/styles/chef-order-card.style.module.css` (new)
