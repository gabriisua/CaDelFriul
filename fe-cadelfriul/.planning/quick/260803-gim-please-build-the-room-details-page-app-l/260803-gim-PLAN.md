---
phase: quick-260803-gim
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - "package.json"
  - "package-lock.json"
  - "src/lib/api.ts"
  - "src/components/ui/calendar.tsx"
  - "src/lib/roomBooking.ts"
  - "src/lib/roomBooking.test.ts"
  - "src/app/[locale]/(vetrina)/rooms/[id]/page.tsx"
  - "src/app/[locale]/(vetrina)/_components/RoomCard.tsx"
  - "src/app/[locale]/(auth)/login/page.tsx"
autonomous: true
requirements: [QT-260803-GIM]
user_setup: []

must_haves:
  truths:
    - "A room card on the rooms list links to its detail page (/rooms/{id})"
    - "The detail page shows room name, price per night, max capacity (when the API returns it), description, and amenities"
    - "The gallery shows the first image large with smaller images beside it, image URLs prefixed with the API base URL, and a muted placeholder when there are no images"
    - "The booking calendar disables past dates and dates already booked for the room"
    - "Selecting a range that spans a booked or past date resets to check-in only and shows an error toast"
    - "Selecting a full valid range shows the price breakdown (nights x price per night) and total"
    - "An unauthenticated visitor sees 'Log in to Reserve' which goes to /login?redirect=/rooms/{id}, and the login page returns them to that room after signing in"
    - "An authenticated user can click 'Reserve Now' which POSTs { roomId, checkInDate, checkOutDate } with JWT auth, shows a success toast, and redirects to /dashboard"
    - "A loading skeleton is shown while the room and booked dates are fetched"
  artifacts:
    - path: "src/app/[locale]/(vetrina)/rooms/[id]/page.tsx"
      provides: "Room details page: bento gallery, info column, sticky booking widget, auth-gated reservation"
      contains: "fetchRoomBookedDates"
    - path: "src/components/ui/calendar.tsx"
      provides: "shadcn Calendar (react-day-picker v9), consumed by the booking widget"
      contains: "DayPicker"
    - path: "src/lib/roomBooking.ts"
      provides: "Pure helpers: toDateKey, computeNights, findBlockedDate (no react-day-picker, no DOM)"
      contains: "differenceInDays"
    - path: "src/lib/roomBooking.test.ts"
      provides: "Unit tests for the pure booking helpers"
      contains: "findBlockedDate"
    - path: "src/lib/api.ts"
      provides: "fetchRoom, fetchRoomBookedDates, createRoomReservation, RoomReservationRequest, Room.maxCapacity"
      contains: "maxCapacity"
    - path: "src/app/[locale]/(vetrina)/_components/RoomCard.tsx"
      provides: "Link from card image + title to /rooms/{id}"
      contains: "href={`/rooms/${room.id}`}"
    - path: "src/app/[locale]/(auth)/login/page.tsx"
      provides: "Honors the ?redirect= query param on successful sign-in (safe-path guarded)"
      contains: "redirect"
  key_links:
    - from: "page.tsx"
      to: "@/lib/api fetchRoom + fetchRoomBookedDates"
      via: "Promise.all in useEffect (cancelled-guard)"
      pattern: "fetchRoom|fetchRoomBookedDates"
    - from: "page.tsx Calendar"
      to: "booked-dates → Date[]"
      via: "disabled={[{ before: new Date() }, ...bookedDates.map(d => new Date(`${d}T00:00:00`))]}"
      pattern: "disabled=\\{\\["
    - from: "page.tsx onSelect"
      to: "roomBooking.findBlockedDate"
      via: "overlap validation resetting selection to { from } + toast.error"
      pattern: "findBlockedDate"
    - from: "page.tsx Reserve Now"
      to: "api.createRoomReservation"
      via: "POST body { roomId, checkInDate, checkOutDate } — apiFetch auto-adds Authorization: Bearer"
      pattern: "createRoomReservation"
    - from: "RoomCard.tsx"
      to: "/rooms/{id} route"
      via: "next/link overlay on image + wrapped CardTitle"
      pattern: "rooms/\\$\\{room\\.id\\}"
    - from: "login/page.tsx"
      to: "redirect param"
      via: "useSearchParams (Suspense-wrapped) + router.push on success"
      pattern: "useSearchParams"
---

<objective>
Build the Room Details Page at `src/app/[locale]/(vetrina)/rooms/[id]/page.tsx` — a premium, API-driven room detail page with a bento image gallery, a two-column layout (info left, sticky booking widget right), calendar-based availability with overlap validation, dynamic pricing, and auth-gated reservation.

Purpose: The rooms list page (`(vetrina)/rooms/page.tsx`) currently renders `RoomCard`s that link nowhere. This task makes rooms fully explorable and bookable end-to-end: card → detail → reserve, against the live Spring Boot API (`GET /api/rooms/{id}`, `GET /api/rooms/{id}/booked-dates`, `POST /api/reservations/rooms`).

