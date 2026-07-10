---
phase: order-management
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/main/java/com/cadelfriul/backend/ecommerce/entity/OrderStatus.java
  - src/main/java/com/cadelfriul/backend/ecommerce/entity/Order.java
  - src/main/java/com/cadelfriul/backend/ecommerce/entity/OrderItem.java
  - src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderRequest.java
  - src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderItemRequest.java
  - src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderResponse.java
  - src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderItemResponse.java
  - src/main/java/com/cadelfriul/backend/ecommerce/repository/OrderRepository.java
  - src/main/java/com/cadelfriul/backend/ecommerce/service/OrderService.java
  - src/main/java/com/cadelfriul/backend/ecommerce/controller/CustomerOrderController.java
  - src/main/java/com/cadelfriul/backend/ecommerce/controller/AdminOrderController.java
autonomous: true
requirements: []
must_haves:
  truths:
    - "Customer can create an order with items by specifying shippingAddressId and product/quantity pairs"
    - "Order total is calculated from current DB product prices, not from client input"
    - "Stock is deducted per-product when an order is created"
    - "Order creation fails with descriptive error if any product has insufficient stock"
    - "Customer can list their own order history"
    - "Admin can list all orders across all customers"
    - "Admin can update an order's status"
    - "Order response includes full item details with product names and line totals"
  artifacts:
    - path: "src/main/java/com/cadelfriul/backend/ecommerce/entity/OrderStatus.java"
      provides: "Order lifecycle enum"
      contains: "PENDING"
    - path: "src/main/java/com/cadelfriul/backend/ecommerce/entity/Order.java"
      provides: "Order JPA entity"
      contains: "@Table(name = \"orders\")"
    - path: "src/main/java/com/cadelfriul/backend/ecommerce/entity/OrderItem.java"
      provides: "OrderItem JPA entity"
      contains: "@Table(name = \"order_items\")"
    - path: "src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderResponse.java"
      provides: "Order response DTO"
      min_lines: 20
    - path: "src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderRequest.java"
      provides: "Order creation request DTO"
    - path: "src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderItemRequest.java"
      provides: "Order item creation request DTO"
    - path: "src/main/java/com/cadelfriul/backend/ecommerce/repository/OrderRepository.java"
      provides: "Order data access"
      exports: ["findByCustomerId"]
    - path: "src/main/java/com/cadelfriul/backend/ecommerce/service/OrderService.java"
      provides: "Order business logic"
      exports: ["createOrder", "getCustomerOrders", "getAllOrders", "updateOrderStatus"]
    - path: "src/main/java/com/cadelfriul/backend/ecommerce/controller/CustomerOrderController.java"
      provides: "Customer-facing order endpoints"
    - path: "src/main/java/com/cadelfriul/backend/ecommerce/controller/AdminOrderController.java"
      provides: "Admin order management endpoints"
  key_links:
    - from: "src/main/java/com/cadelfriul/backend/ecommerce/service/OrderService.java"
      to: "ProductRepository"
      via: "productRepository.findById() to fetch prices and stock"
      pattern: "productRepository\\.findById"
    - from: "src/main/java/com/cadelfriul/backend/ecommerce/service/OrderService.java"
      to: "OrderRepository"
      via: "orderRepository.save() to persist orders"
      pattern: "orderRepository\\.save"
    - from: "src/main/java/com/cadelfriul/backend/ecommerce/service/OrderService.java"
      to: "AddressRepository"
      via: "addressRepository.findById() to validate shipping address"
      pattern: "addressRepository\\.findById"
    - from: "src/main/java/com/cadelfriul/backend/ecommerce/service/OrderService.java"
      to: "CustomerRepository"
      via: "customerRepository.findById() to validate customer"
      pattern: "customerRepository\\.findById"
---

<objective>
Implement the complete Order Management domain: entities, enum, DTOs, repository, service with transactional stock-deducting order creation, and both customer/admin REST controllers.
Purpose: Enables the core e-commerce transaction flow — customers place orders, stock is tracked, admins manage fulfillment.
Output: 11 new Java files following existing codebase patterns exactly.
</objective>

