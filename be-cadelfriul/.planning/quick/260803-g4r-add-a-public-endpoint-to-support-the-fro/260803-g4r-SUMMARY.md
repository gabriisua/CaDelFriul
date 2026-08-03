---
phase: quick-260803-g4r
plan: 01
subsystem: api
tags: [spring-boot, spring-data-jpa, public-endpoint, localdate, room-calendar]

# Dependency graph
requires:
  - phase: quick-260803-fdo
    provides: RoomReservation domain (RoomReservation entity, ReservationStatus enum, RoomReservationService with RoomReservationRepository)
provides:
  - "Public GET /api/rooms/{roomId}/booked-dates returning flat sorted deduplicated List<LocalDate> of CONFIRMED booking blocks"
  - "RoomReservationRepository.findByRoom_IdAndStatus derived query (CONFIRMED-only)"
  - "RoomReservationService.getBookedDates + static package-private expandBookedDates helper"
  - "Plain-JUnit RoomReservationServiceTest (5 tests, no Mockito/Spring)"
affects: [frontend-room-calendar, quick-task-plans-reusing-public-rooms-endpoints]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Plain JUnit 5 unit tests (no Mockito/Spring) for package-private static helpers"
    - "Spring Data derived query findByRoom_IdAndStatus mirroring existing findByUserId style"
    - "TreeSet<LocalDate> as the dedup+sort primitive for date range expansion"

key-files:
  created:
    - src/test/java/com/cadelfriul/backend/hospitality/service/RoomReservationServiceTest.java
  modified:
    - src/main/java/com/cadelfriul/backend/hospitality/repository/RoomReservationRepository.java
    - src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java
    - src/main/java/com/cadelfriul/backend/hospitality/controller/PublicRoomController.java

key-decisions:
  - "Endpoint lives in PublicRoomController (D-01): room browsing is already public, calendar availability belongs with public room endpoints"
  - "Derived query findByRoom_IdAndStatus used (D-03): property path room.id is proven by existing findOverlappingReservations @Query"
  - "CONFIRMED-only, check-in inclusive / check-out exclusive, TreeSet dedup+sort, empty list (200) for unknown room — no 404 (D-04)"
  - "Security via existing /api/rooms/** permitAll (D-05): no SecurityConfig change, no redundant matcher"
  - "Plain-JUnit test for expandBookedDates (D-06): no Mockito, no Spring context, package-private static access"

patterns-established:
  - "PublicRoomController: constructor-injected RoomReservationService as third dependency"
  - "RoomReservationService: static package-private pure helpers for directly unit-testable date logic"

requirements-completed: [QT-260803-g4r]

# Metrics
duration: 4min
completed: 2026-08-03
---

# Quick Task 260803-g4r: Public booked-dates endpoint Summary

**Public GET /api/rooms/{roomId}/booked-dates returning flat, sorted, de-duplicated ISO dates for CONFIRMED booking blocks (check-in inclusive, check-out exclusive), backed by a Spring Data derived query and a plain-JUnit-tested date-expansion helper**

## Performance

- **Duration:** 4 min
- **Started:** 2026-08-03T09:42:05Z
- **Completed:** 2026-08-03T09:46:04Z
- **Tasks:** 3
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments
- `RoomReservationRepository.findByRoom_IdAndStatus(UUID, ReservationStatus)` derived query returns CONFIRMED reservations for a room (parameterized JPQL, no injection surface)
- `RoomReservationService.getBookedDates(UUID)` (`@Transactional(readOnly = true)`) + static package-private `expandBookedDates(List<RoomReservation>)` that expands `[checkInDate, checkOutDate)` via `ChronoUnit.DAYS.between` into a `TreeSet` (sorted + de-duplicated); lazy `getRoom()` never touched
- `PublicRoomController.getBookedDates` maps `GET /{roomId}/booked-dates` → `ResponseEntity<List<LocalDate>>` via constructor-injected `RoomReservationService`
- Endpoint is public by construction: existing SecurityConfig line 51 `/api/rooms/**` `.permitAll()` — no SecurityConfig change
- 5 plain-JUnit tests covering inclusive/exclusive bounds, single-night, overlapping dedup, unsorted input, and empty input

## Task Commits

Each task was committed atomically:

1. **Task 1: repository derived query + service getBookedDates/expandBookedDates** - `ced4cbe` (feat)
2. **Task 2: plain-JUnit RoomReservationServiceTest (5 tests)** - `e944a33` (test)
3. **Task 3: public GET /{roomId}/booked-dates endpoint** - `e3ea75b` (feat)

**Plan metadata:** `1facb6b` (docs: create plan for public booked-dates endpoint) — created by orchestrator, not part of this execution

## Files Created/Modified
- `src/main/java/com/cadelfriul/backend/hospitality/repository/RoomReservationRepository.java` - Added `findByRoom_IdAndStatus(UUID, ReservationStatus)` derived query + `ReservationStatus` import
- `src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java` - Added `getBookedDates(UUID)` read-only method and static package-private `expandBookedDates(List<RoomReservation>)` helper (TreeSet dedup+sort, `ChronoUnit.DAYS.between` iteration); imports `LocalDate`, `ArrayList`, `TreeSet`
- `src/main/java/com/cadelfriul/backend/hospitality/controller/PublicRoomController.java` - Added third constructor-injected `RoomReservationService`, `GET /{roomId}/booked-dates` endpoint with `@Operation` docs, `LocalDate`/`RoomReservationService` imports
- `src/test/java/com/cadelfriul/backend/hospitality/service/RoomReservationServiceTest.java` - 5 plain-JUnit tests for `expandBookedDates` + `reservation(...)` fixture helper

## Decisions Made
- Followed plan D-01..D-06 exactly; no deviation decisions were required during execution
- Used `ChronoUnit.DAYS.between` for the expansion count with a `plusDays` loop (grep gate #3 satisfied at service line 89), collecting into `TreeSet<LocalDate>` for dedup + ascending sort, wrapped in `new ArrayList<>(treeSet)`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- The frontend room calendar can now fetch blocked dates anonymously from `GET /api/rooms/{roomId}/booked-dates` (200 + `[]` for unknown rooms)
- All 6 verification gates pass: compileJava, targeted test run, and the 4 grep gates (ChronoUnit/isBefore, findByRoom_IdAndStatus, booked-dates, SecurityConfig `api/rooms` count = 1)
- No SecurityConfig, entity, DTO, or RoomReservationController changes — surface for future security work is unchanged

---
*Phase: quick-260803-g4r*
*Completed: 2026-08-03*

## Self-Check: PASSED

Verified 2026-08-03: commits `ced4cbe`, `e944a33`, `e3ea75b` present in git history; all 4 source/test files modified and SUMMARY.md present on disk.
