# TASK-03 — FastFood App: Menu Experience

**Status:** DONE  
**Depends on:** TASK-02  
**Blocks:** TASK-04

---

## Read Before Starting

- `apps/fastfood-app/app/[tenant-slug]/layout.tsx`
- `apps/fastfood-app/app/[tenant-slug]/page.tsx`
- `apps/fastfood-app/feature/menus/` — read all existing files in this folder
- `apps/fastfood-app/feature/loading/` — read all existing files
- `apps/fastfood-app/app/globals.css` — design tokens and existing keyframes

Do NOT read cart, auth, or orders features — not needed for this task.

## Goal

The menu experience is fully functional: the loading screen plays, real menu data from the API is displayed, the user can scroll through items section by section, and every interactive element has a `data-testid` attribute so E2E tests can target it.

---

## Checklist

### Loading Screen

- [ ] Loading screen displays for a minimum of 1500ms before transitioning
- [ ] Logo visible during loading with `logo-entrance` CSS animation
- [ ] Background pulse animation plays
- [ ] After 1500ms (or when data is ready, whichever is later) — fades out and reveals menu
- [ ] `data-testid="loading-screen"` on the root element
- [ ] `prefers-reduced-motion` disables animations (all animations off, instant transition)

### Menu Data

- [ ] `MenuExperienceContainer` (server component) fetches real menu from API
- [ ] Uses tenant slug from URL param (`[tenant-slug]`)
- [ ] On API failure — renders a friendly "no disponible" message, does not crash
- [ ] All menu items from all sections are flattened into a single scrollable list
- [ ] Items respect `sort_order` within sections and sections respect `sort_order`

### Menu Item Slide

- [ ] Each item displays: photo (or placeholder if no photo URL), name, price formatted as `$XX.XX`, description
- [ ] Price formatted in MXN pesos with 2 decimal places
- [ ] Photo uses Next.js `<Image>` with correct `sizes` for mobile performance
- [ ] Photo placeholder shown when `photoUrl` is empty — no broken image icon
- [ ] `data-testid="menu-item"` on each item article
- [ ] `data-testid="menu-item-name"` on name element
- [ ] `data-testid="menu-item-price"` on price element
- [ ] `data-testid="add-to-cart"` on the Agregar button
- [ ] Enter/exit animations driven by `direction` prop (`entering` / `exiting`) via CSS class toggle
- [ ] Animations use CSS classes defined in `menu-item-slide.style.module.css`

### Scroll Controls

- [ ] Scroll up button visible when `canScrollUp` is true
- [ ] Scroll up button disabled (not hidden) when on first item
- [ ] Scroll down button visible when `canScrollDown` is true
- [ ] Scroll down button disabled (not hidden) when on last item
- [ ] `data-testid="scroll-up"` and `data-testid="scroll-down"` on buttons
- [ ] Section label shown above item name to indicate which section the item belongs to
- [ ] Item counter shown (e.g. "3 / 12") somewhere on the screen

### Tenant Theming

- [ ] Tenant theme CSS variables injected from DB in `[tenant-slug]/layout.tsx`
- [ ] Font loaded from `theme.font_url` if present
- [ ] Primary color applies to Agregar button and accent elements
- [ ] If tenant slug not found → 404 page

### `data-testid` Completeness

- [ ] `data-testid="menu-experience"` on the root of the experience

---

## Files to update

- `feature/menus/containers/menu-experience.container.tsx`
- `feature/menus/components/menu-experience-client.component.tsx`
- `feature/menus/components/menu-item-slide.component.tsx`
- `feature/menus/styles/menu-item-slide.style.module.css`
- `feature/menus/styles/menu-experience.style.module.css`
- `feature/loading/components/loading-screen.component.tsx`
- `feature/loading/styles/loading-screen.style.module.css`
- `app/[tenant-slug]/layout.tsx`
