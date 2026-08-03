---
phase: 260803-fdo
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/main/java/com/cadelfriul/backend/hospitality/entity/RoomReservation.java (new)
  - src/main/java/com/cadelfriul/backend/hospitality/entity/ReservationStatus.java (new)
  - src/main/java/com/cadelfriul/backend/hospitality/entity/RoomBooking.java (deleted)
  - src/main/java/com/cadelfriul/backend/hospitality/entity/BookingStatus.java (deleted)
  - src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationRequestDTO.java (new)
  - src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTO.java (new)
  - src/main/java/com/cadelfriul/backend/hospitality/dto/RoomBookingRequest.java (deleted)
  - src/main/java/com/cadelfriul/backend/hospitality/dto/RoomBookingResponse.java (deleted)
  - src/main/java/com/cadelfriul/backend/hospitality/repository/RoomReservationRepository.java (new)
  - src/main/java/com/cadelfriul/backend/hospitality/repository/RoomBookingRepository.java (deleted)
  - src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java (new)
  - src/main/java/com/cadelfriul/backend/hospitality/service/RoomBookingService.java (deleted)
  - src/main/java/com/cadelfriul/backend/hospitality/controller/RoomReservationController.java (new)
  - src/main/java/com/cadelfriul/backend/hospitality/controller/PublicBookingController.java (deleted)
  - src/main/java/com/cadelfriul/backend/hospitality/controller/AdminBookingController.java (deleted)
  - src/main/java/com/cadelfriul/backend/core/exception/RoomNotAvailableException.java (new)
  - src/main/java/com/cadelfriul/backend/core/exception/GlobalExceptionHandler.java (modified)
  - src/main/java/com/cadelfriul/backend/core/config/SecurityConfig.java (modified)
  - src/test/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTOTest.java (new)
autonomous: true
requirements: []

must_haves:
  truths:
    - "Authenticated user can create a reservation via POST /api/reservations/rooms (roomId + dates only; identity from JWT)"
    - "Creating a reservation overlapping an existing CONFIRMED reservation returns 409 CONFLICT with a clean ApiErrorResponse"
    - "Authenticated user can list their own reservations via GET /api/reservations/rooms/me"
    - "SUPER_ADMIN can list all reservations (GET /api/reservations/rooms) and update status (PUT /api/reservations/rooms/{id}/status)"
    - "Reservation responses serialize a nested Room summary (reusing RoomResponse), totalPrice backend-computed from pricePerNight x nights"
    - "Archived or missing rooms cannot be reserved"
  artifacts:
    - path: "src/main/java/com/cadelfriul/backend/hospitality/entity/RoomReservation.java"
      provides: "Reservation JPA entity with @ManyToOne Room"
      contains: "@ManyToOne"
    - path: "src/main/java/com/cadelfriul/backend/hospitality/entity/ReservationStatus.java"
      provides: "PENDING/CONFIRMED/CANCELLED enum"
      contains: "enum ReservationStatus"
    - path: "src/main/java/com/cadelfriul/backend/hospitality/repository/RoomReservationRepository.java"
      provides: "CONFIRMED-only overlap query + findByUserId"
      contains: "ReservationStatus.CONFIRMED"
    - path: "src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationRequestDTO.java"
      provides: "Create request (roomId, checkInDate, checkOutDate — no userEmail)"
    - path: "src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTO.java"
      provides: "Response with nested RoomResponse"
      contains: "RoomResponse"
    - path: "src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java"
      provides: "createReservation (overlap + archived checks, backend price), getForUser, getAll, updateStatus"
      contains: "RoomNotAvailableException"
    - path: "src/main/java/com/cadelfriul/backend/hospitality/controller/RoomReservationController.java"
      provides: "POST /api/reservations/rooms, GET /me, GET (admin), PUT /{id}/status"
      contains: "api/reservations/rooms"
    - path: "src/main/java/com/cadelfriul/backend/core/exception/RoomNotAvailableException.java"
      provides: "Custom runtime exception"
      contains: "extends RuntimeException"
    - path: "src/main/java/com/cadelfriul/backend/core/exception/GlobalExceptionHandler.java"
      provides: "409 CONFLICT mapping for RoomNotAvailableException"
      contains: "CONFLICT"
  key_links:
    - from: "RoomReservationController"
      to: "SecurityContextHolder.getContext().getAuthentication().getName()"
      via: "POST + GET /me derive userId (email) from principal, never from request body"
    - from: "RoomReservationService"
      to: "RoomReservationRepository.findOverlappingReservations"
      via: "CONFIRMED-only overlap check before create"
    - from: "RoomReservationService"
      to: "RoomRepository.findById"
      via: "archived room treated as unavailable"
    - from: "RoomReservationResponseDTO"
      to: "RoomResponse"
      via: "constructor maps nested room summary"
    - from: "GlobalExceptionHandler"
      to: "RoomNotAvailableException"
      via: "@ExceptionHandler returning 409"
