---
phase: quick-260804-fit
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTO.java
  - src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java
  - src/main/java/com/cadelfriul/backend/hospitality/controller/RoomReservationController.java
  - src/test/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTOTest.java
  - src/test/java/com/cadelfriul/backend/hospitality/service/RoomReservationServiceTest.java
autonomous: true
requirements: [QT-260804-fit]
user_setup: []

must_haves:
  truths:
    - "Admin can identify the booker of every reservation by email in GET /api/reservations/rooms responses (customerEmail field)"
    - "Admin reservation listing is ordered newest-first (createdAt DESC) by default, even when no sort query parameter is sent"
    - "An explicit client-provided sort still wins over the default createdAt DESC ordering"
    - "GET /api/reservations/rooms and PUT /api/reservations/rooms/{id}/status remain SUPER_ADMIN-guarded and unchanged in behavior"
  artifacts:
    - path: "src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTO.java"
      provides: "customerEmail field + getter, populated from reservation.getUserId() (userId column stores the customer email); legacy userId field kept"
      contains: "customerEmail"
    - path: "src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java"
      provides: "applyDefaultSortIfUnsorted(Pageable) — createdAt DESC default sort applied when the incoming Pageable has no explicit sort"
      contains: "Sort.Direction.DESC"
    - path: "src/test/java/com/cadelfriul/backend/hospitality/service/RoomReservationServiceTest.java"
      provides: "Plain-JUnit tests for the default-sort helper (unsorted -> createdAt DESC; explicit sort preserved)"
      contains: "applyDefaultSortIfUnsorted"
    - path: "src/test/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTOTest.java"
      provides: "Assertions that customerEmail is populated and mirrors userId (which stores the email)"
      contains: "getCustomerEmail"
  key_links:
    - from: "RoomReservationResponseDTO constructor"
      to: "RoomReservation.getUserId()"
      via: "this.customerEmail = reservation.getUserId() — the userId column stores the booker's email (JwtAuthenticationFilter principal is the email; createReservation stores SecurityContextHolder getName())"
      pattern: "customerEmail.*getUserId"
    - from: "RoomReservationService.getAllReservations"
      to: "RoomReservationRepository.findAll"
      via: "findAll(applyDefaultSortIfUnsorted(pageable)) — default createdAt DESC when client sent no sort"
      pattern: "applyDefaultSortIfUnsorted"
---

<objective>
Close the two remaining gaps in the admin room-reservation endpoints (all endpoints themselves already exist from quick task 260803-kqg and MUST NOT be re-implemented or regressed): (1) expose the booker's email to the admin via a `customerEmail` field on `RoomReservationResponseDTO` (the underlying `userId` column stores the email, but the field name hides it), and (2) make `GET /api/reservations/rooms` order by `createdAt` DESC by default instead of relying on the client passing `?sort=createdAt,desc`.

Purpose: The admin backoffice needs to see who booked each reservation ("Crucial for the admin to know who booked"), and the reservation list must be newest-first out of the box so recent bookings are immediately visible.

Output: Additive `customerEmail` field on the response DTO (legacy `userId` kept for backward compatibility with /me consumers), a default `createdAt` DESC sort applied only when the client supplies no explicit sort, matching plain-JUnit test updates, and a one-line Swagger description accuracy fix.

Pre-existing (verified in code, do NOT re-implement): both admin endpoints with `@PreAuthorize("hasRole('SUPER_ADMIN')")`, `updateReservationStatus(UUID, ReservationStatus)`, pagination via `@PageableDefault(size = 20)`, `RoomResponse` nested room (id+name), and the `ReservationStatus` enum. No entity, repository, SecurityConfig, or build changes.

Discretion choices (documented, no user decision needed):
- `customerEmail` added as a real final field (not a delegating getter) — matches the task wording, initialized once from `reservation.getUserId()`, and immune to future drift if the entity column is ever renamed.
- Default sort applied via a package-private static helper `applyDefaultSortIfUnsorted(Pageable)` — mirrors the existing `expandBookedDates` plain-JUnit-testable static-helper convention in this service (tests use no Mockito/Spring).
</objective>

<execution_context>
@/Users/gabrielesuardi/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/gabrielesuardi/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

<interfaces>
<!-- Key types and contracts the executor needs. Extracted from codebase. No further exploration needed. -->

