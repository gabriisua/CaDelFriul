---
phase: quick-260803-dwf
plan: 01
subsystem: ui
tags: [pdp, gallery, next-image, tailwind, natural-height, next16-preload]

requires:
  - phase: quick-260731-n84
    provides: count-based gallery branching (0/1/2/3+), bento geometry, slice(0,5) cap, Show all photos buttons
provides:
  - Natural-height PDP gallery: GalleryImage with fillMode prop (natural default / fill opt-in)
  - Desktop gallery (0/1/2/3+ branches) and lightbox at natural aspect ratio — no forced heights
  - priority → preload rename (Next 16 deprecation) across all GalleryImage call sites
  - Mode-aware onError fallback (w-full aspect-video natural / h-full w-full fill)
affects: [pdp, shop, e-commerce]

tech-stack:
  added: []
  patterns:
    - "fillMode prop pattern: GalleryImage natural default, fill opt-in for fixed-size carousel slides"
    - "Mode-aware fallback box that no longer depends on a parent fixed height"

key-files:
  created: []
  modified:
    - "src/app/[locale]/(vetrina)/shop/[id]/page.tsx"
    - "src/app/[locale]/(vetrina)/shop/[id]/page.test.tsx"

key-decisions:
  - "Option A (Natural Height Scaling) locked D-01: remove fill, width/height 800, w-full h-auto rounded-xl object-cover, remove h-[500px]/h-40/md:h-56 from desktop gallery + lightbox"
  - "Mobile snap carousel keeps h-[400px] fill slides (D-02) — uniform slides required for snapping; fillMode opt-in"
  - "priority renamed to preload per Next 16 deprecation (D-04, verified in node_modules/next/dist/docs)"
  - "Desktop grids use gap-4 (D-06); lightbox cells become overflow-hidden rounded-xl"
  - "0-image placeholder becomes flex aspect-video w-full (D-07)"

patterns-established:
  - "fillMode?: boolean on GalleryImage: natural branch renders width={800} height={800} + w-full h-auto rounded-xl object-cover (no fill, no sizes); fill branch unchanged"
  - "Test scoping: querySelectorAll('img[class*=\"h-auto\"]') matches only natural-mode imgs (carousel uses fill, lightbox unmounted)"

requirements-completed: [QT-260803-DWF]

duration: 14min
completed: 2026-08-03
---

# Quick 260803-dwf: Natural-Height PDP Image Gallery Summary

**PDP gallery reworked to natural-height mode: GalleryImage gains a fillMode prop (natural default / fill for the mobile carousel), desktop gallery (0/1/2/3+ branches) and lightbox render at intrinsic aspect ratio via `w-full h-auto rounded-xl object-cover` with `width={800} height={800}` — no more `object-cover` side-cropping in fixed 500px boxes; `priority` renamed to `preload` per Next 16**

## Performance

- **Duration:** ~14 min
- **Started:** 2026-08-03T08:07:23Z (execution began ~08:07 UTC; timing approximated from session window)
- **Completed:** 2026-08-03T08:07:23Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- `GalleryImage` reworked: props `{ src, alt, className, preload, fillMode }`; natural branch renders `<Image width={800} height={800} preload className="w-full h-auto rounded-xl object-cover">` with no `fill`/`sizes`; fill branch byte-identical except `priority` → `preload` (verified against `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` §`preload`/`priority`)
- Desktop gallery count branches at natural heights: 0-case `flex aspect-video w-full`, 1-case full-width `w-full h-auto`, 2-case `grid grid-cols-2 gap-4`, 3+ bento `grid grid-rows-2 gap-4` (keeps `grid-cols-3`/`grid-cols-4` switch, `col-span-2 row-span-2` first image, `row-span-2` 4th, `slice(0, 5)` cap, conditional "Show all photos" button)
- Mobile snap carousel untouched except `fillMode` + `preload` — uniform `h-[400px]` slides with `fill`/`object-cover` preserved (locked D-02)
- Lightbox cells `overflow-hidden rounded-xl` at natural height; `onError` fallback becomes mode-aware (`w-full aspect-video` natural / `h-full w-full` fill — fixes latent fallback collapse in fixed slides and removes reliance on the deleted 500px parent)
- 4 layout tests rewritten to assert natural-height classes (`w-full`, `h-auto`, `rounded-xl`, `object-cover`, `width="800"`, `height="800"`, absence of `h-[500px]`) while keeping structural assertions (grid columns, `grid-rows-2`, `col-span-2 row-span-2`, 5-image cap, conditional button)