---

<objective>
Evolve the existing RoomBooking domain into the RoomReservation architecture: renamed domain (entity, enum, repository, DTOs, service, controller), `@ManyToOne` Room, CONFIRMED-only overlap check, authenticated-user `/me` endpoint, custom `RoomNotAvailableException` → 409.

Purpose: Replace the bare `roomId` UUID + client-supplied `userEmail` booking model with a proper JPA relationship and server-derived identity, per locked decisions D-01..D-09. All old booking files are deleted — no parallel duplicate remains.

Output: Working RoomReservation API (`/api/reservations/rooms`) replacing `/api/bookings` and `/api/admin/bookings`; the codebase compiles and the new DTO mapping is covered by a unit test following the repo's plain-JUnit convention.

Note: Only the hospitality package + `core.exception` + `core.config` are touched. Grep-verified: no other module or frontend references RoomBooking (locked decision D-09). `spring.jpa.hibernate.ddl-auto=update` auto-creates `room_reservations`; no migration files exist in the repo.
</objective>

<execution_context>
@/Users/gabrielesuardi/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/gabrielesuardi/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

Follow the repo's existing conventions exactly:
- Entities: manual getters/setters, no Lombok, `@Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;`
- DTO responses: immutable-style, `private final` fields, constructor from entity; DTO requests: mutable, getters/setters
- Services: `@Service @Transactional`, constructor injection, `ResponseStatusException` for 404s
- Controllers: `@RestController`, `@Tag`/`@Operation` Swagger annotations, constructor injection
- Auth identity: JWT principal is the **email** — see below

<interfaces>

From src/main/java/com/cadelfriul/backend/hospitality/entity/Room.java (used as-is, NOT modified):
```java
public class Room {
    public UUID getId();
    public String getName();
    public String getDescription();
    public BigDecimal getPricePerNight();
    public int getCapacity();
    public List<String> getAmenities();
    public List<String> getImageUrls();
    public boolean isArchived();
}
```

From src/main/java/com/cadelfriul/backend/hospitality/dto/RoomResponse.java (used as-is, NOT modified — reuse for the nested room summary):
```java
public class RoomResponse {
    public RoomResponse(Room room);   // maps id, name, description, pricePerNight, capacity, amenities, imageUrls, isArchived
    public UUID getId();
    public String getName();
    public BigDecimal getPricePerNight();
    public int getCapacity();
    public boolean isArchived();
}
```

From src/main/java/com/cadelfriul/backend/hospitality/repository/RoomRepository.java (used as-is, NOT modified):
```java
public interface RoomRepository extends JpaRepository<Room, UUID> {
    List<Room> findAllByIsArchivedFalse();
    // inherits findById(UUID)
}
```

Auth pattern — from src/main/java/com/cadelfriul/backend/core/config/JwtAuthenticationFilter.java and src/main/java/com/cadelfriul/backend/core/user/controller/CustomerController.java:
```java
// JWT filter builds: new UsernamePasswordAuthenticationToken(email, null, authorities)
// => authentication.getName() returns the user's EMAIL
String authenticatedEmail = SecurityContextHolder.getContext().getAuthentication().getName();
```

From src/main/java/com/cadelfriul/backend/core/exception/GlobalExceptionHandler.java (existing shape to mirror):
```java
// Handler pattern to copy (status varies):
@ExceptionHandler(RuntimeException.class)
public ResponseEntity<ApiErrorResponse> handleBusinessExceptions(RuntimeException ex, WebRequest request) {
    ApiErrorResponse response = new ApiErrorResponse(
            LocalDateTime.now(), status.value(), status.getReasonPhrase(),
            ex.getMessage(), request.getDescription(false).replace("uri=", ""));
    return new ResponseEntity<>(response, status);
}
```

