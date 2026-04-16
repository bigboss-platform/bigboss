# TASK-07 — FastFood App: Active Order View

**Status:** PENDING  
**Depends on:** TASK-06  
**Blocks:** TASK-13

---

## Goal

After placing an order the user sees a live status view. The status updates automatically by polling. The user can contact the business via WhatsApp. The view persists across page refreshes.

---

## Checklist

### Entry

- [ ] After successful order creation, user is immediately shown the Active Order view
- [ ] On app load, if `bb_active_order_id` exists in localStorage → show Active Order view instead of menu
- [ ] Active order view replaces the menu experience (full screen)

### Order Status Display

- [ ] `data-testid="active-order-view"` on the root container
- [ ] Order status displayed in Spanish using `ORDER_STATUS_DISPLAY` map:
  - `pending` → "Recibido"
  - `confirmed` → "Confirmado"
  - `preparing` → "Preparando tu pedido"
  - `ready` → "Listo para recoger" (pickup) or "En camino" (delivery)
  - `delivered` → "Entregado"
  - `cancelled` → "Cancelado"
- [ ] `data-testid="order-status"` on the status element
- [ ] Current status visually emphasized (large text, accent color)
- [ ] Visual progress indicator showing completed steps (CSS only)

### Order Summary

- [ ] `data-testid="active-order-items"` on the items list
- [ ] All ordered items shown: name, quantity, price
- [ ] Total shown
- [ ] Delivery type shown ("Recoger en tienda" or "Envío a domicilio")
- [ ] Delivery address shown if applicable

### Polling

- [ ] `GET /api/v1/tenants/{slug}/orders/{order_id}` polled every 15 seconds
- [ ] Status updated in UI without full page reload
- [ ] Polling stops when order reaches `delivered` or `cancelled`
- [ ] Polling continues in background even if screen is idle

### WhatsApp Button

- [ ] WhatsApp contact button always visible — `data-testid="whatsapp-contact"`
- [ ] Links to `https://wa.me/{whatsapp_number}?text=Hola, tengo una pregunta sobre mi pedido #{order_id}`
- [ ] WhatsApp number comes from tenant settings
- [ ] Opens in a new tab

### Order Complete State

- [ ] When status is `delivered` — shows congratulations message, polling stops
- [ ] "Hacer otro pedido" button clears `bb_active_order_id` from localStorage and returns to menu
- [ ] `data-testid="new-order-button"` on this button

### Order Cancelled State

- [ ] When status is `cancelled` — shows cancellation message
- [ ] "Volver al menú" button clears storage and returns to menu

### Persistence

- [ ] Refreshing the page while order is active restores the order view (from localStorage order ID + API fetch)
- [ ] If order ID in storage returns 404 from API → clear storage, go to menu

---

## Files to create or update

- `feature/orders/containers/active-order.container.tsx` (new)
- `feature/orders/components/order-status-display.component.tsx` (new)
- `feature/orders/components/order-items-summary.component.tsx` (new)
- `feature/orders/hooks/use-active-order.hook.ts` (new — polling logic)
- `feature/orders/styles/active-order.style.module.css` (new)
- `feature/menus/components/menu-experience-client.component.tsx` — check for active order on mount