Output:
- `src/components/ui/calendar.tsx` (shadcn Calendar, react-day-picker v9) — **created** (does not exist; only button, card, dialog, input, label, separator, skeleton, sonner exist)
- `src/lib/roomBooking.ts` — **created** pure booking helpers (unit-testable without rendering the Calendar)
- `src/lib/roomBooking.test.ts` — **created** unit tests for those helpers
- `src/app/[locale]/(vetrina)/rooms/[id]/page.tsx` — **created** the page
- `src/lib/api.ts` — **modified**: `Room.maxCapacity?`, `RoomReservationRequest`, `fetchRoom`, `fetchRoomBookedDates`, `createRoomReservation`
- `src/app/[locale]/(vetrina)/_components/RoomCard.tsx` — **modified**: links to the new detail page
- `src/app/[locale]/(auth)/login/page.tsx` — **modified**: honors `?redirect=` so the "Log in to Reserve" flow returns the user to the room
- `package.json` / `package-lock.json` — **modified** via `npm install react-day-picker date-fns`

**Locked decisions (from user spec, non-negotiable):**
- **D-01 (Deps):** `npm install react-day-picker date-fns` (npm only — project uses npm per package-lock). `date-fns` v4 already sits in the lockfile as a transitive dep — this promotes it to a direct dependency. `react-day-picker` is absent and required by the shadcn Calendar.
- **D-02 (API client):** Reuse `apiFetch` (auto-adds `Content-Type: application/json` + `Authorization: Bearer <token>`, handles 401/403 redirect). Add `maxCapacity?: number` to `Room` (backend may not return it — render "Up to {n} guests" only when defined), `RoomReservationRequest` (`{ roomId: string; checkInDate: string; checkOutDate: string }` — `yyyy-MM-dd` strings), `fetchRoom(id)` → `GET /api/rooms/${id}`, `fetchRoomBookedDates(id)` → `GET /api/rooms/${id}/booked-dates` (array of `"yyyy-MM-dd"` strings), `createRoomReservation(req)` → `POST /api/reservations/rooms`. Use `getRoomImageUrl` for image paths — do NOT reimplement base-URL prepending.
- **D-03 (Next 16, per AGENTS.md):** `params` is a Promise → `const { id } = use(params)`. `next/image` uses `preload` (NOT `priority` — deprecated in 16.2.10; verified in `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` §`priority`). Images: `width={1200} height={800} unoptimized` + `w-full h-auto object-cover` inside `overflow-hidden rounded-xl` wrappers, `onError` fallback (local `GalleryImage`-style component, mirroring the PDP at `shop/[id]/page.tsx` lines 37-88).
- **D-04 (Gallery):** Bento at top — `grid grid-cols-1 gap-4 sm:grid-cols-3`; first image `sm:col-span-2`, up to 4 smaller images stacked in column 3 (slice displayed images to 5 total, per PDP convention). Count badge `+{n}` on the last displayed image when `imageUrls.length > 5` (simple static overlay — NO lightbox). 0 images → muted placeholder (`ImageOff` icon in an `aspect-video bg-muted rounded-xl` box, PDP pattern).
- **D-05 (Layout):** Below the gallery: `grid gap-10 lg:grid-cols-[1fr_380px]`. Left: room name (`font-heading`), price per night, max capacity, description, amenities with lucide icons (keyword→icon map with a default icon). Right: booking widget in a `Card` with `h-fit lg:sticky lg:top-24`.
- **D-06 (Calendar):** shadcn `Calendar` with `mode="range"`, `numberOfMonths={1}`, `disabled={[{ before: new Date() }, ...bookedDates.map(d => new Date(`${d}T00:00:00`))]}`. Local-midnight parsing avoids TZ shifts; comparison logic uses canonical `yyyy-MM-dd` string keys (a `Set`) per the verified codebase fact.
- **D-07 (Overlap validation):** react-day-picker blocks disabled *endpoints* but NOT a range spanning a disabled *middle* day. In `onSelect`, when both `from` and `to` are set, check the days strictly BETWEEN them via `findBlockedDate` (booked ∪ past); if blocked → `toast.error("Selected dates overlap with an existing booking.")` and reset selection to `{ from }` only.
- **D-08 (Pricing):** `nights = computeNights(from, to)` (date-fns `differenceInDays`), breakdown `€{price} × {nights} nights = €{total}` (`toFixed(2)`), shown only when a full range is selected.
- **D-09 (Auth gating):** `useAuth()` → `{ isAuthenticated, loading: authLoading }`. While `authLoading` the button renders disabled (prevents flashing "Log in to Reserve" on mount). Unauthenticated: label **"Log in to Reserve"**, onClick `router.push(\`/login?redirect=/rooms/${id}\`)`. Authenticated: **"Reserve Now"**, disabled until a valid full range is selected or while the request is in flight; onClick → `createRoomReservation` → `toast.success("Reservation confirmed!")` → `router.push("/dashboard")`; on error extract `message` from `AuthError.body` (checkout page pattern, `checkout/page.tsx` lines 103-124) → `toast.error(...)`.
- **D-10 (Login redirect):** The login page currently ignores query params (`router.push("/dashboard")` always). To make D-09's redirect meaningful, `login/page.tsx` reads `redirect` via `useSearchParams()` in a `Suspense`-wrapped inner component (the `shop/success/page.tsx` pattern — production build FAILS without the Suspense boundary on a prerendered page; Next docs §use-search-params "Missing Suspense boundary with useSearchParams") and pushes to it only when it is a same-origin relative path (`startsWith("/")` && `!startsWith("//")` — open-redirect guard), falling back to `/dashboard`.
- **D-11 (i18n):** Plain English only — NO `useTranslations` (rooms list page convention).
- **D-12 (Tests):** Unit-test ONLY the pure helpers (`src/lib/roomBooking.ts`). Do NOT render react-day-picker in jsdom (finicky). Follow the PDP test conventions: vitest + plain matchers, no jest-dom.