## Task Commits

Each task was committed atomically:

1. **Task 1: Rework GalleryImage, desktop gallery, and lightbox to natural-height mode** - `b328f50` (feat)
2. **Task 2: Update the 4 layout tests to assert natural-height classes** - `8a9d670` (test)

## Files Created/Modified

- `src/app/[locale]/(vetrina)/shop/[id]/page.tsx` - GalleryImage with `fillMode`/`preload`; natural-height desktop gallery (0/1/2/3+), lightbox, mode-aware fallback; mobile carousel keeps `h-[400px]` fill slides
- `src/app/[locale]/(vetrina)/shop/[id]/page.test.tsx` - 4 layout tests assert `w-full h-auto rounded-xl object-cover` + `width/height="800"` and absence of `h-[500px]` on grids/wrappers; structural grid assertions kept

## Decisions Made

- Locked decisions D-01..D-09 executed exactly as specified in the plan (natural-height scope, mobile carousel fill retention, `fillMode` API, `preload` rename, bento geometry, `gap-4`, aspect-video 0-case, wrapper cleanup, preserved behaviors)
- No new packages installed

## Deviations from Plan

None - plan executed exactly as written. (The plan's line reference to "the three mobile carousel `GalleryImage` usages (lines ~300-305)" actually resolves to a single usage inside the `fullImageUrls.map`; the intent — add `fillMode`, rename `priority` → `preload` at the mobile call site — was applied exactly.)

---

**Total deviations:** 0 auto-fixed
**Impact on plan:** None

## Issues Encountered

None. Mid-plan test redness between Task 1 and Task 2 occurred exactly as predicted by the plan (old tests asserted `h-[500px]` against new natural-height markup) and was resolved by Task 2's test rewrite; no "fixing early" was performed.

## Known Stubs

None - no placeholder data, mock sources, or `coming soon` text introduced. The gallery reads from `fullImageUrls` (real `getImageUrl` output) in all branches; the 0-case ImageOff placeholder is the intended empty state.

## Threat Flags

None - no new network endpoints, auth paths, file access patterns, or schema changes introduced. The threat register's four mitigations (T-260803-DWF-01..04) were honored: width-bounded natural images, mode-aware fallback box, unchanged `slice(0,5)` cap, unchanged `onError` handling.

## Verification Results

- `npx tsc --noEmit` — PASS (confirms `preload` prop valid in next/image 16.2.10)
- Grep gate `grep -v '^#' "src/app/[locale]/(vetrina)/shop/[id]/page.tsx" | grep -c "h-\[500px\]"` — 0 PASS
- No `h-40` / `md:h-56` remaining in page.tsx (grep count 0)
- No `priority` remaining in page.tsx (grep count 0)
- `npx vitest run "src/app/[locale]/(vetrina)/shop/[id]/page.test.tsx"` — 6/6 PASS
- `npx vitest run` — 2 files, 10/10 PASS
- `npx eslint` on the two touched files — clean (exit 0)
- `npm run lint` — reports 9 errors / 9 warnings, ALL in pre-existing unrelated files (Footer.tsx, Header.tsx, cart/page.tsx, checkout/page.tsx, error.tsx x4, success/page.tsx, SidebarNav.tsx, addresses/page.tsx, profile/page.tsx) — documented debt from quick task 260731-mi2, out of scope per executor instructions

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- PDP gallery renders images at full natural aspect ratio on desktop (all count branches) and in the lightbox; mobile carousel behavior unchanged
- Layout tests now lock in the natural-height contract — future gallery changes will be caught by the `img[class*="h-auto"]` scoped assertions
- Spring Boot API contract and Stripe integration mode remain the standing blockers for Phase 2-5 (unchanged)

---
*Phase: quick-260803-dwf*
*Completed: 2026-08-03*

## Self-Check: PASSED

- Files verified on disk: `src/app/[locale]/(vetrina)/shop/[id]/page.tsx`, `src/app/[locale]/(vetrina)/shop/[id]/page.test.tsx`, `260803-dwf-SUMMARY.md`
- Commits verified in git log: `b328f50` (Task 1), `8a9d670` (Task 2)
