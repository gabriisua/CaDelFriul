# PLAN: Order Detail Full-Page View

**ID:** 260716-fpe  
**Date:** 2026-07-16  
**Status:** IN PROGRESS

## Overview
Shift Order Management from modal dialog to a dedicated full-page view for complex order data (items, addresses) and administrative actions (printing labels).

## Task 1: Update Routing and OrderService

**Files:**
- `src/app/app.routes.ts` - Add route `orders/:id`
- `src/app/core/services/order.service.ts` - Add `getOrderById(id)` method

**Action:**
1. Add route: `{ path: 'orders/:id', loadComponent: () => import('./features/orders/order-detail.component').then(m => m.OrderDetailComponent) }`
2. Add method: `getOrderById(id: string): Observable<Order>` returning `this.api.get<Order>('/orders/' + id)`

## Task 2: Create OrderDetailComponent

**Files:**
- `src/app/features/orders/order-detail.component.ts` (new)

**Action:**
Create standalone component with:
- Inject: `ActivatedRoute`, `OrderService`, `UiService`, `Router`
- On init: extract `id` from route params, fetch order
- Header: Back button, title "Order Details #<short-id>", Status dropdown
- Action bar: Print Shipping Label, Print DDT (placeholder methods)
- 2-column grid: Order Summary (items table, totals) + Customer/Addresses cards
- Brand-aligned Tailwind design (cream/beige bg, dark text, ochre/gold accents)

## Task 3: Update OrdersComponent

**Files:**
- `src/app/features/orders/orders.component.ts`

**Action:**
- Add `actions` array with "View" action navigating to `/orders/:id`
- Pass `actions` to `<app-data-grid>`

## Verification
- Build passes
- Route `/orders/:id` loads OrderDetailComponent
- Orders list "View" navigates to detail page
- Status change shows toast via UiService
- Print buttons show info toast
