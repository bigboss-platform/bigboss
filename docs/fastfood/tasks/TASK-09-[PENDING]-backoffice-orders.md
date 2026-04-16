# TASK-09 — Back Office: Orders Management

**Status:** PENDING  
**Depends on:** TASK-08  
**Blocks:** TASK-10

---

## Goal

Staff can see all incoming orders in real time, filter by status, select an order to view its full detail, advance its status, and update all payment information. This is the primary daily-use screen.

---

## Checklist

### Orders List

- [ ] `GET /api/v1/backoffice/orders` called on mount with auth token
- [ ] Auto-refreshes every 10 seconds (`ORDER_POLL_INTERVAL_MS = 10000`)
- [ ] Orders displayed as cards sorted by `created_at` descending (newest first)
- [ ] `data-testid="order-list"` on the list container
- [ ] `data-testid="order-card"` on each order card
- [ ] Each card shows: order ID (last 6 chars), delivery type, status badge, payment status badge, total, time elapsed since creation
- [ ] New orders (< 60 seconds old) get a visual "NUEVO" badge

### Status Filter

- [ ] Filter bar with buttons for each status + "Todos"
- [ ] `data-testid="status-filter-{status}"` on each filter button (e.g. `status-filter-preparing`)
- [ ] Active filter highlighted
- [ ] Changing filter calls API with `?status=` param immediately (does not wait for next poll)
- [ ] Filter persists if page auto-refreshes (stored in component state, not URL — no page reload occurs)

### Order Detail Panel

- [ ] Clicking an order card opens a detail panel (side panel on desktop, full-screen on mobile)
- [ ] `data-testid="order-detail"` on the panel
- [ ] Panel shows: all order items with name/qty/price, subtotal, delivery cost, total, delivery type, delivery address if applicable, order notes, timestamps

### Status Management

- [ ] Current status shown with label in Spanish
- [ ] "Avanzar estado" button advances order to next logical status:
  - `pending` → `confirmed`
  - `confirmed` → `preparing`
  - `preparing` → `ready`
  - `ready` → `delivered`
- [ ] Button label shows the next status name (e.g. "Marcar como preparando")
- [ ] `data-testid="advance-status-button"` on this button
- [ ] "Cancelar pedido" button available for orders not yet `delivered`
- [ ] Both buttons disabled while API call is in flight
- [ ] On success → order card and detail panel update immediately (optimistic or re-fetch)
- [ ] On error → `data-testid="success-toast"` replaced with error toast

### Payment Management

- [ ] Payment section visible in order detail for all orders
- [ ] Current payment status shown
- [ ] "Editar pago" button opens payment edit form inline — `data-testid="edit-payment-button"`
- [ ] Payment form fields:
  - Payment method select: Efectivo, Tarjeta, Transferencia — `data-testid="payment-method-input"`
  - Amount received number input — `data-testid="payment-amount-input"`
  - Reference/note text input — `data-testid="payment-reference-input"`
  - Notes textarea — `data-testid="payment-notes-input"`
  - Payment status select: Pendiente, Parcial, Pagado, Sin cobro — `data-testid="payment-status-input"`
- [ ] "Guardar" button calls `PATCH /api/v1/backoffice/orders/{id}/payment` — `data-testid="save-payment-button"`
- [ ] "Cancelar" discards changes without API call
- [ ] On success → payment section updates, shows `data-testid="success-toast"`

### Toast Notifications

- [ ] Success toast appears for 3 seconds after successful status or payment update
- [ ] Error toast appears for 5 seconds on API errors
- [ ] Toasts do not block the UI

---

## Files to create or update

- `feature/orders/containers/order-list.container.tsx` — wire to real API + polling
- `feature/orders/components/order-card.component.tsx` (new)
- `feature/orders/components/order-detail-panel.component.tsx` (new)
- `feature/orders/components/order-status-controls.component.tsx` (new)
- `feature/orders/components/order-payment-form.component.tsx` (new)
- `feature/orders/hooks/use-order-list.hook.ts` — update to pass token from session
- `feature/orders/hooks/use-order-detail.hook.ts` (new)
- `feature/orders/services/order.service.ts` — wire all endpoints
- `feature/orders/styles/order-card.style.module.css` (new)
- `feature/orders/styles/order-detail-panel.style.module.css` (new)
- `feature/shared/components/toast.component.tsx` (new)
- `feature/shared/hooks/use-toast.hook.ts` (new)
