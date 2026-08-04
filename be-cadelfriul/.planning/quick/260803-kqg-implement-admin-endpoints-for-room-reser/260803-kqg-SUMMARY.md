---
phase: quick-260803-kqg
plan: 01
subsystem: api
tags: [spring-boot, stripe-checkout, webhook, reservations, pagination, jwt, plain-junit]

# Dependency graph
requires:
  - phase: quick-260803-fdo
    provides: RoomReservation domain (entity, CONFIRMED-only overlap repository query, RoomReservationService/Controller, SUPER_ADMIN guards D-07)
  - phase: quick-260803-g4r
    provides: findByRoom_IdAndStatus derived query + getBookedDates (CONFIRMED-only availability, unchanged)
provides:
  - "Paginated SUPER_ADMIN GET /api/reservations/rooms returning a Page envelope (content/totalElements/sort) via @PageableDefault(size = 20)"
  - "StripePaymentService.createRoomReservationCheckoutSession: PAYMENT-mode Session with room line item and reservationId in BOTH Session metadata and payment_intent_data.metadata"
  - "RoomReservationResponseDTO.stripeCheckoutUrl (mutable, null by default) returned on POST /api/reservations/rooms"
  - "RoomReservationService.cancelReservation(UUID) + confirmReservationIfAvailable(UUID) (race-safe CONFIRMED-only re-check, race-lost -> CANCELLED + warn)"
  - "Signature-verified webhook dispatch: checkout.session.completed / checkout.session.expired / payment_intent.payment_failed -> reservation transitions; existing order path unchanged"
  - "Plain-JUnit StripeWebhookControllerTest (4 tests) + RoomReservationResponseDTOTest stripeCheckoutUrl tests (2)"
affects: [admin-backoffice-reservations, frontend-booking-checkout, stripe-webhook-consumers]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Dual metadata on Checkout Session: reservationId on Session AND payment_intent_data.metadata (Stripe does NOT copy Session metadata onto the PaymentIntent)"
    - "Webhook reservation dispatch via metadata-resolved UUID; missing/invalid metadata or reservation -> warn + 200 (no Stripe retries)"
    - "Race-safe confirmation: webhook re-runs CONFIRMED-only findOverlappingReservations before CONFIRMED; PENDING never blocks itself"
    - "CANCELLED rollback on Stripe session-creation failure, then RuntimeException (same wrapper as CheckoutController.checkout)"
    - "Primitive-parameter Stripe service method (UUID/roomName/totalPrice) — no entity coupling; controller reads values from the response DTO"

key-files:
  created:
    - src/test/java/com/cadelfriul/backend/ecommerce/controller/StripeWebhookControllerTest.java
  modified:
    - src/main/java/com/cadelfriul/backend/ecommerce/service/StripePaymentService.java
    - src/main/java/com/cadelfriul/backend/ecommerce/controller/StripeWebhookController.java
    - src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTO.java
    - src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java
    - src/main/java/com/cadelfriul/backend/hospitality/controller/RoomReservationController.java
    - src/test/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTOTest.java

key-decisions:
  - "Session URLs hardcoded http://localhost:3000/reservations/success|cancel — mirrors the existing /shop/... pattern (documented discretion)"
  - "Race-lost paid reservation -> CANCELLED terminal state + log.warn (manual refund flag; refund automation out of scope)"
  - "Webhook never throws for missing/invalid reservationId or reservation — 200 + warn, matching the existing ifPresentOrElse order style"
  - "Stripe session-creation failure on POST rolls back the reservation to CANCELLED then throws RuntimeException (500 via GlobalExceptionHandler)"
  - "payment_intent.payment_failed metadata parse is defensive (malformed -> warn + 200), consistent with extractReservationId null-safety"

patterns-established:
  - "Static package-private webhook helpers (extractReservationId) directly unit-testable with real Stripe model objects (new Session() + setMetadata), no Mockito/Spring"
  - "Generic deserializeEventObject helper preserves the API-version deserialization workaround without duplicating the inline pattern"

requirements-completed: [QT-260803-kqg]

# Metrics
duration: 22min
completed: 2026-08-03
---

# Quick Task 260803-kqg: Admin pagination + Stripe Checkout lifecycle for room reservations Summary

**Paginated SUPER_ADMIN reservation listing, Stripe Checkout session creation with reservationId on both Session and PaymentIntent metadata, and signature-verified webhook dispatch (completed/expired/payment_failed) driving race-safe CONFIRMED/CANCELLED reservation transitions — order path untouched**

## Performance

- **Duration:** 22 min
- **Started:** 2026-08-03T10:14:00Z
- **Completed:** 2026-08-03T10:36:00Z
- **Tasks:** 3
- **Files modified:** 7 (1 created, 6 modified)

## Accomplishments