From src/main/java/com/cadelfriul/backend/core/config/SecurityConfig.java:
```java
// line to REMOVE (with its comment above it):
// --- ENDPOINT PUBBLICI PRENOTAZIONI ---
.requestMatchers("/api/bookings/**").permitAll()
// @EnableMethodSecurity is present — method-level @PreAuthorize works.
// Admin convention: @PreAuthorize("hasRole('SUPER_ADMIN')") (JWT filter adds ROLE_<role> authorities).
```

Test convention — from src/test/java/com/cadelfriul/backend/ecommerce/controller/AdminOrderControllerTest.java:
- Plain JUnit 5 unit test, NO Spring context, NO Mockito
- Build entities directly, inject UUID ids via a private reflection `setField(Object, String, Object)` helper (walks superclass chain)
- Assert field-by-field on the response DTO; annotation-reflection assertions for fetch types
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create RoomReservation domain — entity, enum, repository, DTOs; delete old booking domain files</name>
  <files>
    CREATE src/main/java/com/cadelfriul/backend/hospitality/entity/RoomReservation.java,
    CREATE src/main/java/com/cadelfriul/backend/hospitality/entity/ReservationStatus.java,
    CREATE src/main/java/com/cadelfriul/backend/hospitality/repository/RoomReservationRepository.java,
    CREATE src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationRequestDTO.java,
    CREATE src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTO.java,
    DELETE src/main/java/com/cadelfriul/backend/hospitality/entity/RoomBooking.java,
    DELETE src/main/java/com/cadelfriul/backend/hospitality/entity/BookingStatus.java,
    DELETE src/main/java/com/cadelfriul/backend/hospitality/repository/RoomBookingRepository.java,
    DELETE src/main/java/com/cadelfriul/backend/hospitality/dto/RoomBookingRequest.java,
    DELETE src/main/java/com/cadelfriul/backend/hospitality/dto/RoomBookingResponse.java
  </files>
  <action>
Per locked decisions D-01, D-02, D-03, D-04. Package `com.cadelfriul.backend.hospitality`.

**ReservationStatus enum** (`entity/ReservationStatus.java`): values `PENDING`, `CONFIRMED`, `CANCELLED` (rename of BookingStatus, D-01).

**RoomReservation entity** (`entity/RoomReservation.java`):
- `@Entity @Table(name = "room_reservations")` (table renamed from `room_bookings`, D-01)
- Fields:
  - `@Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;`
  - `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "room_id", nullable = false) private Room room;` — replaces the bare `roomId` UUID (D-02). Do NOT use EAGER: LAZY is fine because all reads happen inside `@Transactional` service methods.
  - `@Column(nullable = false) private String userId;` — holds the authenticated user's EMAIL (D-02). Named `userId` per decision, populated from `authentication.getName()`.
  - `@Column(nullable = false) private LocalDate checkInDate;`
  - `@Column(nullable = false) private LocalDate checkOutDate;`
  - `@Column(nullable = false, precision = 10, scale = 2) private BigDecimal totalPrice;`
  - `@Enumerated(EnumType.STRING) @Column(nullable = false, columnDefinition = "VARCHAR(255) DEFAULT 'PENDING'") private ReservationStatus status;`
  - `@Column(nullable = false, updatable = false) private LocalDateTime createdAt;`
  - `@Column(nullable = false) private LocalDateTime updatedAt;`
- No-arg constructor setting `createdAt = LocalDateTime.now()`, `updatedAt = LocalDateTime.now()`, `status = ReservationStatus.PENDING` (same shape as old RoomBooking)
- Manual getters/setters for all fields: `getId`, `getRoom`/`setRoom`, `getUserId`/`setUserId`, `getCheckInDate`/`setCheckInDate`, `getCheckOutDate`/`setCheckOutDate`, `getTotalPrice`/`setTotalPrice`, `getStatus`/`setStatus`, `getCreatedAt` (no setter), `getUpdatedAt`/`setUpdatedAt`

