---
phase: quick
plan: 260710-mwq
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/api.ts
  - src/app/dashboard/orders/page.tsx
autonomous: true
requirements: []
must_haves:
  truths:
    - "Orders page fetches real order history from backend API on mount"
    - "Loading state shown while orders are being fetched"
    - "Empty state shown when user has no orders"
    - "Orders table renders real data (order number, date, status, total)"
  artifacts:
    - path: "src/lib/api.ts"
      provides: "Order interface and fetchOrders() function"
      contains: "fetchOrders"
    - path: "src/app/dashboard/orders/page.tsx"
      provides: "Client component fetching and displaying real orders"
      contains: "useEffect"
  key_links:
    - from: "src/app/dashboard/orders/page.tsx"
      to: "src/lib/api.ts"
      via: "import { fetchOrders }"
      pattern: "fetchOrders"
    - from: "src/lib/api.ts"
      to: "Spring Boot GET /api/orders"
      via: "apiFetch"
      pattern: "/api/orders"
---

<objective>
Connect the orders page to the backend API by adding an Order type and fetchOrders function to the API client, then rewriting the orders page to fetch and display real order data with loading, error, and empty states.

Purpose: Replace hardcoded placeholder orders with live data from the Spring Boot backend.
Output: Working orders page showing authenticated user's order history.
</objective>

<execution_context>
@/Users/gabrielesuardi/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/gabrielesuardi/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md

@src/lib/api.ts
@src/app/dashboard/orders/page.tsx
@src/context/AuthContext.tsx
</context>

<interfaces>
<!-- Key types and contracts the executor needs. Extracted from codebase. -->

From src/lib/api.ts — existing API client pattern:
```typescript
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T>
// Handles auth headers, 401/403 redirect, JSON parsing

export interface OrderRequest {
  shippingAddressId: string;
  items: OrderItemRequest[];
}

export async function placeOrder(order: OrderRequest): Promise<void> {
  await apiFetch<void>("/api/orders", { method: "POST", body: JSON.stringify(order) });
}
```

From src/context/AuthContext.tsx — provides user:
```typescript
export function useAuth(): { user: UserResponse | null; isAuthenticated: boolean; loading: boolean; login; logout }
export interface UserResponse { id: string; firstName: string; lastName: string; email: string; phone?: string }
```

From src/app/dashboard/orders/page.tsx — current hardcoded page:
```typescript
// Server component with hardcoded orders array, renders a table with Order #, Date, Status, Total columns
// Status uses green badge for "Delivered", yellow for others
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Add Order interface and fetchOrders to API client</name>
  <files>src/lib/api.ts</files>
  <action>
Add the following to `src/lib/api.ts`:

1. Add `Order` interface after the existing `OrderRequest` interface (around line 107):
```typescript
export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItemRequest[];
}
```

2. Add `fetchOrders()` function after `placeOrder` (around line 118):
```typescript
export async function fetchOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/api/orders");
}
```

Note: The backend is Spring Boot. `POST /api/orders` already exists for placing orders, so `GET /api/orders` is the natural REST endpoint for the current user's orders (authenticated via Bearer token). The `apiFetch` helper handles auth headers automatically.

If the Spring Boot backend uses a different endpoint shape (e.g., `GET /api/customers/{id}/orders`), the executor should adapt accordingly — but `GET /api/orders` is the most likely convention given the existing `placeOrder` pattern.
  </action>
  <verify>
    <automated>cd /Users/gabrielesuardi/Desktop/CaDelFriul/fe-cadelfriul && npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>Order interface and fetchOrders() exist in api.ts, TypeScript compiles without errors</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Rewrite orders page to fetch real data from API</name>
  <files>src/app/dashboard/orders/page.tsx</files>
  <behavior>
    - Page renders as a "use client" component
    - On mount, calls fetchOrders() and stores result in state
    - While loading: shows skeleton placeholders (3-4 rows matching the table layout)
    - On error: shows a message like "Unable to load orders. Please try again later."
    - On empty orders: shows "No orders yet" with a link to /shop
    - On success: renders the table with real data — orderNumber, formatted createdAt date, status badge, total formatted as EUR currency
    - Status badge logic: "DELIVERED" → green, "PROCESSING"/"PLACED" → yellow, default → gray
    - Uses useAuth() to ensure user is loaded before fetching (optional guard)
  </behavior>
  <action>
Rewrite `src/app/dashboard/orders/page.tsx` as a client component:

1. Add `"use client"` directive at top
2. Import `useState, useEffect` from react, `fetchOrders` and `Order` type from `@/lib/api`, `Skeleton` from `@/components/ui/skeleton`
3. Create component with state: `orders: Order[]`, `loading: boolean`, `error: string | null`
4. In `useEffect`, call `fetchOrders()`, handle success/error/finally
5. Render loading state: 3 skeleton rows mimicking the table structure
6. Render error state: centered message with muted text
7. Render empty state: "No orders yet" with link to shop
8. Render orders table: same visual structure as current hardcoded version but using real data
   - `order.orderNumber` for Order # column
   - `new Date(order.createdAt).toLocaleDateString("it-IT")` for Date column
   - Status badge with conditional classes (match existing green/yellow pattern, add gray default)
   - `€{order.total.toFixed(2)}` for Total column

Keep the existing heading, description, and table styling exactly as-is. Only replace the data source and add loading/error/empty states.
  </action>
  <verify>
    <automated>cd /Users/gabrielesuardi/Desktop/CaDelFriul/fe-cadelfriul && npx tsc --noEmit 2>&1 | head -20</automated>
  </verify>
  <done>Orders page is a client component that fetches from API, shows loading/error/empty states, and renders real order data in the table</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client→API | Orders page fetches from authenticated backend endpoint |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-mwq-01 | Info Disclosure | fetchOrders | accept | apiFetch already handles 401/403 with token removal and redirect — no additional PII exposure risk beyond authenticated data |
</threat_model>

<verification>
1. `npx tsc --noEmit` passes with no errors
2. Orders page compiles as client component
3. fetchOrders function exists and uses apiFetch with correct endpoint
4. Page handles loading, error, and empty states
5. No hardcoded order data remains in the page
</verification>

<success_criteria>
- Order type and fetchOrders() added to API client
- Orders page fetches real data on mount
- Loading skeleton shown during fetch
- Error message shown on failure
- Empty state with shop link shown when no orders
- Real orders displayed in table with formatted date and EUR currency
- TypeScript compiles cleanly
</success_criteria>

<output>
After completion, create `.planning/quick/260710-mwq-connect-orders-page-to-backend-api-fetch/260710-mwq-SUMMARY.md`
</output>