From src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTO.java (current shape — all fields final except stripeCheckoutUrl):
```java
public class RoomReservationResponseDTO {
    private final UUID id;
    private final RoomResponse room;
    private final String userId;          // <-- stores the CUSTOMER EMAIL (legacy name)
    private final LocalDate checkInDate;
    private final LocalDate checkOutDate;
    private final BigDecimal totalPrice;
    private final ReservationStatus status;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;
    private String stripeCheckoutUrl;

    public RoomReservationResponseDTO(RoomReservation reservation) {
        this.id = reservation.getId();
        this.room = new RoomResponse(reservation.getRoom());
        this.userId = reservation.getUserId();          // <- getUserId() returns the email
        ...
    }
    // getters: getId(), getRoom() -> RoomResponse, getUserId(), getCheckInDate(), getCheckOutDate(),
    //          getTotalPrice(), getStatus(), getCreatedAt(), getUpdatedAt(), getStripeCheckoutUrl()
    // setter:  setStripeCheckoutUrl(String)
}
```
Why `userId` holds an email: `JwtAuthenticationFilter` sets the authentication principal to the user's email, and `RoomReservationController.createReservation` calls `SecurityContextHolder.getContext().getAuthentication().getName()` — the same pattern as `CustomerOrderController` (principal cast to email, `customerRepository.findByEmail`). Confirmed against code; do not "fix" the entity.

From src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java (current shape):
```java
@Service @Transactional
public class RoomReservationService {
    private final RoomReservationRepository roomReservationRepository;
    private final RoomRepository roomRepository;
    // ctor: (RoomReservationRepository, RoomRepository)

    @Transactional(readOnly = true)
    public Page<RoomReservationResponseDTO> getAllReservations(Pageable pageable) {
        return roomReservationRepository.findAll(pageable).map(RoomReservationResponseDTO::new);
    }
    // existing static helper convention: static List<LocalDate> expandBookedDates(List<RoomReservation>) — package-private, plain-JUnit-tested
    // other methods: createReservation, getBookedDates, getReservationsForUser, updateReservationStatus, cancelReservation, confirmReservationIfAvailable
}
```
`RoomReservationRepository extends JpaRepository<RoomReservation, UUID>` — `findAll(Pageable)` inherited. `Pageable.withSort(Sort)` (Spring Data Commons 4.x, Spring Boot 4.1.0) returns a copy with the given sort — use it.

From src/main/java/com/cadelfriul/backend/hospitality/controller/RoomReservationController.java (current shape — DO NOT touch endpoints/guards):
```java
@RestController @RequestMapping("/api/reservations/rooms")
public class RoomReservationController {
    // POST /            -> createReservation (Stripe checkout, unchanged)
    // GET  /me          -> getMyReservations (unchanged)
    // GET  "" @PreAuthorize("hasRole('SUPER_ADMIN')") @PageableDefault(size = 20) Pageable pageable
    //      -> getAllReservations(pageable)   // @Operation description currently says "Query params: ?page=0&size=20&sort=createdAt,desc"
    // PUT  /{id}/status @PreAuthorize("hasRole('SUPER_ADMIN')") -> updateReservationStatus (unchanged)
}
```

Test conventions (from RoomReservationServiceTest / RoomReservationResponseDTOTest): plain JUnit 5, no Mockito, no Spring context. `static org.junit.jupiter.api.Assertions.*` imports. Static service helpers are tested directly with real objects.

