---
phase: quick-260804-knm
plan: 01
subsystem: hospitality (room reservations)
tags: [quick-task, scheduled-task, room-reservation, spring-scheduling, auto-cleanup]
duration: ~8 min
completed: 2026-08-04
---

# Phase quick-260804-knm Plan 01: Implement an automated scheduled task in — Summary

Added an automatic cleanup of orphaned PENDING room reservations to the Spring Boot backend: `@EnableScheduling` on the app class, a derived `findByStatusAndCreatedAtBefore(ReservationStatus, LocalDateTime)` query, a `cancelExpiredPendingReservations()` service method (30-minute threshold, CANCELLED transition, count log), and a `ReservationCleanupScheduler` `@Component` running every 15 minutes (`fixedRate = 900000`). Stale PENDING rows (e.g., abandoned Stripe checkouts) no longer hold room availability indefinitely.

## Dependency Graph

- **requires:** quick task 260803-kqg (webhook flow with PENDING→CONFIRMED/CANCELLED transitions and `RoomReservation` entity with `createdAt` `updatable=false` set in constructor); quick task 260804-fit (current service/repo/DTO state)
- **provides:** automatic expiry of PENDING reservations older than 30 minutes, every 15 minutes, first run at application startup
- **affects:** `RoomReservationService` (new public method + static helper), `RoomReservationRepository` (new derived query), app bootstrap (`@EnableScheduling`), future plans that consume reservation status transitions

## Tech Tracking

- **added:** none (no new dependencies; `build.gradle.kts` untouched)
- **patterns:** package-private static plain-JUnit-testable helper (`expireReservation`) following the existing `expandBookedDates` / `applyDefaultSortIfUnsorted` convention; `@Scheduled` trigger in a dedicated `scheduler` sub-package under the hospitality module; thin DB-touching loop delegating the testable logic to the static helper

## Requirements Completed

- [x] KNM-260804-scheduled-cleanup

## Metrics

- Tasks: 2/2
- Commits: 2
- Files modified: 5 (4 main, 1 test)
- Compile: PASS (`./gradlew compileJava`)
- Tests: PASS (`RoomReservationServiceTest` 9/9; optional `BeCadelfriulApplicationTests` `contextLoads` PASS — live Postgres was available, validating the derived query name at context startup and scheduler bean wiring)
- Duration: ~8 min (plan dispatched at 14:5x → both commits by 14:57, including full verification)

## Accomplishments

- `BeCadelfriulApplication` is annotated `@EnableScheduling`, activating all `@Scheduled` beans in the app.
- `RoomReservationRepository` declares `List<RoomReservation> findByStatusAndCreatedAtBefore(ReservationStatus, LocalDateTime)` — derived query (no JPQL), SQL `WHERE status = ?1 AND created_at < ?2`.
- `RoomReservationService.cancelExpiredPendingReservations()` computes `now - 30 min`, transitions each matching PENDING row via the package-private static `expireReservation(RoomReservation)` helper (CANCELLED + fresh `updatedAt`), saves each row, logs `"Automatically cancelled {} expired PENDING reservation(s)"`, and returns the count. Class-level `@Transactional` covers the write; no extra annotation added.
- `ReservationCleanupScheduler` (`@Component`, new package `com.cadelfriul.backend.hospitality.scheduler`) triggers `roomReservationService.cancelExpiredPendingReservations()` at `fixedRate = 900000` (15 min), first run at startup.
- Two plain-JUnit tests added (`expireReservation_setsStatusToCancelled`, `expireReservation_setsUpdatedAtToNow`); the full `RoomReservationServiceTest` class passes 9/9 with no Mockito/Spring/DB.
- `contextLoads` (`@SpringBootTest`) also passed against the live local Postgres — Spring Data accepted the derived query method name at context startup, and the scheduler bean wired cleanly.

## Task Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | `35b9331` | feat(be): add expired-PENDING query and cancellation logic with tests |
| 2 | `e38ce3c` | feat(be): auto-cancel expired PENDING room reservations |

