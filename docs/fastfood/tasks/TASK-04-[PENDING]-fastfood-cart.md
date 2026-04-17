# TASK-04 — FastFood App: Cart Drawer

**Status:** PENDING  
**Depends on:** TASK-03  
**Blocks:** TASK-05

---

## Read Before Starting

- `apps/fastfood-app/feature/cart/` — read all existing files
- `apps/fastfood-app/feature/shared/components/drawer.component.tsx`
- `apps/fastfood-app/feature/menus/components/menu-experience-client.component.tsx`
- `apps/fastfood-app/app/globals.css` — existing keyframe animation names

Do NOT read auth, orders, or loading features.

## Goal

The cart drawer opens when the user taps "Agregar", manages quantities and per-item notes, shows totals, and has a checkout button that triggers the auth flow. The drawer is accessible and keyboard-navigable.

---

## Checklist

### Add to Cart

- [ ] Tapping "Agregar" on any menu item adds it to cart and opens the drawer
- [ ] If item is already in cart, tapping "Agregar" increases quantity by 1 (does not add duplicate)
- [ ] Cart state persists while navigating between menu items (does not reset on scroll)

### Drawer Behavior

- [ ] Drawer slides in from the bottom on mobile (CSS `slide-in-right` or bottom sheet variant)
- [ ] Overlay (semi-transparent backdrop) appears behind drawer
- [ ] Tapping overlay closes drawer
- [ ] Pressing Escape key closes drawer
- [ ] Body scroll locked while drawer is open
- [ ] `data-testid="cart-drawer"` on the drawer root element
- [ ] Drawer has a visible close button (`data-testid="cart-close"`)

### Cart Items List

- [ ] Each cart item shows: name, unit price, quantity controls (− and +), line total
- [ ] Tapping `+` increases quantity
- [ ] Tapping `−` decreases quantity; at 1 it removes the item from cart
- [ ] Per-item note input — optional text field under each item (placeholder: "Nota para este producto")
- [ ] Note value stored in cart state and sent with order
- [ ] `data-testid="cart-item"` on each row
- [ ] `data-testid="cart-item-increase"` and `data-testid="cart-item-decrease"` on controls

### Totals

- [ ] Subtotal shown — sum of (price × quantity) for all items
- [ ] "Subtotal" label and value visible at bottom of cart
- [ ] Delivery cost shown as "Por calcular" until delivery type is selected (handled in TASK-06)
- [ ] Total shown below subtotal

### Checkout Button

- [ ] "Ir a pagar" button visible at bottom of drawer
- [ ] `data-testid="checkout-button"` on the button
- [ ] Tapping it: if user not authenticated → triggers OTP auth flow (TASK-05); if authenticated → goes directly to delivery options (TASK-06)
- [ ] Button disabled and shows spinner while auth is in progress

### Empty State

- [ ] If cart is empty and drawer is somehow opened, shows "Tu carrito está vacío" message
- [ ] "Agregar productos" prompt with no checkout button visible

### Cart Icon / Badge

- [ ] A persistent cart icon or floating button shows the current item count
- [ ] Badge updates in real time as items are added/removed
- [ ] `data-testid="cart-badge"` on the badge element
- [ ] Tapping it reopens the drawer

---

## Files to update or create

- `feature/cart/hooks/use-cart.hook.ts` — wire add, increase, decrease, note, open/close
- `feature/cart/components/cart-drawer.component.tsx` (new)
- `feature/cart/components/cart-item-row.component.tsx` (new)
- `feature/cart/styles/cart-drawer.style.module.css` (new)
- `feature/cart/styles/cart-item-row.style.module.css` (new)
- `feature/shared/components/drawer.component.tsx` — ensure overlay + escape + body lock work
- `feature/menus/components/menu-experience-client.component.tsx` — wire useCart, pass to items
