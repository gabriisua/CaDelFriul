---
phase: quick-260803-gim
plan: 01
subsystem: ui, api
tags: [react-day-picker, date-fns, booking, calendar, nextjs, shadcn]
requires:
  - phase: quick-260803-g4r
    provides: public GET /api/rooms/{roomId}/booked-dates backend endpoint
provides:
  - Room Details page at /rooms/{id} with bento gallery, info column, sticky calendar booking widget
  - Auth-gated reservation flow: Log in to Reserve (with safe ?redirect= return) and Reserve Now (POST /api/reservations/rooms)
  - Pure booking helpers (toDateKey, computeNights, findBlockedDate) with unit tests
  - shadcn Calendar component (react-day-picker v10) and extended room API client
affects: [dashboard bookings, backend reservation validation, room management UI]
tech-stack:
  added: [react-day-picker v10.0.1, date-fns v4.4.0]
  patterns: [use(params) async params, preload instead of priority, local-midnight date keys, strictly-between overlap validation, Suspense-wrapped useSearchParams]
key-files:
  created:
    - "src/app/[locale]/(vetrina)/rooms/[id]/page.tsx"
    - "src/components/ui/calendar.tsx"
    - "src/lib/roomBooking.ts"
    - "src/lib/roomBooking.test.ts"
  modified:
    - "src/lib/api.ts"
    - "src/app/[locale]/(vetrina)/_components/RoomCard.tsx"
    - "src/app/[locale]/(auth)/login/page.tsx"
    - "package.json"
    - "package-lock.json"
key-decisions:
  - "react-day-picker resolved to v10 (not v9 as planned) — used the current shadcn registry calendar (v10 classNames contract: month_caption, button_previous/next, month_grid, weekdays, day_button) and the plan's handleSelect(range) contract is assignable to v10's OnSelectHandler"
  - "Date math uses canonical local yyyy-MM-dd string keys (TZ-proof) and local-midnight Date parsing for disabled days"
  - "Overlap validation checks strictly-between interior days only (endpoints excluded) and resets selection to { from } with an error toast"
  - "Login redirect accepts only same-origin relative paths (open-redirect guard) and is Suspense-wrapped per Next 16 prerender requirements"
requirements-completed: [QT-260803-GIM]
duration: 38min
completed: 2026-08-03
---

# Quick 260803-gim: Room Details Page with Booking Widget — Summary

**API-driven room detail page at /rooms/{id} with a bento gallery, sticky react-day-picker v10 calendar booking widget (past/booked dates disabled, strictly-between overlap validation), nights × price breakdown, and auth-gated reservation with a safe ?redirect= login round-trip**

## Performance

- **Duration:** 38 min
- **Started:** 2026-08-03T09:29:00Z
- **Completed:** 2026-08-03T10:07:06Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- Room Details page (`/rooms/{id}`) with bento gallery (first image `sm:col-span-2`, up to 4 stacked, `+n more` badge over 5, muted 0-image placeholder), natural-height images (`width={1200} height={800}`, `unoptimized`, `preload` on first, zero `priority`), `lg:grid-cols-[1fr_380px]` layout with sticky booking Card
- Booking widget: `mode="range"` Calendar with past + booked dates disabled, manual strictly-between overlap check (`findBlockedDate` on booked ∪ past keys) resetting to `{ from }` with an error toast, `nights × €price` breakdown via `differenceInDays`, "Log in to Reserve" → `/login?redirect=/rooms/{id}` (no flash while `authLoading`), "Reserve Now" → `createRoomReservation` → success toast → `/dashboard`
- Pure, unit-tested booking helpers in `src/lib/roomBooking.ts` (no react-day-picker, no DOM): `toDateKey`, `computeNights`, `findBlockedDate`
- RoomCard links (image overlay `z-[5]` below carousel `z-10` controls + title link) make cards navigable without breaking the carousel
- Login page honors a safe `?redirect=` (Suspense-wrapped `useSearchParams`, same-origin-relative-only guard) so the reserve flow returns users to the room
- Production build passes; `/rooms/[id]` is a dynamic route, `/login` still prerendered (SSG) thanks to the Suspense boundary

