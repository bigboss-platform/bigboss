# FastFood — Task Index

Rename each task file prefix to reflect its current state:
- `[PENDING]` — not started
- `[IN-PROGRESS]` — actively being worked on
- `[DONE]` — complete and verified

AI agents: read this file first, then open only the task files relevant to your work.

---

## Status Overview

| # | File | Title | Status |
|---|---|---|---|
| 01 | TASK-01-[DONE]-backend-boot-and-migrations.md | Backend — Boot, Migrations & Seed | DONE |
| 02 | TASK-02-[DONE]-backend-api-complete.md | Backend — Complete API | DONE |
| 03 | TASK-03-[PENDING]-fastfood-menu-experience.md | FastFood App — Menu Experience | PENDING |
| 04 | TASK-04-[PENDING]-fastfood-cart.md | FastFood App — Cart Drawer | PENDING |
| 05 | TASK-05-[PENDING]-fastfood-auth-flow.md | FastFood App — OTP Auth Flow | PENDING |
| 06 | TASK-06-[PENDING]-fastfood-delivery-and-order.md | FastFood App — Delivery & Place Order | PENDING |
| 07 | TASK-07-[PENDING]-fastfood-active-order.md | FastFood App — Active Order View | PENDING |
| 08 | TASK-08-[PENDING]-backoffice-auth.md | Back Office — Auth & Route Protection | PENDING |
| 09 | TASK-09-[PENDING]-backoffice-orders.md | Back Office — Orders Management | PENDING |
| 10 | TASK-10-[PENDING]-backoffice-chef-view.md | Back Office — Chef View | PENDING |
| 11 | TASK-11-[PENDING]-backoffice-menu-management.md | Back Office — Menu Management | PENDING |
| 12 | TASK-12-[PENDING]-backoffice-dashboard-and-settings.md | Back Office — Dashboard & Settings | PENDING |
| 13 | TASK-13-[PENDING]-e2e-and-ci.md | E2E Tests & CI Validation | PENDING |

---

## Dependency Order

Tasks must be completed in order. Each task depends on the previous ones being done.

```
01 → 02 → 03 → 04 → 05 → 06 → 07
               ↓
              08 → 09 → 10 → 11 → 12
                                   ↓
                                  13
```

Tasks 03–07 (FastFood App) and 08–12 (Back Office) can be parallelized by two developers after task 02 is done.