**RoomReservationRepository** (`repository/RoomReservationRepository.java`):
- `extends JpaRepository<RoomReservation, UUID>`
- `List<RoomReservation> findByUserId(String userId);` — derived query for the /me endpoint (D-04)
- Overlap query — STRICT `status = CONFIRMED` only (D-04), entity-typed `r.room.id` because room is now a relationship:
  ```java
  @Query("SELECT r FROM RoomReservation r WHERE r.room.id = :roomId " +
         "AND r.status = com.cadelfriul.backend.hospitality.entity.ReservationStatus.CONFIRMED " +
         "AND r.checkInDate < :checkOutDate AND r.checkOutDate > :checkInDate")
  List<RoomReservation> findOverlappingReservations(
          @Param("roomId") UUID roomId,
          @Param("checkInDate") LocalDate checkInDate,
          @Param("checkOutDate") LocalDate checkOutDate);
  ```
  Note: CANCELLED and PENDING reservations must NOT block availability — only CONFIRMED does (this is stricter than the old query, which excluded only CANCELLED).

**RoomReservationRequestDTO** (`dto/RoomReservationRequestDTO.java`):
- Mutable, getters/setters (match old RoomBookingRequest style)
- Fields: `@NotNull(message = "Room ID is required") private UUID roomId;` / `@NotNull(message = "Check-in date is required") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) private LocalDate checkInDate;` / `@NotNull(message = "Check-out date is required") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) private LocalDate checkOutDate;`
- NO `userEmail` field (D-03 — identity comes from the auth context at controller level)

**RoomReservationResponseDTO** (`dto/RoomReservationResponseDTO.java`):
- Immutable-style, `private final` fields, constructor `RoomReservationResponseDTO(RoomReservation reservation)` (D-03)
- Fields + getters: `UUID id`, `RoomResponse room` (nested summary — `new RoomResponse(reservation.getRoom())`, reusing the existing DTO untouched), `String userId`, `LocalDate checkInDate`, `LocalDate checkOutDate`, `BigDecimal totalPrice`, `ReservationStatus status`, `LocalDateTime createdAt`, `LocalDateTime updatedAt`
- NO bare `roomId` UUID field — the nested `room` object replaces it (D-03)

Delete (D-01): `entity/RoomBooking.java`, `entity/BookingStatus.java`, `repository/RoomBookingRepository.java`, `dto/RoomBookingRequest.java`, `dto/RoomBookingResponse.java` via `rm`. Do not delete the old service/controllers yet — Task 3 handles those.

Note: the codebase will NOT compile between this task and Task 3 (old RoomBookingService/controllers still reference deleted classes). Final compile is verified at Task 3.
  </action>
  <verify>
    <automated>test -f src/main/java/com/cadelfriul/backend/hospitality/entity/RoomReservation.java && test ! -f src/main/java/com/cadelfriul/backend/hospitality/entity/RoomBooking.java && grep -c "ReservationStatus.CONFIRMED" src/main/java/com/cadelfriul/backend/hospitality/repository/RoomReservationRepository.java | grep -q "1" && echo "PASS" || echo "FAIL"</automated>
  </verify>
  <done>RoomReservation.java, ReservationStatus.java, RoomReservationRepository.java, RoomReservationRequestDTO.java, RoomReservationResponseDTO.java exist. Old RoomBooking/BookingStatus/RoomBookingRepository/RoomBookingRequest/RoomBookingResponse files deleted. Overlap query filters on ReservationStatus.CONFIRMED with `r.room.id`. Request DTO has no userEmail field. Response DTO nests RoomResponse.</done>
</task>

<task type="auto">
  <name>Task 2: Create RoomNotAvailableException + 409 handler + RoomReservationService</name>
  <files>
    CREATE src/main/java/com/cadelfriul/backend/core/exception/RoomNotAvailableException.java,
    MODIFY src/main/java/com/cadelfriul/backend/core/exception/GlobalExceptionHandler.java,
    CREATE src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java
  </files>
  <action>
Per locked decisions D-05, D-06. Follow repo conventions (core.exception package, @Service/@Transactional, constructor injection).

**RoomNotAvailableException** (`core/exception/RoomNotAvailableException.java`):
- `package com.cadelfriul.backend.core.exception;`
- `public class RoomNotAvailableException extends RuntimeException { public RoomNotAvailableException(String message) { super(message); } }`