## Task Commits

Each task was committed atomically:

1. **Task 1: Install react-day-picker + date-fns and extend the API client** - `e86bcad` (feat)
2. **Task 2: shadcn Calendar + pure booking helpers (+ unit tests)** - `49c55da` (feat)
3. **Task 3: Room Details page + RoomCard links + login redirect** - `b548277` (feat)

## Files Created/Modified

- `src/app/[locale]/(vetrina)/rooms/[id]/page.tsx` - Room Details page (gallery, info column, booking widget, auth-gated reserve)
- `src/components/ui/calendar.tsx` - shadcn Calendar (react-day-picker v10, current registry implementation)
- `src/lib/roomBooking.ts` - `toDateKey`, `computeNights`, `findBlockedDate` (pure helpers)
- `src/lib/roomBooking.test.ts` - 11 unit tests for the helpers
- `src/lib/api.ts` - `Room.maxCapacity?`, `RoomReservationRequest`, `fetchRoom`, `fetchRoomBookedDates`, `createRoomReservation` (all via `apiFetch`)
- `src/app/[locale]/(vetrina)/_components/RoomCard.tsx` - overlay + title links to `/rooms/{id}`
- `src/app/[locale]/(auth)/login/page.tsx` - Suspense-wrapped `LoginForm` honoring safe `?redirect=`
- `package.json` / `package-lock.json` - `react-day-picker@^10.0.1`, `date-fns@^4.4.0` (promoted from transitive)

## Decisions Made

