# BigBoss FastFood — Product Specification

**Version:** 1.0  
**Status:** Official  
**Last updated:** 2026-04-15

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Terminology — FastFood Specific](#2-terminology--fastfood-specific)
3. [Tenant Theming System](#3-tenant-theming-system)
4. [End-User App — Screens and Flows](#4-end-user-app--screens-and-flows)
   - 4.1 [Loading Screen](#41-loading-screen)
   - 4.2 [Menu Experience](#42-menu-experience)
   - 4.3 [Cart Drawer](#43-cart-drawer)
   - 4.4 [Authentication Flow](#44-authentication-flow)
   - 4.5 [Delivery Flow](#45-delivery-flow)
   - 4.6 [Bill and Order Confirmation](#46-bill-and-order-confirmation)
   - 4.7 [Navigation States](#47-navigation-states)
   - 4.8 [Active Order View](#48-active-order-view)
   - 4.9 [Floating WhatsApp Button](#49-floating-whatsapp-button)
   - 4.10 [Social Links](#410-social-links)
5. [Back Office — Modules](#5-back-office--modules)
6. [Menu Architecture — Dynamic Menus](#6-menu-architecture--dynamic-menus)
7. [Data Entities](#7-data-entities)
8. [API Contracts — High Level](#8-api-contracts--high-level)
9. [Frontend Feature Modules Breakdown](#9-frontend-feature-modules-breakdown)
10. [Animation Specification](#10-animation-specification)
11. [Google Maps Integration — Free Tier Strategy](#11-google-maps-integration--free-tier-strategy)
12. [End-User Data Collection Strategy](#12-end-user-data-collection-strategy)
13. [Out of Scope — First Version](#13-out-of-scope--first-version)

---

## 1. Product Overview

**BigBoss FastFood** is a tenant-branded, end-user facing ordering application for fast food businesses. It is not a generic food listing app — it is an immersive, full-screen, animation-first experience that represents each tenant's brand identity.

The app is accessed by end users via a URL unique to each tenant (e.g., `burgers.bigboss.io/tenant-slug` or a custom domain). The entire visual identity — colors, logo, fonts — is driven by each tenant's configuration stored in the database. No code changes are needed to rebrand for a new tenant.

**Current implementation tenant:** A burger business with 3 signature burgers and a drinks menu.

**Business model note:** Every interaction an end user has with the app is a data collection opportunity. End-user data (phone, location, ordering habits, visit frequency) is valuable to BigBoss. Data collection must be invisible to the end user — it must never interrupt the ordering experience. See [Section 12](#12-end-user-data-collection-strategy).

---

## 2. Terminology — FastFood Specific

These terms extend the [master glossary](01-master-architecture.md#2-official-terminology-glossary) for FastFood context.

| Term | Definition |
|---|---|
| **Menu** | A collection of menu sections belonging to one tenant. Dynamic, fully configurable per tenant. |
| **Menu Section** | A grouping of menu items (e.g., "Burgers", "Bebidas"). Each section has its own visual experience. |
| **Menu Item** | A single orderable product within a menu section. Has name, description, photo, price, availability. |
| **Cart** | The end user's current selection of items before ordering. Not persisted unless logged in. |
| **Cart Item** | A menu item added to the cart, with quantity and optional note. |
| **Order** | A confirmed cart submitted by a logged-in end user. |
| **Ordenar** | The CTA button (Spanish: "Order"). This is the confirmed button label — do not translate or rename it. |
| **Drawer** | The right-side sliding panel that contains cart, auth, delivery, and billing flows. |
| **Active Order** | An order that has been placed and is currently being processed (not yet delivered or cancelled). |
| **Chef View** | The Back Office section used by kitchen staff to manage incoming orders. |
| **Tenant Theme** | The set of colors, logo, and brand config that defines a tenant's visual identity in the app. |

---

## 3. Tenant Theming System

Each tenant has a complete visual identity stored in the database. The app applies this identity via **CSS custom properties injected at runtime** — no rebuild or redeployment is needed when a tenant updates their theme.

### Tenant Theme Configuration

```typescript
// Stored in DB — public.tenant_themes table (linked to tenants)
interface ITenantTheme {
    tenantId: string
    primaryColor: string           // hex — main brand color (buttons, accents)
    primaryColorHover: string      // hex — hover state of primary
    secondaryColor: string         // hex — supporting accent
    backgroundColor: string        // hex — page background
    surfaceColor: string           // hex — card/surface background
    textPrimaryColor: string       // hex
    textSecondaryColor: string     // hex
    fontFamilyUrl: string          // Google Fonts or uploaded font URL
    fontFamilyName: string         // CSS font-family value
    logoUrl: string                // CDN URL of tenant logo (used on loading screen)
    faviconUrl: string
    primaryButtonTextColor: string // usually white or dark depending on primaryColor
    loadingScreenBackgroundColor: string  // can differ from backgroundColor
}
```

### Runtime Application

When the end-user app loads for a tenant, the server fetches the tenant theme and injects it as a `<style>` block in the document `<head>` as CSS custom properties overriding the base design tokens:

```html
<style id="tenant-theme">
  :root {
    --color-primary: #e63946;
    --color-primary-hover: #c1121f;
    --color-background: #1a1a2e;
    --font-family-base: 'Oswald', sans-serif;
    /* ... all other tokens */
  }
</style>
```

This means every CSS variable reference in every component automatically reflects the tenant's brand. No component needs to know it is themed.

### Back Office — Theme Editor

The Back Office includes a visual theme editor where the tenant admin can:
- Upload logo and favicon
- Pick brand colors via a color picker (with live preview)
- Select a font from a curated list of Google Fonts
- Preview the app with their theme before saving
- Revert to previous theme

---

## 4. End-User App — Screens and Flows

### 4.1 Loading Screen

**Purpose:** First impression. Sets the brand tone immediately.

**Behavior:**
- Covers the full viewport on initial app load
- Background color: `--loading-screen-background-color` from tenant theme
- Center of screen: tenant logo
- Logo entrance animation: custom CSS keyframe animation (scale + fade)
- Simultaneous background animation: subtle pulse or gradient shift using tenant primary color
- Loading screen exit: the entire screen slides up and out (or dissolves) to reveal the menu below
- The menu must be fully loaded before the loading screen exits — the loading screen doubles as the data fetch wait state
- Minimum display time: 1.5 seconds even if data loads faster (brand moment, not just a spinner)

**What loads during this screen:**
- Tenant theme (already server-injected, so instant)
- First menu section data (the first burger / hero item)
- End user session check (is this user logged in?)

**No interaction** is available on the loading screen. It is not skippable.

---

### 4.2 Menu Experience

**Purpose:** The core product experience. Full-screen, immersive, scroll-driven.

**Layout:** Full viewport. One menu item is visible at a time. The experience is vertical scroll — scroll down for next item, scroll up for previous.

**Each menu item screen contains:**
- Item photo (full-bleed background or large feature image — provided by tenant graphic designer)
- Item name — with entrance animation (slides in, or letter-by-letter reveal)
- Item description (short, one line)
- Item price
- "Agregar" / Add button (opens cart drawer and adds item)

**Scroll behavior:**
- Scroll snapping — each scroll moves exactly to the next/previous item
- Transition between items: the outgoing item slides or fades out, the incoming item animates in
- Visual hint to scroll: subtle animated arrow or dot indicator at the bottom
- The transition animation is the centerpiece — this is where visual quality lives

**Menu sections:**
- Initially, the app shows the active section (e.g., Burgers)
- Switching sections (e.g., to Bebidas/Drinks) replaces the entire item stack with the new section's items
- Section switching triggers a full transition animation

**Item order:**
- Items within a section are ordered by the `sort_order` field set by the tenant admin in Back Office
- The first item in the first section is always shown first after the loading screen

**Scroll direction:**
- Scroll down → next item
- Scroll up → previous item
- Touch swipe up/down on mobile mirrors scroll

---

### 4.3 Cart Drawer

**Purpose:** The right-side panel for order management. Opens without navigating away from the menu.

**Trigger:** Clicking "Agregar" on any menu item opens the drawer and adds the item.

**Drawer behavior:**
- Slides in from the right side of the screen
- Width: 100% on mobile, ~420px on desktop
- The menu behind the drawer is still visible (partially) on desktop and dimmed with an overlay
- Closing: swipe right, click overlay, or click a close button inside the drawer

**Drawer contents:**

```
┌─────────────────────────────────┐
│  Your Order            [close]  │
├─────────────────────────────────┤
│  🍔 Classic Burger              │
│     [−] 2 [+]         $17.98   │
│     [+ Add note]                │
│                                 │
│  🥤 Cola                        │
│     [−] 1 [+]          $2.50   │
│     [+ Add note]                │
├─────────────────────────────────┤
│  Subtotal              $20.48   │
│  Delivery              $2.00    │
│  Total                 $22.48   │
├─────────────────────────────────┤
│       [ ORDENAR ]               │
└─────────────────────────────────┘
```

**Cart Item controls:**
- `[−]` button: decrease quantity. If quantity reaches 0, item is removed from cart with a slide-out animation
- `[+]` button: increase quantity
- `[+ Add note]`: expands an inline text input below the item for the end user to add a note (e.g., "no onions"). The note collapses back into a summary line once the user blurs the input.
- Quantity and note changes update the price and total in real time

**Price display:**
- Subtotal: sum of all items
- Delivery: shown as "— " until delivery address is set
- Total: subtotal + delivery

**ORDENAR button:**
- If end user is not logged in → triggers [Authentication Flow](#44-authentication-flow) inside the drawer
- If end user is logged in → triggers [Delivery Flow](#45-delivery-flow) inside the drawer
- The button label is always "ORDENAR" regardless of tenant language preference in v1

**Empty cart state:**
- If the cart is empty and the drawer is open, show a friendly empty state message and a button to browse menu
- ORDENAR button is disabled and visually distinct when cart is empty

---

### 4.4 Authentication Flow

**Trigger:** End user clicks ORDENAR and has no active session.

**Location:** All steps happen inside the Drawer. The drawer does not close.

**Step 1 — Phone Number Entry**
- Screen: a clean input asking for phone number
- Input: phone number field with country code selector
- CTA button: "Enviar código" (Send code)
- Subtext: "Te enviaremos un código de verificación" (We'll send you a verification code)
- No email, no password, no name asked here

**Step 2 — OTP Code Entry**
- Screen: 4 or 6 digit OTP input (individual digit boxes)
- Auto-advance to next box as user types each digit
- Timer showing how long the code is valid (60 seconds)
- "Reenviar código" (Resend code) link appears after timer expires
- CTA button: "Verificar" (Verify)

**Account Creation (automatic):**
- If phone number has no account → the OTP verification creates the account automatically
- No registration form, no extra steps
- After successful OTP verification, the end user is logged in and the flow continues
- The account is created with: phone number, first-seen timestamp, tenant association
- The end user is not told explicitly that an account was created — they simply proceed

**Account Login:**
- If phone number already has an account → same OTP flow, same behavior
- The experience is identical for new and returning users

**Error states:**
- Invalid OTP: show inline error, allow retry (up to 3 attempts then lock for 5 minutes)
- Network error: show retry button
- OTP expired: show "resend" prompt

**After successful verification:**
- Drawer transitions to the [Delivery Flow](#45-delivery-flow)
- The login button in the main UI is replaced by the user menu (see [Navigation States](#47-navigation-states))

---

### 4.5 Delivery Flow

**Trigger:** End user is authenticated and clicks ORDENAR.

**Location:** All steps inside the Drawer.

**Step 1 — Delivery or Pickup**

```
┌──────────────────────────────────┐
│  ¿Cómo quieres recibirlo?        │
│                                  │
│  [ 🛵 Delivery ]  [ 🏪 Recoger ] │
└──────────────────────────────────┘
```

- Two options: Delivery or Pickup (Recoger)
- If Pickup: skip map, go directly to [Bill Screen](#46-bill-and-order-confirmation)

**Step 2 — Delivery Address (if delivery selected)**

- Google Maps embedded in the drawer
- Map auto-centers near the end user's current location (browser geolocation API)
- End user can drag the map or search for an address
- A centered pin on the map represents the selected delivery point
- The address field above the map shows the resolved address from the pin location (reverse geocoding)
- CTA button: "Confirmar dirección"

**Delivery cost calculation:**
- After address is confirmed, the backend calculates delivery cost using:
  - Straight-line distance between tenant location and end user location (Haversine formula — no Google API needed for this)
  - Tenant-configured pricing tiers (e.g., 0–2km = $1, 2–5km = $2, 5km+ = not available)
- Distance calculation does NOT use Google Distance Matrix API (free tier preservation)
- Google Maps is used only for address selection and display — not for routing or distance

**Out of range:**
- If the calculated distance exceeds the tenant's max delivery radius, show a message and offer Pickup as the only option

---

### 4.6 Bill and Order Confirmation

**Location:** Inside the Drawer.

**Bill Screen:**

```
┌─────────────────────────────────────┐
│  Resumen de tu pedido               │
├─────────────────────────────────────┤
│  Classic Burger x2       $17.98     │
│  Cola x1                  $2.50     │
├─────────────────────────────────────┤
│  Subtotal                $20.48     │
│  Delivery                 $2.00     │
│  Total                   $22.48     │
├─────────────────────────────────────┤
│  Entregar en:                       │
│  Calle 45 #12-30, Barrio Centro     │
│                                     │
│  Forma de pago:                     │
│  El staff gestionará el pago        │
├─────────────────────────────────────┤
│  [ ACEPTAR Y ORDENAR ]              │
│                                     │
│  Al ordenar, aceptas nuestros       │
│  Términos y Condiciones y           │
│  Política de Privacidad.            │
└─────────────────────────────────────┘
```

**Disclaimer text** (below the button): short legal text informing the user they accept Terms of Service and Privacy Policy. Links to static pages. This is the legal cover for data collection.

**"ACEPTAR Y ORDENAR" button:**
- Creates the order in the backend
- Clears the local cart
- Transitions the drawer to the [Active Order View](#48-active-order-view)
- The order is sent to the Back Office in real time

**Payment note:** Payment is handled manually by the tenant's staff. The bill screen informs the end user that the staff will manage the payment. The actual payment method, amount confirmed, and any relevant payment notes are recorded by staff in the Back Office after the order is placed. Automatic payment processing is planned for a future version.

---

### 4.7 Navigation States

The main menu screen has a floating navigation element (position TBD with designer and UX expert). This element changes based on the end user's state.

**State 1 — Not Logged In:**

```
[ Iniciar sesión ]
```
A single button. Clicking it opens the Drawer and shows the [Authentication Flow](#44-authentication-flow) without requiring a cart interaction.

**State 2 — Logged In, No Active Order:**

Clicking the user element reveals a small popup or bottom sheet with 3 options:

```
┌─────────────────┐
│  🥤 Bebidas     │   → switches menu section to drinks
│  🛒 Carrito     │   → opens the Drawer showing the cart
│  👤 Mi cuenta   │   → opens profile/config view
└─────────────────┘
```

- **Bebidas**: switches the full-screen menu to the drinks section with a section transition animation
- **Carrito**: opens the Drawer to the cart state
- **Mi cuenta**: opens a profile screen (inside the Drawer or a separate modal) where the user can update their name, phone, and notification preferences

**State 3 — Logged In, Active Order Exists:**

The element changes to an order status indicator (e.g., a pulsing badge with "Ver pedido"). Clicking it goes directly to the [Active Order View](#48-active-order-view).

---

### 4.8 Active Order View

**Access:** When the end user has a placed order that has not been delivered or cancelled.

**This view replaces the cart drawer content** and is the primary interaction surface when an order is live.

**Layout:**

```
┌────────────────────────────────────┐
│  Tu pedido                         │
│  Estado: En preparación  🟡        │
├────────────────────────────────────┤
│  Classic Burger x2                 │
│  Cola x1                           │
│                                    │
│  Total: $22.48                     │
├────────────────────────────────────┤
│  Información de pago               │
│  Pago en efectivo al recibir       │
│                                    │
│  Dirección:                        │
│  Calle 45 #12-30, Barrio Centro    │
├────────────────────────────────────┤
│  ─────────── Bottom Bar ────────── │
│  [📋 Detalle] [👤 Mi perfil] [📜 Historial] │
└────────────────────────────────────┘
```

**Order Status Values (visible to end user):**
| Backend Status | Display Text | Indicator Color |
|---|---|---|
| `pending` | Esperando confirmación | Gray |
| `confirmed` | Pedido confirmado | Blue |
| `preparing` | En preparación | Yellow |
| `ready` | ¡Listo para recoger! / En camino | Green |
| `delivered` | Entregado | Green |
| `cancelled` | Cancelado | Red |

**Status updates:** The view polls the order status every 15 seconds OR uses WebSocket if infrastructure allows (v1: polling).

**Bottom Bar (mobile-style tab bar):**
- **Detalle** — current view (order status + info)
- **Mi perfil** — form to update name, delivery preferences
- **Historial** — list of past orders with date, items, total, and status

---

### 4.9 Floating WhatsApp Button

**Always visible** in the end-user app (on all screens except the loading screen).

**Position:** Bottom-right corner, above any other floating elements.

**Behavior:**
- Clicking opens WhatsApp (app on mobile, web.whatsapp.com on desktop) with a pre-filled message
- The message is personalized: includes the tenant's business name and optionally the end user's name if logged in
- Example: `"Hola, quiero hacer una consulta sobre mi pedido en Burgers BigBoss"`
- The WhatsApp phone number is configured by the tenant admin in Back Office
- The message template is also configurable by the tenant admin

**The WhatsApp number and message template are required fields** in tenant onboarding. The button is hidden if the tenant has not configured a WhatsApp number.

---

### 4.10 Social Links

**Position and visual treatment:** TBD with graphic designer and UX expert.

**Supported platforms (tenant-configurable, all optional):**
- Instagram
- Facebook
- TikTok
- WhatsApp (secondary entry point — same as floating button target)
- Twitter / X

Each social link is a URL configured by the tenant admin in Back Office. Links that are not configured are not shown. The icons are standard SVG icons for each platform.

---

## 5. Back Office — Modules

The Back Office is a separate Next.js application (`apps/fastfood-backoffice`). It is mobile-oriented — designed first for a tablet or large phone, usable on desktop. The tenant admin manages the entire business from here.

### Module List

| Module | Description |
|---|---|
| **Dashboard** | Key metrics at a glance: orders today, revenue today, active orders count, most popular items |
| **Orders** | Real-time list of all orders. Filter by status and payment status. Open each order for full detail and payment management. |
| **Chef View** | Simplified, large-text view optimized for kitchen staff. Shows only active orders. Tap to advance status (Confirmed → Preparing → Ready). |
| **Menu Manager** | Create, edit, reorder menu sections and menu items. Upload item photos. Set availability. |
| **Catalog** | Manage menu item details, prices, descriptions, and photos independent of menu order |
| **End Users** | View registered end users, their order history, and contact info |
| **Analytics** | Graphs and metrics: daily/weekly/monthly revenue, orders by hour, best-selling items, delivery vs pickup ratio, end-user retention |
| **Delivery Zones** | Configure the delivery radius and pricing tiers (km → price mapping) |
| **Theme Editor** | Set brand colors, upload logo/favicon, select font, preview and publish |
| **Settings** | Business name, address, tenant coordinates (for delivery distance calc), WhatsApp number, message template, social links, operating hours |
| **Tenant Admin Users** | Manage staff accounts that have access to the Back Office. Assign roles (Admin, Chef). |

### Back Office Roles

| Role | Access |
|---|---|
| **Owner** (Tenant Admin) | Full access to all modules |
| **Chef** | Chef View only — can only advance order status |
| **Staff** | Orders view (read), Chef View |

### Payment Management — Order Detail View

Payment is handled entirely by staff through the Back Office. When staff opens any order they see a **Payment Panel** alongside the order details.

**Payment Panel fields (all editable by staff):**

| Field | Type | Description |
|---|---|---|
| Payment Status | Dropdown | `Pendiente`, `Pago parcial`, `Pagado`, `Condonado` |
| Payment Method | Free text | Staff types the method: "Efectivo", "Transferencia Bancolombia", "Nequi", etc. Not a fixed enum — tenants may use any method |
| Amount Received | Number | Actual amount collected. Pre-filled with the order total but editable (e.g., partial payment) |
| Payment Reference | Text | Optional: transfer confirmation number, receipt ID, etc. |
| Payment Notes | Textarea | Any additional notes about the payment situation |

**Workflow:**
1. A new order arrives with `payment_status = pending`
2. Staff fulfills the order (delivery or pickup)
3. Staff opens the order in Back Office, fills in how payment was collected, and saves
4. The order record is updated with the payment details and the staff member's ID
5. The order list filters allow viewing all orders with pending payment — useful for end-of-day reconciliation

**Payment status filter on order list:**
- The order list in Back Office can be filtered by `payment_status`
- This allows staff to quickly see all unpaid or partially paid orders
- Useful for end-of-day cash reconciliation and following up on pending payments

**End user visibility:**
- The end user's Active Order View shows the `payment_instructions` text configured by the tenant in Settings
- The end user does not see the internal payment fields filled by staff
- Once the order is marked as `Pagado`, no further payment information is surfaced to the end user — the order simply shows as completed

**Future — Automatic Payments:**
The payment fields and `payment_status` enum are designed to be compatible with an automatic payment gateway integration. When automatic payments are implemented, the gateway will write to the same fields automatically, and the manual staff workflow will become a fallback for failed or disputed transactions.

---

### Chef View Detail

The Chef View is a standalone page within the Back Office designed for the kitchen:
- Large cards for each active order
- Each card shows: order number, items with quantities and notes, time since order was placed
- A single large button per card to advance status to the next stage
- Status flow: Confirmed → Preparing → Ready
- Sound notification when a new order arrives (browser notification API)
- Auto-refreshes every 10 seconds

---

## 6. Menu Architecture — Dynamic Menus

The menu system is the most flexible part of the platform. It must support any tenant's product structure without code changes.

### Data Model

```
Menu (1 per tenant per product)
└── MenuSection[] (e.g., "Burgers", "Bebidas")
    ├── sort_order: int
    ├── is_active: bool
    └── MenuItem[]
        ├── name: str
        ├── description: str
        ├── price: Decimal
        ├── photo_url: str
        ├── sort_order: int
        └── is_available: bool
```

### Menu Behavior Rules

- A tenant can have multiple sections. Each section is navigated as a separate "mode" in the end-user app.
- Items within a section are navigated by scrolling (the full-screen, one-item-at-a-time experience).
- The tenant admin can reorder both sections and items via drag-and-drop in Back Office.
- Setting `is_available = false` on an item grays it out in the app with a "No disponible" label but keeps it visible.
- Setting `is_active = false` on a section hides it entirely from the end-user app.
- The menu is cached aggressively on the frontend (ISR or cache headers) to minimize API calls.

### Current Tenant Menu (Reference)

```
Section: Burgers
  ├── Classic Burger     - photo, price, description
  ├── BBQ Burger         - photo, price, description
  └── Spicy Burger       - photo, price, description

Section: Bebidas
  ├── Cola               - photo, price
  ├── Limonada           - photo, price
  └── Agua               - photo, price
```

---

## 7. Data Entities

### Backend Entities (FastFood module — tenant schema)

```
end_users
├── id (uuid)
├── phone_number (str, unique within tenant)
├── name (str, nullable — filled in later)
├── created_at
├── last_seen_at
└── is_deleted (bool)

menus
├── id (uuid)
├── tenant_id (str)
├── is_active (bool)
└── created_at

menu_sections
├── id (uuid)
├── menu_id (uuid → menus)
├── name (str)
├── sort_order (int)
└── is_active (bool)

menu_items
├── id (uuid)
├── section_id (uuid → menu_sections)
├── name (str)
├── description (str)
├── price (decimal 10,2)
├── photo_url (str)
├── sort_order (int)
├── is_available (bool)
└── is_deleted (bool)

orders
├── id (uuid)
├── end_user_id (uuid → end_users)
├── status (enum: pending, confirmed, preparing, ready, delivered, cancelled)
├── delivery_type (enum: delivery, pickup)
├── delivery_address (str)
├── delivery_lat (decimal)
├── delivery_lng (decimal)
├── delivery_cost (decimal 10,2)
├── subtotal (decimal 10,2)
├── total (decimal 10,2)
├── notes (str)
├── payment_status (enum: pending, partially_paid, paid, waived)
├── payment_method (str — free text, staff fills this in: "Efectivo", "Transferencia", etc.)
├── payment_amount_received (decimal 10,2 — actual amount collected by staff)
├── payment_reference (str — optional: transfer ID, receipt number, etc.)
├── payment_notes (str — any additional staff notes about the payment)
├── payment_updated_at (datetime — when staff last updated payment info)
├── payment_updated_by (uuid → tenant_admins — which staff member recorded it)
├── created_at
└── updated_at

order_items
├── id (uuid)
├── order_id (uuid → orders)
├── menu_item_id (uuid → menu_items)
├── menu_item_name (str — snapshot at time of order)
├── menu_item_price (decimal — snapshot at time of order)
├── quantity (int)
└── note (str)

otp_verifications
├── id (uuid)
├── phone_number (str)
├── code (str — hashed)
├── expires_at (datetime)
├── is_used (bool)
└── attempt_count (int)
```

### Public Schema (platform level)

```
tenant_themes
├── id (uuid)
├── tenant_id (uuid → tenants)
├── primary_color (str)
├── primary_color_hover (str)
├── secondary_color (str)
├── background_color (str)
├── surface_color (str)
├── text_primary_color (str)
├── text_secondary_color (str)
├── font_family_url (str)
├── font_family_name (str)
├── logo_url (str)
├── favicon_url (str)
├── primary_button_text_color (str)
├── loading_screen_background_color (str)
└── updated_at

tenant_settings (FastFood-specific fields)
├── tenant_id (uuid)
├── business_name (str)
├── business_address (str)
├── business_lat (decimal)
├── business_lng (decimal)
├── whatsapp_number (str)
├── whatsapp_message_template (str)
├── max_delivery_radius_km (decimal)
├── operating_hours (jsonb)
├── instagram_url (str)
├── facebook_url (str)
├── tiktok_url (str)
├── twitter_url (str)
└── payment_instructions (str — shown to end user on bill screen, e.g. "El staff coordinará el cobro al entregar")

delivery_pricing_tiers
├── id (uuid)
├── tenant_id (uuid)
├── min_km (decimal)
├── max_km (decimal)
└── price (decimal 10,2)
```

---

## 8. API Contracts — High Level

All routes are under `/api/v1/`. Full OpenAPI spec is auto-generated by FastAPI at `/docs`.

### Public Routes (no auth required)

```
GET  /tenants/{tenant_slug}/theme                → tenant theme config (for CSS injection)
GET  /tenants/{tenant_slug}/settings             → public business info (name, hours, socials)
GET  /tenants/{tenant_slug}/menu                 → full menu with sections and items
```

### End User Auth Routes

```
POST /auth/otp/request                           → send OTP to phone number
POST /auth/otp/verify                            → verify OTP, return tokens, create account if new
POST /auth/token/refresh                         → refresh access token
POST /auth/logout                                → invalidate refresh token
```

### Authenticated End User Routes

```
GET  /end-users/me                               → current end user profile
PUT  /end-users/me                               → update name, preferences

GET  /tenants/{tenant_slug}/orders               → end user's order history
POST /tenants/{tenant_slug}/orders               → create new order (the ORDENAR action)
GET  /tenants/{tenant_slug}/orders/active        → current active order if exists
GET  /tenants/{tenant_slug}/orders/{order_id}    → single order detail

POST /tenants/{tenant_slug}/delivery/calculate   → calculate delivery cost from coords
```

### Authenticated Tenant Admin Routes (Back Office)

```
GET   /backoffice/orders                              → all orders, filterable by status and payment_status
PUT   /backoffice/orders/{order_id}/status            → advance order status
GET   /backoffice/orders/active                       → all non-completed orders (Chef View)
PATCH /backoffice/orders/{order_id}/payment           → update payment info (method, amount, reference, notes, status)

GET  /backoffice/menu                            → full menu for editing
POST /backoffice/menu/sections                   → create section
PUT  /backoffice/menu/sections/{id}              → update section
PUT  /backoffice/menu/sections/reorder           → update sort_order for all sections
POST /backoffice/menu/sections/{id}/items        → create item
PUT  /backoffice/menu/items/{id}                 → update item
PUT  /backoffice/menu/items/reorder              → update sort_order for all items in a section

GET  /backoffice/analytics/summary               → dashboard KPIs
GET  /backoffice/analytics/orders                → time-series order data
GET  /backoffice/analytics/items                 → best-selling items

GET  /backoffice/end-users                       → paginated end user list
GET  /backoffice/settings                        → tenant settings
PUT  /backoffice/settings                        → update settings
GET  /backoffice/theme                           → current theme
PUT  /backoffice/theme                           → update theme
GET  /backoffice/delivery-tiers                  → delivery pricing tiers
PUT  /backoffice/delivery-tiers                  → replace all tiers

GET  /backoffice/staff                           → list of staff accounts
POST /backoffice/staff                           → invite staff member
DELETE /backoffice/staff/{id}                    → remove staff
```

---

## 9. Frontend Feature Modules Breakdown

### End-User App (`apps/fastfood-app`)

```
feature/
├── loading/
│   ├── containers/      ← loading-screen.container.tsx
│   └── styles/          ← loading-screen.style.module.css
│
├── menus/
│   ├── containers/      ← menu-experience.container.tsx
│   ├── components/      ← menu-item-slide.component.tsx, menu-scroll-indicator.component.tsx
│   ├── hooks/           ← use-menu.hook.ts, use-menu-scroll.hook.ts
│   ├── services/        ← menu.service.ts
│   ├── interfaces/      ← menu-item.interface.ts, menu-section.interface.ts
│   ├── enums/           ← menu-section-type.enum.ts
│   ├── constants/       ← menu-item.constant.ts
│   └── styles/          ← menu-experience.style.module.css, menu-item-slide.style.module.css
│
├── cart/
│   ├── containers/      ← cart-drawer.container.tsx
│   ├── components/      ← cart-item.component.tsx, cart-summary.component.tsx, cart-empty.component.tsx
│   ├── hooks/           ← use-cart.hook.ts
│   ├── interfaces/      ← cart-item.interface.ts, cart.interface.ts
│   ├── constants/       ← cart.constant.ts
│   └── styles/
│
├── auth/
│   ├── containers/      ← phone-entry.container.tsx, otp-entry.container.tsx
│   ├── components/      ← otp-input.component.tsx, phone-field.component.tsx
│   ├── hooks/           ← use-auth.hook.ts, use-otp.hook.ts
│   ├── services/        ← auth.service.ts
│   ├── interfaces/      ← otp-request.interface.ts, auth-session.interface.ts
│   └── styles/
│
├── delivery/
│   ├── containers/      ← delivery-selector.container.tsx, address-map.container.tsx
│   ├── components/      ← delivery-type-picker.component.tsx, address-field.component.tsx
│   ├── hooks/           ← use-delivery.hook.ts, use-geolocation.hook.ts
│   ├── services/        ← delivery.service.ts
│   ├── interfaces/      ← delivery-address.interface.ts, delivery-cost.interface.ts
│   ├── constants/       ← delivery.constant.ts
│   └── styles/
│
├── orders/
│   ├── containers/      ← bill.container.tsx, active-order.container.tsx, order-history.container.tsx
│   ├── components/      ← order-status.component.tsx, order-item-summary.component.tsx, order-bottom-bar.component.tsx
│   ├── hooks/           ← use-order.hook.ts, use-active-order.hook.ts
│   ├── services/        ← order.service.ts
│   ├── interfaces/      ← order.interface.ts, order-item.interface.ts
│   ├── enums/           ← order-status.enum.ts, delivery-type.enum.ts
│   ├── constants/       ← order.constant.ts, order-status-display.constant.ts
│   └── styles/
│
├── end-users/
│   ├── containers/      ← profile.container.tsx
│   ├── components/      ← profile-form.component.tsx
│   ├── hooks/           ← use-end-user.hook.ts
│   ├── services/        ← end-user.service.ts
│   ├── interfaces/      ← end-user.interface.ts
│   ├── constants/       ← end-user.constant.ts
│   └── styles/
│
├── navigation/
│   ├── containers/      ← user-nav.container.tsx
│   ├── components/      ← nav-menu-popup.component.tsx, whatsapp-button.component.tsx, social-links.component.tsx
│   ├── hooks/           ← use-nav-state.hook.ts
│   ├── interfaces/      ← nav-state.interface.ts
│   └── styles/
│
└── shared/
    ├── components/      ← drawer.component.tsx, modal.component.tsx, loading-spinner.component.tsx
    ├── hooks/           ← use-drawer.hook.ts
    ├── interfaces/      ← tenant-theme.interface.ts, tenant-settings.interface.ts
    ├── constants/       ← tenant-theme.constant.ts
    └── styles/          ← drawer.style.module.css, modal.style.module.css
```

### Back Office (`apps/fastfood-backoffice`)

```
feature/
├── dashboard/
├── orders/
│   ├── containers/      ← order-list.container.tsx, order-detail.container.tsx
│   └── ...
├── chef-view/
│   ├── containers/      ← chef-board.container.tsx
│   └── ...
├── menus/
│   ├── containers/      ← menu-manager.container.tsx, menu-item-form.container.tsx
│   └── ...
├── end-users/
├── analytics/
├── delivery-zones/
├── theme-editor/
├── settings/
└── staff/
```

---

## 10. Animation Specification

All animations are pure CSS. The following are the key animations required for v1.

### Loading Screen

| Animation | Element | Spec |
|---|---|---|
| Logo entrance | Logo image | `scale(0.8) opacity(0)` → `scale(1) opacity(1)`, 600ms, `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring feel) |
| Background pulse | Page background | Subtle brightness pulse 100% → 103% → 100%, 2s infinite, ease-in-out |
| Exit | Full loading screen | `translateY(0)` → `translateY(-100%)`, 500ms, `cubic-bezier(0.76, 0, 0.24, 1)` |

### Menu Item Transitions

| Animation | Element | Spec |
|---|---|---|
| Item enter (scroll down) | Incoming item | Slides up from below: `translateY(40px) opacity(0)` → `translateY(0) opacity(1)`, 400ms, `ease-out` |
| Item exit (scroll down) | Outgoing item | Slides up and out: `translateY(0) opacity(1)` → `translateY(-40px) opacity(0)`, 300ms, `ease-in` |
| Item enter (scroll up) | Incoming item | Same but inverted vertically |
| Item name reveal | `<h1>` title | Letters or words reveal left to right using `clip-path` or sequential `opacity` delays, 500ms total |
| Photo entrance | Feature image | `scale(1.05) opacity(0)` → `scale(1) opacity(1)`, 500ms, `ease-out` — slight zoom-in effect |
| Price entrance | Price element | Fades in with slight upward drift, 300ms delay after photo |
| Button entrance | Add button | Fades and scales in, 400ms delay |
| Scroll indicator | Arrow/dots | Gentle bounce up/down, infinite, 1.5s, ease-in-out |

### Drawer

| Animation | Element | Spec |
|---|---|---|
| Drawer open | Panel | `translateX(100%)` → `translateX(0)`, 350ms, `cubic-bezier(0.32, 0.72, 0, 1)` |
| Drawer close | Panel | `translateX(0)` → `translateX(100%)`, 280ms, `ease-in` |
| Overlay fade in | Dim overlay | `opacity(0)` → `opacity(0.5)`, 350ms |
| Cart item add | New item row | Slides down from top of list, 250ms |
| Cart item remove | Item row | Slides out to the right and collapses height, 250ms |
| Quantity change | Price display | Brief scale flash: `scale(1)` → `scale(1.1)` → `scale(1)`, 150ms |
| Drawer step transition | Auth/Delivery/Bill steps | Slides left (forward) or right (backward), 300ms |

### Navigation

| Animation | Element | Spec |
|---|---|---|
| User menu popup | Options panel | Scales from bottom-right origin: `scale(0.8) opacity(0)` → `scale(1) opacity(1)`, 200ms, `ease-out` |
| WhatsApp button | Floating button | Entrance: bounces in 1s after loading screen clears. Hover: scale(1.1), 150ms |
| Active order badge | Status indicator | Pulsing ring: box-shadow pulse, 1.5s infinite |

### Reduced Motion

Every animation block must have a corresponding `@media (prefers-reduced-motion: reduce)` rule that removes motion. Fades are allowed — position changes and scale changes are removed.

---

## 11. Google Maps Integration — Free Tier Strategy

Google Maps is used **only** for the address selection step in the delivery flow.

### What We Use

| Feature | API | Free Tier |
|---|---|---|
| Display a map | Maps JavaScript API | $200/month credit (generous) |
| Resolve pin to address | Geocoding API | $200/month credit |
| Auto-complete address search | Places API (optional, v2) | $200/month credit |

### What We Do NOT Use (cost control)

| Feature | Why Not Used |
|---|---|
| Distance Matrix API | We calculate distance ourselves (Haversine) |
| Directions API | Not needed — we don't route, just measure |
| Routes API | Not needed |

### Map Load Strategy

- The Google Maps script is loaded **lazily** — only when the user selects "Delivery" and reaches the map step
- This prevents API calls for users who pick Pickup or never reach that step
- The map component checks `typeof google === "undefined"` before loading to prevent double-loads

### Distance Calculation (Backend)

```python
import math

def calculate_haversine_distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    earth_radius_km = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lng = math.radians(lng2 - lng1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return earth_radius_km * c
```

The tenant coordinates (`business_lat`, `business_lng`) are set by the tenant admin in Back Office settings. This is a required field — the delivery system does not work without it.

---

## 12. End-User Data Collection Strategy

BigBoss monetizes end-user data aggregated across tenants. This must be architecturally correct and legally covered.

### Data Collected Automatically

| Data Point | When Collected | How |
|---|---|---|
| Phone number | OTP verification | Required for auth |
| First visit timestamp | First app load | Session tracking |
| Tenant visited | Every visit | URL context |
| Items viewed | Menu scroll events | Analytics event |
| Items added to cart | Cart interaction | Cart event |
| Order items, quantity, price | Order creation | Order record |
| Delivery address, lat/lng | Delivery step | Order record |
| Order frequency | Every order | Derived from order history |
| Device type | Every visit | User-Agent header |
| Time of day of orders | Every order | Timestamp analysis |

### Legal Cover

- The Bill screen disclaimer: "Al ordenar, aceptas nuestros Términos y Condiciones y Política de Privacidad"
- The Terms of Service (BigBoss platform-level) explicitly states that BigBoss collects and processes aggregated usage data
- Consent is captured at first order
- A `consent_accepted_at` timestamp is stored on the `end_users` record

### Data Does Not Break UX

- No cookie consent banners on first load
- No newsletter opt-in modals
- No data collection forms beyond phone number
- All collection is silent and server-side

### Analytics Flow

- End-user behavior events are written to a `user_events` table in the tenant schema at order time
- A nightly Celery job aggregates these into the `analytics` schema in anonymized/aggregated form
- Raw phone numbers are never written to the analytics schema — only hashed identifiers and aggregated counts

---

## 13. Out of Scope — First Version

The following features are intentionally excluded from v1 to maintain focus. They are documented here for future planning.

| Feature | Notes |
|---|---|
| Automatic payment gateway (card, digital wallet) | Payment is currently staff-managed via Back Office. The data model is designed for gateway integration. Automatic payment planned for a future version. |
| Order real-time push via WebSocket | v1 polls every 15 seconds. WebSocket in v2 when infrastructure is ready. |
| End user address book | v1 user enters address per order. Saved addresses in v2. |
| Loyalty / points system | Planned as a cross-product feature in a future BigBoss module. |
| Multiple tenants on same product page | Not applicable — each tenant has its own URL. |
| Tenant custom domain | v2 feature — requires DNS configuration infrastructure. |
| Multi-language support (i18n) | v1 is Spanish only. i18n framework to be selected in v2. |
| Push notifications (browser/mobile) | v2 — requires service worker and notification infrastructure. |
| Item modifier groups (toppings, sizes) | v2 — the menu item model supports it but the UI and order flow do not yet. |
| Photo upload directly in Back Office | v1 uses URL input. Direct upload (to CDN) in v2. |
| Rating and review system | Future product feature. |
