---
phase: quick-260731-mi2
plan: 01
subsystem: vetrina-shop-pdp
tags: [pdp, api-client, fetchProduct, attributes, skeleton, e-commerce]
requires: ["260731-lfb PDP route (mock) — replaced by live data"]
provides: ["/shop/[id] renders real Spring Boot product data via fetchProduct; Product.attributes type; dynamic attribute accordions"]
affects: ["src/lib/api.ts consumers", "future PDP polish plans", "CartContext quantity capping"]
tech-stack:
  added: []
  patterns:
    - "fetchProduct(id) single-resource fetch reusing apiFetch (base URL + Bearer + 401/403 redirect)"
    - "cancelled-guard useEffect data fetching (profile-page pattern)"
    - "getImageUrl-prefixed image arrays for gallery/carousel/lightbox"
    - "TDD RED/GREEN on a client page: vi.hoisted mocks + await act(async render) + afterEach(cleanup)"
    - "dynamic <details> accordions mapped from Record<string,string> attributes with humanized keys"
key-files:
  created:
    - "src/app/[locale]/(vetrina)/shop/[id]/page.test.tsx"
  modified:
    - "src/lib/api.ts"
    - "src/app/[locale]/(vetrina)/shop/[id]/page.tsx"
key-decisions:
  - "Restructured the fetch effect to comply with react-hooks/set-state-in-effect (resets moved into async callbacks; behavior-equivalent for mount fetch)"
  - "Test renders wrapped in await act(async ...) because use(params) suspends on the promise in React 19.2 tests"
  - "Explicit cleanup() in afterEach — vitest globals are off, so testing-library auto-cleanup never runs and DOM leaks between tests"
  - "vi.hoisted() for shared mock fns — direct factory references trigger 'Cannot access before initialization' under vitest hoisting"
patterns-established:
  - "PDP fetch: useState(product/loading/error) + cancelled-guard useEffect + useMemo(getImageUrl) image mapping"
  - "Stock guards mirroring /shop: stepper max = stockQuantity ?? MAX_SAFE_INTEGER; low-stock note only when 0 < stock <= 5; Unavailable button state"
requirements-completed: [QT-260731-MI2]

# Metrics
duration: ~5 min
completed: 2026-07-31
---

# Phase quick-260731-mi2 Plan 01: Refactor PDP to Real API Data Summary

PDP at `/shop/[id]` now fetches the real product via `fetchProduct(id)` — name, price, description, and `getImageUrl`-prefixed images all derive from the Spring Boot API; the lavender-oil mock and features list are gone, Product Details accordions render dynamically from `product.attributes` (hidden when empty), loading skeleton and destructive error banner mirror the `/shop` page, and Add to Cart passes the real `product.id`/price/`getImageUrl` image/`stockQuantity`. TDD: 2 new tests (success + failure) drive the refactor.

## Verification

- `npx tsc --noEmit` — pass (after each task)
- `npm test` — 2 files, 6 tests pass (existing `success` suite + 2 new PDP tests)
- `npx eslint` on the 3 touched files — pass (0 errors/warnings)
- `npm run lint` — full suite still reports 18 pre-existing errors in unrelated files (Header, cart, checkout, profile, addresses, SidebarNav, error pages, Footer — `react-hooks/set-state-in-effect` etc.). Out of scope per scope boundary; all files touched by this task are lint-clean.
- Grep gates: zero mock data (`Lavender Essential Oil`/`Unsplash`/`MockProduct`) in `page.tsx`; `fetchProduct(id)`, `getImageUrl`, `productId: product.id` present

## Tasks & Commits

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Add `fetchProduct` + `attributes` to the API client | `1eea998` | `src/lib/api.ts` (+5) |
| 2 (RED) | Add failing PDP tests for real product data | `f0b1a60` | `src/app/[locale]/(vetrina)/shop/[id]/page.test.tsx` (new) |
| 2 (GREEN) | Refactor PDP to fetch and map real product data | `27f91ed` | `page.tsx`, `page.test.tsx` (+332/−299) |

## Files Created/Modified

- `src/lib/api.ts` — `attributes?: Record<string, string>` added to `Product` (between `imageUrls` and `available`); `fetchProduct(id)` exported reusing `apiFetch`
- `src/app/[locale]/(vetrina)/shop/[id]/page.tsx` — mock removed; cancelled-guard fetch effect; `fullImageUrls` useMemo; skeleton/error branches; dynamic attribute accordions; real-data add-to-cart; stock guards
- `src/app/[locale]/(vetrina)/shop/[id]/page.test.tsx` — 2 tests: fetch success renders heading + `€24.00`; fetch failure renders error banner with no heading