<execution_context>
@/Users/gabrielesuardi/.config/opencode/get-shit-done/workflows/execute-plan.md
</execution_context>

<interfaces>
<!-- Key existing types the executor needs. Extracted from codebase. -->

From src/main/java/com/cadelfriul/backend/core/user/entity/Customer.java:
```java
@Entity @Table(name = "customers")
public class Customer {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String email, firstName, lastName;
    // ... full getters/setters
}
```

From src/main/java/com/cadelfriul/backend/core/user/entity/Address.java:
```java
@Entity @Table(name = "customer_addresses")
public class Address {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "customer_id")
    private Customer customer;
    private String street, houseNumber, city, zipCode, province, country;
    // ... full getters/setters
}
```

From src/main/java/com/cadelfriul/backend/ecommerce/entity/Product.java:
```java
@Entity @Table(name = "products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    private String name;
    @Column(precision = 10, scale = 2)
    private BigDecimal price;
    private int stockQuantity;
    private boolean isAvailable;
    // ... full getters/setters
}
```

From src/main/java/com/cadelfriul/backend/core/user/repository/CustomerRepository.java:
```java
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    boolean existsByEmail(String email);
    Optional<Customer> findByEmail(String email);
}
```

From src/main/java/com/cadelfriul/backend/core/user/repository/AddressRepository.java:
```java
public interface AddressRepository extends JpaRepository<Address, UUID> {
    List<Address> findByCustomerId(UUID customerId);
    Optional<Address> findByIdAndCustomerId(UUID id, UUID customerId);
    long countByCustomerId(UUID customerId);
}
```

From src/main/java/com/cadelfriul/backend/ecommerce/repository/ProductRepository.java:
```java
public interface ProductRepository extends JpaRepository<Product, UUID> {
    List<Product> findByIsAvailableTrue();
    // ... custom queries
}
```
</interfaces>

<context>
@.planning/STATE.md

Codebase patterns to follow (from existing code):

Entity pattern (from Product.java):
- @Entity @Table(name = "snake_case_plural")
- @Id @GeneratedValue(strategy = GenerationType.UUID)
- jakarta.persistence.* imports
- No Lombok — explicit no-arg constructor, getters/setters
- @ManyToOne(fetch = FetchType.LAZY) @JoinColumn
- @OneToMany(mappedBy, cascade = ALL, orphanRemoval = true) with add/remove helpers
- @Enumerated(EnumType.STRING) for enums
- BigDecimal with precision = 10, scale = 2
- LocalDateTime for timestamps

DTO pattern (from ProductRequest/ProductResponse):
- Request DTOs: mutable, getters and setters, no annotations
- Response DTOs: immutable final fields, constructor takes entity, getters only

Service pattern (from AdminProductService):
- @Service @Transactional (class-level)
- Constructor-based DI
- Throw RuntimeException with descriptive messages
- Private toResponse() helper

Controller pattern (from AdminProductController):
- @RestController @RequestMapping("/api/...")
- @PreAuthorize("hasRole('SUPER_ADMIN')") at class level for admin
- @Tag(name, description) for Swagger
- @Operation(summary, description) per endpoint
- Return ResponseEntity with proper status codes

Enum pattern (from AdminRole):
- Simple enum, no annotations, values as UPPER_SNAKE_CASE
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create entities, enum, DTOs, and repository for Order domain</name>
  <files>
    src/main/java/com/cadelfriul/backend/ecommerce/entity/OrderStatus.java,
    src/main/java/com/cadelfriul/backend/ecommerce/entity/Order.java,
    src/main/java/com/cadelfriul/backend/ecommerce/entity/OrderItem.java,
    src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderRequest.java,
    src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderItemRequest.java,
    src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderResponse.java,
    src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderItemResponse.java,
    src/main/java/com/cadelfriul/backend/ecommerce/repository/OrderRepository.java
  </files>
  <action>