- **react-day-picker v10 (not v9):** `npm install react-day-picker` resolved v10.0.1 (the plan assumed v9.x). Kept v10 (plan: "accept whatever resolves") and used the current shadcn registry calendar which targets v10's classNames contract.
- **No page-level rendering tests:** react-day-picker in jsdom is flaky (plan D-12); the pure helpers are covered instead. PDP suite stayed green.
- **Calendar button label while `authLoading`:** "Loading..." (plan's literal "…" placeholder) — cosmetic only; the disabled state is what prevents the login-button flash.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] react-day-picker v10 resolved instead of v9 — calendar classNames contract and onSelect signature differ**
- **Found during:** Task 2 (calendar.tsx) and Task 3 (page.tsx)
- **Issue:** The plan's calendar spec assumed react-day-picker v9 (shadcn v2 registry keys: `caption`, `nav_button`, `table`, `head_row`, `row`, `cell`, `day`, `day_selected`, …). `npm install react-day-picker` resolved **v10.0.1**, whose `ClassNames` type keys are `month_caption`, `button_previous`/`button_next`, `month_grid`, `weekdays`, `weekday`, `week`, `day`, `day_button`, `selected`/`range_start`/`range_middle`/`range_end`, `today`, `outside`, `disabled`, `hidden` — the v9 keys are TS errors on v10. v10's `onSelect` handler also takes `(selected, triggerDate, modifiers, e)` instead of v9's `(range)`.
- **Fix:** Used the **current shadcn registry calendar** (v10-targeted — `getDefaultClassNames()`, custom `DayButton`, `Chevron` components, `--cell-size` tokens), exactly the plan's stated intent ("the current shadcn v2 registry calendar… if any class key fails, adapt"). The plan's `handleSelect(range: DateRange | undefined)` contract is assignable to v10's `OnSelectHandler` (fewer params), so the page logic — `findBlockedDate` overlap reset + toast — is unchanged.
- **Files modified:** `src/components/ui/calendar.tsx` (created with v10 contract), `src/app/[locale]/(vetrina)/rooms/[id]/page.tsx` (onSelect passes through CalendarProps)
- **Verification:** `npx tsc --noEmit` clean, full vitest green, `next build` passes with `/rooms/[id]` as a dynamic route
- **Committed in:** `49c55da` (Task 2), `b548277` (Task 3)

**2. [Rule 1 - Bug] Calendar nav buttons render as anchors with no visible chevron sizing**
- **Found during:** Task 2 (calendar.tsx)
- **Issue:** With v10's `button_previous`/`button_next` classNames there is no generic `nav_button` key; applying the plan's v9 `nav_button` classes silently did nothing.
- **Fix:** Applied `buttonVariants({ variant })` + `h-[--cell-size] w-[--cell-size] p-0` to both `button_previous` and `button_next` per the current registry, and wired the `Chevron` component override so prev/next/dropdown arrows render correct lucide icons.
- **Files modified:** `src/components/ui/calendar.tsx`
- **Verification:** tsc clean; visual structure matches the registry reference
- **Committed in:** `49c55da` (Task 2)

---

**Total deviations:** 2 auto-fixed (1 blocking API-version drift, 1 bug from the same drift)
**Impact on plan:** Both stem from react-day-picker v9 → v10 resolution, which the plan explicitly delegated ("accept whatever resolves" + "if any class key fails, adapt"). No scope creep; all locked decisions (D-01…D-12) honored.

## Issues Encountered

- `npm view` legitimacy check confirmed both packages before install: `react-day-picker` "Customizable Date Picker for React" (MIT, v10.0.1), `date-fns` "Modern JavaScript date utility library" (MIT, v4.4.0, already a vetted transitive dep in the lockfile). Threat T-260803-GIM-SC satisfied — no human checkpoint needed.
- Pre-existing ESLint debt (18 problems in `Header.tsx`, `Footer.tsx`, `cart`, `checkout`, `dashboard/*`, `shop/success`, `(auth)/error.tsx`, etc.) predates this work (documented 260731-mi2 / 260710-c3d); out of scope. All files touched by this plan pass `eslint` (exit 0) individually.

## Verification Results

- `npm ls react-day-picker date-fns` — both direct deps (`react-day-picker@10.0.1`, `date-fns@4.4.0`)
- `npx tsc --noEmit` — clean (exit 0)
- `npx vitest run "src/lib/roomBooking.test.ts"` — 11/11 pass
- `npx vitest run` — full suite 21/21 pass (3 files: PDP, shop success, roomBooking)
- `npm run lint` — exit 1 only on pre-existing unrelated debt; touched files clean
- Grep gate `priority`: 0 occurrences in the page (comments excluded); `preload`: 4 occurrences
- `next build` — PASS (bonus check; `/rooms/[id]` ƒ Dynamic, `/login` ● SSG with no Suspense/useSearchParams warnings)

## Known Stubs

None — the page wires real data end-to-end (fetchRoom + fetchRoomBookedDates + createRoomReservation against the live Spring Boot API).

## Threat Flags

None — all new surface (GET /rooms/{id}, GET booked-dates, POST reservations/rooms, ?redirect=) is covered by the plan's threat model (T-260803-GIM-01…06, -SC) with mitigations implemented as specified.

## Next Phase Readiness

- Rooms are now explorable and reservable end-to-end (card → detail → reserve); backend `POST /api/reservations/rooms` is the authority for availability/idempotency (client checks are UX only, per threat model)
- Natural follow-ups: dashboard "My Reservations" view, cancellation flow, per-amenity filters on the rooms list, and RTL/locale-aware calendar captions

## Self-Check: PASSED

Created files verified on disk; commits verified in `git log`:

- `src/app/[locale]/(vetrina)/rooms/[id]/page.tsx` → FOUND
- `src/components/ui/calendar.tsx` → FOUND
- `src/lib/roomBooking.ts` → FOUND
- `src/lib/roomBooking.test.ts` → FOUND
- `e86bcad` → FOUND (git log)
- `49c55da` → FOUND (git log)
- `b548277` → FOUND (git log)

---
*Phase: quick-260803-gim*
*Completed: 2026-08-03*
