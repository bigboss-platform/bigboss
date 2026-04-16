# TASK-11 — Back Office: Menu Management

**Status:** PENDING  
**Depends on:** TASK-10  
**Blocks:** TASK-12

---

## Goal

Tenant admins can manage the full menu from the back office: create and reorder sections, add and edit items with photos, toggle item availability in real time, and soft-delete anything. Changes are reflected immediately in the FastFood app.

---

## Checklist

### Menu Overview

- [ ] `GET /api/v1/backoffice/menu` fetched on mount — shows all sections and items including unavailable ones
- [ ] Sections displayed in a list sorted by `sort_order`
- [ ] Each section is collapsible (expanded by default)
- [ ] Item count shown per section
- [ ] `data-testid="menu-manager"` on the root container

### Section Management

- [ ] "Nueva sección" button opens a form (inline or modal)
- [ ] Form fields: Section name (required)
- [ ] On submit → `POST /api/v1/backoffice/menu/sections` → section appears in list
- [ ] Each section has: edit name button, toggle active/inactive, delete button, drag handle for reorder
- [ ] Edit name → inline input, saves on blur or Enter
- [ ] Toggle active/inactive → `PUT /api/v1/backoffice/menu/sections/{id}` with `is_active`
- [ ] Delete → confirm dialog → `DELETE /api/v1/backoffice/menu/sections/{id}` (soft delete)
- [ ] Deleting a section with items → warning: "Esta sección tiene X productos. ¿Eliminar de todas formas?"
- [ ] `data-testid="section-{id}"` on each section row

### Item Management

- [ ] "Agregar producto" button inside each section
- [ ] Add item form fields:
  - Name (required)
  - Description (optional)
  - Price (required, numeric, > 0)
  - Photo upload (optional, accepts JPG/PNG, max 2MB)
  - Is available toggle (default: true)
- [ ] On submit → `POST /api/v1/backoffice/menu/sections/{section_id}/items`
- [ ] Each item row shows: photo thumbnail, name, price, availability toggle, edit button, delete button
- [ ] `data-testid="menu-item-{id}"` on each item row

### Edit Item

- [ ] Edit button opens item form pre-filled with current values
- [ ] All fields editable including photo replacement
- [ ] "Guardar" → `PUT /api/v1/backoffice/menu/items/{id}`
- [ ] On success → item row updates immediately

### Availability Toggle

- [ ] Toggle switch on each item row for `is_available`
- [ ] Toggling calls `PUT /api/v1/backoffice/menu/items/{id}` with new `is_available` value
- [ ] Visual state updates immediately (optimistic)
- [ ] On API failure → reverts to previous state + brief error indicator
- [ ] Unavailable items shown with reduced opacity in the list

### Photo Upload

- [ ] File input accepts image/jpeg and image/png only
- [ ] File size validation: max 2MB — shows error if exceeded
- [ ] On select → shows preview of the image before saving
- [ ] On save → `PUT /api/v1/backoffice/menu/items/{id}/photo` (multipart)
- [ ] After upload → photo URL updated in item row thumbnail

### Sort Order

- [ ] Drag-and-drop reordering for sections
- [ ] Drag-and-drop reordering for items within a section
- [ ] On drop → `PUT /api/v1/backoffice/menu/sections/{id}` or items endpoint called with new `sort_order`
- [ ] Use HTML5 drag-and-drop API (no animation library)

### Validation

- [ ] Price must be > 0 — inline validation
- [ ] Name must not be empty — inline validation
- [ ] API errors shown inline in the form

---

## Files to create or update

- `feature/menus/containers/menu-manager.container.tsx` — replace placeholder with real UI
- `feature/menus/components/section-list.component.tsx` (new)
- `feature/menus/components/section-row.component.tsx` (new)
- `feature/menus/components/item-row.component.tsx` (new)
- `feature/menus/components/item-form.component.tsx` (new)
- `feature/menus/components/photo-upload.component.tsx` (new)
- `feature/menus/hooks/use-menu-manager.hook.ts` (new)
- `feature/menus/services/menu.service.ts` (new — all CRUD calls)
- `feature/menus/interfaces/menu-section.interface.ts` (new)
- `feature/menus/interfaces/menu-item.interface.ts` (new)
- `feature/menus/constants/menu.constant.ts` (new)
- `feature/menus/styles/menu-manager.style.module.css` — replace placeholder styles
- `feature/menus/styles/item-row.style.module.css` (new)
- `feature/menus/styles/item-form.style.module.css` (new)
