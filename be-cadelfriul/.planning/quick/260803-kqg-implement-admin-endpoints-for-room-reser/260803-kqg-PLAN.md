---
phase: quick-260803-kqg
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/main/java/com/cadelfriul/backend/ecommerce/service/StripePaymentService.java
  - src/main/java/com/cadelfriul/backend/ecommerce/controller/StripeWebhookController.java
  - src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTO.java
  - src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java
  - src/main/java/com/cadelfriul/backend/hospitality/controller/RoomReservationController.java
  - src/test/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTOTest.java
  - src/test/java/com/cadelfriul/backend/ecommerce/controller/StripeWebhookControllerTest.java
autonomous: true
requirements: [QT-260803-kqg]
user_setup:
  - service: stripe
    why: "The webhook endpoint must be subscribed to the new event types or the CANCELLED/CONFIRMED transitions never fire"
    dashboard_config:
      - task: "Enable webhook events checkout.session.expired and payment_intent.payment_failed on the existing endpoint"
        location: "Stripe Dashboard -> Developers -> Webhooks -> (existing /api/webhooks/stripe endpoint) -> Add events"
        note: "checkout.session.completed is assumed already enabled (existing orders flow). Agent cannot do this — dashboard UI only."

must_haves:
  truths:
    - "GET /api/reservations/rooms returns a paginated response (content + totalElements + sort) to SUPER_ADMIN only"
    - "POST /api/reservations/rooms persists a PENDING reservation, creates a Stripe Checkout Session carrying reservationId metadata (on BOTH the Session and its PaymentIntent), and returns stripeCheckoutUrl in the body"
    - "Stripe checkout.session.completed confirms the reservation ONLY if the dates are still free (re-checked against CONFIRMED-only overlaps); if the race is lost the paid reservation is cancelled and logged"
    - "Stripe checkout.session.expired and payment_intent.payment_failed cancel the reservation resolved via reservationId metadata"
    - "Only CONFIRMED reservations block availability: the overlap query and the public booked-dates endpoint ignore PENDING/CANCELLED (verified unchanged from 260803-fdo/260803-g4r)"
    - "PUT /api/reservations/rooms/{id}/status lets a SUPER_ADMIN manually override status (already implemented — verified unchanged)"
  artifacts:
    - path: "src/main/java/com/cadelfriul/backend/ecommerce/service/StripePaymentService.java"
      provides: "createRoomReservationCheckoutSession building a PAYMENT-mode Session with room line item and reservationId metadata on Session AND payment_intent_data"
      contains: "createRoomReservationCheckoutSession"
    - path: "src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTO.java"
      provides: "stripeCheckoutUrl field with getter/setter on the existing response DTO"
      contains: "stripeCheckoutUrl"
    - path: "src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java"
      provides: "getAllReservations(Pageable) returning Page, cancelReservation(UUID), confirmReservationIfAvailable(UUID) with overlap re-check"
      contains: "confirmReservationIfAvailable"
    - path: "src/main/java/com/cadelfriul/backend/hospitality/controller/RoomReservationController.java"
      provides: "Paginated SUPER_ADMIN GET-all; POST wires createReservation -> Stripe session -> stripeCheckoutUrl with CANCELLED rollback on Stripe failure"
      contains: "stripeCheckoutUrl"
    - path: "src/main/java/com/cadelfriul/backend/ecommerce/controller/StripeWebhookController.java"
      provides: "Signature-verified dispatch of checkout.session.completed / checkout.session.expired / payment_intent.payment_failed to reservation transitions; existing order path untouched"
      contains: "payment_intent.payment_failed"
    - path: "src/test/java/com/cadelfriul/backend/ecommerce/controller/StripeWebhookControllerTest.java"
      provides: "Plain-JUnit tests for extractReservationId (valid / missing / malformed metadata)"
      contains: "extractReservationId"
    - path: "src/test/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTOTest.java"
      provides: "New test covering stripeCheckoutUrl default-null + set/get round-trip"
      contains: "stripeCheckoutUrl"
  key_links:
    - from: "RoomReservationController.createReservation"
      to: "StripePaymentService.createRoomReservationCheckoutSession"
      via: "constructor-injected call after service.createReservation (values from response DTO — no lazy entity access)"
      pattern: "createRoomReservationCheckoutSession"
    - from: "StripePaymentService.createRoomReservationCheckoutSession"
      to: "Stripe API Session.create"
      via: "SessionCreateParams with .putMetadata(\"reservationId\", ...) AND setPaymentIntentData(...putMetadata(\"reservationId\", ...))"
      pattern: "putMetadata\\(\"reservationId\""
    - from: "StripeWebhookController.handleStripeWebhook"
      to: "RoomReservationService.confirmReservationIfAvailable / cancelReservation"
      via: "reservationId extracted from Session/PaymentIntent metadata after signature verification"
      pattern: "confirmReservationIfAvailable|cancelReservation"
    - from: "RoomReservationService.confirmReservationIfAvailable"
      to: "RoomReservationRepository.findOverlappingReservations"
      via: "CONFIRMED-only overlap re-check (race with same-minute bookings)"
      pattern: "findOverlappingReservations"
    - from: "RoomReservationController.getAllReservations"
      to: "RoomReservationRepository.findAll(Pageable)"
      via: "service getAllReservations(Pageable) mapped to Page<RoomReservationResponseDTO>"
      pattern: "findAll\\(pageable\\)"