**GlobalExceptionHandler** (MODIFY — add a dedicated handler, keep all existing handlers):
- Add `@ExceptionHandler(RoomNotAvailableException.class)` returning `ResponseEntity<ApiErrorResponse>` with `HttpStatus.CONFLICT` (409), message = `ex.getMessage()`, path = `request.getDescription(false).replace("uri=", "")`, timestamp `LocalDateTime.now()` — mirror the existing `handleBusinessExceptions` construction exactly, but with `HttpStatus.CONFLICT`. Spring selects the most specific handler, so this takes precedence over the generic `RuntimeException` handler (D-06).

**RoomReservationService** (`hospitality/service/RoomReservationService.java`):
- `@Service @Transactional`, constructor injection of `RoomReservationRepository` + `RoomRepository`
- `public RoomReservationResponseDTO createReservation(RoomReservationRequestDTO request, String userId)` (userId = authenticated email, passed from controller):
  1. Date validation: if `!request.getCheckOutDate().isAfter(request.getCheckInDate())` → `ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-out date must be after check-in date")`
  2. Overlap check: `roomReservationRepository.findOverlappingReservations(request.getRoomId(), request.getCheckInDate(), request.getCheckOutDate())`; if non-empty → `throw new RoomNotAvailableException("Room is not available for the selected dates")`
  3. Room validation (D-05): `roomRepository.findById(request.getRoomId())`; if empty → `ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found with id: " + request.getRoomId())`; if `room.isArchived()` → `throw new RoomNotAvailableException("Room is not available for the selected dates")` (archived = unavailable)
  4. Price (D-05, backend-computed): `long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate()); BigDecimal totalPrice = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));` — NEVER trust a client-supplied price
  5. Build RoomReservation (room, userId, dates, totalPrice, status PENDING via constructor, `setUpdatedAt(LocalDateTime.now())`), `save`, return `new RoomReservationResponseDTO(...)`
- `@Transactional(readOnly = true) public List<RoomReservationResponseDTO> getReservationsForUser(String userId)` → `findByUserId(userId)` mapped to response DTOs
- `@Transactional(readOnly = true) public List<RoomReservationResponseDTO> getAllReservations()` → `findAll()` mapped
- `public RoomReservationResponseDTO updateReservationStatus(UUID id, ReservationStatus status)` → `findById` or `ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found with id: " + id)`; set status + `setUpdatedAt(LocalDateTime.now())`, save, return response
- Map entities to DTOs with `new RoomReservationResponseDTO(reservation)` (LAZY room loads inside the transaction — do not switch to EAGER)
  </action>
  <verify>
    <automated>grep -c "RoomNotAvailableException" src/main/java/com/cadelfriul/backend/core/exception/GlobalExceptionHandler.java | grep -q "2" && grep -c "HttpStatus.CONFLICT" src/main/java/com/cadelfriul/backend/core/exception/GlobalExceptionHandler.java | grep -q "1" && grep -c "RoomNotAvailableException" src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java | grep -q "2" && echo "PASS" || echo "FAIL"</automated>
  </verify>
  <done>RoomNotAvailableException exists in core.exception. GlobalExceptionHandler has a dedicated @ExceptionHandler mapping it to 409 CONFLICT. RoomReservationService has createReservation (overlap + archived + backend price), getReservationsForUser, getAllReservations, updateReservationStatus. No client-supplied email or price accepted anywhere.</done>
</task>

<task type="auto">
  <name>Task 3: Create RoomReservationController, update SecurityConfig, delete old service/controllers, add unit test, compile + test</name>
  <files>
    CREATE src/main/java/com/cadelfriul/backend/hospitality/controller/RoomReservationController.java,
    MODIFY src/main/java/com/cadelfriul/backend/core/config/SecurityConfig.java,
    DELETE src/main/java/com/cadelfriul/backend/hospitality/service/RoomBookingService.java,
    DELETE src/main/java/com/cadelfriul/backend/hospitality/controller/PublicBookingController.java,
    DELETE src/main/java/com/cadelfriul/backend/hospitality/controller/AdminBookingController.java,
    CREATE src/test/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTOTest.java
  </files>
  <action>
Per locked decisions D-07, D-08, plus verification. Repo conventions: @RestController, @Tag/@Operation, constructor injection.

