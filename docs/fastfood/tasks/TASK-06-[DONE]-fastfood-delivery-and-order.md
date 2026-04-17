# TASK-06 — FastFood App: Delivery Options & Place Order

**Status:** DONE  
**Depends on:** TASK-05  
**Blocks:** TASK-07

---

## Read Before Starting

- `apps/fastfood-app/feature/orders/` — read all existing files
- `apps/fastfood-app/feature/cart/hooks/use-cart.hook.ts`
- `apps/fastfood-app/feature/auth/hooks/use-auth.hook.ts`

Do NOT read menus, loading, or backend files.

## Goal

After authentication, the user selects pickup or delivery, optionally enters an address with map confirmation, sees the delivery cost, reviews the order bill, and places the order. A confirmed order ID is stored for the active order view.

---

## Checklist

### Delivery Options Screen

- [ ] Two clear options presented: "Recoger en tienda" and "A domicilio"
- [ ] `data-testid="delivery-options"` on the container
- [ ] `data-testid="delivery-type-pickup"` on the pickup option
- [ ] `data-testid="delivery-type-delivery"` on the delivery option
- [ ] Selecting an option highlights it visually (CSS class toggle, no JS animation library)
- [ ] Selecting "Recoger en tienda" → skips address step, goes directly to bill screen
- [ ] Selecting "A domicilio" → shows address input step

### Address Input (Delivery only)

- [ ] Text input for address — `data-testid="delivery-address-input"`
- [ ] As user types (debounced 500ms) → calls Google Maps Geocoding API to resolve coordinates
- [ ] On successful geocode → shows map with marker at resolved location
- [ ] `data-testid="delivery-map"` on the map container
- [ ] Map uses Google Maps JavaScript API (embed, not static image)
- [ ] Marker is draggable — dragging updates the coordinates used for cost calculation
- [ ] After geocode → calls backend `POST /api/v1/tenants/{slug}/delivery/calculate` with lat/lng
- [ ] `data-testid="delivery-cost"` shows the returned cost (e.g. "Costo de envío: $35.00")
- [ ] If outside delivery radius → shows "Lo sentimos, no llegamos a esa dirección" message
- [ ] If Google Maps API key not set → show address input only (no map), cost still calculated via backend

### Bill / Confirm Screen

- [ ] Shows order summary: all items with name, quantity, unit price, line total
- [ ] Shows subtotal
- [ ] Shows delivery cost (or "Gratis" / "Recoger en tienda" for pickup)
- [ ] Shows total
- [ ] Optional order notes text area — `data-testid="order-notes"`
- [ ] Payment instructions from tenant settings shown (e.g. "Solo efectivo")
- [ ] Disclaimer text: "Al ordenar, aceptas nuestros Términos y Condiciones"
- [ ] "Confirmar pedido" button — `data-testid="confirm-order-button"`
- [ ] Button disabled and shows spinner while API call is in flight
- [ ] On success → navigate to Active Order view (TASK-07)
- [ ] On failure → show error message, keep user on bill screen

### Order Creation

- [ ] `POST /api/v1/tenants/{slug}/orders` called with:
  - `items[]` — each with `menu_item_id`, `quantity`, `note`
  - `delivery_type` — `"recogida"` or `"entrega"`
  - `delivery_address` — filled if delivery type is entrega
  - `delivery_lat`, `delivery_lng` — from geocode if delivery
  - `notes` — optional order notes
- [ ] Response order ID stored (localStorage key: `bb_active_order_id`)
- [ ] Cart cleared after successful order creation

### Back Navigation

- [ ] User can go back from address step to delivery options
- [ ] User can go back from bill to delivery options
- [ ] Cart contents preserved through all steps
- [ ] Going back does not re-trigger API calls

---

## Files to create or update

- `feature/orders/components/delivery-options.component.tsx` (new)
- `feature/orders/components/delivery-address.component.tsx` (new)
- `feature/orders/components/delivery-map.component.tsx` (new)
- `feature/orders/components/bill-screen.component.tsx` (new)
- `feature/orders/hooks/use-checkout.hook.ts` (new — orchestrates steps)
- `feature/orders/services/order.service.ts` — wire createOrder to real API
- `feature/orders/services/delivery.service.ts` (new — geocoding + cost calculation)
- `feature/orders/styles/delivery-options.style.module.css` (new)
- `feature/orders/styles/bill-screen.style.module.css` (new)
- `feature/cart/hooks/use-cart.hook.ts` — add clearCart method