---

<objective>
Implement the admin backoffice + Stripe Checkout lifecycle for room reservations: paginate the SUPER_ADMIN `GET /api/reservations/rooms`, create a Stripe Checkout Session on `POST /api/reservations/rooms` (reservation persisted PENDING, `reservationId` in session metadata, `stripeCheckoutUrl` returned), and extend the existing signature-verified `POST /api/webhooks/stripe` to drive CONFIRMED/CANCELLED transitions via metadata. Requirement 4 (CONFIRMED-only availability) is already satisfied by 260803-fdo/260803-g4r — this plan verifies it with grep gates, no code change.

Purpose: Let the admin backoffice paginate reservations and override statuses, and let the frontend redirect room bookings to Stripe Checkout with reliable, race-safe status transitions in the webhook.

Output: Paginated admin endpoint, Stripe Checkout session creation with dual metadata (Session + PaymentIntent), webhook event dispatch to reservation transitions, and plain-JUnit tests.

CRITICAL researched constraint (do not skip): Stripe does NOT copy Checkout Session-level metadata to the PaymentIntent it creates (verified against Stripe docs). To make `payment_intent.payment_failed` resolvable, `reservationId` must ALSO be set via `payment_intent_data.metadata` when creating the session. Setting only session metadata silently breaks the failed-payment path.

Discretion choices (documented, no user decision needed):
- Session URLs hardcoded `http://localhost:3000/reservations/success|cancel` — mirrors the existing `StripePaymentService` hardcoded `http://localhost:3000/shop/...` pattern.
- If `checkout.session.completed` finds the dates already CONFIRMED-blocked (race lost): set CANCELLED + `log.warn` — terminal state, flagged for manual refund (refund automation out of scope). Never leave a paid reservation stuck PENDING.
- Webhook never throws for a missing/invalid reservationId — returns 200 + `log.warn`, matching the existing `ifPresentOrElse` order-handling style (avoids Stripe retries).
- Stripe session-creation failure on POST: rollback the just-created reservation to CANCELLED, then throw `RuntimeException` (same wrapper as `CheckoutController.checkout`).

Pre-existing (verify-only, do NOT re-implement): `PUT /api/reservations/rooms/{id}/status` + `@PreAuthorize("hasRole('SUPER_ADMIN')")` on GET-all and PUT-status (D-07 of 260803-fdo); CONFIRMED-only `findOverlappingReservations` and `findByRoom_IdAndStatus`; `/api/webhooks/**` already `.permitAll()` in SecurityConfig; `stripe.api.secretKey` / `stripe.webhook.secret` already in application.properties; `stripe-java:24.22.0` already in build.gradle.kts. **No SecurityConfig, entity, repository, build, or config changes.**
</objective>

<execution_context>
@/Users/gabrielesuardi/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/gabrielesuardi/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/260803-fdo-please-implement-the-spring-boot-backend/260803-fdo-SUMMARY.md
@.planning/quick/260803-g4r-add-a-public-endpoint-to-support-the-fro/260803-g4r-SUMMARY.md

<interfaces>
<!-- Key types and contracts the executor needs. Extracted from codebase. No further exploration needed. -->

From src/main/java/com/cadelfriul/backend/hospitality/entity/RoomReservation.java:
```java
@Entity @Table(name = "room_reservations")
public class RoomReservation {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "room_id", nullable = false) private Room room;
    @Column(nullable = false) private String userId;
    @Column(nullable = false) private LocalDate checkInDate;
    @Column(nullable = false) private LocalDate checkOutDate;
    @Column(nullable = false, precision = 10, scale = 2) private BigDecimal totalPrice;
    @Enumerated(EnumType.STRING) private ReservationStatus status;   // constructor defaults to PENDING
    private LocalDateTime createdAt; private LocalDateTime updatedAt;
    // getters: getId(), getRoom(), getCheckInDate(), getCheckOutDate(), getTotalPrice(), getStatus()
    // setters: setStatus(...), setUpdatedAt(...)
}
```