Create all data-layer artifacts for the Order Management domain. Follow existing codebase patterns exactly.

1. **OrderStatus.java** (in `ecommerce.entity`): Simple enum with values: `PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELLED`. No annotations, UPPER_SNAKE_CASE, trailing comma after last value. Same pattern as `AdminRole.java`.

2. **Order.java** (in `ecommerce.entity`):
   - `@Entity @Table(name = "orders")`
   - Fields: `UUID id` (@Id @GeneratedValue UUID), `Customer customer` (@ManyToOne LAZY + @JoinColumn "customer_id"), `Address shippingAddress` (@ManyToOne LAZY + @JoinColumn "shipping_address_id"), `BigDecimal totalAmount` (precision=10, scale=2, nullable=false), `OrderStatus status` (@Enumerated(EnumType.STRING), nullable=false, columnDefinition defaults to 'PENDING' via @Column(columnDefinition = "VARCHAR(255) DEFAULT 'PENDING'")), `LocalDateTime createdAt` (@Column nullable=false updatable=false)
   - No-arg constructor initializes `createdAt = LocalDateTime.now()` and `status = OrderStatus.PENDING`
   - Import Customer from `com.cadelfriul.backend.core.user.entity.Customer` and Address from `com.cadelfriul.backend.core.user.entity.Address`
   - `@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)` for `List<OrderItem> items = new ArrayList<>()`
   - Helper methods: `addItem(OrderItem item)` adds to list and sets `item.setOrder(this)`, `removeItem(OrderItem item)` removes from list
   - Full getters/setters for all fields

3. **OrderItem.java** (in `ecommerce.entity`):
   - `@Entity @Table(name = "order_items")`
   - Fields: `UUID id`, `Order order` (@ManyToOne LAZY + @JoinColumn "order_id"), `Product product` (@ManyToOne LAZY + @JoinColumn "product_id"), `int quantity` (nullable=false), `BigDecimal priceAtPurchase` (precision=10, scale=2, nullable=false)
   - No-arg constructor
   - Full getters/setters

4. **OrderRequest.java** (in `ecommerce.dto`):
   - Mutable DTO. Fields: `UUID shippingAddressId`, `List<OrderItemRequest> items`
   - Getters and setters

5. **OrderItemRequest.java** (in `ecommerce.dto`):
   - Mutable DTO. Fields: `UUID productId`, `int quantity`
   - Getters and setters

6. **OrderResponse.java** (in `ecommerce.dto`):
   - Immutable DTO. Final fields: `UUID id`, `UUID customerId`, `String customerEmail`, `UUID shippingAddressId`, `BigDecimal totalAmount`, `OrderStatus status`, `LocalDateTime createdAt`, `List<OrderItemResponse> items`
   - Constructor takes `Order` entity (no items — items passed separately as second param or fetched)
   - Actually: constructor takes `Order order, List<OrderItemResponse> items` and maps all fields
   - Getters only, no setters

7. **OrderItemResponse.java** (in `ecommerce.dto`):
   - Immutable DTO. Final fields: `UUID id`, `UUID productId`, `String productName`, `int quantity`, `BigDecimal priceAtPurchase`, `BigDecimal lineTotal` (quantity * priceAtPurchase calculated in constructor)
   - Constructor takes `OrderItem` entity, extracts product name via `orderItem.getProduct().getName()`
   - Getters only

8. **OrderRepository.java** (in `ecommerce.repository`):
   - `public interface OrderRepository extends JpaRepository<Order, UUID>`
   - `List<Order> findByCustomerId(UUID customerId);`
   - `List<Order> findByCustomerIdOrderByCreatedAtDesc(UUID customerId);`
  </action>
  <verify>
    <automated>cd /Users/gabrielesuardi/Desktop/CaDelFriul/be-cadelfriul && ./gradlew compileJava 2>&1 | tail -20</automated>
  </verify>
  <done>All 8 files compile without errors. Order, OrderItem entities have correct JPA annotations, table names, and relationships. DTOs follow immutable (response) / mutable (request) pattern. Repository has required query methods.</done>
