---
phase: 260716-grz
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/main/java/com/cadelfriul/backend/ecommerce/entity/Order.java
  - src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderResponse.java
  - src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderRequest.java
  - src/main/java/com/cadelfriul/backend/ecommerce/service/OrderService.java
  - src/main/java/com/cadelfriul/backend/ecommerce/repository/OrderRepository.java
  - src/test/java/com/cadelfriul/backend/ecommerce/controller/AdminOrderControllerTest.java
autonomous: true
requirements: []

must_haves:
  truths:
    - "GET /api/admin/orders/{id} returns structured shippingAddress object with street, city, zipCode, etc. instead of just UUID"
    - "GET /api/admin/orders/{id} returns structured billingAddress object (same shape as shippingAddress)"
    - "GET /api/admin/orders returns structured address objects for all orders"
    - "POST /api/orders accepts billingAddressId in request body"
    - "Order entity has billingAddress field persisted in database"
    - "Existing orderItems collection continues to be returned correctly"
  artifacts:
    - path: "src/main/java/com/cadelfriul/backend/ecommerce/entity/Order.java"
      provides: "billingAddress entity field"
      contains: "billingAddress"
    - path: "src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderResponse.java"
      provides: "Structured address DTOs in response"
      contains: "AddressResponse"
    - path: "src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderRequest.java"
      provides: "billingAddressId in create request"
      contains: "billingAddressId"
  key_links:
    - from: "src/main/java/com/cadelfriul/backend/ecommerce/service/OrderService.java"
      to: "src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderResponse.java"
      via: "toResponse() method mapping Order to OrderResponse"
      pattern: "new OrderResponse\\(order,"
    - from: "src/main/java/com/cadelfriul/backend/ecommerce/entity/Order.java"
      to: "customer_addresses table"
      via: "@ManyToOne billingAddress field"
      pattern: "billingAddress"
---

<objective>
Fix the Order Management endpoint to return structured address objects instead of UUIDs, and add billingAddress support throughout the order domain.

Purpose: The current OrderResponse returns `shippingAddressId` as a bare UUID and has no billingAddress at all. Admins and customers need to see full address details (street, city, zipCode, province, country) inline, not have to make a separate call to resolve an address ID.

Output: Updated Order entity with billingAddress, updated OrderResponse with AddressResponse objects, updated OrderRequest with billingAddressId, updated OrderService mapping, and updated tests.
</objective>

<execution_context>
@/Users/gabrielesuardi/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/gabrielesuardi/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

<interfaces>
<!-- Existing types the executor needs -->

From src/main/java/com/cadelfriul/backend/core/user/dto/AddressResponse.java:
```java
public class AddressResponse {
    private final UUID id;
    private final String street;
    private final String houseNumber;
    private final String city;
    private final String zipCode;
    private final String province;
    private final String country;
    private final String additionalInfo;
    private final boolean defaultShipping;
    private final boolean defaultBilling;

    public AddressResponse(Address address) { ... }
    // getters...
}
```

From src/main/java/com/cadelfriul/backend/core/user/entity/Address.java:
```java
@Entity
@Table(name = "customer_addresses")
public class Address {
    private UUID id;
    private Customer customer;
    private String street;
    private String houseNumber;
    private String city;
    private String zipCode;
    private String province;
    private String country;
    private String additionalInfo;
    private boolean isDefaultShipping;
    private boolean isDefaultBilling;
    // getters/setters...
}
```

From src/main/java/com/cadelfriul/backend/ecommerce/entity/Order.java:
```java
@Entity
@Table(name = "orders")
public class Order {
    private UUID id;
    @ManyToOne(fetch = FetchType.LAZY)
    private Customer customer;
    @ManyToOne(fetch = FetchType.LAZY)
    private Address shippingAddress;  // <-- NO billingAddress currently
    private BigDecimal totalAmount;
    private OrderStatus status;
    private LocalDateTime createdAt;
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItem> items;
    // getters/setters...
}
```