From src/main/java/com/cadelfriul/backend/hospitality/entity/ReservationStatus.java:
```java
public enum ReservationStatus { PENDING, CONFIRMED, CANCELLED }
```

From src/main/java/com/cadelfriul/backend/hospitality/repository/RoomReservationRepository.java (DO NOT MODIFY — already CONFIRMED-only per requirement 4):
```java
public interface RoomReservationRepository extends JpaRepository<RoomReservation, UUID> {
    List<RoomReservation> findByUserId(String userId);
    List<RoomReservation> findByRoom_IdAndStatus(UUID roomId, ReservationStatus status);
    @Query("SELECT r FROM RoomReservation r WHERE r.room.id = :roomId "
         + "AND r.status = com.cadelfriul.backend.hospitality.entity.ReservationStatus.CONFIRMED "
         + "AND r.checkInDate < :checkOutDate AND r.checkOutDate > :checkInDate")
    List<RoomReservation> findOverlappingReservations(@Param("roomId") UUID roomId,
            @Param("checkInDate") LocalDate checkInDate, @Param("checkOutDate") LocalDate checkOutDate);
}
```

From src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java (current shape):
```java
@Service @Transactional
public class RoomReservationService {
    private final RoomReservationRepository roomReservationRepository;
    private final RoomRepository roomRepository;
    public RoomReservationService(RoomReservationRepository roomReservationRepository, RoomRepository roomRepository) { ... }

    public RoomReservationResponseDTO createReservation(RoomReservationRequestDTO request, String userId) { ... } // saves entity (status=PENDING from constructor), returns new RoomReservationResponseDTO(reservation) INSIDE the transaction (lazy room safe here)
    @Transactional(readOnly = true) public List<LocalDate> getBookedDates(UUID roomId) { ... }
    static List<LocalDate> expandBookedDates(List<RoomReservation> reservations) { ... }
    @Transactional(readOnly = true) public List<RoomReservationResponseDTO> getReservationsForUser(String userId) { ... }
    @Transactional(readOnly = true) public List<RoomReservationResponseDTO> getAllReservations() { ... }        // <-- REPLACE with Pageable version
    public RoomReservationResponseDTO updateReservationStatus(UUID id, ReservationStatus status) { ... }
}
```

From src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTO.java (current shape — immutable final fields, single 1-arg constructor):
```java
public class RoomReservationResponseDTO {
    private final UUID id; private final RoomResponse room; private final String userId;
    private final LocalDate checkInDate; private final LocalDate checkOutDate;
    private final BigDecimal totalPrice; private final ReservationStatus status;
    private final LocalDateTime createdAt; private final LocalDateTime updatedAt;
    public RoomReservationResponseDTO(RoomReservation reservation) { ... }  // calls new RoomResponse(reservation.getRoom())
    // getters: getId(), getRoom() -> RoomResponse, getTotalPrice(), getStatus(), ...
}
```
RoomResponse exposes `getName()`, `getPricePerNight()` (value object — safe to read outside a transaction; it is NOT a lazy proxy).

From src/main/java/com/cadelfriul/backend/hospitality/controller/RoomReservationController.java (current shape):
```java
@RestController @RequestMapping("/api/reservations/rooms")
@Tag(name = "Room Reservations", description = "Authenticated room reservation endpoints")
public class RoomReservationController {
    private final RoomReservationService roomReservationService;
    public RoomReservationController(RoomReservationService roomReservationService) { ... }
    @PostMapping  -> createReservation(@Valid @RequestBody RoomReservationRequestDTO request): userId from SecurityContextHolder.getContext().getAuthentication().getName(); returns 201 + DTO
    @GetMapping("/me") -> getMyReservations()
    @GetMapping @PreAuthorize("hasRole('SUPER_ADMIN')") -> getAllReservations() returns List<RoomReservationResponseDTO>   // <-- paginate this
    @PutMapping("/{id}/status") @PreAuthorize("hasRole('SUPER_ADMIN')") -> updateReservationStatus(@PathVariable UUID id, @RequestBody ReservationStatus status)   // <-- DO NOT TOUCH (exists per D-07)
}
```