**RoomReservationController** (`hospitality/controller/RoomReservationController.java`):
- `@RestController @RequestMapping("/api/reservations/rooms") @Tag(name = "Room Reservations", description = "Authenticated room reservation endpoints")`
- Constructor injection of `RoomReservationService`
- Endpoints (D-07):
  - `@PostMapping` `createReservation(@Valid @RequestBody RoomReservationRequestDTO request)` → derive `String userId = SecurityContextHolder.getContext().getAuthentication().getName();` (JWT principal = email), call `service.createReservation(request, userId)`, return `ResponseEntity.status(HttpStatus.CREATED).body(...)`. `@Operation(summary = "Create a reservation")`. Protected by `anyRequest().authenticated()` — no annotation needed.
  - `@GetMapping("/me")` `getMyReservations()` → `userId` from SecurityContext (same pattern), return `ResponseEntity.ok(service.getReservationsForUser(userId))`. `@Operation(summary = "Get my reservations")`. Authenticated.
  - `@GetMapping` `@PreAuthorize("hasRole('SUPER_ADMIN')")` `getAllReservations()` → `ResponseEntity.ok(service.getAllReservations())`. `@Operation(summary = "List all reservations (admin)")`. Method-level @PreAuthorize (class cannot carry it — the /me and POST endpoints must stay open to any authenticated user).
  - `@PutMapping("/{id}/status")` `@PreAuthorize("hasRole('SUPER_ADMIN')")` `updateReservationStatus(@PathVariable UUID id, @RequestBody ReservationStatus status)` → `ResponseEntity.ok(service.updateReservationStatus(id, status))`. `@Operation(summary = "Update reservation status (admin)")`. Note: PUT per D-07 (old admin endpoint used PATCH; the new one is PUT).
- Imports: `org.springframework.security.core.context.SecurityContextHolder`, `org.springframework.security.access.prepost.PreAuthorize`, `jakarta.validation.Valid`, Swagger `Operation`/`Tag`.

**SecurityConfig** (MODIFY, D-08): remove exactly these two lines from `authorizeHttpRequests`:
```java
// --- ENDPOINT PUBBLICI PRENOTAZIONI ---
.requestMatchers("/api/bookings/**").permitAll()
```
Do NOT add any permitAll for `/api/reservations/**` — those endpoints are protected by the existing `.anyRequest().authenticated()`; admin methods are guarded by method-level `@PreAuthorize`. Change nothing else.

**Delete** (D-01): `service/RoomBookingService.java`, `controller/PublicBookingController.java`, `controller/AdminBookingController.java` via `rm`.

**RoomReservationResponseDTOTest** (`src/test/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTOTest.java`):
- Plain JUnit 5, NO Spring context, NO Mockito — copy the conventions from `src/test/java/com/cadelfriul/backend/ecommerce/controller/AdminOrderControllerTest.java` (reflection `setField`/`findField` private helpers included verbatim-style at the bottom).
- Test 1 `roomReservationResponse_shouldMapAllFieldsFromReservation`: build a `Room` (name "Camera Panoramica", pricePerNight `new BigDecimal("120.00")`, capacity 2, id injected via `setField`), build a `RoomReservation` (set room, userId "guest@example.com", checkInDate/checkOutDate, totalPrice `new BigDecimal("360.00")`, status CONFIRMED, id + createdAt/updatedAt injected via `setField`); assert response id, room id, userId, dates, totalPrice, status, createdAt, updatedAt all match.
- Test 2 `roomReservationResponse_shouldContainNestedRoomSummary`: same setup; assert `response.getRoom()` is a `RoomResponse` (`assertInstanceOf`), with matching `getId()`, `getName()`, `getPricePerNight()`, `getCapacity()`.
- Test 3 `roomEntity_shouldUseLazyManyToOneForRoom`: reflection on `RoomReservation.class.getDeclaredField("room")` (walk superclass chain like `findField`); assert `@ManyToOne` annotation exists and `fetch()` == `jakarta.persistence.FetchType.LAZY` (mirror of `eagerFetchType_onOrderItems_shouldBeSet` in AdminOrderControllerTest, but asserting LAZY).

