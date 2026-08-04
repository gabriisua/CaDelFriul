---
phase: quick-260804-fsq
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - bo-cadelfriul/src/app/core/models/reservation.model.ts
  - bo-cadelfriul/src/app/core/services/reservation.service.ts
  - bo-cadelfriul/src/app/features/reservations/reservations-management.component.ts
  - bo-cadelfriul/src/app/app.routes.ts
  - bo-cadelfriul/src/app/layout/admin-layout.component.ts
autonomous: true
requirements: [FSQ-260804-admin-reservations]
user_setup: []

must_haves:
  truths:
    - "Admin can see all room reservations (room name, customer email, date range, total price, status badge)"
    - "Admin can cancel a PENDING or CONFIRMED reservation"
    - "Cancelled reservations no longer show a Cancel button"
    - "The Reservations page is reachable via sidebar nav and a lazy route"
  artifacts:
    - path: "bo-cadelfriul/src/app/core/models/reservation.model.ts"
      provides: "AdminRoomReservationResponse + AdminReservationPage (Spring Page wrapper) interfaces"
      contains: "export interface AdminRoomReservationResponse"
    - path: "bo-cadelfriul/src/app/core/services/reservation.service.ts"
      provides: "GET list (unwraps page.content) + PUT status with raw enum string body"
      exports: ["getAdminReservations", "updateReservationStatus"]
    - path: "bo-cadelfriul/src/app/features/reservations/reservations-management.component.ts"
      provides: "Inline-table reservations view with loading/error/empty states and conditional Cancel button"
      contains: "cancelReservation"
    - path: "bo-cadelfriul/src/app/app.routes.ts"
      provides: "Lazy route path 'reservations'"
      contains: "path: 'reservations'"
    - path: "bo-cadelfriul/src/app/layout/admin-layout.component.ts"
      provides: "Sidebar nav item between Orders and Products"
      contains: "path: '/reservations', label: 'Reservations'"
  key_links:
    - from: "reservation.service.ts"
      to: "environment.apiUrl"
      via: "template literal"
      pattern: "environment\\.apiUrl.*api/reservations/rooms"
    - from: "reservation.service.ts"
      to: "AdminReservationPage"
      via: "map(p => p.content)"
      pattern: "map\\(p => p\\.content\\)"
    - from: "reservations-management.component.ts"
      to: "ReservationService"
      via: "inject(ReservationService)"
      pattern: "inject\\(ReservationService\\)"
    - from: "admin-layout.component.ts"
      to: "route /reservations"
      via: "routerLink item.path"
      pattern: "/reservations"
---

<objective>
Implement the Admin Reservations Management view in the Angular backoffice (bo-cadelfriul): a reservations list page (room, customer, dates, total, status) with a cancel action, wired into the sidebar nav and a lazy route.

Purpose: Give SUPER_ADMIN users a place to view and cancel room reservations, using the already-implemented backend endpoints `GET /api/reservations/rooms` and `PUT /api/reservations/rooms/{id}/status`.
Output: model + service + standalone component + route entry + nav item. Backend (be-cadelfriul) and frontend (fe-cadelfriul) are NOT touched.
</objective>

<execution_context>
@/Users/gabrielesuardi/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/gabrielesuardi/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
All work is under `/Users/gabrielesuardi/Desktop/CaDelFriul/bo-cadelfriul`. The git repo root is `/Users/gabrielesuardi/Desktop/CaDelFriul` (branch `develop`).

**CRITICAL git rule:** Pre-existing uncommitted changes exist in `fe-cadelfriul/` (two files). Never `git add -A` / `git add .`. Stage ONLY the five files listed in `files_modified` above. Do not modify fe-cadelfriul files.

**CRITICAL API rule:** The reservations endpoints live at `/api/reservations/rooms`, NOT `/api/admin/...`. `ApiService` prepends `/api/admin` to every path, so it CANNOT be used. The new `ReservationService` injects `HttpClient` directly and builds `${environment.apiUrl}/api/reservations/rooms` — the exact pattern used by `AuthService.login` (see below).

<interfaces>
<!-- Contracts the executor builds against. No codebase exploration needed. -->

From src/app/core/services/auth.service.ts (pattern to copy for direct HttpClient usage):
```typescript
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
private readonly http = inject(HttpClient);
private readonly loginUrl = `${environment.apiUrl}/api/auth/admin/login`;
```

From src/app/core/services/api.service.ts (do NOT use — prepends `/api/admin`):
```typescript
private readonly baseUrl = `${environment.apiUrl}/api/admin`;
```

From src/app/core/models/room.model.ts (model style — plain interfaces, no classes):
```typescript
export interface Room {
  id: string;
  name: string;
  // ...
}
```

