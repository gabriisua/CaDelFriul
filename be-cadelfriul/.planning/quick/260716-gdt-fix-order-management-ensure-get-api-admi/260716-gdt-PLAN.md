---
phase: quick
quick_id: 260716-gdt
slug: fix-order-management-ensure-get-api-admi
status: pending
created: 2026-07-16T09:47:47.800Z
---

# Quick Task 260716-gdt: Fix Order Management DTO and Service Mapping

## Task Description

Fix Order Management: Ensure GET /api/admin/orders/{id} returns order items by updating DTO and Service mapping.

## Analysis

After reviewing the codebase, the implementation already exists:

1. **Endpoint exists**: `AdminOrderController.getOrderById()` at `/api/admin/orders/{id}`
2. **Service method exists**: `OrderService.getOrderById()` with `@Transactional(readOnly = true)`
3. **DTO exists**: `OrderResponse` with `List<OrderItemResponse> items`
4. **Item mapping exists**: `OrderItemResponse` has all required fields (productId, productName, quantity, priceAtPurchase, lineTotal)

The code should already be returning items. However, the user reports items are not being returned. This could indicate:

1. A lazy loading issue (items not being loaded within transaction)
2. A serialization issue (items being excluded from JSON response)
3. A data issue (items might be null/empty in database)

## Plan

### Task 1: Verify and Fix Lazy Loading

**Goal**: Ensure items are properly loaded when fetching an order

**Files to modify**:
- `src/main/java/com/cadelfriul/backend/ecommerce/entity/Order.java`

**Actions**:
1. Check if the `@OneToMany` relationship has proper fetch type
2. Add `FetchType.EAGER` if items are not being loaded (or verify LAZY works within transaction)
3. Verify the `toResponse()` method in `OrderService` properly accesses items within the transaction

**Verification**:
- Run `gradle compileJava` to ensure compilation succeeds
- Test the endpoint with a sample order that has items

### Task 2: Verify DTO Structure

**Goal**: Ensure DTO matches expected structure

**Files to verify**:
- `src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderResponse.java`
- `src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderItemResponse.java`

**Actions**:
1. Verify `OrderResponse` has `List<OrderItemResponse> items` field
2. Verify `OrderItemResponse` has all required fields:
   - `productId` (UUID)
   - `productName` (String)
   - `quantity` (int)
   - `priceAtPurchase` (BigDecimal) - user calls this `unitPrice`
   - `lineTotal` (BigDecimal)
3. Verify no `@JsonIgnore` annotations are hiding items

**Verification**:
- Check JSON serialization includes items array
- Verify field names match API expectations

### Task 3: Add Verification Test

**Goal**: Create a simple test to verify items are returned

**Files to create**:
- `src/test/java/com/cadelfriul/backend/ecommerce/controller/AdminOrderControllerTest.java`

**Actions**:
1. Create integration test for GET /api/admin/orders/{id}
2. Verify response includes items array
3. Verify items have correct fields populated

**Verification**:
- Test passes with sample data
- Items are not null or empty

## Success Criteria

- [ ] GET /api/admin/orders/{id} returns items in response
- [ ] Items contain productId, productName, quantity, priceAtPurchase, lineTotal
- [ ] No lazy loading exceptions
- [ ] Compilation succeeds
- [ ] Test verifies items are returned

## Notes

The implementation appears to already be correct based on code review. The issue might be:
1. Runtime lazy loading issue (Hibernate session closed before items accessed)
2. JSON serialization configuration
3. Test data doesn't have items

If the code is already working, this task will document the verification and add tests to prevent regression.