<execution_context>
@/Users/gabrielesuardi/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/gabrielesuardi/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

@src/lib/api.ts
# Read fully before editing. Key facts:
# - `API_BASE_URL` = NEXT_PUBLIC_API_URL || "http://localhost:8080"
# - `apiFetch<T>(path, options)` (lines 188-210) adds Content-Type + Bearer (getAuthHeaders, lines 177-186) and redirects on 401/403.
# - `Room` interface at lines 296-303: `{ id, name, description, pricePerNight, amenities: string[], imageUrls: string[] }` — add `maxCapacity?: number` here.
# - `getRoomImageUrl(imageUrl)` (lines 305-308): returns as-is if it starts with http, else prepends API_BASE_URL. Reuse — do not reimplement.
# - `fetchRooms()` at lines 310-312. Add the three new room/reservation functions directly after it.
# - `AuthError` (lines 62-72) carries `status` + `body` (raw JSON body). The checkout page extracts `message` from it.

@src/app/[locale]/(vetrina)/shop/[id]/page.tsx
# THE structural reference (just refactored to natural heights, 2026-08-03). Copy these patterns:
# - `GalleryImage` component (lines 37-88): natural branch = `<Image src alt width={800} height={800} unoptimized preload={preload} className={cn("w-full h-auto rounded-xl object-cover", className)} onError={() => setFailed(true)} />`, failed branch = ImageOff in `w-full aspect-video bg-muted`. For THIS page use width={1200} height={800} per user spec (D-03).
# - `use(params)` at line 102: `const { id } = use(params);` with prop type `{ params: Promise<{ id: string }> }`.
# - Fetch pattern (lines 114-135): useEffect with `cancelled` guard, `setError("Failed to load ...")` catch.
# - Loading skeleton (lines 189-205): Skeleton blocks for gallery + text lines.
# - `preload` on first image only (`preload={i === 0}`); `unoptimized` on ALL images (SSRF fix, STATE 260710-b4e).
# - `cn` from `@/lib/utils` for conditional classes.

@src/app/[locale]/(vetrina)/shop/success/page.tsx
# Pattern for Suspense-wrapped useSearchParams (lines 3-17, 85-98): inner component calls `useSearchParams()`, default export wraps it in `<Suspense fallback={...}>`. Copy this structure for the login page change (D-10).

@src/app/[locale]/(vetrina)/checkout/page.tsx
# AuthError message extraction (lines 103-124): `if (err instanceof AuthError) { const body = err.body as Record<string, unknown> | null; const message = body && typeof body === "object" && "message" in body ? String((body as { message: string }).message) : null; ... }`.

@src/app/[locale]/(vetrina)/_components/RoomCard.tsx
# Modify in place. Current structure: `Card > div.relative.h-48.w-full.bg-muted > (Image fill + prev/next buttons z-10 + dots z-10) > CardHeader(CardTitle, CardDescription) > CardContent(price, amenities)`. The carousel buttons are z-10 INSIDE the image container — a full-card Link would nest interactive elements inside an anchor (invalid). See Task 3 for the overlay-Link approach.

@src/app/[locale]/(auth)/login/page.tsx
# Modify in place. Currently `export default function LoginPage()` renders the form directly and `router.push("/dashboard")` on success (line 27). The page is `"use client"` and prerendered → useSearchParams MUST go inside a Suspense boundary (D-10).

@src/app/[locale]/(vetrina)/shop/[id]/page.test.tsx
# Test conventions: `vi.mock("@/lib/api", ...)` with per-function mocks via `vi.hoisted`; `vi.mock("@/context/AuthContext", () => ({ useAuth: () => ({ ... }) }))`; `vi.mock("next/navigation", ...)`; render via `await act(async () => { render(<Component params={Promise.resolve({ id: "p1" })} />); })`; NO jest-dom — plain matchers (`.toBeDefined()`, `.toBeNull()`, `.toContain()`, `.toHaveLength()`).

@src/components/ui/button.tsx
# `buttonVariants` is exported (line 58) — the shadcn calendar imports it for day/nav cells. Variants: default, outline, secondary, ghost, destructive, link; sizes: default, xs, sm, lg, icon...

<interfaces>
From src/lib/api.ts (executor uses these directly — no exploration needed):

```typescript
export interface Room {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  amenities: string[];
  imageUrls: string[];
  maxCapacity?: number;   // <- ADD (D-02); render capacity UI only when defined
}

export interface RoomReservationRequest {   // <- ADD (D-02)
  roomId: string;
  checkInDate: string;    // "yyyy-MM-dd"
  checkOutDate: string;   // "yyyy-MM-dd"
}

export async function fetchRoom(id: string): Promise<Room> { return apiFetch<Room>(`/api/rooms/${id}`); }
export async function fetchRoomBookedDates(id: string): Promise<string[]> { return apiFetch<string[]>(`/api/rooms/${id}/booked-dates`); }
export async function createRoomReservation(req: RoomReservationRequest): Promise<unknown> {
  return apiFetch<unknown>("/api/reservations/rooms", { method: "POST", body: JSON.stringify(req) });
}
```

From src/context/AuthContext.tsx: `useAuth(): { user: UserResponse | null; isAuthenticated: boolean; loading: boolean; login; logout }`.