Backend GET response shape (Spring Data Page, NOT a plain array):
```json
{ "content": [...], "totalElements": 5, "totalPages": 1, "number": 0, "size": 20, "first": true, "last": true, "empty": false }
```

Backend PUT contract: body is the RAW enum string `"CANCELLED"` (NOT `{ "status": "CANCELLED" }`). Sending a TypeScript string as the HttpClient body serializes correctly to a JSON string.
</interfaces>

Reference files (all already read — do not re-explore):
- `src/app/features/rooms/rooms.component.ts` — exact template/state pattern to mirror: `space-y-6` wrapper, header with `h1 class="text-3xl font-bold text-brand-text font-heading"`, `@if (loading)` spinner div (`animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary`), `@else if (error)` red box (`bg-red-50 border border-red-200 rounded-lg p-4` + `text-red-700`), `@else if (empty)` (`bg-white/80 rounded-xl shadow p-8 text-center` + `text-brand-muted`), else the table. Uses `inject(ChangeDetectorRef)` + `cdr.detectChanges()` in every async callback (both next AND error).
- `src/app/shared/components/data-grid/data-grid.component.ts` — table styling to copy verbatim (grid wrapper is `bg-white/80 rounded-xl shadow overflow-hidden`; table `min-w-full divide-y divide-brand-border`; thead `bg-brand-secondary/30`; th `px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider font-heading`; tbody rows `bg-white divide-y divide-brand-border` + `hover:bg-brand-bg/50`; td `px-6 py-4 whitespace-nowrap text-sm text-brand-text`). Currency renders `{{ value | currency:'EUR' }}`. Badge classes: PENDING `bg-yellow-100 text-yellow-800`, CANCELLED `bg-red-100 text-red-800`; CONFIRMED must use green `bg-green-100 text-green-800`. The badge span base is `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium`.
- `src/app/app.routes.ts` — children array currently: dashboard, products, orders, orders/:id, customers, staff, rooms, redirect. Insert the reservations route AFTER the `orders/:id` entry.
- `src/app/layout/admin-layout.component.ts` — `navItems` order: Dashboard, Orders, Products, Rooms, Customers, Staff. Insert `{ path: '/reservations', label: 'Reservations' }` directly after Orders (before Products).
- `src/styles.css` — `--color-brand-destructive: #c4382d` (red). Destructive button pattern used elsewhere: `text-white` + `bg-brand-destructive` + `hover:opacity-80` (mirrors the `bg-brand-primary hover:opacity-80` button in rooms.component.ts).
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create reservation model and ReservationService</name>
  <files>
    src/app/core/models/reservation.model.ts
    src/app/core/services/reservation.service.ts
  </files>
  <action>
    Create `src/app/core/models/reservation.model.ts` with two plain interfaces:

    1. `AdminRoomReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED'` (type alias, exported).
    2. `AdminRoomReservationResponse` with EXACTLY these fields:
       - `id: string`
       - `room: { id: string; name: string }`
       - `customerEmail: string`
       - `userId: string`
       - `checkInDate: string`
       - `checkOutDate: string`
       - `totalPrice: number`
       - `status: AdminRoomReservationStatus`
       - `createdAt: string`
       - `updatedAt?: string`
    3. `AdminReservationPage` (Spring Data Page wrapper) with:
       - `content: AdminRoomReservationResponse[]`
       - `totalElements: number`
       - `totalPages: number`
       - `number: number`
       - `size: number`
       - `first: boolean`
       - `last: boolean`
       - `empty: boolean`

    Create `src/app/core/services/reservation.service.ts`:
    - `@Injectable({ providedIn: 'root' })`, named `ReservationService`.
    - Inject `HttpClient` via `inject()` (NOT ApiService — it prepends `/api/admin`, and these endpoints live at `/api/reservations/rooms`). Pattern copied from `AuthService.login`: `import { environment } from '../../../environments/environment';` and `private readonly baseUrl = \`${environment.apiUrl}/api/reservations/rooms\`;`
    - `getAdminReservations(): Observable<AdminRoomReservationResponse[]>` → `this.http.get<AdminReservationPage>(this.baseUrl).pipe(map(p => p.content))` — the GET returns a Spring Page, so the service MUST unwrap `.content`. Return type is the array, not the page (per contract decision: service unwraps).
    - `updateReservationStatus(id: string, status: AdminRoomReservationStatus): Observable<AdminRoomReservationResponse>` → `this.http.put<AdminRoomReservationResponse>(\`${this.baseUrl}/${id}/status\`, status)` — the body is the RAW enum string (`'CANCELLED'`), NOT `{ status: ... }`. Do not wrap it in an object.
    - Import `map` from `rxjs`.
  </action>
  <verify>
    <automated>npx tsc --noEmit -p tsconfig.app.json</automated>
  </verify>
  <done>Model file exports the three types with the exact fields above; service GET unwraps `.content` and returns `Observable<AdminRoomReservationResponse[]>`; service PUT sends the raw status string; no reference to `ApiService` and no `/api/admin` string anywhere in the service.</done>