</task>

<task type="auto">
  <name>Task 2: Create OrderService and both controllers</name>
  <files>
    src/main/java/com/cadelfriul/backend/ecommerce/service/OrderService.java,
    src/main/java/com/cadelfriul/backend/ecommerce/controller/CustomerOrderController.java,
    src/main/java/com/cadelfriul/backend/ecommerce/controller/AdminOrderController.java
  </files>
  <action>
Create the service layer and REST controllers for Order Management. Follow existing codebase patterns exactly.

1. **OrderService.java** (in `ecommerce.service`):
   - `@Service @Transactional` (class-level)
   - Constructor-injected dependencies: `OrderRepository`, `CustomerRepository`, `AddressRepository`, `ProductRepository`
   - Methods:

   **`createOrder(UUID customerId, OrderRequest request) -> OrderResponse`**:
   - Validate customer exists: `customerRepository.findById(customerId).orElseThrow(() -> new RuntimeException("Customer not found with id: " + customerId))`
   - Validate shipping address belongs to customer: `addressRepository.findByIdAndCustomerId(request.getShippingAddressId(), customerId).orElseThrow(() -> new RuntimeException("Address not found with id: " + request.getShippingAddressId() + " for customer: " + customerId))`
   - Create Order entity, set customer, shippingAddress, status=PENDING, createdAt=LocalDateTime.now()
   - Iterate `request.getItems()`:
     - For each item: fetch product via `productRepository.findById(item.getProductId()).orElseThrow(...)`
     - Validate product is available (`product.isAvailable()`), throw RuntimeException if not
     - Validate sufficient stock (`product.getStockQuantity() >= item.getQuantity()`), throw RuntimeException with message like "Insufficient stock for product '" + product.getName() + "': requested " + item.getQuantity() + ", available " + product.getStockQuantity()
     - Deduct stock: `product.setStockQuantity(product.getStockQuantity() - item.getQuantity())`
     - Create OrderItem: set product, quantity, priceAtPurchase = product.getPrice()
     - Call `order.addItem(orderItem)`
     - Accumulate total: `totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))`
   - Set order.totalAmount, save order via `orderRepository.save(order)`
   - Return `toResponse(order)` which maps to OrderResponse using the items from the saved order

   **`getCustomerOrders(UUID customerId) -> List<OrderResponse>`**:
   - Validate customer exists
   - Fetch `orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId)`
   - Map each to `toResponse(order)`

   **`getAllOrders() -> List<OrderResponse>`**:
   - Fetch `orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))`
   - Map each to `toResponse(order)`

   **`updateOrderStatus(UUID orderId, OrderStatus status) -> OrderResponse`**:
   - Fetch order by ID, throw if not found
   - Set new status, save, return toResponse

   - Private `toResponse(Order order)` helper: creates OrderItemResponse list from order.getItems(), then returns `new OrderResponse(order, itemResponses)`

2. **CustomerOrderController.java** (in `ecommerce.controller`):
   - `@RestController @RequestMapping("/api/orders")`
   - No `@PreAuthorize` at class level (customer endpoints, secured via JWT filter)
   - `@Tag(name = "Customer Orders", description = "Customer endpoints for placing and viewing orders")`
   - Constructor-injected `OrderService`
   - Inject `UUID customerId` from the authenticated user's principal. The security principal contains the customer UUID as the subject. Use `@AuthenticationPrincipal Jwt jwt` (from `org.springframework.security.oauth2.jwt.Jwt`) and extract `jwt.getSubject()` to get the customerId UUID string.
   - Endpoints:
     - `@PostMapping @Operation(summary = "Create order", description = "Place a new order")` — accepts `@RequestBody OrderRequest request`, calls `orderService.createOrder(customerId, request)`, returns `ResponseEntity.status(HttpStatus.CREATED).body(response)`
     - `@GetMapping @Operation(summary = "List my orders", description = "Get order history for the authenticated customer")` — calls `orderService.getCustomerOrders(customerId)`, returns `ResponseEntity.ok(orders)`
   - Also add a secondary endpoint for viewing a specific customer's orders (for admin use in customer context):
     - `@GetMapping("/customer/{customerId}") @PreAuthorize("hasRole('SUPER_ADMIN')") @Operation(summary = "Get customer orders", description = "Get orders for a specific customer (admin only)")` — returns `orderService.getCustomerOrders(customerId)`

