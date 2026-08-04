---
phase: quick-260804-knm
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - be-cadelfriul/src/main/java/com/cadelfriul/backend/BeCadelfriulApplication.java
  - be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/repository/RoomReservationRepository.java
  - be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java
  - be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/scheduler/ReservationCleanupScheduler.java
  - be-cadelfriul/src/test/java/com/cadelfriul/backend/hospitality/service/RoomReservationServiceTest.java
autonomous: true
requirements: [KNM-260804-scheduled-cleanup]
user_setup: []

must_haves:
  truths:
    - "PENDING room reservations older than 30 minutes are automatically transitioned to CANCELLED"
    - "The cleanup runs automatically every 15 minutes with no manual intervention"
    - "The cleanup touches ONLY PENDING reservations (CONFIRMED/CANCELLED rows are never modified)"
    - "Each cleanup run logs the number of auto-cancelled reservations"
  artifacts:
    - path: "be-cadelfriul/src/main/java/com/cadelfriul/backend/BeCadelfriulApplication.java"
      provides: "Scheduling enabled at application level"
      contains: "@EnableScheduling"
    - path: "be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/repository/RoomReservationRepository.java"
      provides: "Derived query for expired PENDING reservations"
      contains: "findByStatusAndCreatedAtBefore"
    - path: "be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java"
      provides: "Cancellation logic + testable static helper"
      contains: "cancelExpiredPendingReservations"
    - path: "be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/scheduler/ReservationCleanupScheduler.java"
      provides: "15-minute scheduled trigger"
      contains: "@Scheduled(fixedRate = 900000)"
    - path: "be-cadelfriul/src/test/java/com/cadelfriul/backend/hospitality/service/RoomReservationServiceTest.java"
      provides: "Plain-JUnit coverage of the expiry helper"
      contains: "expireReservation_"
  key_links:
    - from: "ReservationCleanupScheduler.cleanupExpiredPendingReservations"
      to: "RoomReservationService.cancelExpiredPendingReservations"
      via: "@Scheduled method call"
      pattern: "cancelExpiredPendingReservations"
    - from: "RoomReservationService.cancelExpiredPendingReservations"
      to: "RoomReservationRepository.findByStatusAndCreatedAtBefore"
      via: "derived query invocation"
      pattern: "findByStatusAndCreatedAtBefore"
    - from: "RoomReservationService.cancelExpiredPendingReservations"
      to: "ReservationStatus.PENDING"
      via: "query filter argument"
      pattern: "ReservationStatus\\.PENDING"
---

<objective>
Implement an automated scheduled task in the Spring Boot backend (`be-cadelfriul`) that cancels orphaned PENDING room reservations: `@EnableScheduling` on the main app class, a `findByStatusAndCreatedAtBefore(ReservationStatus, LocalDateTime)` derived query on the repository, a `cancelExpiredPendingReservations()` service method (30-minute threshold, CANCELLED status, count log), and a `ReservationCleanupScheduler` component running every 15 minutes.

Purpose: Prevent PENDING reservations (e.g., users who abandoned payment after Stripe checkout was created) from holding room availability indefinitely. With `ddl-auto=update` and no DB migration, the scheduler clears stale PENDING rows so `findOverlappingReservations` (which only considers CONFIRMED) and the confirmation flow stay accurate.
Output: One repository method, one service method + static package-private helper, one scheduler component, one annotation on the app class, and plain-JUnit tests — no new dependencies, `build.gradle.kts` untouched.
</objective>

<execution_context>
@/Users/gabrielesuardi/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/gabrielesuardi/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
All backend work is under `/Users/gabrielesuardi/Desktop/CaDelFriul/be-cadelfriul`. The git repo root is `/Users/gabrielesuardi/Desktop/CaDelFriul` (branch `develop`).

**CRITICAL git rule:** Pre-existing uncommitted changes exist in `bo-cadelfriul/` and `fe-cadelfriul/` (four files). Never `git add -A` / `git add .`. Stage ONLY the five backend files listed in `files_modified` above.