## Decisions Made

- Fetch effect restructured so the only direct effect-body setStates were removed, keeping the file `react-hooks/set-state-in-effect`-clean while preserving mount behavior (loading initializes `true`; error reset happens before `setProduct`; failure clears stale product).
- Button `disabled` includes `!product.available` (mirrors `/shop` disabled logic) even though the plan's step-10 text only lists auth/stock — consistent with the cited `/shop` button states.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] vitest mock hoisting — `vi.hoisted()` required**
- **Found during:** Task 2 (GREEN test run)
- **Issue:** `vi.mock("@/lib/api", () => ({ fetchProduct: mockFetchProduct }))` throws `ReferenceError: Cannot access 'mockFetchProduct' before initialization` — the factory is hoisted above the `const` declarations (the `success/page.test.tsx` convention only works because its mock references are nested inside closures invoked at render time).
- **Fix:** Declared the mock fns via `vi.hoisted(() => ({ ... }))`.
- **Files modified:** `page.test.tsx`
- **Verification:** Test file runs; suite green.
- **Committed in:** `27f91ed` (Task 2 GREEN)

**2. [Rule 1 - Bug] React 19.2 `use(params)` suspends — awaited `act` needed**
- **Found during:** Task 2 (GREEN test run)
- **Issue:** Rendering `<ProductDetailPage params={Promise.resolve({ id: "p1" })} />` synchronously suspends at `use(params)`; React logs "A component suspended inside an `act` scope, but the `act` call was not awaited" and the tree stays empty.
- **Fix:** Wrapped both renders in `await act(async () => { render(...) })` so the settled promise and fetch effect flush inside act.
- **Files modified:** `page.test.tsx`
- **Verification:** Heading + price found; error banner found.
- **Committed in:** `27f91ed` (Task 2 GREEN)

**3. [Rule 1 - Bug] DOM leakage between tests — explicit `cleanup()`**
- **Found during:** Task 2 (GREEN test run)
- **Issue:** The failure test found test 1's leftover heading because `@testing-library/react` auto-cleanup never runs (vitest `globals` not enabled), so each `render` mounts a second tree in the same `document.body`.
- **Fix:** Added `afterEach(() => cleanup())`.
- **Files modified:** `page.test.tsx`
- **Verification:** Failure test now sees only its own tree; suite green.
- **Committed in:** `27f91ed` (Task 2 GREEN)

**4. [Rule 1 - Lint compliance] Effect restructured for `react-hooks/set-state-in-effect`**
- **Found during:** Task 2 (lint verification)
- **Issue:** The plan's exact effect snippet (`setLoading(true); setError(null);` at the top of the effect) trips `react-hooks/set-state-in-effect` (new violation in this file).
- **Fix:** Moved resets into the async callbacks (`setError(null)` before `setProduct` on success; `setProduct(null)` + error in catch). Loading starts `true` and is only lowered in `finally` — behavior-equivalent for the mount fetch.
- **Files modified:** `page.tsx`
- **Verification:** `npx eslint` on task files — 0 errors; all tests still pass.
- **Committed in:** `27f91ed` (Task 2 GREEN)

---

**Total deviations:** 4 auto-fixed (3 test-infrastructure, 1 lint compliance)
**Impact on plan:** All fixes required to get tests/lint green as the plan mandates. No scope creep; no architecture changes. The 18 remaining `npm run lint` failures are pre-existing in files this task did not touch.

## Issues Encountered

- Full `npm run lint` cannot be green for the repo: 18 pre-existing violations exist in untouched files (`Header.tsx`, `cart/page.tsx`, `checkout/page.tsx`, `dashboard/profile/page.tsx`, `dashboard/addresses/page.tsx`, `SidebarNav.tsx`, error pages, `Footer.tsx`). Logged here rather than fixed (scope boundary). Consider a follow-up quick task to clean the pre-existing `react-hooks/set-state-in-effect` violations.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `/shop` and `/shop/[id]` now both consume live API data; PDP closes the listing→detail gap.
- Add to cart from PDP is now a strict improvement over `/shop`'s `http://localhost:8080` hardcode (`getImageUrl` used instead) — a future task could apply the same fix to `/shop`.
- Pre-existing lint debt (18 errors in unrelated files) is the main housekeeping item before any CI lint gate.

---
*Phase: quick-260731-mi2*
*Completed: 2026-07-31*