Build: Java 26, Spring Boot 4.1.0, Gradle (build.gradle.kts). Verification: `./gradlew compileJava` and `./gradlew test`.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add customerEmail to RoomReservationResponseDTO (+ test updates)</name>
  <files>src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTO.java, src/test/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTOTest.java</files>
  <action>
  Add the booker's email to the response DTO. The `userId` field already stores the email (JwtAuthenticationFilter principal = email, confirmed via CustomerOrderController pattern) — this task only re-exposes it under a truthful name. Keep `userId` for backward compatibility with /me consumers and the existing DTO test that asserts `getUserId()`.

  1. In `RoomReservationResponseDTO.java`:
     - Add a new final field after the `userId` field: `private final String customerEmail;`
     - In the existing 1-arg constructor, add: `this.customerEmail = reservation.getUserId();` (place it right after `this.userId = ...`)
     - Add getter: `public String getCustomerEmail() { return customerEmail; }`
     - Do NOT touch: `userId` field/getter, `room`, `stripeCheckoutUrl`, or any other field. Do NOT rename `userId` or the constructor signature.

  2. In `src/test/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTOTest.java` (plain JUnit 5, existing style):
     - In `roomReservationResponse_shouldMapAllFieldsFromReservation`, add next to the existing `getUserId()` assertion:
       `assertEquals("guest@example.com", response.getCustomerEmail());`
     - Add a dedicated test `customerEmail_mirrorsUserId_whichStoresTheEmail`: build a reservation with `setUserId("guest@example.com")` (same fixture pattern as the existing tests — Room + setField for id), construct the DTO, and assert `response.getCustomerEmail()` equals `"guest@example.com"` AND equals `response.getUserId()`.
     - Reuse the existing `setField`/`findField` helpers — do not add Mockito or Spring.

  No entity, repository, controller, or service changes.
  </action>
  <verify>
  <automated>./gradlew test --tests "com.cadelfriul.backend.hospitality.dto.RoomReservationResponseDTOTest"</automated>
  </verify>
  <done>`RoomReservationResponseDTO` exposes `customerEmail` (final field + getter) populated from `reservation.getUserId()`; `userId` getter still present (backward compat); `RoomReservationResponseDTOTest` green with the new assertion + dedicated test.</done>
</task>

<task type="auto">
  <name>Task 2: Default createdAt DESC ordering for admin reservation listing (+ tests, Swagger description fix)</name>
  <files>src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java, src/main/java/com/cadelfriul/backend/hospitality/controller/RoomReservationController.java, src/test/java/com/cadelfriul/backend/hospitality/service/RoomReservationServiceTest.java</files>
  <action>
  Make `GET /api/reservations/rooms` newest-first by default while preserving the paginated contract and any explicit client sort. Apply the default ONLY when the incoming Pageable is unsorted — `@PageableDefault(size = 20)` leaves the sort unsorted when no `sort` param is sent, so this is the "no explicit sort" signal.

  1. In `RoomReservationService.java`:
     - Add import `org.springframework.data.domain.Sort` (Page and Pageable already imported).
     - Change the body of `getAllReservations(Pageable)` to pass the defaulted pageable:
       `return roomReservationRepository.findAll(applyDefaultSortIfUnsorted(pageable)).map(RoomReservationResponseDTO::new);`
     - Add a package-private static helper (mirrors the `expandBookedDates` plain-JUnit-testable convention):
       ```java
       static Pageable applyDefaultSortIfUnsorted(Pageable pageable) {
           return pageable.getSort().isUnsorted()
                   ? pageable.withSort(Sort.by(Sort.Direction.DESC, "createdAt"))
                   : pageable;
       }
       ```
       `Pageable.withSort(Sort)` (Spring Data Commons 4.x) returns a copy with the sort replaced — the default page size (20) and page number are preserved. An explicitly supplied `sort=...` is passed through untouched.
     - Do NOT touch: createReservation, getBookedDates, getReservationsForUser, updateReservationStatus, cancelReservation, confirmReservationIfAvailable, expandBookedDates, or the repository.

  2. In `RoomReservationController.java` — description-accuracy fix ONLY:
     - Update the `@Operation` description on the admin GET to: `"Paginated admin listing (newest first by default). Query params: ?page=0&size=20&sort=createdAt,desc"`
     - Do NOT change the mapping, `@PreAuthorize("hasRole('SUPER_ADMIN')")`, `@PageableDefault(size = 20)`, the PUT endpoint, or anything else in the file.

  3. In `src/test/java/com/cadelfriul/backend/hospitality/service/RoomReservationServiceTest.java` (plain JUnit 5, no Mockito):
     - Add imports `org.springframework.data.domain.PageRequest`, `org.springframework.data.domain.Pageable`, `org.springframework.data.domain.Sort`.
     - Test `getAllReservations_unsortedPageable_defaultsToCreatedAtDesc`:
       `Pageable result = RoomReservationService.applyDefaultSortIfUnsorted(PageRequest.of(0, 20));`
       assert `result.getSort()` equals `Sort.by(Sort.Direction.DESC, "createdAt")`, and pagination params preserved: `result.getPageNumber() == 0`, `result.getPageSize() == 20`.
     - Test `getAllReservations_explicitSort_isPreserved`:
       `Sort explicit = Sort.by(Sort.Direction.ASC, "totalPrice");`
       `Pageable result = RoomReservationService.applyDefaultSortIfUnsorted(PageRequest.of(0, 20, explicit));`
       assert `result.getSort()` equals `explicit`.
     - Keep the existing `expandBookedDates` tests untouched.

  No entity, repository, SecurityConfig, or build.gradle.kts changes.
  </action>
  <verify>
  <automated>./gradlew test --tests "com.cadelfriul.backend.hospitality.service.RoomReservationServiceTest"</automated>
  </verify>
  <done>`getAllReservations` returns `findAll(applyDefaultSortIfUnsorted(pageable))` mapped to `Page<RoomReservationResponseDTO>`; unsorted Pageable gets `createdAt` DESC (size/page preserved), explicit sorts pass through; `RoomReservationServiceTest` green; admin GET behavior and SUPER_ADMIN guard unchanged (only the @Operation description string changed).</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| SUPER_ADMIN client → GET /api/reservations/rooms | Admin listing now includes booker email (PII); must stay SUPER_ADMIN-only |
