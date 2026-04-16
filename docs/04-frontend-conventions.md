# BigBoss — Frontend Conventions

**Version:** 1.0  
**Status:** Official  
**Last updated:** 2026-04-15

---

## Table of Contents

1. [Language and Framework Rules](#1-language-and-framework-rules)
2. [Naming Conventions](#2-naming-conventions)
3. [Feature Folder Architecture](#3-feature-folder-architecture)
4. [File Naming Rules](#4-file-naming-rules)
5. [TypeScript Code Rules](#5-typescript-code-rules)
6. [Variable and State Initialization Rules](#6-variable-and-state-initialization-rules)
7. [Component Rules](#7-component-rules)
8. [Styling Rules — Pure CSS](#8-styling-rules--pure-css)
9. [Service Layer Rules (Server Actions)](#9-service-layer-rules-server-actions)
10. [Hooks Rules](#10-hooks-rules)
11. [Interface and Type Rules](#11-interface-and-type-rules)
12. [Enum and Constant Rules](#12-enum-and-constant-rules)
13. [Mobile-First Design Rules](#13-mobile-first-design-rules)
14. [Testing Rules](#14-testing-rules)
15. [Forbidden Patterns](#15-forbidden-patterns)

---

## 1. Language and Framework Rules

- **Next.js 15** with App Router. Pages Router is forbidden in new projects.
- **TypeScript 5.x** in strict mode. `"strict": true` is required in all `tsconfig.json` files.
- **React Server Components (RSC)** are the default. Add `"use client"` only when the component explicitly needs browser APIs, event handlers, or state.
- **Pure CSS with CSS Modules** for all styling. No CSS-in-JS, no styled-components, no emotion, no Tailwind at this time.
- Animation approach: **pure CSS only** (transitions, keyframes, animations). The team will evaluate and document a dedicated animation library in a future convention update.
- `pnpm` is the only accepted package manager. Never commit `package-lock.json` or `yarn.lock`.

---

## 2. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Folder (module, in plural) | `kebab-case` plural | `menus/`, `end-users/`, `order-items/` |
| Folder (vertical slice) | `kebab-case` plural | `components/`, `hooks/`, `interfaces/` |
| File | `kebab-case` singular + `.{folder-singular}.{ext}` | `menu-item.component.tsx` |
| React component | `PascalCase` function | `MenuItemCard`, `OrderSummary` |
| Custom hook | `camelCase` starting with `use` | `useMenu`, `useOrderStatus` |
| TypeScript interface | `PascalCase` with `I` prefix | `IMenuItem`, `IOrder`, `IEndUser` |
| TypeScript enum | `PascalCase` | `OrderStatus`, `MenuCategory` |
| Constant file export | `SCREAMING_SNAKE_CASE` for scalars, `camelCase` for objects | `MAX_ITEMS`, `emptyOrder` |
| CSS class | `kebab-case` | `.menu-item-card`, `.order-summary` |
| CSS variable | `--kebab-case` | `--color-primary`, `--spacing-md` |

### Names Must Be Descriptive

- No abbreviations: `btn` → `button`, `img` → `image`, `cfg` → `config`
- No generic names alone: `data`, `item`, `obj`, `result` — qualify them: `menuItem`, `orderData`
- Boolean variables and props start with `is`, `has`, or `can`: `isLoading`, `hasError`, `canSubmit`
- Event handlers are named `handle{Event}`: `handleSubmit`, `handleMenuItemClick`, `handleQuantityChange`
- No comments anywhere in the code. If a name needs a comment to be understood, rename it.

---

## 3. Feature Folder Architecture

The `feature/` folder is the heart of the application. All product logic lives here, completely isolated from the Next.js framework. Next.js routing files (`page.tsx`, `layout.tsx`) are thin entry points that import from `feature/`.

### Structure

```
feature/
├── {module-plural}/              ← one folder per domain module, name is plural
│   ├── containers/               ← page-level smart components, connected to state and services
│   ├── components/               ← presentational UI components
│   ├── styles/                   ← CSS Modules for this module
│   ├── interfaces/               ← TypeScript interfaces
│   ├── enums/                    ← TypeScript enums
│   ├── constants/                ← constants and empty object definitions
│   ├── hooks/                    ← custom React hooks
│   ├── services/                 ← HTTP calls via Next.js Server Actions
│   └── tests/                    ← unit and integration tests
│
└── shared/                       ← code shared across multiple modules
    ├── components/
    ├── styles/
    ├── interfaces/
    ├── enums/
    ├── constants/
    ├── hooks/
    └── services/
```

### Module Examples

```
feature/
├── menus/
├── orders/
├── end-users/
├── cart/
└── shared/
```

### The Next.js Layer

Next.js route files are framework glue only. They must contain no logic beyond importing the container:

```tsx
// app/[tenant-slug]/menu/page.tsx
import { MenuPageContainer } from "@/feature/menus/containers/menu-page.container"

export default function MenuPage() {
    return <MenuPageContainer />
}
```

This isolation means the business logic in `feature/` is:
- Testable without Next.js
- Portable to a different framework if needed
- Easy to locate because it is never mixed with routing configuration

---

## 4. File Naming Rules

Every file inside `feature/` follows this pattern:

```
{descriptive-name}.{folder-name-singular}.{extension}
```

The `{folder-name-singular}` is the singular form of the vertical slice folder the file lives in.

### Full Reference Table

| Folder | Singular Form | File Example |
|---|---|---|
| `components/` | `component` | `menu-item-card.component.tsx` |
| `containers/` | `container` | `menu-page.container.tsx` |
| `styles/` | `style` | `menu-item-card.style.module.css` |
| `interfaces/` | `interface` | `menu-item.interface.ts` |
| `enums/` | `enum` | `menu-category.enum.ts` |
| `constants/` | `constant` | `menu-item.constant.ts` |
| `hooks/` | `hook` | `use-menu.hook.ts` |
| `services/` | `service` | `menu.service.ts` |
| `tests/` | `test` | `menu-item-card.test.tsx` |

### Additional Rules

- All characters are **lowercase English**
- Words are separated by **hyphens** (`-`)
- No underscores, no spaces, no camelCase in file names
- File names are **singular** (describe one thing, not many)
- Index files (`index.ts`) are forbidden inside `feature/` — every file is explicitly named

---

## 5. TypeScript Code Rules

### Strict Mode

All projects have `tsconfig.json` with:

```json
{
    "compilerOptions": {
        "strict": true,
        "noUncheckedIndexedAccess": true,
        "noImplicitReturns": true,
        "exactOptionalPropertyTypes": true
    }
}
```

### No Escape Hatches

These TypeScript features are forbidden:

| Forbidden | Why | Alternative |
|---|---|---|
| `any` | Disables type checking entirely | Use the correct type or `unknown` with type guards |
| `null` | Creates null reference errors | Use `""`, `0`, `false`, or an empty object as a default |
| `undefined` | Same as null — ambiguous empty state | Initialize all variables with a typed empty value |
| `// @ts-ignore` | Suppresses type errors | Fix the actual type error |
| `// @ts-expect-error` | Suppresses type errors | Fix the actual type error |
| `as SomeType` (type casting) | Bypasses type safety | Use type guards (`instanceof`, `typeof`, discriminated unions) |
| `!` non-null assertion | Assumes non-null at runtime | Handle the empty case explicitly |

### Comments

**Comments are forbidden in all source code files.** If code requires a comment to be understood, it is not descriptive enough. Rename the variable, function, or component until the code explains itself.

The only exception is JSDoc on exported public interfaces, and only when the meaning is not derivable from the name and types alone.

---

## 6. Variable and State Initialization Rules

Every variable must be initialized with a value that matches its type. The empty state of a type is never `null` or `undefined`.

### Primitive Initialization

```typescript
const name: string = ""
const age: number = 0
const isActive: boolean = false
const price: number = 0
const itemCount: number = 0
```

### Object Initialization — Empty Object Pattern

For every interface, a corresponding `empty{InterfaceName}` constant must be defined in the `constants/` folder of the same module. This constant is the canonical "empty" representation of that object.

```typescript
// feature/menus/interfaces/menu-item.interface.ts
export interface IMenuItem {
    id: string
    name: string
    price: number
    description: string
    categoryId: string
    isAvailable: boolean
}

// feature/menus/constants/menu-item.constant.ts
import { IMenuItem } from "../interfaces/menu-item.interface"

export const EMPTY_MENU_ITEM: IMenuItem = {
    id: "",
    name: "",
    price: 0,
    description: "",
    categoryId: "",
    isAvailable: false,
}
```

### Array Initialization

```typescript
const menuItems: IMenuItem[] = []
const selectedIds: string[] = []
```

### State Initialization

```typescript
// CORRECT
const [menuItem, setMenuItem] = useState<IMenuItem>(EMPTY_MENU_ITEM)
const [isLoading, setIsLoading] = useState<boolean>(false)
const [errorMessage, setErrorMessage] = useState<string>("")
const [menuItems, setMenuItems] = useState<IMenuItem[]>([])

// WRONG
const [menuItem, setMenuItem] = useState(null)        // forbidden
const [menuItem, setMenuItem] = useState()            // forbidden
const [data, setData] = useState<any>(null)           // forbidden
```

---

## 7. Component Rules

### Component Types

| Type | Location | Responsibility |
|---|---|---|
| **Container** | `containers/` | Connects UI to data — calls hooks and services, manages page-level state, passes data to components |
| **Component** | `components/` | Renders UI only — receives everything via props, contains no data fetching or business logic |

### Component File Structure

```tsx
// feature/menus/components/menu-item-card.component.tsx

import styles from "../styles/menu-item-card.style.module.css"
import { IMenuItem } from "../interfaces/menu-item.interface"

interface MenuItemCardProps {
    menuItem: IMenuItem
    onAddToCart: (menuItemId: string) => void
}

export function MenuItemCard({ menuItem, onAddToCart }: MenuItemCardProps) {
    function handleAddToCartClick() {
        onAddToCart(menuItem.id)
    }

    return (
        <article className={styles.menuItemCard}>
            <h3 className={styles.menuItemCardName}>{menuItem.name}</h3>
            <p className={styles.menuItemCardDescription}>{menuItem.description}</p>
            <span className={styles.menuItemCardPrice}>${menuItem.price.toFixed(2)}</span>
            <button
                className={styles.menuItemCardButton}
                onClick={handleAddToCartClick}
                type="button"
            >
                Add to cart
            </button>
        </article>
    )
}
```

### Component Rules

- Components are **named exports** — never default exports inside `feature/`
- Props interfaces are defined in the same file as the component (not in `interfaces/`)
- Props are destructured in the function signature
- No inline styles — all styles are in CSS Modules
- No logic inside JSX — extract to functions before the return statement
- All interactive elements have explicit `type` attributes on buttons
- Use semantic HTML elements (`article`, `section`, `nav`, `header`, `main`, `aside`, `footer`) — never `div` for structure that has semantic meaning
- Every image has an `alt` attribute
- Componentize aggressively — if a UI section is independently identifiable or reusable, it is its own component

### Container File Structure

```tsx
// feature/menus/containers/menu-page.container.tsx

"use client" // only if client-side state or interactions are needed

import { MenuItemCard } from "../components/menu-item-card.component"
import { useMenu } from "../hooks/use-menu.hook"
import { EMPTY_MENU_ITEM } from "../constants/menu-item.constant"
import styles from "../styles/menu-page.style.module.css"

export function MenuPageContainer() {
    const { menuItems, isLoading, errorMessage } = useMenu()

    if (isLoading) {
        return <div className={styles.menuPageLoader}>Loading menu...</div>
    }

    if (errorMessage !== "") {
        return <div className={styles.menuPageError}>{errorMessage}</div>
    }

    function handleAddToCart(menuItemId: string) {
        // cart logic
    }

    return (
        <main className={styles.menuPage}>
            <section className={styles.menuPageGrid}>
                {menuItems.map((menuItem) => (
                    <MenuItemCard
                        key={menuItem.id}
                        menuItem={menuItem}
                        onAddToCart={handleAddToCart}
                    />
                ))}
            </section>
        </main>
    )
}
```

---

## 8. Styling Rules — Pure CSS

### CSS Modules

Every component file has a corresponding CSS Module file in `styles/`:

```css
/* feature/menus/styles/menu-item-card.style.module.css */

.menuItemCard {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    background-color: var(--color-surface);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.menuItemCard:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}
```

### Design Tokens (CSS Variables)

All colors, spacing, typography, shadows, and radii are defined as CSS custom properties in `app/globals.css`. No magic values in component styles.

```css
/* app/globals.css */

:root {
    /* Colors */
    --color-primary: #e63946;
    --color-primary-hover: #c1121f;
    --color-surface: #ffffff;
    --color-background: #f8f9fa;
    --color-text-primary: #212529;
    --color-text-secondary: #6c757d;
    --color-border: #dee2e6;
    --color-error: #dc3545;
    --color-success: #198754;

    /* Spacing scale */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;

    /* Typography */
    --font-family-base: 'Inter', system-ui, sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-md: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 2rem;
    --font-weight-regular: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;

    /* Borders */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 16px;
    --radius-full: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.16);

    /* Transitions */
    --transition-fast: 0.15s ease;
    --transition-base: 0.2s ease;
    --transition-slow: 0.3s ease;

    /* Breakpoints (for reference — use in media queries) */
    /* --breakpoint-sm: 640px  */
    /* --breakpoint-md: 768px  */
    /* --breakpoint-lg: 1024px */
    /* --breakpoint-xl: 1280px */
}
```

### Animation Rules

All animations use pure CSS. Animations must be purposeful — every animation must either:
- Give feedback to user interaction (hover, active, focus)
- Communicate state change (loading, success, error, appearing/disappearing)
- Guide attention to important content

Animations are never purely decorative.

```css
/* Entry animation */
@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.menuItemCard {
    animation: fade-in-up 0.3s ease forwards;
}

/* Respect user preference for reduced motion */
@media (prefers-reduced-motion: reduce) {
    .menuItemCard {
        animation: none;
    }
}
```

The `@media (prefers-reduced-motion: reduce)` block is **required** for every animation definition. This is not optional.

### CSS Rules

- No inline styles anywhere — no `style={{ ... }}` props
- No `!important`
- No hardcoded color or spacing values — always use CSS variables
- Class names are camelCase in CSS Modules (e.g., `.menuItemCard`, not `.menu-item-card`) — CSS Modules handles the scoping
- Never nest CSS selectors more than 2 levels deep
- Keep CSS files focused on one component — no sharing styles between components

---

## 9. Service Layer Rules (Server Actions)

Services in `feature/` are **Next.js Server Actions** or **server-side fetch functions**. They are the only place where HTTP calls to the BigBoss API are made.

```typescript
// feature/menus/services/menu.service.ts

"use server"

import { IMenuItem } from "../interfaces/menu-item.interface"

export async function fetchMenuItems(tenantId: string): Promise<IMenuItem[]> {
    const response = await fetch(
        `${process.env.API_BASE_URL}/api/v1/tenants/${tenantId}/menu-items`,
        {
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
            },
        }
    )

    if (!response.ok) {
        return []
    }

    const body = await response.json()
    return body.data as IMenuItem[]
}
```

Rules:
- All service files use `"use server"` directive
- Services never return `null` or `undefined` — return an empty array `[]` or empty object (using the `EMPTY_` constant) on failure
- Services never throw — catch errors internally and return the appropriate empty value
- Services never contain UI logic or React imports
- One service file per module — do not split by HTTP verb
- Services use `process.env` for API URLs — never hardcode URLs

---

## 10. Hooks Rules

Custom hooks manage state and side effects, bridging the service layer and the container layer.

```typescript
// feature/menus/hooks/use-menu.hook.ts

"use client"

import { useState, useEffect } from "react"
import { IMenuItem } from "../interfaces/menu-item.interface"
import { fetchMenuItems } from "../services/menu.service"

interface UseMenuResult {
    menuItems: IMenuItem[]
    isLoading: boolean
    errorMessage: string
}

export function useMenu(tenantId: string): UseMenuResult {
    const [menuItems, setMenuItems] = useState<IMenuItem[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>("")

    useEffect(() => {
        async function loadMenuItems() {
            setIsLoading(true)
            setErrorMessage("")
            const items = await fetchMenuItems(tenantId)
            setMenuItems(items)
            setIsLoading(false)
        }

        loadMenuItems()
    }, [tenantId])

    return { menuItems, isLoading, errorMessage }
}
```

Rules:
- Custom hooks always start with `use`
- Custom hooks always return a typed object (not an array)
- The return type interface is defined inline in the same file
- Hooks never make direct API calls — they call services
- Hooks never return `null` or `undefined` in their result object — use empty values

---

## 11. Interface and Type Rules

- Use `interface` for object shapes, not `type` (exception: union types and utility types)
- All interfaces are prefixed with `I`: `IMenuItem`, `IOrder`, `IEndUser`
- Interfaces are defined in `interfaces/` folder, one interface per file
- Interfaces use optional (`?`) only when the field is genuinely optional in the domain — not as a workaround for missing data
- Nested object types are defined as their own interface, never inlined

```typescript
// feature/orders/interfaces/order.interface.ts

import { IOrderItem } from "./order-item.interface"
import { OrderStatus } from "../enums/order-status.enum"

export interface IOrder {
    id: string
    status: OrderStatus
    items: IOrderItem[]
    totalPrice: number
    notes: string
    createdAt: string
}
```

---

## 12. Enum and Constant Rules

### Enums

```typescript
// feature/orders/enums/order-status.enum.ts

export enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PREPARING = "preparing",
    READY = "ready",
    DELIVERED = "delivered",
    CANCELLED = "cancelled",
}
```

Rules:
- Enum values are always strings matching the backend enum value exactly
- Enums are never used for UI display strings — use a display mapping in `constants/` for that

### Constants

```typescript
// feature/orders/constants/order.constant.ts

import { IOrder } from "../interfaces/order.interface"
import { OrderStatus } from "../enums/order-status.enum"

export const EMPTY_ORDER: IOrder = {
    id: "",
    status: OrderStatus.PENDING,
    items: [],
    totalPrice: 0,
    notes: "",
    createdAt: "",
}

export const ORDER_STATUS_DISPLAY: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: "Pending",
    [OrderStatus.CONFIRMED]: "Confirmed",
    [OrderStatus.PREPARING]: "Preparing",
    [OrderStatus.READY]: "Ready for Pickup",
    [OrderStatus.DELIVERED]: "Delivered",
    [OrderStatus.CANCELLED]: "Cancelled",
}

export const MAX_ORDER_NOTES_LENGTH: number = 300
```

---

## 13. Mobile-First Design Rules

All UI is designed and built **mobile-first**. This means:

- The base CSS (no media query) targets the smallest screen (320px minimum)
- Media queries only add styles for larger screens, never override for smaller ones
- Use `min-width` in media queries, never `max-width`

```css
/* CORRECT — mobile first */
.menuItemGrid {
    display: grid;
    grid-template-columns: 1fr;       /* mobile: 1 column */
    gap: var(--spacing-md);
}

@media (min-width: 640px) {
    .menuItemGrid {
        grid-template-columns: repeat(2, 1fr); /* tablet: 2 columns */
    }
}

@media (min-width: 1024px) {
    .menuItemGrid {
        grid-template-columns: repeat(3, 1fr); /* desktop: 3 columns */
    }
}

/* WRONG — desktop first */
.menuItemGrid {
    grid-template-columns: repeat(3, 1fr);
}
@media (max-width: 768px) {
    .menuItemGrid {
        grid-template-columns: 1fr;
    }
}
```

### Breakpoint Reference

| Name | Min-width | Targets |
|---|---|---|
| base | — | Phones (320px+) |
| sm | 640px | Large phones |
| md | 768px | Tablets |
| lg | 1024px | Small desktops, landscape tablets |
| xl | 1280px | Standard desktops |
| 2xl | 1536px | Large desktops |

### Touch Targets

All interactive elements must have a minimum touch target of **44x44px** (Apple HIG and WCAG requirement). Use padding to achieve this without changing the visual size of the element.

---

## 14. Testing Rules

- Test files live in `tests/` folder within the module
- Test file naming: `{component-or-hook-name}.test.tsx` (e.g., `menu-item-card.test.tsx`)
- Use **Vitest** + **React Testing Library**
- Test what the user sees, not implementation details — query by role, label, text
- Never test internal state or private methods
- Every new component has at least: a render test, an interaction test (if interactive), an edge case test (empty data, error state)

```tsx
// feature/menus/tests/menu-item-card.test.tsx

import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { MenuItemCard } from "../components/menu-item-card.component"
import { EMPTY_MENU_ITEM } from "../constants/menu-item.constant"

const testMenuItem = {
    ...EMPTY_MENU_ITEM,
    id: "item-001",
    name: "Classic Burger",
    price: 8.99,
    description: "100% beef patty with lettuce and tomato",
}

describe("MenuItemCard", () => {
    it("renders the menu item name and price", () => {
        render(<MenuItemCard menuItem={testMenuItem} onAddToCart={() => {}} />)

        expect(screen.getByText("Classic Burger")).toBeInTheDocument()
        expect(screen.getByText("$8.99")).toBeInTheDocument()
    })

    it("calls onAddToCart with the correct item id when button is clicked", () => {
        const handleAddToCart = vi.fn()
        render(<MenuItemCard menuItem={testMenuItem} onAddToCart={handleAddToCart} />)

        fireEvent.click(screen.getByRole("button", { name: /add to cart/i }))

        expect(handleAddToCart).toHaveBeenCalledWith("item-001")
        expect(handleAddToCart).toHaveBeenCalledTimes(1)
    })
})
```

---

## 15. Forbidden Patterns

| Pattern | Why Forbidden | Correct Alternative |
|---|---|---|
| `any` | Disables TypeScript | Use the correct interface or `unknown` with type guards |
| `null` | Ambiguous empty state | Use typed empty values: `""`, `0`, `false`, `[]`, `EMPTY_X` |
| `undefined` | Same as null | Initialize all variables before use |
| `// comment` | Means code isn't descriptive enough | Rename the variable/function/component |
| Inline styles `style={{}}` | Defeats CSS Modules, hard to maintain | CSS Module class |
| Default export inside `feature/` | Hard to refactor (name tied to import site) | Named exports only |
| `import *` | Unclear dependencies | Named imports only |
| Logic inside JSX return | Mixes concerns, hard to test | Extract to a function or variable before `return` |
| `useEffect` with no dependency array | Runs on every render | Always provide a dependency array |
| `dangerouslySetInnerHTML` | XSS risk | Never use this |
| `window`, `document` inside a Server Component | Server has no browser globals | Move to a Client Component or `useEffect` |
| `console.log` in committed code | Noise, leaks info | Remove before committing |
| `max-width` media queries | Desktop-first, violates mobile-first rule | Use `min-width` always |
| Hard-coded colors or spacing in CSS | Unthemed, inconsistent | Use CSS variables from design tokens |
| `!important` in CSS | Breaks cascade and specificity | Fix specificity properly |
| Nesting selectors more than 2 levels in CSS | Hard to override, specificity wars | Flatten using more specific class names |