From react-day-picker v9 (after install): `import { DayPicker } from "react-day-picker"; import type { DateRange } from "react-day-picker";`
- `mode="range"`, `selected?: DateRange`, `onSelect?: (range: DateRange | undefined) => void`
- `disabled` accepts a matcher array: `Matcher[]` where a matcher is a `Date`, a `{ before: Date }`/`{ after }`/`{ from, to }` object, a predicate, etc.

From src/lib/roomBooking.ts (created in Task 2 — contract Task 3 consumes):
```typescript
export function toDateKey(d: Date): string;                                   // format(d, "yyyy-MM-dd") — canonical local key
export function computeNights(from: Date, to: Date): number;                  // Math.max(0, differenceInDays(to, from))
export function findBlockedDate(
  from: Date, to: Date, blockedKeys: ReadonlySet<string>, todayKey: string
): string | null;  // first blocked key strictly BETWEEN from/to (booked or past), else null
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install react-day-picker + date-fns and extend the API client</name>
  <files>package.json, package-lock.json, src/lib/api.ts</files>
  <action>
    Install and extend the API client exactly as follows.

    1. **Legitimacy check first (T-260803-GIM-SC mitigation):** run `npm view react-day-picker name description license` and `npm view date-fns name description license`. Both are canonical mainstream packages (react-day-picker is the official shadcn/ui Calendar dependency, ~10M weekly downloads; date-fns is already present in package-lock.json as a transitive dependency at `^4.0.0`, lines ~549-562). Record the verified names in the SUMMARY. Then `npm install react-day-picker date-fns` (npm ONLY — never pnpm/yarn). Accept whatever current `react-day-picker` v9.x resolves; it is React 19-compatible. Confirm `date-fns` lands as a direct dependency (v4.x — `differenceInDays`, `format`, `eachDayOfInterval`, `addDays` all exist in v4).

    2. **In `src/lib/api.ts`, add `maxCapacity` to the Room interface** (line ~296): `maxCapacity?: number;` — optional, backend may not return it. No other Room changes.

    3. **In `src/lib/api.ts`, directly after `fetchRooms()` (line ~312), add** the `RoomReservationRequest` interface and the three functions from the `<interfaces>` block above, byte-for-byte per the contract. All three reuse `apiFetch` — which auto-adds `Authorization: Bearer <token>` (via `getAuthHeaders`) and redirects on 401/403 — so no new auth plumbing. Do not add any new helper or URL building; `fetchRoomBookedDates` returns the raw `string[]` of `"yyyy-MM-dd"` dates.

    Avoid: hand-rolling fetch/headers anywhere (always `apiFetch`); touching any other existing function or interface; importing anything new into api.ts.
  </action>
  <verify>
    <automated>npm ls react-day-picker date-fns</automated>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>package.json lists `react-day-picker` and `date-fns` as direct dependencies; `src/lib/api.ts` exports `RoomReservationRequest`, `fetchRoom`, `fetchRoomBookedDates`, `createRoomReservation`, and `Room` has optional `maxCapacity?: number`; tsc clean.</done>
</task>

<task type="auto">
  <name>Task 2: Create the shadcn Calendar component and the pure booking helpers (+ unit tests)</name>
  <files>src/components/ui/calendar.tsx, src/lib/roomBooking.ts, src/lib/roomBooking.test.ts</files>
  <action>
    Create two modules plus their unit tests. The helpers must be pure (no react-day-picker, no DOM, no React) so they unit-test cheaply.

    1. **`src/components/ui/calendar.tsx`** — the standard shadcn calendar (react-day-picker v9), `"use client"`. Exports `CalendarProps` (type) and `Calendar` (component):
       - Imports: `DayPicker` from `"react-day-picker"`; `ChevronLeft, ChevronRight` from `"lucide-react"`; `buttonVariants` from `"@/components/ui/button"`; `cn` from `"@/lib/utils"`.
       - `export type CalendarProps = React.ComponentProps<typeof DayPicker>`
       - Component signature `function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps)`.
       - Renders `<DayPicker showOutsideDays={showOutsideDays} className={cn("w-fit p-3", className)} classNames={cn({...})}` where `classNames` uses the shadcn map — notably: `months: "flex flex-col", month: "space-y-4", caption: "flex justify-center pt-1 relative items-center", caption_label: "text-sm font-medium", nav: "flex items-center gap-1", nav_button: cn(buttonVariants({ variant: "outline" }), "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"), nav_button_previous: "absolute left-1", nav_button_next: "absolute right-1", table: "w-full border-collapse space-y-1", head_row: "flex", head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]", row: "flex w-full mt-2", cell: cn("relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"), day: cn(buttonVariants({ variant: "ghost" }), "size-8 p-0 font-normal aria-selected:opacity-100"), day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground", day_today: "bg-accent text-accent-foreground", day_outside: "text-muted-foreground opacity-50", day_disabled: "text-muted-foreground opacity-50", day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground", day_hidden: "invisible"`} `{...props} />`. This is the current shadcn v2 registry calendar — if any class key fails, use the same DayPicker v9 classNames contract (day/cell/selected/disabled keys are the stable part). Do not add `locale`/`mode` defaults — callers pass them.

    2. **`src/lib/roomBooking.ts`** — three pure exports (contract in `<interfaces>`):
       - `toDateKey(d: Date): string` → `format(d, "yyyy-MM-dd")` (date-fns). Canonical local key for Set comparisons AND for the reservation payload.
       - `computeNights(from: Date, to: Date): number` → `Math.max(0, differenceInDays(to, from))` — 0 when `to <= from` or equal days.
       - `findBlockedDate(from: Date, to: Date, blockedKeys: ReadonlySet<string>, todayKey: string): string | null` → iterate `eachDayOfInterval({ start: addDays(from, 1), end: addDays(to, -1) })` (STRICTLY between endpoints, D-07 — endpoints are already guaranteed non-disabled by react-day-picker); for each day compute `const key = toDateKey(d); if (blockedKeys.has(key) || key < todayKey) return key;` (`yyyy-MM-dd` compares lexicographically, so `key < todayKey` catches past dates); return `null` when the interior is clean. Import only `addDays, differenceInDays, eachDayOfInterval, format` from `date-fns`. No comments about "future features" — this IS the final logic.

    3. **`src/lib/roomBooking.test.ts`** — plain vitest, NO jsdom, NO jest-dom (plain matchers only). Use LOCAL dates (`new Date(2026, 7, 10)` etc.) so `toDateKey` is deterministic in any TZ. Test cases:
       - `toDateKey`: `new Date(2026, 7, 10)` → `"2026-08-10"` (zero-padding month/day).
       - `computeNights`: adjacent days → 1; `new Date(2026,7,1)` → `new Date(2026,7,5)` → 4; `to < from` → 0; same day → 0.
       - `findBlockedDate`:
         - adjacent from/to (no interior) → `null`
         - clean interior → `null`
         - interior contains a booked key → returns that key
         - interior contains only a past date (key < todayKey) → returns it
         - booked endpoint only (from or to itself is in blockedKeys) → `null` (endpoints excluded by design, D-07)

    Avoid: rendering the Calendar in any test; importing the page; adding jest-dom; extending the helper API beyond the three exports (Task 3's page depends on exactly this contract).
  </action>
  <verify>
    <automated>npx vitest run "src/lib/roomBooking.test.ts"</automated>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>calendar.tsx compiles and exports `Calendar` + `CalendarProps` (DayPicker-backed, buttonVariants-based classes); roomBooking.ts exports exactly `toDateKey`, `computeNights`, `findBlockedDate`; all roomBooking unit tests pass; tsc clean.</done>
</task>

<task type="auto">
  <name>Task 3: Build the Room Details page, link RoomCard to it, and honor the login redirect</name>
  <files>src/app/[locale]/(vetrina)/rooms/[id]/page.tsx, src/app/[locale]/(vetrina)/_components/RoomCard.tsx, src/app/[locale]/(auth)/login/page.tsx</files>
  <action>
    Build the page and the two wiring edits. Follow the PDP reference patterns (`shop/[id]/page.tsx`) and the D-03…D-11 decisions.

    ## 3a. Create `src/app/[locale]/(vetrina)/rooms/[id]/page.tsx` (`"use client"`)

    **Imports:** `use, useEffect, useMemo, useState` from react; `Image` from `next/image`; `useRouter` from `next/navigation`; `Card, CardContent, CardHeader, CardTitle` from `@/components/ui/card`; `Button` from `@/components/ui/button`; `Calendar` from `@/components/ui/calendar`; `Skeleton` from `@/components/ui/skeleton`; `Separator` from `@/components/ui/separator`; `cn` from `@/lib/utils`; `useAuth` from `@/context/AuthContext`; `toast` from `sonner`; `type DateRange` from `react-day-picker`; `AuthError, createRoomReservation, fetchRoom, fetchRoomBookedDates, getRoomImageUrl, type Room` from `@/lib/api`; `computeNights, findBlockedDate, toDateKey` from `@/lib/roomBooking`; lucide icons: `Wifi, Car, Coffee, Waves, Snowflake, Users, Check, ImageOff, CalendarDays` (+ any extras needed for the amenity map).

    **Local `GalleryImage` component** (D-03): props `{ src, alt, className, preload }: { src: string; alt: string; className?: string; preload?: boolean }`. Failed state (`useState`) → `ImageOff` in `cn("flex aspect-video w-full items-center justify-center rounded-xl bg-muted", className)`. Success → `<Image src alt width={1200} height={800} unoptimized preload={preload} className={cn("w-full h-auto object-cover rounded-xl", className)} onError={() => setFailed(true)} />`. NO `fill`, NO `sizes`, NO `priority`.

    **Component state:**
    - `const { id } = use(params);` — prop type `{ params: Promise<{ id: string }> }`
    - `const [room, setRoom] = useState<Room | null>(null);`
    - `const [bookedDates, setBookedDates] = useState<string[]>([]);`
    - `const [loading, setLoading] = useState(true);`
    - `const [error, setError] = useState<string | null>(null);`
    - `const [selected, setSelected] = useState<DateRange | undefined>();`
    - `const [submitting, setSubmitting] = useState(false);`
    - `const { isAuthenticated, loading: authLoading } = useAuth();` (D-09 — `authLoading` distinct from data `loading`)
    - `const router = useRouter();`

    **Data fetch** (PDP pattern, cancelled-guard): `useEffect` on `[id]` → `Promise.all([fetchRoom(id), fetchRoomBookedDates(id)])` → `setRoom(r); setBookedDates(dates);` catch → `setError("Failed to load room. Please try again later.")`; finally `setLoading(false)`; cleanup sets `cancelled = true`.

    **Derived values:**
    - `const fullImageUrls = useMemo(() => (room?.imageUrls ?? []).map(getRoomImageUrl), [room]);` (D-02 — reuse `getRoomImageUrl`, never reimplement)
    - `const displayedImages = fullImageUrls.slice(0, 5);` `const extraCount = fullImageUrls.length - 5;`
    - `const bookedKeySet = useMemo(() => new Set(bookedDates), [bookedDates]);`
    - `const todayKey = toDateKey(new Date());`
    - `const disabledDates = useMemo(() => [{ before: new Date() }, ...bookedDates.map((d) => new Date(`${d}T00:00:00`))], [bookedDates]);` (D-06 — local-midnight Dates avoid TZ drift)
    - `const nights = selected?.from && selected?.to ? computeNights(selected.from, selected.to) : 0;`
    - `const total = room ? nights * room.pricePerNight : 0;`

    **`handleSelect(range: DateRange | undefined)`** (D-07): `if (!range?.from) { setSelected(undefined); return; }`; `if (!range.to) { setSelected({ from: range.from }); return; }`; `if (range.to.getTime() <= range.from.getTime()) { setSelected({ from: range.from }); return; }`; then `const blocked = findBlockedDate(range.from, range.to, bookedKeySet, todayKey);` — if blocked: `toast.error("Selected dates overlap with an existing booking."); setSelected({ from: range.from }); return;` (reset to check-in only so the user picks a new check-out); else `setSelected({ from: range.from, to: range.to });`.

    **`handleReserve()`** (D-08/D-09): guard `!selected?.from || !selected?.to || !room || submitting`; `setSubmitting(true)`; `try { await createRoomReservation({ roomId: room.id, checkInDate: toDateKey(selected.from), checkOutDate: toDateKey(selected.to) }); toast.success("Reservation confirmed!"); router.push("/dashboard"); }` `catch (err) {` extract `message` from `AuthError.body` (checkout pattern — `body && typeof body === "object" && "message" in body`); `toast.error(message || "Failed to create reservation. Please try again.");` `} finally { setSubmitting(false); }`.

    **JSX layout** (`<div className="mx-auto max-w-7xl px-4 py-16 md:px-8">`):

    - **Loading** (`loading && !room`): gallery skeleton `<div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><Skeleton className="h-72 w-full rounded-xl sm:col-span-2" /><div className="space-y-4"><Skeleton className="h-32 w-full rounded-xl" /><Skeleton className="h-32 w-full rounded-xl" /></div></div>` + text skeleton block (name/price/description lines, PDP lines 197-204 style) + widget skeleton `<Skeleton className="h-96 w-full rounded-xl" />` in the right column of the same `lg:grid-cols-[1fr_380px]` grid.
    - **Error** (`error && !room`): `<div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>` (PDP pattern).
    - **Loaded** (`room`):
      - **Gallery section** (D-04): `{fullImageUrls.length === 0 ? (<div className="flex aspect-video w-full items-center justify-center rounded-xl bg-muted"><ImageOff className="size-10 text-muted-foreground/30" aria-hidden /></div>) : (<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{displayedImages.map((img, i) => (<div key={img} className={cn("group overflow-hidden rounded-xl", i === 0 && "sm:col-span-2")}><GalleryImage src={img} alt={i === 0 ? room.name : `${room.name} photo ${i + 1}`} preload={i === 0} className="transition duration-500 hover:scale-105 group-hover:brightness-110" /></div>))}{extraCount > 0 && (<span className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">+{extraCount} more</span>)}</div>)}` — the `+{n} more` badge overlays the LAST displayed image (wrap that image's wrapper in `relative` and position the badge inside it; give the badge the `absolute` placement there). On mobile (`grid-cols-1`) all images stack full-width at natural height.
      - **Two-column body**: `<div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]">` (D-05):
        - **Left column:** `<h1 className="font-heading text-3xl font-semibold md:text-4xl">{room.name}</h1>`; price `<p className="mt-3 text-2xl font-semibold text-accent">€{room.pricePerNight.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/ night</span></p>`; capacity `{room.maxCapacity !== undefined && room.maxCapacity > 0 && (<p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Users className="size-4 text-accent" aria-hidden /> Up to {room.maxCapacity} guests</p>)}` (D-02 — render ONLY when defined); description `<p className="mt-5 leading-relaxed text-muted-foreground">{room.description}</p>`; `<Separator className="my-8" />`; Amenities: `<h2 className="font-heading text-lg font-semibold">Amenities</h2>` + `<ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">` where each amenity renders `<li className="flex items-center gap-2.5 text-sm text-muted-foreground"><Icon className="size-4 text-accent" aria-hidden />{amenity}</li>` — Icon from a keyword map: lowercase the amenity, match on `wifi → Wifi`, `parking → Car`, `breakfast → Coffee`, `pool → Waves`, `air conditioning`/`air-conditioning`/`ac → Snowflake`, default → `Check`. Use `const AMENITY_ICONS: Record<string, LucideIcon>` (type from `lucide-react`) with the default `Check`.
        - **Right column — booking widget** (D-05/D-06/D-08/D-09): `<Card className="h-fit lg:sticky lg:top-24">` with `<CardHeader><CardTitle className="font-heading text-lg font-semibold"><CalendarDays className="mr-2 inline-block size-4 text-accent" aria-hidden />Book your stay</CardTitle></CardHeader>` and `<CardContent className="space-y-4">`:
          - `<Calendar mode="range" numberOfMonths={1} selected={selected} onSelect={handleSelect} disabled={disabledDates} className="mx-auto" />`
          - Price breakdown, shown only when `nights > 0 && selected?.from && selected?.to`: `<div className="space-y-1.5 rounded-md bg-muted p-3 text-sm"><div className="flex justify-between"><span>€{room.pricePerNight.toFixed(2)} × {nights} night{nights !== 1 ? "s" : ""}</span><span>€{total.toFixed(2)}</span></div><Separator className="my-2" /><div className="flex justify-between font-semibold"><span>Total</span><span>€{total.toFixed(2)}</span></div></div>`
          - Reserve button: `{authLoading ? (<Button disabled className="w-full" size="lg">…</Button>) : !isAuthenticated ? (<Button variant="default" size="lg" className="w-full" onClick={() => router.push(`/login?redirect=/rooms/${id}`)}>Log in to Reserve</Button>) : (<Button variant="default" size="lg" className="w-full" disabled={!selected?.from || !selected?.to || submitting} onClick={handleReserve}>{submitting ? "Reserving..." : "Reserve Now"}</Button>)}` (D-09 — disabled while `authLoading` prevents the login-button flash).

    **Avoid:** `priority` anywhere (grep gate below — `preload` only); `max-h`/fixed heights on gallery images (natural height, D-03); reimplementing URL prepending; `useTranslations`; a lightbox; adding `sizes` to non-fill images; mutating `RoomCard` or `login/page.tsx` from this file.

    ## 3b. Edit `src/app/[locale]/(vetrina)/_components/RoomCard.tsx` (link to detail)

    Add `import Link from "next/link";`. Two edits:
    1. **Image overlay link:** inside the `div.relative.h-48.w-full.bg-muted` container, immediately after the `<Image … />` element (before the carousel buttons), insert `<Link href={`/rooms/${room.id}`} aria-label={`View ${room.name}`} className="absolute inset-0 z-[5]" />`. The prev/next buttons and dots already use `z-10`, so they stay clickable above the overlay (no nested interactive elements — D-04 RoomCard decision). The overlay makes the image area navigate; buttons keep working.
    2. **Title link:** wrap the `CardTitle` content: `<CardTitle className="font-heading text-xl font-semibold"><Link href={`/rooms/${room.id}`} className="transition-colors hover:text-accent">{room.name}</Link></CardTitle>`.
    Nothing else in the file changes (carousel logic, price, amenity chips, image states untouched). No `"use client"` directive needed — the parent `rooms/page.tsx` is a client component and RoomCard already uses hooks.

    ## 3c. Edit `src/app/[locale]/(auth)/login/page.tsx` (honor `?redirect=`, D-10)

    Follow the `shop/success/page.tsx` structure exactly:
    1. Add `import { Suspense } from "react";` and `import { useSearchParams } from "next/navigation";` (merge into the existing `useRouter` import).
    2. Rename the current default export body to an inner `function LoginForm()` — it keeps ALL existing markup/state/handlers. Inside it add `const searchParams = useSearchParams();` and `const redirect = searchParams.get("redirect");`.
    3. In `handleSubmit`, replace `router.push("/dashboard");` (line 27) with: `const target = redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/dashboard"; router.push(target);` (open-redirect guard — only same-origin relative paths).
    4. New default export: `export default function LoginPage() { return (<Suspense fallback={null}><LoginForm /></Suspense>); }` — the Suspense boundary is REQUIRED (prerendered page + useSearchParams → production build fails with "Missing Suspense boundary with useSearchParams" otherwise).
    Nothing else in the file changes.

    **Mid-plan note:** no page-level rendering tests are added — react-day-picker in jsdom is flaky (D-12); the pure helpers are already covered by Task 2's tests. The PDP suite must remain green.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
    <automated>npx vitest run</automated>
    <automated>grep -v '^#' "src/app/[locale]/(vetrina)/rooms/[id]/page.tsx" | grep -c "priority"</automated>
    <automated>grep -c "preload" "src/app/[locale]/(vetrina)/rooms/[id]/page.tsx"</automated>
    <automated>npm run lint</automated>
  </verify>
  <done>The page renders name, price, capacity (when defined), description, and amenity list; bento gallery (first image large, up to 4 stacked beside it, count badge when >5, muted placeholder at 0) uses `getRoomImageUrl` + `width={1200} height={800} unoptimized preload w-full h-auto object-cover` and zero `priority` occurrences (grep count == 0, comments excluded); booking widget uses Calendar mode="range" with past+booked disabled, overlap check resetting to `{ from }` with a toast, nights × price breakdown via computeNights, "Log in to Reserve" → `/login?redirect=/rooms/{id}` when unauthenticated, "Reserve Now" → createRoomReservation → success toast → `/dashboard`, in-flight disabled state; RoomCard image+tile link to `/rooms/${room.id}` while carousel buttons stay clickable; login page honors safe `?redirect=` via Suspense-wrapped useSearchParams; full vitest suite green; tsc clean; lint clean on touched files (pre-existing debt in unrelated files documented 260731-mi2 is not in scope).</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Spring Boot API → Next.js client | `Room` payload (`imageUrls`, `maxCapacity`), `booked-dates` strings, and `imageUrls` values cross into the browser and drive layout, calendar disabling, and image rendering |
| Next.js client → Spring Boot API | Reservation POST body `{ roomId, checkInDate, checkOutDate }` crosses out with JWT auth (apiFetch) |
| URL → Next.js client | Dynamic `id` segment; `?redirect=` query param on the login page |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-260803-GIM-01 | Tampering | Reservation POST body dates | transfer | Frontend formats `yyyy-MM-dd` local keys (D-08) and sends via `apiFetch` (Bearer JWT). Real authority is backend-side: server must validate availability/overlap/idempotency against its own booking data. Client checks are UX, not security. |
| T-260803-GIM-02 | Tampering | Booked-date strings → Date objects / range math | mitigate | Compare canonical `"yyyy-MM-dd"` string keys (lexicographic, TZ-proof) in `findBlockedDate`; parse booked dates as local-midnight `new Date(`${d}T00:00:00`)` so UTC TZ shifts cannot misalign disabled days; `computeNights` floors at 0. |
| T-260803-GIM-03 | Tampering | `?redirect=` on /login | mitigate | Only accept same-origin relative paths: `redirect.startsWith("/") && !redirect.startsWith("//")` (blocks `//evil.com` protocol-relative open redirects); anything else falls back to `/dashboard`. |
| T-260803-GIM-04 | Information Disclosure | `GET /api/rooms/{id}/booked-dates` occupancy exposure | accept | Availability data is standard public hotel UI data; backend controls what it exposes (unauthenticated read is the existing API contract, same as rooms list). |
| T-260803-GIM-05 | Denial of Service | Large `imageUrls` arrays / huge intrinsic images | mitigate | Displayed gallery capped at 5 (`slice(0, 5)`) + `w-full` bounds width and natural aspect keeps height proportional; `onError` fallback keeps layout from collapsing. |
| T-260803-GIM-06 | Spoofing | Range selection bypassing disabled dates | mitigate | D-07 overlap check runs on EVERY completed range (`findBlockedDate` over the strictly-between interior) — react-day-picker only blocks disabled endpoints, so the manual check is the guarantee. |
| T-260803-GIM-SC | Tampering | npm/pip/cargo installs | mitigate | Only `react-day-picker` + `date-fns`, both canonical: date-fns already present in package-lock (transitive, vetted); Task 1 runs `npm view react-day-picker name description license` as an automated legitimacy check before install. No blocking human checkpoint needed — these are the two mainstream packages required by shadcn/ui Calendar and the user-locked spec (D-01). Status: [ASSUMED] with automated evidence. |

No other packages are installed; the two PDP/Success/checkout patterns referenced introduce no new trust surfaces.
</threat_model>

<verification>
- `npm ls react-day-picker date-fns` — both listed as direct deps
- `npx vitest run "src/lib/roomBooking.test.ts"` — helper unit tests pass
- `npx vitest run` — full suite stays green (PDP + all existing tests unaffected)
- `npx tsc --noEmit` — zero type errors (validates `preload` on next/image 16.2.10, `use(params)`, react-day-picker v9 types)
- `npm run lint` — no errors in touched files (pre-existing lint debt in unrelated files is documented 260731-mi2 and out of scope)
- Grep gate: `grep -v '^#' "src/app/[locale]/(vetrina)/rooms/[id]/page.tsx" | grep -c "priority"` → 0 (no deprecated prop; `preload` used instead)
- Grep gate: `grep -c "preload" "src/app/[locale]/(vetrina)/rooms/[id]/page.tsx"` → ≥ 1 (first gallery image preloads)
- Manual smoke (optional, after automation): `npm run dev` → open `/en/rooms`, click a room card → gallery bento renders at natural heights; calendar disables past + booked days; a range spanning a booked day resets with the overlap toast; price breakdown updates; unauthenticated "Log in to Reserve" → login → returns to the room; authenticated "Reserve Now" POSTs and redirects to `/dashboard`
</verification>

<success_criteria>
- `npm install react-day-picker date-fns` completed (npm only); both are direct deps
- API client extended exactly per D-02: `Room.maxCapacity?`, `RoomReservationRequest`, `fetchRoom`, `fetchRoomBookedDates`, `createRoomReservation` — all through `apiFetch`
- `src/components/ui/calendar.tsx` (shadcn Calendar, react-day-picker v9) created and consumed by the booking widget
- `src/lib/roomBooking.ts` + tests: pure `toDateKey` / `computeNights` / `findBlockedDate`, unit-tested, no react-day-picker in jsdom
- Room Details page live at `app/[locale]/(vetrina)/rooms/[id]/page.tsx`: bento gallery (`sm:grid-cols-3`, first image `sm:col-span-2`, natural `w-full h-auto object-cover`, `width=1200 height=800`, `unoptimized`, `preload` on first, count badge >5, 0-image placeholder), `lg:grid-cols-[1fr_380px]` layout with sticky booking Card, plain-English copy (D-11)
- Booking widget: `mode="range"` Calendar, past + booked disabled, strictly-between overlap validation with toast + reset (D-07), `nights × price` breakdown via `differenceInDays` (D-08)
- Auth gating (D-09): no login-button flash (authLoading-disabled state), "Log in to Reserve" → `/login?redirect=/rooms/{id}`, "Reserve Now" → POST → success toast → `/dashboard`, in-flight disabled
- Login page honors safe `?redirect=` (D-10, Suspense-wrapped)
- RoomCard links to the detail page without breaking the carousel buttons
- tsc, full vitest suite, and lint green
</success_criteria>

<output>
Create `.planning/quick/260803-gim-please-build-the-room-details-page-app-l/260803-gim-SUMMARY.md` when done
</output>