3. **AdminOrderController.java** (in `ecommerce.controller`):
   - `@RestController @RequestMapping("/api/admin/orders")`
   - `@PreAuthorize("hasRole('SUPER_ADMIN')")` at class level
   - `@Tag(name = "Admin Orders", description = "Admin endpoints for managing all orders")`
   - Constructor-injected `OrderService`
   - Endpoints:
     - `@GetMapping @Operation(summary = "List all orders", description = "Get all orders across all customers")` — calls `orderService.getAllOrders()`, returns `ResponseEntity.ok(orders)`
     - `@PutMapping("/{id}/status") @Operation(summary = "Update order status", description = "Update the status of an order")` — accepts `@PathVariable UUID id` and `@RequestBody OrderStatus status`, calls `orderService.updateOrderStatus(id, status)`, returns `ResponseEntity.ok(response)`
  </action>
  <verify>
    <automated>cd /Users/gabrielesuardi/Desktop/CaDelFriul/be-cadelfriul && ./gradlew compileJava 2>&1 | tail -20</automated>
  </verify>
  <done>OrderService has createOrder (with stock validation, price calculation from DB, transactional), getCustomerOrders, getAllOrders, updateOrderStatus. CustomerOrderController exposes POST /api/orders and GET /api/orders. AdminOrderController exposes GET /api/admin/orders and PUT /api/admin/orders/{id}/status with SUPER_ADMIN role check. All files compile.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Customer → OrderService | Client sends order request with productId and quantity; service must validate prices from DB, not trust client-supplied prices |
| Stock deduction | Concurrent orders could oversell if stock check + deduction is not atomic (addressed by @Transactional on createOrder) |
| Admin endpoint access | AdminOrderController guarded by @PreAuthorize("hasRole('SUPER_ADMIN')") |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-order-01 | T (Tampering) | OrderRequest DTO | mitigate | Price never taken from client; service fetches product.price from DB. Quantity validated as positive. |
| T-order-02 | T (Tampering) | Stock deduction | mitigate | createOrder is @Transactional — stock check + deduction + order persist happen atomically. DB-level pessimistic locking via JPA flush. |
| T-order-03 | I (Information Disclosure) | Order responses | accept | OrderResponse exposes product names and prices which are already public. No PII beyond customer ID (email). |
| T-order-04 | E (Elevation of Privilege) | AdminOrderController | mitigate | @PreAuthorize("hasRole('SUPER_ADMIN')") at class level ensures only admins can access order management endpoints. |
</threat_model>

<verification>
- `./gradlew compileJava` passes with 0 errors
- All 11 new files exist in correct package directories
- Order and OrderItem entities have @Table annotations with correct names ("orders", "order_items")
- OrderService.createOrder is annotated @Transactional and validates stock before deducting
- AdminOrderController has @PreAuthorize("hasRole('SUPER_ADMIN')") at class level
- OrderResponse is immutable (final fields, constructor-only, getters only)
</verification>

<success_criteria>
All 11 files compile. Order creation calculates total from DB prices, deducts stock transactionally, and rejects insufficient stock. Customer can create orders and view history. Admin can list all orders and update status.
</success_criteria>

<output>
After completion, create `.planning/quick/260710-fpa-implement-order-management-domain-in-spr/260710-fpa-SUMMARY.md`
</output>