</task>

<task type="auto">
  <name>Task 2: Build ReservationsManagementComponent</name>
  <files>
    src/app/features/reservations/reservations-management.component.ts
  </files>
  <action>
    Create standalone component `ReservationsManagementComponent` (selector `app-reservations-management`, `standalone: true`, `imports: [CommonModule]`, inline `template` string — no separate .html). Mirror the structure of `rooms.component.ts` exactly.

    Class state and logic:
    - `private readonly reservationService = inject(ReservationService);` and `private readonly cdr = inject(ChangeDetectorRef);`
    - `reservations: AdminRoomReservationResponse[] = [];`, `loading = true;`, `error = '';`
    - `ngOnInit(): void { this.loadReservations(); }`
    - `private loadReservations(): void` → subscribes to `getAdminReservations()`; on `next`: assign array, `loading = false`, `this.cdr.detectChanges()`; on `error`: `this.error = 'Failed to load reservations.';`, `loading = false`, `this.cdr.detectChanges()`.
    - `cancelReservation(id: string): void` → subscribes to `updateReservationStatus(id, 'CANCELLED')`; on `next` (updated reservation): replace it in the local array in place via `.map(r => r.id === updated.id ? updated : r)`, then `this.cdr.detectChanges()` (no re-fetch needed); on `error`: `this.error = 'Failed to cancel reservation.';` + `this.cdr.detectChanges()`.
    - `getStatusBadgeClass(status: string): string` → base `'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium '` plus: `PENDING` → `bg-yellow-100 text-yellow-800`, `CONFIRMED` → `bg-green-100 text-green-800`, `CANCELLED` → `bg-red-100 text-red-800`, default → `bg-gray-100 text-gray-800`. This mirrors the data-grid badge palette.

    Template (exact structure):
    - Wrapper `<div class="space-y-6">`, then header row `<div class="flex items-center justify-between">` with `<h1 class="text-3xl font-bold text-brand-text font-heading">Reservations Management</h1>` (no Add button — read-only apart from cancel).
    - `@if (loading)` → spinner div exactly like rooms.component.ts (`animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary` centered with `py-12`).
    - `@else if (error)` → `<div class="bg-red-50 border border-red-200 rounded-lg p-4"><p class="text-red-700">{{ error }}</p></div>`.
    - `@else if (reservations.length === 0)` → `<div class="bg-white/80 rounded-xl shadow p-8 text-center"><p class="text-brand-muted">No reservations found.</p></div>`.
    - `@else` → PLAIN table (NOT `app-data-grid` — it cannot shorten an ID, compose the checkIn→checkOut column, or conditionally hide a per-row button). Use the data-grid's exact styling:
      - `<div class="bg-white/80 rounded-xl shadow overflow-hidden">`
      - `<table class="min-w-full divide-y divide-brand-border">`
      - `<thead class="bg-brand-secondary/30">` with one `<th class="px-6 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider font-heading">` per column.
      - `<tbody class="bg-white divide-y divide-brand-border">`; rows `@for (reservation of reservations; track reservation.id)` with `<tr class="hover:bg-brand-bg/50">`; every `<td class="px-6 py-4 whitespace-nowrap text-sm text-brand-text">`.
      - Column order and cell contents (NOT plain field renders — these three require custom rendering):
        1. ID → `{{ reservation.id.slice(0, 8) }}`
        2. Room → `{{ reservation.room.name }}`
        3. Customer → `{{ reservation.customerEmail }}`
        4. Dates → `{{ reservation.checkInDate }} → {{ reservation.checkOutDate }}` (the `→` literal between the two yyyy-MM-dd strings)
        5. Total → `{{ reservation.totalPrice | currency:'EUR' }}`
        6. Status → `<span [class]="getStatusBadgeClass(reservation.status)">{{ reservation.status }}</span>`
        7. Actions → Cancel button shown ONLY when cancelable: wrap in `@if (reservation.status === 'PENDING' || reservation.status === 'CONFIRMED')`, button class `px-3 py-1 text-xs font-medium rounded-md text-white bg-brand-destructive hover:opacity-80 focus:outline-none`, `(click)="cancelReservation(reservation.id)"`, label `Cancel`. No button rendered for CANCELLED rows.
  </action>
  <verify>
    <automated>npx tsc --noEmit -p tsconfig.app.json</automated>
  </verify>
  <done>Component compiles under strict TypeScript; template contains all 7 columns; Cancel button is conditional on PENDING/CONFIRMED; loading/error/empty states mirror rooms.component.ts; every async callback calls `cdr.detectChanges()`.</done>
