# Dashboard Order Metrics API

## Context
Implement the first Dashboard API for the admin backoffice. The goal is to provide order metrics (counts by status) to power the existing placeholder dashboard component.

## Current State
- `OrderStatus` enum already has the correct 6 values: `PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED`
- `OrderRepository` has no aggregate queries — only `findByCustomerId` methods
- No dashboard controller, service, or DTO exists
- Angular `DashboardComponent` is a placeholder with hardcoded zeros
- No `.planning/` infrastructure exists (no STATE.md, no ROADMAP.md)

## Decisions
- **DTO package:** Place `OrderMetricsResponse` in `com.cadelfriul.backend.ecommerce.dto` (follows existing pattern where all order-related DTOs live)
- **Auth pattern:** Use `@PreAuthorize("hasRole('SUPER_ADMIN')")` at class level (matches `AdminOrderController` and `AdminProductController` pattern)
- **Service location:** New `AdminDashboardService` in `com.cadelfriul.backend.ecommerce.service`
- **Controller location:** New `AdminDashboardController` in `com.cadelfriul.backend.ecommerce.controller`
- **Frontend service:** New `DashboardService` using `ApiService` pattern (like `OrderService`)

## Tasks

### Task 1: Backend — Repository, DTO, Service, Controller

**Files to modify:**
- `be-cadelfriul/src/main/java/com/cadelfriul/backend/ecommerce/repository/OrderRepository.java` — add `countOrdersByStatus()` query
- NEW `be-cadelfriul/src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderMetricsResponse.java`
- NEW `be-cadelfriul/src/main/java/com/cadelfriul/backend/ecommerce/service/AdminDashboardService.java`
- NEW `be-cadelfriul/src/main/java/com/cadelfriul/backend/ecommerce/controller/AdminDashboardController.java`

**Implementation details:**

1. **OrderRepository** — Add JPQL query:
   ```java
   @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
   List<Object[]> countOrdersByStatus();
   ```

2. **OrderMetricsResponse** — Immutable DTO (final fields, getter-only, entity-style constructor):
   ```java
   public class OrderMetricsResponse {
       private final Map<OrderStatus, Long> statusCounts;
       private final long totalOrders;
       // constructor, getters
   }
   ```

3. **AdminDashboardService** — `@Service @Transactional(readOnly = true)`:
   - `getOrderMetrics()` calls `orderRepository.countOrdersByStatus()`
   - Parses `List<Object[]>` into `Map<OrderStatus, Long>`
   - Pre-populates all 6 statuses with 0 if missing from query results
   - Calculates `totalOrders` as sum of all counts

4. **AdminDashboardController** — `@RestController @RequestMapping("/api/admin/dashboard")`:
   - Class-level `@PreAuthorize("hasRole('SUPER_ADMIN')")`
   - `GET /orders-metrics` → returns `OrderMetricsResponse`
   - Swagger `@Tag(name = "Admin Dashboard")`

### Task 2: Frontend — Model, Service, Component Update

**Files to create/modify:**
- NEW `bo-cadelfriul/src/app/core/models/dashboard.model.ts`
- NEW `bo-cadelfriul/src/app/core/services/dashboard.service.ts`
- MODIFY `bo-cadelfriul/src/app/features/dashboard/dashboard.component.ts`

**Implementation details:**

1. **dashboard.model.ts**:
   ```typescript
   export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
   export interface OrderMetrics {
     totalOrders: number;
     statusCounts: Record<OrderStatus, number>;
   }
   ```

2. **dashboard.service.ts** — Uses `ApiService.get<OrderMetrics>('/dashboard/orders-metrics')`

3. **DashboardComponent** — Update to:
   - Inject `DashboardService`
   - Call `getOrderMetrics()` in constructor/init
   - Bind `totalOrders` to the "Total Orders" card
   - Display per-status counts in additional cards or a breakdown section
   - Keep Revenue/Active Staff/Customers cards as placeholders (zeros) for now

## Verification
- Backend: Start Spring Boot app, hit `GET /api/admin/dashboard/orders-metrics` with a SUPER_ADMIN JWT → verify JSON response with status counts
- Frontend: Navigate to `/dashboard` → verify total orders card shows real count from API
- Run `./gradlew build` in backend to verify compilation
- Run `npx ng build` in frontend to verify compilation