From src/main/java/com/cadelfriul/backend/ecommerce/service/StripePaymentService.java (pattern to mimic — DO NOT modify the existing createCheckoutSession(Order)):
```java
@Service
public class StripePaymentService {
    public Session createCheckoutSession(Order order) throws StripeException {
        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:3000/shop/success")
                .setCancelUrl("http://localhost:3000/shop/cancel")
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("eur")
                                .setUnitAmount(order.getTotalAmount().movePointRight(2).longValue())
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Ca' Del Friul - Order")
                                        .build())
                                .build())
                        .setQuantity(1L)
                        .build())
                .build();
        return Session.create(params);
    }
}
```
stripe-java 24.22.0 builder methods: `SessionCreateParams.builder().putMetadata(String, String)`, `SessionCreateParams.PaymentIntentData.builder().putMetadata(String, String)`, `Session.getMetadata()` (Map<String,String>), `Session.setMetadata(Map)` (from MetadataStore — usable in tests).

From src/main/java/com/cadelfriul/backend/ecommerce/controller/StripeWebhookController.java (current shape — order path must stay intact):
```java
@RestController @RequestMapping("/api/webhooks")
public class StripeWebhookController {
    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);
    private final OrderRepository orderRepository;
    @Value("${stripe.webhook.secret}") private String webhookSecret;
    @PostMapping("/stripe")
    public ResponseEntity<Void> handleStripeWebhook(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            if ("checkout.session.completed".equals(event.getType())) {
                // deserialization workaround: event.getDataObjectDeserializer().getObject().isPresent() ? cast : deserializeUnsafe()
                // order path: orderRepository.findByStripeSessionId(sessionId).ifPresentOrElse(...)
            }
        } catch (SignatureVerificationException e) { return badRequest; } catch (Exception e) { return badRequest; }
        return ok;
    }
}
```

SecurityConfig (DO NOT MODIFY): `.requestMatchers("/api/webhooks/**").permitAll()` already present (line 54); `/api/reservations/**` falls under `anyRequest().authenticated()`. application.properties already has `stripe.api.secretKey` and `stripe.webhook.secret`.

Test conventions (from RoomReservationServiceTest / RoomReservationResponseDTOTest): plain JUnit 5, no Mockito, no Spring context. `static org.junit.jupiter.api.Assertions.*` imports. Real Stripe model objects can be constructed (`new Session()`) and configured via setters (`setMetadata`) — no mocks needed.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Paginate admin GET /api/reservations/rooms (service + controller)</name>
  <files>src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java, src/main/java/com/cadelfriul/backend/hospitality/controller/RoomReservationController.java</files>
  <action>
  Per requirement 1a. Do NOT touch the PUT /{id}/status endpoint or the repository.

  1. In `RoomReservationService.java`, REPLACE the existing read-only `getAllReservations()` (no-arg, returns `List<RoomReservationResponseDTO>`) with a Pageable version:
     - Signature: `@Transactional(readOnly = true) public Page<RoomReservationResponseDTO> getAllReservations(Pageable pageable)`
     - Body: `return roomReservationRepository.findAll(pageable).map(RoomReservationResponseDTO::new);`
     - Add imports `org.springframework.data.domain.Page` and `org.springframework.data.domain.Pageable`. Keep the existing `java.util.List` import (still used by `getReservationsForUser`).
     - The only caller is `RoomReservationController.getAllReservations` — no other code depends on the old signature.

  2. In `RoomReservationController.java`, update the admin GET mapping (keep the `@PreAuthorize("hasRole('SUPER_ADMIN')")` annotation exactly as-is):
     - Signature: `public ResponseEntity<Page<RoomReservationResponseDTO>> getAllReservations(@PageableDefault(size = 20) Pageable pageable)`
     - Body: `return ResponseEntity.ok(roomReservationService.getAllReservations(pageable));`
     - Add imports `org.springframework.data.domain.Page`, `org.springframework.data.domain.Pageable`, `org.springframework.data.web.PageableDefault`. `List` and `UUID` imports remain (used by /me and PUT).
     - Update the `@Operation` description to mention pagination query params: `?page=0&size=20&sort=createdAt,desc`.
     - The response shape changes from a bare JSON array to a `Page` envelope (`content`, `totalElements`, `totalPages`, `number`, `size`, `sort`, ...) — this is the intended contract change for the admin backoffice.

  Do NOT modify: SecurityConfig, repository, entity, DTOs, the PUT mapping, or the POST mapping.
  </action>
  <verify>
  <automated>./gradlew compileJava</automated>
  </verify>
  <done>Service exposes `Page<RoomReservationResponseDTO> getAllReservations(Pageable)`; controller GET returns `Page<RoomReservationResponseDTO>` with `@PageableDefault(size = 20) Pageable` and unchanged SUPER_ADMIN guard; `./gradlew compileJava` passes; PUT mapping untouched.</done>