</task>

<task type="auto">
  <name>Task 3: Wire route, sidebar nav, and verify full build</name>
  <files>
    src/app/app.routes.ts
    src/app/layout/admin-layout.component.ts
  </files>
  <action>
    1. In `src/app/app.routes.ts`, inside the `AdminLayoutComponent` children array, insert AFTER the `orders/:id` entry and BEFORE `customers`:
       ```typescript
       {
         path: 'reservations',
         loadComponent: () =>
           import('./features/reservations/reservations-management.component').then(
             (m) => m.ReservationsManagementComponent,
           ),
       },
       ```
       (Matches the lazy `loadComponent` style of the other routes.)

    2. In `src/app/layout/admin-layout.component.ts`, insert `{ path: '/reservations', label: 'Reservations' }` into `navItems` directly after `{ path: '/orders', label: 'Orders' }` and before Products (final order: Dashboard, Orders, Reservations, Products, Rooms, Customers, Staff).

    3. Run `npm run build` from `/Users/gabrielesuardi/Desktop/CaDelFriul/bo-cadelfriul` and confirm it passes.

    4. Git (repo root `/Users/gabrielesuardi/Desktop/CaDelFriul`, branch `develop`):
       - Stage ONLY these five files (never `git add -A` / `git add .`):
         `bo-cadelfriul/src/app/core/models/reservation.model.ts`
         `bo-cadelfriul/src/app/core/services/reservation.service.ts`
         `bo-cadelfriul/src/app/features/reservations/reservations-management.component.ts`
         `bo-cadelfriul/src/app/app.routes.ts`
         `bo-cadelfriul/src/app/layout/admin-layout.component.ts`
       - Commit with message `feat(bo): add admin reservations management`.
       - Verify with `git status` that the pre-existing uncommitted `fe-cadelfriul/` files remain unstaged and unmodified.
  </action>
  <verify>
    <automated>npm run build</automated>
  </verify>
  <done>Production build passes; `git status` shows exactly the five bo-cadelfriul files committed and the pre-existing fe-cadelfriul uncommitted files untouched.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Admin UI (Angular, SSR) → Spring Boot API `/api/reservations/*` | Browser-executed code calls authenticated endpoints; token from `localStorage` is attached by the existing HTTP interceptor. Authorization on the backend is `@PreAuthorize("hasRole('SUPER_ADMIN')")`. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-260804-01 | Tampering | `ReservationService.updateReservationStatus` | mitigate | Status parameter typed as `AdminRoomReservationStatus` union ('PENDING' \| 'CONFIRMED' \| 'CANCELLED'); component only ever sends the literal `'CANCELLED'`. Arbitrary status strings cannot be emitted from this code path. |
| T-260804-02 | Spoofing / Elevation of Privilege | `PUT /api/reservations/rooms/{id}/status` | transfer | Existing backend `@PreAuthorize("hasRole('SUPER_ADMIN')")` + JWT authentication (outside this task's scope — do not modify backend). No new client-side authorization logic added. |
| T-260804-03 | Information Disclosure | GET response logged client-side | accept | Error handlers only surface the generic strings 'Failed to load reservations.' / 'Failed to cancel reservation.' — no DTO contents or raw error bodies rendered in the template. |
</threat_model>

<verification>
- `npx tsc --noEmit -p tsconfig.app.json` passes after Tasks 1 and 2.
- `npm run build` (workdir: `bo-cadelfriul`) passes after Task 3.
- `git status` after Task 3: only the five bo-cadelfriul files in the commit; fe-cadelfriul uncommitted files still present and unstaged.
</verification>

<success_criteria>
- `AdminRoomReservationResponse`, `AdminRoomReservationStatus`, `AdminReservationPage` exported from the model file; service GET unwraps `page.content`; service PUT sends raw enum string to `${environment.apiUrl}/api/reservations/rooms/{id}/status`.
- Reservations page renders: ID (8 chars), Room, Customer, Dates (checkIn → checkOut), Total (EUR), Status badge, and a Cancel button only for PENDING/CONFIRMED rows; cancel updates the row in place.
- Route `reservations` lazily loads the component; sidebar shows "Reservations" between Orders and Products.
- `npm run build` passes; backend and fe-cadelfriul untouched; no commit includes fe-cadelfriul files.
</success_criteria>

<output>
Create `.planning/quick/260804-fsq-implement-admin-reservations-management-/260804-fsq-SUMMARY.md` when done
</output>
