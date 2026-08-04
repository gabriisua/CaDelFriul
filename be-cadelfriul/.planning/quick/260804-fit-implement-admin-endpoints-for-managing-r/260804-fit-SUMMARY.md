---
phase: quick-260804-fit
plan: 01
subsystem: hospitality (room reservations)
tags: [quick-task, admin-endpoints, room-reservation, sort, dto]
duration: ~4 min
completed: 2026-08-04
---

# Phase quick-260804-fit Plan 01: Implement admin endpoints for managing r — Summary

Closed the two remaining gaps in the admin room-reservation endpoints: exposed the booker's email as `customerEmail` on `RoomReservationResponseDTO` (populated from the `userId` column, which stores the email) and made `GET /api/reservations/rooms` default to `createdAt` DESC (newest-first) when the client sends no explicit sort, plus a one-line Swagger description accuracy fix.

## Dependency Graph

- **requires:** quick task 260803-kqg (admin endpoints + guards + pagination already in place — endpoints NOT re-implemented)
- **provides:** `customerEmail` on the admin listing response; default `createdAt` DESC ordering for the admin listing
- **affects:** `GET /api/reservations/rooms` (admin), `GET /api/reservations/rooms/me` (same DTO shape, unchanged behavior), `PUT /api/reservations/rooms/{id}/status` (untouched)

## Tech Tracking

- **added:** none (no new dependencies; build.gradle.kts untouched)
- **patterns:** package-private static plain-JUnit-testable helper (`applyDefaultSortIfUnsorted`) mirroring the existing `expandBookedDates` convention; additive DTO field with legacy field kept for backward compatibility

## Requirements Completed

- [x] QT-260804-fit

## Metrics

- Tasks: 2/2
- Commits: 2
- Files modified: 5 (2 main, 3 test)
- Compile: PASS (`./gradlew compileJava`)
- Tests: PASS (`RoomReservationResponseDTOTest`, `RoomReservationServiceTest`, and full `./gradlew test`)
- Duration: ~4 min (11:15:59 → 11:16:45 commit span + verification)

## Accomplishments

- `RoomReservationResponseDTO` now carries a final `customerEmail` field + getter, initialized once from `reservation.getUserId()` (the `userId` column stores the booker's email — `JwtAuthenticationFilter` principal is the email). Legacy `userId` field/getter kept for `/me` consumers.
- `RoomReservationService.getAllReservations` now calls `findAll(applyDefaultSortIfUnsorted(pageable))`; the package-private static helper applies `createdAt` DESC only when the incoming `Pageable` is unsorted, preserving page number/size, and passes explicit client sorts through untouched.
- Swagger `@Operation` description on the admin GET corrected to reflect the newest-first default.
- Both SUPER_ADMIN guards, both endpoint mappings, the repository, the entity, SecurityConfig, and build files untouched.

## Task Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | `d808753` | feat(quick-260804-fit): expose booker email as customerEmail on RoomReservationResponseDTO |
| 2 | `319efc4` | feat(quick-260804-fit): default createdAt DESC ordering for admin reservation listing |

## Files Modified

- `src/main/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTO.java`
- `src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java`
- `src/main/java/com/cadelfriul/backend/hospitality/controller/RoomReservationController.java`
- `src/test/java/com/cadelfriul/backend/hospitality/dto/RoomReservationResponseDTOTest.java`
- `src/test/java/com/cadelfriul/backend/hospitality/service/RoomReservationServiceTest.java`

## Decisions Made

- `customerEmail` is a real final field (not a delegating getter), initialized once from `reservation.getUserId()` — immune to future drift if the entity column is ever renamed.
- Default sort lives in a package-private static helper `applyDefaultSortIfUnsorted(Pageable)` — mirrors the existing `expandBookedDates` plain-JUnit-testable convention (no Mockito/Spring).
- Default `createdAt` DESC applied ONLY when the incoming Pageable is unsorted; an explicit client `sort=` always wins. `@PageableDefault(size = 20)` produces an unsorted Pageable when no `sort` param is sent, which is the "no explicit sort" signal.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `Pageable.withSort(Sort)` does not exist in Spring Data Commons 4.1.0**
- **Found during:** Task 2 (first `./gradlew test` run after the edit)
- **Issue:** The plan's helper skeleton called `pageable.withSort(Sort.by(...))`, but the `Pageable` interface in the resolved `spring-data-commons 4.1.0` jar only declares `withPage(int)` — compilation failed with `cannot find symbol: method withSort(Sort)`.
- **Fix:** Built a fresh `PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, "createdAt"))` — same intent (copy with sort replaced, page number and size preserved), universally available API. Added a javadoc note in the helper explaining why `PageRequest.of` is used instead.
- **Files modified:** `RoomReservationService.java`
- **Commit:** `319efc4`
- **Impact on plan gates:** None — `Sort.Direction.DESC` still present, `applyDefaultSortIfUnsorted` still used in both declaration and `getAllReservations` body, existing service tests pass unchanged (the tests were written against the helper's behavior, not its internals).

**2. [Plan gate pattern note — no code change] Verification gate 7 grep pattern over-counts**
- **Found during:** final verification
- **Issue:** Gate 7 (`grep -v '^#' | grep -c "PreAuthorize"` must return exactly 2) returned 3 because the raw string `PreAuthorize` also matches the `import org.springframework.security.access.prepost.PreAuthorize;` line (line 18). This is pre-existing: the same pattern returns 3 on the pre-dispatch commit `8d065c9` too.
- **Fix:** None needed. The actual `@PreAuthorize` annotation count is exactly 2 (GET-all + PUT-status, both SUPER_ADMIN), and the controller diff vs `8d065c9` is exclusively the `@Operation` description string. Endpoint guards are not regressed.
- **Files modified:** none

## Issues Encountered

- None beyond the auto-fixed items above. No package installs attempted (no new dependencies — package legitimacy gate N/A).

## User Setup Required

- None (`user_setup: []`).

## Next Phase Readiness

- The admin backoffice can now identify the booker of every reservation by email (`customerEmail`) and sees reservations newest-first by default.
- `/me` consumers unaffected (legacy `userId` still present; requester only ever sees their own rows via `findByUserId`).
- No regressions in endpoint guards, entity, repository, SecurityConfig, or build.

## Self-Check

- Task commits present: PASS (`d808753`, `319efc4` both in `git log`)
- All files exist: PASS (all 5 paths verified via `git diff --stat 8d065c9`)
- Compile passes: PASS (`./gradlew compileJava` → BUILD SUCCESSFUL)
- Tests green: PASS (`RoomReservationResponseDTOTest`, `RoomReservationServiceTest`, full `./gradlew test` → BUILD SUCCESSFUL)
- Grep gates:
  - Gate 3 `customerEmail` ≥ 3 matches: PASS (3: field decl, ctor init, getter)
  - Gate 4 `customerEmail = reservation.getUserId()`: PASS (line 29)
  - Gate 5 `getUserId` still matches: PASS (field, ctor, getter)
  - Gate 6 `applyDefaultSortIfUnsorted` in decl + body: PASS (lines 115, 124); `Sort.Direction.DESC`: PASS (line 126)
  - Gate 7 `@PreAuthorize` annotations = 2: PASS (raw pattern counts 3 due to import line — pre-existing, documented above)
- Only planned files staged/committed: PASS (fe-cadelfriul and bo-cadelfriul untouched; no untracked files)