## Files Modified

- `be-cadelfriul/src/main/java/com/cadelfriul/backend/BeCadelfriulApplication.java`
- `be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/repository/RoomReservationRepository.java`
- `be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java`
- `be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/scheduler/ReservationCleanupScheduler.java` (new)
- `be-cadelfriul/src/test/java/com/cadelfriul/backend/hospitality/service/RoomReservationServiceTest.java`

## Decisions Made

- `fixedRate = 900000` (15 min) and the 30-minute threshold are deliberate quick-task values, kept as-is and NOT parameterized (per plan). `fixedRate`'s default `initialDelay = 0` means the first cleanup run fires at app startup — stale PENDING rows are cleared as soon as the app boots.
- Expiry logic lives in package-private static `expireReservation(RoomReservation)` so the plain-JUnit class can assert it directly; the DB loop stays thin (query → helper → save → count/log).
- Derived query name (not JPQL) — Spring Data validates it at context startup, confirmed by the passing `contextLoads` test.
- No locking: the scheduler only touches PENDING rows; the scheduler-vs-webhook race (T-260804-knm-01) is accepted per the threat model.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `assertFalse` static import missing in test file**
- **Found during:** Task 1 (before first test run — pre-empted during editing)
- **Issue:** The plan's `action` stated "`assertEquals`, `assertFalse` are already imported" in `RoomReservationServiceTest.java`, but the file only imported `assertEquals` and `assertTrue`. The two plan-specified tests call `assertFalse(...)`, so compilation would have failed with `cannot find symbol`.
- **Fix:** Added `import static org.junit.jupiter.api.Assertions.assertFalse;` to the test file.
- **Files modified:** `RoomReservationServiceTest.java`
- **Commit:** `35b9331`
- **Impact on plan gates:** None — test bodies match the plan verbatim; only the missing static import was added.

No other deviations — the plan executed exactly as written otherwise.

## Issues Encountered

- None beyond the auto-fixed import above. No package installs attempted (no new dependencies — package legitimacy gate N/A).
- The optional `@SpringBootTest` `contextLoads` test was run (live Postgres on `localhost:5432`) and PASSED; absence of a DB would not have been treated as a failure.

## User Setup Required

- None (`user_setup: []`). The scheduler activates automatically on the next backend deploy/restart.

## Next Phase Readiness

- PENDING reservations older than 30 minutes are auto-cancelled every 15 minutes from startup, keeping `findOverlappingReservations` (CONFIRMED-only) and the confirmation flow accurate — abandoned Stripe checkouts no longer block rooms.
- `build.gradle.kts`, entities, controllers, security config, and everything outside the five planned files are untouched.
- Accepted edge cases (documented in the plan's threat register): scheduler-vs-webhook race (T-260804-knm-01), DB-down run logging and retry on next tick (T-260804-knm-02).

## Self-Check

- Task commits present: PASS (`35b9331`, `e38ce3c` both in `git log`)
- All files exist: PASS (5/5 — 4 modified + `ReservationCleanupScheduler.java` created, verified via `git status`/`git log`)
- Compile passes: PASS (`./gradlew compileJava` → BUILD SUCCESSFUL)
- Tests green: PASS (`RoomReservationServiceTest` 9/9 → BUILD SUCCESSFUL; `BeCadelfriulApplicationTests` `contextLoads` → BUILD SUCCESSFUL)
- Git gates verified:
  - Only the five planned `be-cadelfriul` files staged/committed: PASS (35b9331 = 3 files, e38ce3c = 2 files; `git diff --diff-filter=D` empty — no deletions)
  - Pre-existing uncommitted `bo-cadelfriul/` + `fe-cadelfriul/` files untouched and still unstaged: PASS (`git status --short` shows the same 4 files)
  - No untracked leftovers in `be-cadelfriul` (scheduler file is committed, build output gitignored): PASS