**Timing semantics (do not second-guess):** `@Scheduled(fixedRate = 900000)` = run every 15 minutes, with the FIRST execution firing at application startup (Spring's `initialDelay` defaults to 0 for `fixedRate`). This is desirable: stale PENDING rows get cleaned as soon as the app boots. The 30-minute expiry threshold and 15-minute fixed rate are deliberate quick-task values — keep them, do not parameterize.

**Derived-query semantics (pitfall from verification):** `findByStatusAndCreatedAtBefore` maps to SQL `WHERE status = ?1 AND created_at < ?2`. `LocalDateTime.now().minusMinutes(30)` against the entity's `createdAt` (set in the constructor, `updatable = false`) is exactly the required "strictly before threshold" semantics. Do NOT write a `<=` variant or a manual JPQL query — the derived method name is the task requirement.

**Concurrency:** The scheduler only touches PENDING rows. The webhook flow (`confirmReservationIfAvailable`) only ever transitions PENDING→CONFIRMED/CANCELLED. A reservation that expires and is confirmed in the same window may be cancelled by the scheduler — accepted edge case (see threat model T-260804-knm-01), no locking needed.

**Test convention:** `RoomReservationServiceTest` is plain JUnit 5 — no Mockito, no Spring context, no DB. Testable logic MUST be exposed as package-private `static` helpers (existing precedent: `expandBookedDates`, `applyDefaultSortIfUnsorted`). The DB-touching loop stays thin. The `@SpringBootTest` `contextLoads` test requires a live Postgres (`localhost:5432`) — it is NOT the primary verification.

<interfaces>
<!-- Contracts the executor builds against. No codebase exploration needed. -->

From src/main/java/com/cadelfriul/backend/hospitality/entity/RoomReservation.java (already verified):
```java
public ReservationStatus getStatus();
public void setStatus(ReservationStatus status);
public LocalDateTime getCreatedAt();              // updatable=false, set in constructor
public LocalDateTime getUpdatedAt();
public void setUpdatedAt(LocalDateTime updatedAt);
```

From src/main/java/com/cadelfriul/backend/hospitality/entity/ReservationStatus.java:
```java
public enum ReservationStatus { PENDING, CONFIRMED, CANCELLED }
```

From src/main/java/com/cadelfriul/backend/hospitality/repository/RoomReservationRepository.java (current imports: `LocalDate`, `List`, `UUID`; `ReservationStatus` already imported):
```java
public interface RoomReservationRepository extends JpaRepository<RoomReservation, UUID> {
    List<RoomReservation> findByUserId(String userId);
    List<RoomReservation> findByRoom_IdAndStatus(UUID roomId, ReservationStatus status);
    // ... JPQL findOverlappingReservations(...)
}
```

From src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java (already verified: `@Service @Transactional` class, SLF4J logger `private static final Logger log`, `LocalDateTime` and `List` already imported, existing status-change pattern is `setStatus(...)` + `setUpdatedAt(LocalDateTime.now())` + `roomReservationRepository.save(...)`):
```java
public static RoomReservationService(RoomReservationRepository roomReservationRepository, RoomRepository roomRepository);
static List<LocalDate> expandBookedDates(List<RoomReservation> reservations);        // existing testable helper precedent
static Pageable applyDefaultSortIfUnsorted(Pageable pageable);                       // existing testable helper precedent
```

From src/main/java/com/cadelfriul/backend/BeCadelfriulApplication.java (current state):
```java
@SpringBootApplication
public class BeCadelfriulApplication { public static void main(String[] args) { ... } }
```

Test file pattern (plain JUnit, same package `com.cadelfriul.backend.hospitality.service` — can call package-private statics directly):
```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class RoomReservationServiceTest {
    private RoomReservation reservation(LocalDate checkIn, LocalDate checkOut) { ... }  // existing helper
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add expired-PENDING query and cancellation logic with plain-JUnit tests</name>
  <files>
    src/main/java/com/cadelfriul/backend/hospitality/repository/RoomReservationRepository.java
    src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java
    src/test/java/com/cadelfriul/backend/hospitality/service/RoomReservationServiceTest.java
  </files>
  <action>
    All paths relative to `/Users/gabrielesuardi/Desktop/CaDelFriul/be-cadelfriul`.

    1. `RoomReservationRepository.java` — add `import java.time.LocalDateTime;` directly after `import java.time.LocalDate;` (keep alphabetical block order). Add this derived query method inside the interface:
       ```java
       List<RoomReservation> findByStatusAndCreatedAtBefore(ReservationStatus status, LocalDateTime threshold);
       ```
       Do NOT write a `@Query` JPQL version — the derived method name is the requirement (Spring Data validates it at context startup; the generated SQL is `WHERE status = ?1 AND created_at < ?2`).

    2. `RoomReservationService.java` — add a named constant right after the logger declaration:
       ```java
       private static final int EXPIRED_PENDING_THRESHOLD_MINUTES = 30;
       ```
       Add this public method (class-level `@Transactional` covers the write — do NOT add another annotation):
       ```java
       public int cancelExpiredPendingReservations() {
           LocalDateTime threshold = LocalDateTime.now().minusMinutes(EXPIRED_PENDING_THRESHOLD_MINUTES);
           List<RoomReservation> expired = roomReservationRepository
                   .findByStatusAndCreatedAtBefore(ReservationStatus.PENDING, threshold);
           int count = 0;
           for (RoomReservation reservation : expired) {
               expireReservation(reservation);
               roomReservationRepository.save(reservation);
               count++;
           }
           log.info("Automatically cancelled {} expired PENDING reservation(s)", count);
           return count;
       }
       ```
       Add this package-private static helper (the testable core, per the codebase's plain-JUnit convention — it is what `RoomReservationServiceTest` asserts against; the loop above stays thin):
       ```java
       static void expireReservation(RoomReservation reservation) {
           reservation.setStatus(ReservationStatus.CANCELLED);
           reservation.setUpdatedAt(LocalDateTime.now());
       }
       ```
       No new imports are needed in the service (`LocalDateTime`, `List`, `ReservationStatus` all already imported).

    3. `RoomReservationServiceTest.java` — append these two tests before the `// --- helpers ---` section, using the existing plain-JUnit style (no Mockito, no Spring). Build the reservation with `new RoomReservation()` (constructor sets `createdAt` and `status = PENDING`):
       ```java
       @Test
       void expireReservation_setsStatusToCancelled() {
           RoomReservation reservation = new RoomReservation();
           RoomReservationService.expireReservation(reservation);
           assertEquals(ReservationStatus.CANCELLED, reservation.getStatus());
       }

       @Test
       void expireReservation_setsUpdatedAtToNow() {
           RoomReservation reservation = new RoomReservation();
           RoomReservationService.expireReservation(reservation);
           assertFalse(reservation.getUpdatedAt().isBefore(reservation.getCreatedAt()));
           assertFalse(reservation.getUpdatedAt().isAfter(LocalDateTime.now()));
       }
       ```
       (Both assertions are flake-proof: `updatedAt` is set after `createdAt` in the constructor, and the test's `now()` is always at-or-after the moment the helper ran.) Add `import java.time.LocalDateTime;` to the test file — `assertEquals`, `assertFalse` are already imported; `ReservationStatus`, `RoomReservation` already imported.
  </action>
  <verify>
    <automated>./gradlew test --tests "com.cadelfriul.backend.hospitality.service.RoomReservationServiceTest"</automated>
  </verify>
  <done>Repository exposes `List<RoomReservation> findByStatusAndCreatedAtBefore(ReservationStatus, LocalDateTime)` with the `LocalDateTime` import added; service has the 30-minute constant, the `cancelExpiredPendingReservations()` method (returns count, logs it, saves each expired row with CANCELLED + fresh updatedAt), and the package-private static `expireReservation(RoomReservation)` helper; `RoomReservationServiceTest` has the two new tests and the targeted Gradle test run passes (all tests in the class green).</done>
</task>

<task type="auto">
  <name>Task 2: Enable scheduling and create the 15-minute cleanup scheduler</name>
  <files>
    src/main/java/com/cadelfriul/backend/BeCadelfriulApplication.java
    src/main/java/com/cadelfriul/backend/hospitality/scheduler/ReservationCleanupScheduler.java
  </files>
  <action>
    All paths relative to `/Users/gabrielesuardi/Desktop/CaDelFriul/be-cadelfriul`.

    1. `BeCadelfriulApplication.java` — add `import org.springframework.scheduling.annotation.EnableScheduling;` and annotate the class with `@EnableScheduling` (keep `@SpringBootApplication`; both annotations sit on the class). This activates all `@Scheduled` beans in the app.

    2. Create `src/main/java/com/cadelfriul/backend/hospitality/scheduler/ReservationCleanupScheduler.java` (new package `com.cadelfriul.backend.hospitality.scheduler` — hospitality module placement, consistent with the existing `repository`/`service`/`controller` package split):
       ```java
       package com.cadelfriul.backend.hospitality.scheduler;

       import com.cadelfriul.backend.hospitality.service.RoomReservationService;
       import org.springframework.scheduling.annotation.Scheduled;
       import org.springframework.stereotype.Component;

       @Component
       public class ReservationCleanupScheduler {

           private final RoomReservationService roomReservationService;

           public ReservationCleanupScheduler(RoomReservationService roomReservationService) {
               this.roomReservationService = roomReservationService;
           }

           @Scheduled(fixedRate = 900000)
           public void cleanupExpiredPendingReservations() {
               roomReservationService.cancelExpiredPendingReservations();
           }
       }
       ```
       Constructor injection (matches the codebase's `RoomReservationService` style). `fixedRate = 900000` ms = 15 min; the first run fires at application startup. The scheduler itself does not log — the service method already logs the count.

    3. Git (repo root `/Users/gabrielesuardi/Desktop/CaDelFriul`, branch `develop`):
       - Stage ONLY these five files (never `git add -A` / `git add .`):
         `be-cadelfriul/src/main/java/com/cadelfriul/backend/BeCadelfriulApplication.java`
         `be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/repository/RoomReservationRepository.java`
         `be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/service/RoomReservationService.java`
         `be-cadelfriul/src/main/java/com/cadelfriul/backend/hospitality/scheduler/ReservationCleanupScheduler.java`
         `be-cadelfriul/src/test/java/com/cadelfriul/backend/hospitality/service/RoomReservationServiceTest.java`
       - Commit with message `feat(be): auto-cancel expired PENDING room reservations`.
       - Verify with `git status` that the pre-existing uncommitted `bo-cadelfriul/` and `fe-cadelfriul/` files remain unstaged and unmodified.
  </action>
  <verify>
    <automated>./gradlew compileJava</automated>
  </verify>
  <done>`compileJava` passes; `@EnableScheduling` is on `BeCadelfriulApplication`; `ReservationCleanupScheduler` is a `@Component` in `com.cadelfriul.backend.hospitality.scheduler` with `@Scheduled(fixedRate = 900000)` calling `roomReservationService.cancelExpiredPendingReservations()`; the five backend files are committed; `git status` shows the pre-existing bo/fe uncommitted files untouched.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Scheduler thread (internal) → `RoomReservationService` → `RoomReservationRepository` | No external/untrusted input crosses any boundary — the trigger is time-based (`@Scheduled`), the filter is a fixed threshold computed from the system clock, and the only data touched is `room_reservations` rows with `status = PENDING` and `created_at < now - 30 min`. |

No new dependencies are added in this plan (`build.gradle.kts` untouched), so the package-legitimacy gate (npm/pip/cargo) does not apply.

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-260804-knm-01 | Tampering | `cancelExpiredPendingReservations` vs `confirmReservationIfAvailable` (webhook) | accept | Race: a reservation older than 30 min whose payment confirms in the same 15-min window may be cancelled by the scheduler, losing the payment window. Low probability (requires a >30-min-old PENDING row to receive a webhook in the same minute), no data corruption, user can rebook. A conditional `UPDATE ... WHERE status='PENDING'` atomic write would close it but is deliberately out of scope for this quick task — no locking added. |
| T-260804-knm-02 | Denial of Service | `@Scheduled` run when DB unavailable | accept | If the repository call throws (DB down), the exception is logged by Spring's default task error handler; `fixedRate` continues scheduling subsequent runs, so the next 15-min tick retries. One failed run never blocks future runs. |
| T-260804-knm-03 | Spoofing | Scheduler bean registration | mitigate | `@EnableScheduling` is added only to the single main app class, and the scheduler is a narrow `@Component` in the hospitality module — no user-facing endpoint, no request-triggered execution, no new authorization surface introduced. |
</threat_model>

<verification>
- Task 1: `./gradlew test --tests "com.cadelfriul.backend.hospitality.service.RoomReservationServiceTest"` (workdir `be-cadelfriul`) passes — plain JUnit, no DB required.
- Task 2: `./gradlew compileJava` (workdir `be-cadelfriul`) passes.
- OPTIONAL (only if a local Postgres is running on `localhost:5432` per `application.properties`): `./gradlew test --tests "com.cadelfriul.backend.BeCadelfriulApplicationTests"` — validates that Spring Data accepts the derived query name `findByStatusAndCreatedAtBefore` and that the `ReservationCleanupScheduler` bean wires at context startup. Skip if no DB is available; do not treat its absence as a failure.
- OPTIONAL runtime spot-check: start the app; the first scheduler run fires at startup, so the log line `Automatically cancelled {N} expired PENDING reservation(s)` appears within seconds of boot (N = count of PENDING rows older than 30 min).
- `git status` after Task 2: only the five `be-cadelfriul` files in the commit; pre-existing bo/fe uncommitted files still present and unstaged.
</verification>

<success_criteria>
- `BeCadelfriulApplication` is annotated `@EnableScheduling`.
- `RoomReservationRepository` declares `List<RoomReservation> findByStatusAndCreatedAtBefore(ReservationStatus, LocalDateTime)` (derived query, no JPQL).
- `RoomReservationService.cancelExpiredPendingReservations()` computes `now - 30 min`, cancels matching PENDING rows (CANCELLED + `updatedAt` now, each saved), logs `"Automatically cancelled {} expired PENDING reservation(s)"`, and returns the count; the transition logic lives in package-private static `expireReservation(RoomReservation)`.
- `RoomReservationCleanupScheduler` (`@Component`, package `...hospitality.scheduler`) runs `@Scheduled(fixedRate = 900000)` calling the service method.
- Two new plain-JUnit tests (`expireReservation_setsStatusToCancelled`, `expireReservation_setsUpdatedAtToNow`) pass; `./gradlew compileJava` passes.
- No changes to `build.gradle.kts`, no new dependencies, no changes outside `be-cadelfriul`.
</success_criteria>

<output>
Create `.planning/quick/260804-knm-implement-an-automated-scheduled-task-in/260804-knm-SUMMARY.md` when done
</output>
