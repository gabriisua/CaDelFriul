---
phase: quick-260804-fsq
plan: 01
subsystem: ui
tags: [angular, admin, reservations, lazy-routing, standalone-component]

# Dependency graph
requires:
  - phase: quick-260803-kqg
    provides: admin room reservation endpoints GET /api/reservations/rooms (paginated) + PUT /{id}/status
  - phase: quick-260804-fit
    provides: customerEmail field on RoomReservationResponseDTO + default createdAt desc ordering
provides:
  - Admin reservations management view in the Angular backoffice with inline-table rendering
  - ReservationService bypassing ApiService's /api/admin prefix to call /api/reservations/rooms directly
  - Lazy route 'reservations' + sidebar nav entry (between Orders and Products)
affects: [quick plans touching the admin backoffice layout or hospitality admin screens]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Direct HttpClient injection with environment.apiUrl for endpoints outside /api/admin
    - Spring Data Page unwrap via map(p => p.content)
    - Inline plain-table rendering (no DataGridComponent) for custom columns + conditional per-row buttons

key-files:
  created:
    - bo-cadelfriul/src/app/core/models/reservation.model.ts
    - bo-cadelfriul/src/app/core/services/reservation.service.ts
    - bo-cadelfriul/src/app/features/reservations/reservations-management.component.ts
  modified:
    - bo-cadelfriul/src/app/app.routes.ts
    - bo-cadelfriul/src/app/layout/admin-layout.component.ts

key-decisions:
  - "ReservationService injects HttpClient directly instead of ApiService because reservations endpoints live at /api/reservations/rooms, not under the /api/admin prefix ApiService prepends"
  - "GET unwraps the Spring Data Page .content in the service, returning Observable<AdminRoomReservationResponse[]>"
  - "PUT /{id}/status sends the raw JSON enum string 'CANCELLED' (Content-Type application/json), matching the backend @RequestBody ReservationStatus contract"
  - "Component renders a plain inline table (not DataGridComponent) because it must shorten UUIDs to 8 chars, compose a checkIn→checkOut Dates column, and hide the Cancel button per row status"
  - "Cancel updates the row in place via array .map (no re-fetch)"

patterns-established:
  - "Direct HttpClient usage pattern (AuthService.login style) for endpoints outside /api/admin"
  - "Data-grid visual language reused for the inline reservations table (bg-white/80 rounded-xl shadow overflow-hidden wrapper, divide-brand-border table, brand-secondary/30 thead)"
  - "cdr.detectChanges() after every async mutation (project convention)"

requirements-completed: [FSQ-260804-admin-reservations]

# Metrics
duration: 14min
completed: 2026-08-04
---

# Quick Plan 260804-fsq: Admin Reservations Management Summary

**Admin reservations management view in the Angular backoffice: inline-table list (ID, room, customer, dates, total, status badge) with a conditional Cancel action wired through a direct-HttpClient ReservationService, a lazy 'reservations' route, and a sidebar nav item**

## Performance

- **Duration:** ~14 min
- **Started:** 2026-08-04T09:14:00Z
- **Completed:** 2026-08-04T09:27:55Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- `AdminRoomReservationResponse`, `AdminRoomReservationStatus`, `AdminReservationPage` model types matching the backend `RoomReservationResponseDTO` + Spring Data Page shapes
- `ReservationService` calling `GET /api/reservations/rooms` (unwraps `page.content`) and `PUT /api/reservations/rooms/{id}/status` with raw `'CANCELLED'` JSON body — bypassing `ApiService`'s `/api/admin` prefix
- Standalone `ReservationsManagementComponent` with loading/error/empty states, 7-column inline table, EUR currency pipe, colored status badges, and a Cancel button only on PENDING/CONFIRMED rows (in-place row update on success)
- Lazy route `reservations` under AdminLayout children + sidebar entry "Reservations" between Orders and Products
- Production build passes; backend and fe-cadelfriul untouched

## Task Commits

Each task was committed atomically:

1. **Task 1: reservation model + service** - `ca2d34e` (feat)
2. **Task 2: reservations management component** - `3fa6f1d` (feat)
3. **Task 3: route + sidebar nav** - `97b07f9` (feat)

**Plan metadata:** `279dc8e` (docs: plan admin reservations management view) — pre-existing, not part of this execution.

## Files Created/Modified
- `bo-cadelfriul/src/app/core/models/reservation.model.ts` - `AdminRoomReservationStatus` type alias, `AdminRoomReservationResponse` and `AdminReservationPage` interfaces
- `bo-cadelfriul/src/app/core/services/reservation.service.ts` - `ReservationService` with `getAdminReservations()` (Page unwrap) and `updateReservationStatus()` (raw enum string body)
- `bo-cadelfriul/src/app/features/reservations/reservations-management.component.ts` - Standalone inline-template component (list, states, conditional Cancel, in-place update)
- `bo-cadelfriul/src/app/app.routes.ts` - Lazy `reservations` route inserted after `orders/:id`
- `bo-cadelfriul/src/app/layout/admin-layout.component.ts` - `{ path: '/reservations', label: 'Reservations' }` nav item between Orders and Products

## Decisions Made
- **Direct HttpClient over ApiService:** reservations endpoints are at `/api/reservations/rooms`, outside the `/api/admin` base that `ApiService` prepends; copied the `AuthService.login` pattern (`environment.apiUrl` template literal).
- **Service-side Page unwrap:** `getAdminReservations()` returns `Observable<AdminRoomReservationResponse[]>` by mapping `p => p.content`, keeping the component free of pagination plumbing.
- **Raw enum string body:** `PUT /{id}/status` sends `'CANCELLED'` with `Content-Type: application/json`, matching the backend `@RequestBody ReservationStatus status` (verified against `RoomReservationController.java`).
- **Inline plain table instead of DataGridComponent:** the grid cannot shorten IDs (`id.slice(0, 8)`), compose the `checkInDate → checkOutDate` column, or conditionally render the per-row Cancel button; the data-grid's visual classes were reused verbatim so the page matches existing screens.
- **In-place cancel update:** replaced the matched row with the updated reservation via `.map`, avoiding an extra list re-fetch.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Reservations management page is fully functional and reachable via sidebar/lazy route; build green
- The Angular build's lazy chunk list confirms `reservations-management-component` is bundled and loaded on demand
- Future work: pagination UI for the reservations list (GET already returns a Spring Page), or extending the admin actions beyond cancel

---
*Phase: quick-260804-fsq*
*Completed: 2026-08-04*

## Self-Check: PASSED

- All 5 planned files exist (model, service, component, routes, layout)
- All 3 task commits verified in git log: `ca2d34e`, `3fa6f1d`, `97b07f9`
- `npm run build` passed (exit 0) with `reservations-management-component` lazy chunk emitted
- `git status --porcelain` shows only the pre-existing `fe-cadelfriul/` modifications (untracked SUMMARY excluded per instructions) — no `bo-cadelfriul` files left uncommitted, no `.planning/` files committed