- `GET /api/reservations/rooms` now returns a Spring Data `Page` envelope (`content`, `totalElements`, `totalPages`, `number`, `size`, `sort`) with `@PageableDefault(size = 20)` — SUPER_ADMIN guard (`@PreAuthorize`) unchanged
- `POST /api/reservations/rooms` persists the PENDING reservation (entity constructor default), creates a PAYMENT-mode Checkout Session with a `"Ca' Del Friul - Room: <name>"` line item and `reservationId` in **both** Session metadata and `payment_intent_data.metadata`, and returns 201 with `stripeCheckoutUrl` in the body; Stripe failure rolls the reservation back to CANCELLED and surfaces a 500
- `checkout.session.completed` confirms the reservation only after a CONFIRMED-only overlap re-check (race-safe same-minute bookings: first to confirm wins, loser becomes CANCELLED with a warn log for manual refund); `checkout.session.expired` and `payment_intent.payment_failed` cancel via metadata-resolved reservationId
- Existing order webhook path behaviorally intact (runs only when the session has no `reservationId` metadata); SecurityConfig/entity/repository/build/config untouched
- 14 targeted tests green (existing 3 + 2 DTO + existing 5 service + new 4 webhook) — plain JUnit 5, no Mockito/Spring

## Task Commits

Each task was committed atomically:

1. **Task 1: Paginate admin GET /api/reservations/rooms (service + controller)** - `7e3339b` (feat)
2. **Task 2: Stripe Checkout session on POST /api/reservations/rooms (with CANCELLED rollback on failure)** - `3d0894e` (feat)
3. **Task 3: Stripe webhook — CONFIRMED/CANCELLED reservation transitions** - `7f75f53` (feat)

**Plan metadata:** `209283c` (docs: create plan) — created by orchestrator, not part of this execution

## Files Created/Modified

- `src/main/java/com/cadelfriul/backend/ecommerce/service/StripePaymentService.java` - Added `createRoomReservationCheckoutSession(UUID, String, BigDecimal)`: PAYMENT-mode Session, `reservationId` in Session metadata AND `payment_intent_data.metadata`, hardcoded `/reservations/success|cancel` URLs; existing `createCheckoutSession(Order)` untouched
- `src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTO.java` - Mutable `stripeCheckoutUrl` field + getter/setter (null by default); existing final fields and 1-arg constructor untouched
- `src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java` - `getAllReservations()` replaced by `getAllReservations(Pageable)` returning `Page<RoomReservationResponseDTO>`; added `cancelReservation(UUID)` (false when absent) and `confirmReservationIfAvailable(UUID)` (CONFIRMED-only re-check, race-lost → CANCELLED + warn); SLF4J logger
- `src/main/java/com/cadelfriul/backend/hospitality/controller/RoomReservationController.java` - GET-all → `ResponseEntity<Page<...>>` with `@PageableDefault(size = 20)`; POST → create → Stripe session → `dto.setStripeCheckoutUrl(...)`, `StripeException` → `cancelReservation` rollback + `RuntimeException`; PUT `/{id}/status` untouched
- `src/main/java/com/cadelfriul/backend/ecommerce/controller/StripeWebhookController.java` - Injected `RoomReservationService`; generic `deserializeEventObject` helper (preserves API-version workaround); static `extractReservationId(Session)` (null-safe UUID parse); event branches for `checkout.session.completed` (reservation path, order path in else), `checkout.session.expired`, `payment_intent.payment_failed`; unknown events info-logged; missing/invalid id → warn + 200
- `src/test/java/com/cadelfriul/backend/ecommerce/controller/StripeWebhookControllerTest.java` (created) - 4 plain-JUnit tests: valid metadata → UUID, missing metadata → null, malformed → null, null session → null
- `src/test/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTOTest.java` - +2 tests: `stripeCheckoutUrl` default-null, set/get round-trip

## Decisions Made

- Followed the plan's documented discretion choices exactly: hardcoded session URLs (`/reservations/success|cancel`), race-lost → CANCELLED terminal + warn (manual refund), webhook never throws for missing/invalid reservation, `RuntimeException` wrapper on Stripe failure.
- Used a lambda-based `Optional.map` implementation for both new service methods (`cancelReservation`, `confirmReservationIfAvailable`) — matches the webhook-friendly "false when absent" contract with no exception path.
- `payment_intent.payment_failed` uses a shared defensive `parseUuid` helper so a malformed metadata value warns + returns 200 instead of throwing into the generic 400 handler (would trigger Stripe retries) — consistent with the plan's "never throw for invalid reservationId" discretion.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `deserializeUnsafe()` throws a checked exception the new generic helper did not declare**
- **Found during:** Task 3 (StripeWebhookController compile)
- **Issue:** The plan's `deserializeEventObject` signature omitted the checked `EventDataObjectDeserializationException` thrown by `deserializeUnsafe()`; `compileJava` failed.
- **Fix:** Added `throws EventDataObjectDeserializationException` to the helper (import added). The caller's existing `catch (Exception e)` handles it as before — behavior identical to the pre-existing inline pattern.
- **Files modified:** `src/main/java/com/cadelfriul/backend/ecommerce/controller/StripeWebhookController.java`
- **Verification:** `./gradlew compileJava` BUILD SUCCESSFUL.
- **Committed in:** `7f75f53` (Task 3 commit)