| SUPER_ADMIN client → PUT /api/reservations/rooms/{id}/status | Manual status override; unchanged |
| Authenticated customer → GET /api/reservations/rooms/me | Returns the same DTO shape (now also customerEmail); requester only ever sees their own reservations |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-fit-01 | Information Disclosure | customerEmail on RoomReservationResponseDTO | mitigate | The email is only revealed where it already was: `GET /api/reservations/rooms` keeps `@PreAuthorize("hasRole('SUPER_ADMIN')")`, and `/me` returns only the requester's own rows (filtered by `findByUserId`). No new data crosses a new boundary — the same email already left the server as `userId`; the field is additive and the guard set is unchanged. |
| T-fit-02 | Tampering / Injection | client-supplied `sort` query param on GET /api/reservations/rooms | accept | Spring Data resolves sort property paths against the entity's mapped property metadata and rejects unknown properties (`PropertyReferenceException`) before any SQL is built — no injection vector, and the default-sort change does not alter this behavior. Explicit sorts pass through by design (documented behavior). |
| T-fit-SC | Tampering | dependency installs | accept | No packages added — build.gradle.kts untouched; package legitimacy gate not applicable. |

</threat_model>

<verification>
Overall checks for this quick task:

1. Compile: `./gradlew compileJava` passes.
2. Tests — both affected classes: `./gradlew test --tests "com.cadelfriul.backend.hospitality.dto.RoomReservationResponseDTOTest" --tests "com.cadelfriul.backend.hospitality.service.RoomReservationServiceTest"` — all green.
3. Grep gate — customerEmail exposed: `grep -n "customerEmail" src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTO.java` shows at least 3 matches (field declaration, constructor init, getter).
4. Grep gate — customerEmail populated from the stored identifier: `grep -n "customerEmail = reservation.getUserId()" src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTO.java` matches.
5. Grep gate — backward compat: `grep -n "getUserId" src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTO.java` still matches (getter kept).
6. Grep gate — default sort wired: `grep -n "applyDefaultSortIfUnsorted" src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java` matches in both the helper declaration and the `getAllReservations` body; `grep -n "Sort.Direction.DESC" src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java` matches.
7. Grep gate — endpoints not regressed: `grep -v '^#' | grep -c "PreAuthorize"` on `src/main/java/com/cadelfriul/backend/hospitality/controller/RoomReservationController.java` returns exactly 2 (GET-all + PUT-status, both SUPER_ADMIN).
</verification>

<success_criteria>
- `GET /api/reservations/rooms` responses include `customerEmail` (the booker's email) alongside the legacy `userId`; the admin can identify who booked without extra lookups.
- `GET /api/reservations/rooms` is ordered `createdAt` DESC (newest first) even with no `sort` query parameter; an explicit `sort=` still wins; pagination envelope unchanged.
- `PUT /api/reservations/rooms/{id}/status`, both SUPER_ADMIN guards, the repository, and the entity are untouched.
- `./gradlew compileJava` passes; `RoomReservationResponseDTOTest` and `RoomReservationServiceTest` are green; tests follow the plain-JUnit convention (no Mockito/Spring added).
</success_criteria>

<output>
Create `.planning/quick/260804-fit-implement-admin-endpoints-for-managing-r/260804-fit-SUMMARY.md` when done
</output>