</task>

<task type="auto">
  <name>Task 2: Stripe Checkout session on POST /api/reservations/rooms (with CANCELLED rollback on failure)</name>
  <files>src/main/java/com/cadelfriul/backend/ecommerce/service/StripePaymentService.java, src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTO.java, src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java, src/main/java/com/cadelfriul/backend/hospitality/controller/RoomReservationController.java, src/test/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTOTest.java</files>
  <action>
  Per requirement 2. The reservation is already persisted with status PENDING (entity constructor default; `createReservation` never changes status) — no entity change needed.

  1. In `StripePaymentService.java`, ADD a new method (do NOT modify `createCheckoutSession(Order)`):
     - Signature: `public Session createRoomReservationCheckoutSession(UUID reservationId, String roomName, BigDecimal totalPrice) throws StripeException`
     - Primitive parameters only — no entity coupling; the controller passes values read from the response DTO.
     - Build `SessionCreateParams` mirroring the existing Order pattern (mode PAYMENT, currency `"eur"`, `unitAmount = totalPrice.movePointRight(2).longValue()`, quantity 1) with:
       - Product name `"Ca' Del Friul - Room: " + roomName` (room details in the line item, per requirement 2).
       - Success/cancel URLs hardcoded `http://localhost:3000/reservations/success` and `http://localhost:3000/reservations/cancel` (discretion — mirrors the existing hardcoded `/shop/...` URLs).
       - Session metadata: `.putMetadata("reservationId", reservationId.toString())` on the SessionCreateParams builder.
       - PaymentIntent metadata — CRITICAL (researched): `.setPaymentIntentData(SessionCreateParams.PaymentIntentData.builder().putMetadata("reservationId", reservationId.toString()).build())`. Stripe does NOT copy Session metadata onto the PaymentIntent; without this, `payment_intent.payment_failed` (Task 3) cannot resolve the reservation.
     - Return `Session.create(params)`.
     - Add imports `java.math.BigDecimal` and `java.util.UUID` (StripeException, Session, SessionCreateParams already imported).

  2. In `RoomReservationResponseDTO.java`, add a mutable `stripeCheckoutUrl` field (matches the mutable getter/setter style of `ecommerce/dto/CheckoutResponse.java`):
     - `private String stripeCheckoutUrl;` (NOT final — the 1-arg constructor keeps it null).
     - Add `getStripeCheckoutUrl()` and `setStripeCheckoutUrl(String)`.
     - Do NOT touch the existing final fields or the 1-arg constructor.

  3. In `RoomReservationService.java`, ADD a method (reused by Task 3's webhook for expired/failed payments):
     - Signature: `public boolean cancelReservation(UUID reservationId)` — returns false when the reservation does not exist (webhook-friendly, no exception), true otherwise.
     - Body: `findById`; if absent return false; else `setStatus(ReservationStatus.CANCELLED)`, `setUpdatedAt(LocalDateTime.now())`, `save`, return true.
     - `ReservationStatus` and `LocalDateTime` are already imported.

  4. In `RoomReservationController.java`, update the POST mapping:
     - Add `StripePaymentService` as a second constructor-injected dependency (field `private final StripePaymentService stripePaymentService;`).
     - New flow:
       a. userId from SecurityContextHolder (unchanged).
       b. `RoomReservationResponseDTO dto = roomReservationService.createReservation(request, userId);` (entity persisted PENDING inside the service transaction).
       c. In a try/catch for `StripeException`: call `stripePaymentService.createRoomReservationCheckoutSession(dto.getId(), dto.getRoom().getName(), dto.getTotalPrice())`. `dto.getRoom()` is a `RoomResponse` value object materialized inside the service transaction — NOT a lazy proxy — safe to read here.
       d. On success: `dto.setStripeCheckoutUrl(session.getUrl());` then return 201 with `dto`.
       e. On `StripeException`: rollback via `roomReservationService.cancelReservation(dto.getId())`, then `throw new RuntimeException("Failed to create Stripe checkout session: " + e.getMessage())` (same wrapper style as `CheckoutController.checkout` — the GlobalExceptionHandler maps it to 500).
     - Add imports: `com.stripe.exception.StripeException`, `com.stripe.model.checkout.Session`, `com.cadelfriul.backend.ecommerce.service.StripePaymentService`.

  5. In `src/test/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTOTest.java`, add a test following the file's existing plain-JUnit style:
     - `stripeCheckoutUrl_defaultsToNull` — DTO built via the existing 1-arg constructor has `getStripeCheckoutUrl() == null`.
     - `stripeCheckoutUrl_setGetRoundTrip` — after `setStripeCheckoutUrl("https://checkout.stripe.com/...")`, `getStripeCheckoutUrl()` returns it.

  Do NOT modify: entity, repository, SecurityConfig, StripeConfig, application.properties, build.gradle.kts, the existing `createCheckoutSession(Order)` method.
  </action>
  <verify>
  <automated>./gradlew test --tests "com.cadelfriul.backend.hospitality.dto.RoomReservationResponseDTOTest"</automated>
  </verify>
  <done>POST /api/reservations/rooms returns 201 with a body containing `stripeCheckoutUrl` and the PENDING reservation; session carries `reservationId` in BOTH session metadata and `payment_intent_data.metadata`; on Stripe failure the just-created reservation is set CANCELLED and a RuntimeException surfaces; `RoomReservationResponseDTOTest` green.</done>
</task>

<task type="auto">
  <name>Task 3: Stripe webhook — CONFIRMED/CANCELLED reservation transitions</name>
  <files>src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java, src/main/java/com/cadelfriul/backend/ecommerce/controller/StripeWebhookController.java, src/test/java/com/cadelfriul/backend/ecommerce/controller/StripeWebhookControllerTest.java</files>
  <action>
  Per requirements 3 and 4 (race-safe confirmation + cancelled transitions). The existing ORDER handling path must remain byte-for-byte behaviorally intact.

  1. In `RoomReservationService.java`, ADD a method (class is already `@Transactional`, so the LAZY `room` access inside is safe):
     - Signature: `public boolean confirmReservationIfAvailable(UUID reservationId)` — returns false only when the reservation does not exist (webhook-friendly, no exception).
     - Body: `findById`; if absent return false. Re-run the race check with `roomReservationRepository.findOverlappingReservations(reservation.getRoom().getId(), reservation.getCheckInDate(), reservation.getCheckOutDate())` — the query only counts CONFIRMED reservations, and this reservation is currently PENDING so it cannot overlap itself.
     - If `overlaps.isEmpty()` (still available): `setStatus(ReservationStatus.CONFIRMED)`.
     - Else (race lost — a CONFIRMED reservation now blocks the dates): `setStatus(ReservationStatus.CANCELLED)` and `log.warn("Reservation {} cancelled after payment: dates no longer available ({} CONFIRMED overlap(s))", reservationId, overlaps.size())` — the customer paid, so CANCELLED is the terminal state flagged for manual refund (documented discretion; refund automation out of scope).
     - Either way: `setUpdatedAt(LocalDateTime.now())`, `save`, return true.
     - Add an SLF4J `Logger` field to the service (`private static final Logger log = LoggerFactory.getLogger(RoomReservationService.class);` + imports `org.slf4j.Logger`, `org.slf4j.LoggerFactory`).

  2. In `StripeWebhookController.java`:
     - Add `RoomReservationService` as a second constructor-injected dependency.
     - Add a private generic helper that preserves the existing API-version deserialization workaround (do NOT duplicate the inline pattern three times):
       - `<T> T deserializeEventObject(Event event, Class<T> type)` — if `event.getDataObjectDeserializer().getObject().isPresent()` return `type.cast(get())`, else `type.cast(event.getDataObjectDeserializer().deserializeUnsafe())`.
     - Add a package-private STATIC helper (plain-JUnit-testable, mirroring the g4r static-helper pattern):
       - `static UUID extractReservationId(Session session)` — null-safe: null session, null metadata, or a value that does not parse as a UUID all return null; otherwise `UUID.fromString(session.getMetadata().get("reservationId"))`.
     - In `handleStripeWebhook`, inside the existing try (after `constructEvent`), add branches WITHOUT disturbing the existing order logic:
       - `checkout.session.completed`: after deserializing `Session`, call `extractReservationId(session)`. If non-null → reservation path: `boolean ok = roomReservationService.confirmReservationIfAvailable(id); if (!ok) log.warn("Reservation not found for webhook: {}", id);`. If null → EXISTING order path (`findByStripeSessionId` etc.) unchanged.
       - `checkout.session.expired`: deserialize `Session`; `extractReservationId`; if non-null → `boolean ok = roomReservationService.cancelReservation(id); if (!ok) log.warn(...)`. (Reuses Task 2's `cancelReservation`.)
       - `payment_intent.payment_failed`: deserialize `com.stripe.model.PaymentIntent` via `deserializeEventObject(event, PaymentIntent.class)`; read `paymentIntent.getMetadata()` (null-safe); if it contains `"reservationId"` → `cancelReservation` + warn-if-false, same as above.
       - Any other event type: log at info level and ignore (200).
     - NEVER throw when a reservation is missing or metadata is absent — return 200 + `log.warn` (matches the existing `ifPresentOrElse` order style; avoids Stripe webhook retries).
     - Keep the existing `SignatureVerificationException` → 400 and generic `Exception` → 400 handling.
     - Add imports: `com.cadelfriul.backend.hospitality.service.RoomReservationService`, `com.stripe.model.PaymentIntent`, `java.util.UUID`.

  3. Create `src/test/java/com/cadelfriul/backend/ecommerce/controller/StripeWebhookControllerTest.java` (plain JUnit 5, no Mockito/Spring — same package as the controller so the package-private static helper is accessible):
     - Helper: `Session sessionWithMetadata(String reservationId)` — `Session s = new Session(); s.setMetadata(Map.of("reservationId", reservationId)); return s;` (stripe-java model setter, no mocks).
     - Test `extractReservationId_returnsUuidFromMetadata` — metadata `"550e8400-e29b-41d4-a716-446655440000"` → `assertEquals(UUID.fromString("550e8400-e29b-41d4-a716-446655440000"), ...)`.
     - Test `extractReservationId_returnsNullWithoutMetadata` — `new Session()` → null.
     - Test `extractReservationId_returnsNullForMalformedValue` — metadata `"not-a-uuid"` → null.
     - Test `extractReservationId_returnsNullForNullSession` — null → null.

  Do NOT modify: SecurityConfig (`/api/webhooks/**` already permitAll), the order-handling code path's behavior, entities, or the repository.
  </action>
  <verify>
  <automated>./gradlew test --tests "com.cadelfriul.backend.ecommerce.controller.StripeWebhookControllerTest"</automated>
  </verify>
  <done>Webhook dispatches all three event types to reservation transitions via metadata-resolved reservationId; confirmation re-checks CONFIRMED-only overlaps (race-safe); missing/invalid reservationId or reservation logs a warning and returns 200 (no Stripe retries); order path untouched; `StripeWebhookControllerTest` green.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| SUPER_ADMIN client → GET /api/reservations/rooms | Paginated admin listing; must stay SUPER_ADMIN-only |
| SUPER_ADMIN client → PUT /api/reservations/rooms/{id}/status | Manual status override; must stay SUPER_ADMIN-only |
| Authenticated customer → POST /api/reservations/rooms | Creates a reservation AND an outbound Stripe Session; input is customer-controlled (roomId + dates) |
| Stripe → POST /api/webhooks/stripe | permitAll endpoint; every event must be signature-verified before any state change |
| Public client → GET /api/rooms/{roomId}/booked-dates | Calendar availability (pre-existing, unchanged — re-verified) |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-kqg-01 | Spoofing | POST /api/webhooks/stripe | mitigate | `Webhook.constructEvent(payload, sigHeader, webhookSecret)` runs before ANY branch — forged events with arbitrary reservationId are rejected with 400 before reaching service calls (pattern already in place, extended to new event types). |
| T-kqg-02 | Tampering | reservationId from webhook metadata | mitigate | Only signature-verified Stripe events reach the dispatch; `extractReservationId` additionally validates UUID format (malformed → null → ignored with warn). `payment_intent.payment_failed` reads metadata only from a signature-verified PaymentIntent (metadata set server-side via `payment_intent_data.metadata`, never client-supplied). |
| T-kqg-03 | Information Disclosure | GET /api/reservations/rooms + PUT /{id}/status | mitigate | `@PreAuthorize("hasRole('SUPER_ADMIN')")` retained on both; `/api/reservations/**` falls under `anyRequest().authenticated()` in SecurityConfig. No SecurityConfig change. |
| T-kqg-04 | Tampering | POST /api/reservations/rooms request | mitigate | DTO is `@Valid` with `@NotNull` roomId/checkInDate/checkOutDate; service validates `checkOutDate > checkInDate` (400) and rejects archived rooms (409) before persisting; identity (userId) and totalPrice remain server-derived — never client-supplied. |
| T-kqg-05 | Integrity (race) | confirmReservationIfAvailable | mitigate | The webhook re-runs `findOverlappingReservations` (CONFIRMED-only) before confirming; a PENDING reservation never blocks itself or others, so same-minute double-bookings are resolved deterministically: first to confirm wins, loser is CANCELLED + warn-logged (manual refund flag). |
| T-kqg-06 | DoS | webhook handler | mitigate | Missing/invalid metadata or unknown reservationId never throws — warn + 200 — so Stripe does not retry-spam the endpoint; signature verification rejects unauthenticated floods with 400. |
| T-kqg-07 | Integrity | availability queries | accept | Requirement 4 is already enforced by the existing CONFIRMED-only JPQL (`findOverlappingReservations`) and derived query (`findByRoom_IdAndStatus` with CONFIRMED) — PENDING/CANCELLED never block dates. Re-verified by grep gates, no code change. |

No new dependencies are installed (stripe-java 24.22.0 already in build.gradle.kts) — package legitimacy gate not applicable.
</threat_model>

<verification>
Overall checks for this quick task:

1. Compile: `./gradlew compileJava` passes.
2. Tests: `./gradlew test --tests "com.cadelfriul.backend.hospitality.dto.RoomReservationResponseDTOTest" --tests "com.cadelfriul.backend.hospitality.service.RoomReservationServiceTest" --tests "com.cadelfriul.backend.ecommerce.controller.StripeWebhookControllerTest"` — all green (existing 3 + 2 + new 4).
3. Grep gate — dual metadata present (researched Stripe constraint): `grep -n 'putMetadata("reservationId"' src/main/java/com/cadelfriul/backend/ecommerce/service/StripePaymentService.java` must show at least 2 matches (Session builder + PaymentIntentData builder).
4. Grep gate — response DTO exposes the URL: `grep -c "stripeCheckoutUrl" src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTO.java src/main/java/com/cadelfriul/backend/hospitality/controller/RoomReservationController.java` matches in both.
5. Grep gate — webhook event branches: `grep -n 'checkout.session.expired\|payment_intent.payment_failed\|confirmReservationIfAvailable' src/main/java/com/cadelfriul/backend/ecommerce/controller/StripeWebhookController.java src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java` matches.
6. Grep gate — admin endpoints: `grep -n "PreAuthorize" src/main/java/com/cadelfriul/backend/hospitality/controller/RoomReservationController.java` still shows exactly 2 (GET-all + PUT-status, SUPER_ADMIN).
7. Grep gate — requirement 4 reinforcement (NO code change expected, must still hold):
   - `grep -n "CONFIRMED" src/main/java/com/cadelfriul/backend/hospitality/repository/RoomReservationRepository.java` shows CONFIRMED in the overlap @Query and the derived query usage.
   - `grep -n "findByRoom_IdAndStatus" src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java` shows the call with `ReservationStatus.CONFIRMED` (booked-dates endpoint remains CONFIRMED-only).
8. Grep gate — SecurityConfig untouched: `grep -c "api/webhooks" src/main/java/com/cadelfriul/backend/core/config/SecurityConfig.java` still returns exactly 1 (the existing permitAll); no new matcher added.
9. Grep gate — no residual no-arg admin list: `grep -n "getAllReservations()" src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java` returns nothing (only the Pageable overload remains).
</verification>

<success_criteria>
- `GET /api/reservations/rooms` returns a `Page` envelope (content/totalElements/page size) to SUPER_ADMIN only; `PUT /api/reservations/rooms/{id}/status` manual override still works (unchanged).
- `POST /api/reservations/rooms` persists a PENDING reservation and returns 201 with `stripeCheckoutUrl`; the Checkout Session has `reservationId` in both Session metadata and `payment_intent_data.metadata`; Stripe failure cancels the reservation and surfaces an error.
- `checkout.session.completed` confirms the reservation only if dates are still free (CONFIRMED-only re-check); race-lost paid reservations become CANCELLED with a warning log; `checkout.session.expired` and `payment_intent.payment_failed` cancel via metadata-resolved reservationId. Existing order webhook path unchanged.
- Only CONFIRMED reservations block availability (verified, unchanged from 260803-fdo/260803-g4r).
- All tests green; no SecurityConfig/entity/repository/build/config changes; no new dependencies; `StripeWebhookControllerTest` follows the plain-JUnit convention.
</success_criteria>

<output>
Create `.planning/quick/260803-kqg-implement-admin-endpoints-for-room-reser/260803-kqg-SUMMARY.md` when done
</output>