**2. [Rule 2 - Missing validation] Un-guarded `UUID.fromString` on payment_intent metadata**
- **Found during:** Task 3 (payment_failed branch)
- **Issue:** The plan's inline instruction `UUID.fromString(paymentIntent.getMetadata().get("reservationId"))` would throw on malformed metadata, falling into the generic 400 handler and causing Stripe to retry-spam the endpoint — contradicting the plan's documented discretion and DoS mitigation (T-kqg-06).
- **Fix:** Extracted a private static `parseUuid(String)` null-safe helper (null/malformed → null); `extractReservationId` and the `payment_intent.payment_failed` branch both use it; malformed value → `log.warn` + 200.
- **Files modified:** `src/main/java/com/cadelfriul/backend/ecommerce/controller/StripeWebhookController.java`
- **Verification:** `StripeWebhookControllerTest` green (4 tests); compile passes.
- **Committed in:** `7f75f53` (Task 3 commit)

### Verify-spec brittleness (no code changes)

**3. [Verify-spec] Grep gate 4 controller count is 0 with the plan's exact pattern**
- **Issue:** Gate 4 greps lowercase `stripeCheckoutUrl` in the controller, but the plan's own `<action>` mandates the setter call `dto.setStripeCheckoutUrl(session.getUrl())` — `grep -c` is case-sensitive, so the lowercase literal never matches the setter name. Case-insensitive count: DTO 3, controller 1. The substantive condition (URL wired through the DTO and returned) holds.
- **Verification:** `grep -n "StripeCheckoutUrl" RoomReservationController.java` → line 49 `dto.setStripeCheckoutUrl(session.getUrl());`

**4. [Verify-spec] Grep gate 6 (`grep -n PreAuthorize`) prints 3 lines due to the import**
- **Issue:** The import line `import org.springframework.security.access.prepost.PreAuthorize;` matches, inflating the line listing to 3. `grep -c "@PreAuthorize"` = exactly 2 (GET-all + PUT-status, both `SUPER_ADMIN`) as required.

---

**Total deviations:** 2 auto-fixed (1 bug, 1 missing validation) + 2 verify-spec brittleness notes (no code changes)
**Impact on plan:** All auto-fixes necessary for compilation and webhook robustness (no Stripe retry loops). No scope creep; implementation matches the plan's intent exactly.

## Issues Encountered

- None beyond the two auto-fixed issues above. Compile and tests passed on the second pass after the checked-exception fix.

## User Setup Required

**External services require manual configuration.** The plan's `user_setup` frontmatter requires a Stripe Dashboard action the agent cannot perform:

- **Enable webhook events `checkout.session.expired` and `payment_intent.payment_failed`** on the existing endpoint (Stripe Dashboard → Developers → Webhooks → existing `/api/webhooks/stripe` endpoint → Add events). `checkout.session.completed` is assumed already enabled (existing orders flow). Without these events the CANCELLED/CONFIRMED transitions for expired/failed payments never fire.

## Next Phase Readiness

- Admin backoffice can consume the paginated `Page` envelope (`content`/`totalElements`/`sort`) and keep using `PUT /{id}/status` (untouched, verified).
- Frontend can redirect room bookings to `stripeCheckoutUrl`; `checkout.session.completed` confirms race-safely, `expired`/`payment_failed` cancel.
- Requirement 4 (CONFIRMED-only availability) re-verified unchanged: `findOverlappingReservations` (CONFIRMED JPQL) and `findByRoom_IdAndStatus(..., CONFIRMED)` both intact; booked-dates endpoint untouched.
- Security posture unchanged: `/api/webhooks/**` permitAll (count=1), `/api/reservations/**` authenticated, GET-all + PUT-status SUPER_ADMIN-only (exactly 2 `@PreAuthorize`).

---

*Phase: quick-260803-kqg*
*Completed: 2026-08-03*

## Self-Check: PASSED

- All 3 task commits present in git history: `7e3339b`, `3d0894e`, `7f75f53` ✓
- All 7 modified/created files exist on disk ✓
- `./gradlew compileJava` BUILD SUCCESSFUL ✓
- Targeted tests green: RoomReservationResponseDTOTest (5), RoomReservationServiceTest (5), StripeWebhookControllerTest (4) — 14 total, 0 failures/errors ✓
- All 9 grep gates verified (gate 4 controller match via case-insensitive setter check; gate 6 via `@PreAuthorize` count = 2) ✓
- No SecurityConfig / entity / repository / StripeConfig / application.properties / build.gradle.kts changes vs base `209283c` ✓