From src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderResponse.java:
```java
public class OrderResponse {
    private final UUID id;
    private final UUID customerId;
    private final String customerEmail;
    private final UUID shippingAddressId;  // <-- currently UUID, needs AddressResponse
    // NO billingAddress field currently
    private final BigDecimal totalAmount;
    private final OrderStatus status;
    private final LocalDateTime createdAt;
    private final List<OrderItemResponse> items;

    public OrderResponse(Order order, List<OrderItemResponse> items) { ... }
}
```

From src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderRequest.java:
```java
public class OrderRequest {
    private UUID shippingAddressId;
    // NO billingAddressId currently
    private List<OrderItemRequest> items;
    // getters/setters...
}
```

From src/main/java/com/cadelfriul/backend/ecommerce/service/OrderService.java:
```java
@Service
@Transactional
public class OrderService {
    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    // ... methods: createOrder, getCustomerOrders, getAllOrders, getOrderById, updateOrderStatus
    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(OrderItemResponse::new)
                .toList();
        return new OrderResponse(order, itemResponses);
    }
}
```

From src/main/java/com/cadelfriul/backend/core/user/repository/AddressRepository.java:
```java
// Has: findByIdAndCustomerId(UUID addressId, UUID customerId)
// Also has: findById(UUID id) inherited from JpaRepository
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add billingAddress to Order entity and update OrderResponse/OrderRequest DTOs</name>
  <files>
    src/main/java/com/cadelfriul/backend/ecommerce/entity/Order.java,
    src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderResponse.java,
    src/main/java/com/cadelfriul/backend/ecommerce/dto/OrderRequest.java,
    src/test/java/com/cadelfriul/backend/ecommerce/controller/AdminOrderControllerTest.java
  </files>
  <behavior>
    - Order entity has `billingAddress` field: @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "billing_address_id", nullable = true) private Address billingAddress — with getter and setter. nullable=true because existing orders won't have it initially.
    - OrderResponse replaces `UUID shippingAddressId` with `AddressResponse shippingAddress` (using existing AddressResponse from core.user.dto). Adds `AddressResponse billingAddress` field. Constructor changes from `(Order order, List<OrderItemResponse> items)` to `(Order order, List<OrderItemResponse> items)` — the constructor builds AddressResponse objects from the Order's Address entities inline.
    - OrderRequest adds `private UUID billingAddressId` with getter/setter. The field is optional (no validation annotation) since billing address may default to shipping address.
    - AdminOrderControllerTest: add test `orderResponse_shouldContainStructuredAddressInsteadOfUUID` that verifies OrderResponse exposes AddressResponse objects with correct field values. Add test `orderResponse_shouldHandleNullBillingAddress` that verifies null billingAddress is handled gracefully.
  </behavior>
  <action>
    **Step 1 — Order entity (Order.java):**
    Add after the `shippingAddress` field:
    ```java
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billing_address_id")
    private Address billingAddress;
    ```
    Add getter/setter: `public Address getBillingAddress() { return billingAddress; }` and `public void setBillingAddress(Address billingAddress) { this.billingAddress = billingAddress; }`

    **Step 2 — OrderResponse DTO (OrderResponse.java):**
    Replace `private final UUID shippingAddressId` with:
    ```java
    import com.cadelfriul.backend.core.user.dto.AddressResponse;

    private final AddressResponse shippingAddress;
    private final AddressResponse billingAddress;
    ```
    Update constructor to:
    ```java
    public OrderResponse(Order order, List<OrderItemResponse> items) {
        this.id = order.getId();
        this.customerId = order.getCustomer().getId();
        this.customerEmail = order.getCustomer().getEmail();
        this.shippingAddress = order.getShippingAddress() != null
            ? new AddressResponse(order.getShippingAddress()) : null;
        this.billingAddress = order.getBillingAddress() != null
            ? new AddressResponse(order.getBillingAddress()) : null;
        this.totalAmount = order.getTotalAmount();
        this.status = order.getStatus();
        this.createdAt = order.getCreatedAt();
        this.items = items;
    }
    ```
    Replace `getShippingAddressId()` getter with `getShippingAddress()` returning `AddressResponse`. Add `getBillingAddress()` getter returning `AddressResponse`.

    **Step 3 — OrderRequest DTO (OrderRequest.java):**
    Add field: `private UUID billingAddressId;` with getter `getBillingAddressId()` and setter `setBillingAddressId(UUID billingAddressId)`.

    **Step 4 — Tests (AdminOrderControllerTest.java):**
    Update `orderResponse_shouldContainItemsList` test: replace `assertEquals(addressId, response.getShippingAddressId())` with assertions on `response.getShippingAddress()` returning an AddressResponse with matching ID.
    Add new test: `orderResponse_shouldHandleNullBillingAddress` — create Order without billingAddress set, construct OrderResponse, assert `getBillingAddress()` returns null.
    Add new test: `orderResponse_shouldContainStructuredBillingAddress` — create Order with billingAddress set, construct OrderResponse, assert `getBillingAddress()` returns AddressResponse with correct fields.
  </action>
  <verify>
    <automated>cd /Users/gabrielesuardi/Desktop/CaDelFriul/be-cadelfriul && ./mvnw test -pl . -Dtest=AdminOrderControllerTest -q 2>&1 | tail -20</automated>
  </verify>
  <done>
    - Order entity has billingAddress field with LAZY fetch
    - OrderResponse exposes `shippingAddress` and `billingAddress` as AddressResponse objects (not UUIDs)
    - OrderRequest accepts optional `billingAddressId`
    - Existing tests pass; new tests verify structured addresses and null billingAddress handling
  </done>
</task>

<task type="auto">
  <name>Task 2: Update OrderService to map billingAddress and persist it on create</name>
  <files>
    src/main/java/com/cadelfriul/backend/ecommerce/service/OrderService.java
  </files>
  <action>
    **Step 1 — createOrder method:**
    After the shippingAddress lookup, add billingAddress resolution:
    ```java
    Address billingAddress;
    if (request.getBillingAddressId() != null) {
        billingAddress = addressRepository.findByIdAndCustomerId(request.getBillingAddressId(), customerId)
                .orElseThrow(() -> new RuntimeException("Address not found with id: " + request.getBillingAddressId() + " for customer: " + customerId));
    } else {
        billingAddress = shippingAddress; // default to shipping address
    }
    order.setBillingAddress(billingAddress);
    ```
    Place this after `order.setShippingAddress(shippingAddress)` and before the items loop.

    **Step 2 — toResponse method:**
    The toResponse method should NOT need changes because OrderResponse constructor now handles Address mapping internally. Verify the existing toResponse still compiles and works — it calls `new OrderResponse(order, itemResponses)` which now maps addresses in its constructor.

    **Step 3 — Run all tests:**
    Run the full test suite to confirm no regressions:
    ```bash
    ./mvnw test -q 2>&1 | tail -30
    ```
  </action>
  <verify>
    <automated>cd /Users/gabrielesuardi/Desktop/CaDelFriul/be-cadelfriul && ./mvnw test -q 2>&1 | tail -20</automated>
  </verify>
  <done>
    - createOrder accepts billingAddressId (optional, defaults to shippingAddress)
    - Order with billingAddress is persisted to database
    - toResponse continues to work — all endpoints return structured addresses
    - Full test suite passes with no regressions
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Client → OrderRequest | User-supplied billingAddressId must be validated against customer ownership |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-grz-01 | Elevation of Privilege | OrderService.createOrder | mitigate | billingAddressId validated via `findByIdAndCustomerId` — same customer-scoping as shippingAddressId |
| T-grz-02 | Information Disclosure | OrderResponse | accept | AddressResponse exposes same fields as AddressController — no new PII surface |
</threat_model>

<verification>
- `./mvnw test -Dtest=AdminOrderControllerTest` passes (all tests including new address mapping tests)
- `./mvnw test` full suite passes (no regressions)
- Manual verification: OrderResponse JSON contains `shippingAddress: { street, houseNumber, city, ... }` and `billingAddress: { ... }` instead of UUID strings
</verification>

<success_criteria>
- OrderResponse returns structured AddressResponse for both shippingAddress and billingAddress
- Order entity persists billingAddress in the database
- OrderRequest accepts optional billingAddressId
- All existing tests pass, new tests cover address mapping and null billingAddress
- No breaking changes to existing API consumers (fields are additive)
</success_criteria>

<output>
After completion, create `.planning/quick/260716-grz-fix-order-management-endpoint-return-ord/260716-grz-01-SUMMARY.md`
</output>