**Final verification**: run `./gradlew compileJava` then `./gradlew test --tests "com.cadelfriul.backend.hospitality.dto.RoomReservationResponseDTOTest"` — both must pass. Also grep the whole `src` tree for residual `RoomBooking|BookingStatus|room_bookings` references — must return zero matches outside `.planning/` (D-09).
  </action>
  <verify>
    <automated>./gradlew compileJava && ./gradlew test --tests "com.cadelfriul.backend.hospitality.dto.RoomReservationResponseDTOTest" && rg -l "RoomBooking|BookingStatus|room_bookings" src --glob '*.java' | grep -v "260803-fdo" | wc -l | grep -q "^0$" && echo "PASS" || echo "FAIL"</automated>
  </verify>
  <done>RoomReservationController exposes POST /api/reservations/rooms, GET /api/reservations/rooms/me (both from SecurityContext identity), GET /api/reservations/rooms + PUT /api/reservations/rooms/{id}/status (both @PreAuthorize SUPER_ADMIN). SecurityConfig has no /api/bookings line. Old service + both booking controllers deleted. Gradle compile + new unit test pass. Zero residual RoomBooking/BookingStatus/room_bookings references in src.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client→RoomReservationController (POST, /me) | Any JWT-authenticated user; userId is derived server-side from the principal, never from the body |
| client→RoomReservationController (GET all, PUT status) | SUPER_ADMIN role enforced via method-level @PreAuthorize |
| Controller→Service | userId parameter trusted (originates from authenticated SecurityContext) |
| Service→GlobalExceptionHandler | RoomNotAvailableException crosses here → mapped to 409 CONFLICT |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-260803-01 | Elevation of Privilege | POST /api/reservations/rooms | mitigate | userId taken from `SecurityContextHolder.getAuthentication().getName()` (JWT-verified email) — the request DTO has no email field (D-03); endpoint protected by `anyRequest().authenticated()` |
| T-260803-02 | Spoofing | GET /api/reservations/rooms/me | mitigate | Results filtered by `findByUserId(auth.getName())` — users can only read their own reservations |
| T-260803-03 | Elevation of Privilege | GET all / PUT status | mitigate | Method-level `@PreAuthorize("hasRole('SUPER_ADMIN')")`; JWT filter mints `ROLE_` authorities from verified token claims (hasRole matches `ROLE_SUPER_ADMIN`) |
| T-260803-04 | Tampering | createReservation overlap check | mitigate | Overlap query is strict `status = CONFIRMED` server-side; totalPrice computed from DB `pricePerNight` × nights — client-supplied price/email are structurally impossible (DTO has no such fields) |
| T-260803-05 | Information Disclosure | Archived rooms | mitigate | Service rejects `room.isArchived()` reservations with RoomNotAvailableException (409) — archived rooms cannot be booked |
| T-260803-06 | Information Disclosure | LAZY Room serialization | accept | Nested RoomResponse is the existing public catalog DTO (no sensitive fields); LAZY loads inside @Transactional service methods |
| T-260803-SC | Tampering | dependency installs | accept | No new external packages — pure Java refactor of existing code; nothing fetched from npm/pip/cargo |
</threat_model>

<verification>
1. `./gradlew compileJava` passes
2. `./gradlew test --tests "com.cadelfriul.backend.hospitality.dto.RoomReservationResponseDTOTest"` passes (3 tests)
3. `rg -l "RoomBooking|BookingStatus|room_bookings" src --glob '*.java'` returns zero matches (D-09)
4. `grep -c "/api/bookings" src/main/java/com/cadelfriul/backend/core/config/SecurityConfig.java` returns 0 (D-08)
5. Old booking files (entity, enum, repository, DTOs, service, both controllers) all deleted from disk
</verification>

<success_criteria>
- Domain fully renamed: RoomReservation / ReservationStatus / room_reservations — zero residual RoomBooking symbols in src
- RoomReservation.room is a `@ManyToOne` LAZY to Room; responses serialize nested RoomResponse (no bare roomId UUID)
- Overlap query blocks only CONFIRMED reservations (`checkInDate < :checkOutDate AND checkOutDate > :checkInDate`)
- POST /api/reservations/rooms derives userId from the authenticated principal; missing room → 404, archived room → 409, CONFIRMED overlap → 409 via RoomNotAvailableException → ApiErrorResponse
- GET /api/reservations/rooms/me returns only the caller's reservations; GET all + PUT status require SUPER_ADMIN
- SecurityConfig no longer permitAlls /api/bookings/**
- Gradle build + targeted unit test green
</success_criteria>

<output>
Create `.planning/quick/260803-fdo-please-implement-the-spring-boot-backend/260803-fdo-SUMMARY.md` when done
</output>
