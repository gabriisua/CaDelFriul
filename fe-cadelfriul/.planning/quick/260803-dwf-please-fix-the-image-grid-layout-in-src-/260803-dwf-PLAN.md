---
phase: quick-260803-dwf
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - "src/app/[locale]/(vetrina)/shop/[id]/page.tsx"
  - "src/app/[locale]/(vetrina)/shop/[id]/page.test.tsx"
autonomous: true
requirements: [QT-260803-DWF]
user_setup: []

must_haves:
  truths:
    - "A product with 1 image shows it full-width at its natural aspect ratio — no side cropping, no fixed 500px box"
    - "A product with exactly 2 images shows both side by side in a grid-cols-2 grid, each at natural height"
    - "A product with 3+ images shows the bento (first image col-span-2 row-span-2) at natural heights, capped at 5 with the conditional Show all photos button"
    - "Every image still renders with the onError fallback (ImageOff), now in a sensible aspect-video box"
    - "The mobile snap carousel still scrolls with uniform h-[400px] slides"
  artifacts:
    - path: "src/app/[locale]/(vetrina)/shop/[id]/page.tsx"
      provides: "GalleryImage with fillMode prop (natural default / fill for carousel); desktop gallery + lightbox wrappers without forced heights"
      contains: "w-full h-auto rounded-xl object-cover"
    - path: "src/app/[locale]/(vetrina)/shop/[id]/page.test.tsx"
      provides: "Four layout tests asserting natural-height classes (w-full, h-auto, width=800, height=800) and absence of h-[500px]"
      contains: "not.toContain(\"h-[500px]\")"
  key_links:
    - from: "GalleryImage natural branch"
      to: "desktop grid wrappers (group overflow-hidden rounded-xl)"
      via: "w-full h-auto images inside overflow-hidden rounded-xl wrappers"
      pattern: "h-auto"
    - from: "page.test.tsx"
      to: "page.tsx natural-mode images"
      via: "querySelectorAll('img[class*=\"h-auto\"]') scoped to desktop-only"
      pattern: "h-auto"
---

<objective>
Fix the PDP image gallery in `src/app/[locale]/(vetrina)/shop/[id]/page.tsx` so images display **completely, at their natural aspect ratio** instead of being aggressively cropped by `object-cover` inside fixed `h-[500px]` boxes.

Purpose: The n84 gallery uses `fill` + `object-cover` inside `h-[500px]` wrappers (and a `h-[500px] grid-rows-2` bento). Because `object-cover` fills the box and crops overflow, the sides of images are cut off. The user locked **Option A (Natural Height Scaling)**: remove `fill`, give the `<Image>` `width={800} height={800}`, add `w-full h-auto rounded-xl object-cover`, and remove forced heights so the image dictates its own height from its intrinsic aspect ratio.

Output: Reworked `GalleryImage` (natural-height default + `fillMode` opt-in for the mobile carousel), desktop gallery (0/1/2/3+ branches) and lightbox on natural heights, and 4 layout tests updated to assert the new classes. Count-based branching, `slice(0, 5)` cap, conditional "Show all photos" button, and the `onError` fallback are all preserved.

**Locked decisions:**
- **D-01 (Option A scope):** Natural-height mode applies to the **desktop gallery** (all branches: 0/1/2/3+) and the **lightbox thumbnails**. Images render without `fill`, with `width={800} height={800}`, class `w-full h-auto rounded-xl object-cover` (per the user's exact recipe). All forced heights are removed: `h-[500px]` from 1-case, 2-case cells, and the bento container; `h-40 md:h-56` from lightbox cells.
- **D-02 (Mobile carousel — locked, justified):** The mobile snap carousel **keeps** fixed `h-[400px] w-full` slides with `fill` + `object-cover`. Rationale: a snap-mandatory carousel requires uniform slide sizes for predictable snapping, dot alignment, and arrow scrolling; `object-cover` cropping inside a uniform slide is the intended carousel UX and is NOT the "grid" the user complained about. The natural-height fix targets the gallery grid and lightbox only.
- **D-03 (GalleryImage API):** `GalleryImage` gains `fillMode?: boolean` (default `false` = natural). Natural branch: `width={800} height={800}` + `w-full h-auto rounded-xl object-cover`, no `fill`, no `sizes` (irrelevant under `unoptimized` — single src renders). Fill branch: unchanged (`fill`, `object-cover`, `sizes="(max-width: 768px) 100vw, 50vw"`). `onError` → ImageOff fallback preserved in both modes; fallback box becomes mode-aware: `w-full aspect-video` (natural — previously relied on the parent's `h-[500px]`, which no longer exists) and `h-full w-full` (fill — fixes the latent collapse where the fallback shrank to icon height in fixed slides).
- **D-04 (Next 16 deprecation, per AGENTS.md):** Rename the `priority` prop to `preload` (Next 16.2.10 deprecates `priority` in favor of `preload` — verify against `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` §§`preload`/`priority`). Same first-image-only semantics; all call sites pass `preload` where they passed `priority`.
- **D-05 (Bento geometry):** The 3+ bento keeps `grid-rows-2`, `grid-cols-3`/`grid-cols-4` switch, first-image `col-span-2 row-span-2`, 4th-image `row-span-2` (exactly 4 images), `slice(0, 5)` cap, and auto-placement (no `grid-flow-col`, no explicit `col-start`/`row-start` — n84 verified auto-placement fills the 2×N grid correctly). Only `h-[500px]` is removed; rows become content-driven (uniform-aspect product images make the `row-span-2` first image exactly fill its 2×2 cell, so no cropping).
- **D-06 (Gap & radius):** Desktop gallery grids use `gap-4` (was `gap-2`; user named `gap-4`). Mobile carousel (`gap-2`) and lightbox (`gap-2`) gaps untouched. Border radiuses stay clean: grid wrappers `overflow-hidden rounded-xl`, lightbox cells become `overflow-hidden rounded-xl` (was `rounded-lg` — matches the image's own `rounded-xl`).
- **D-07 (0-image placeholder):** `flex h-[500px] items-center justify-center rounded-xl bg-muted` → `flex aspect-video w-full items-center justify-center rounded-xl bg-muted` for visual coherence with the natural-height gallery (no test covers this branch; nothing to update).
- **D-08 (Wrappers):** Desktop gallery image wrappers become `group overflow-hidden rounded-xl` (drop `relative` — no `fill` children remain — and all fixed heights). `overflow-hidden` stays so the `hover:scale-105` zoom stays clipped. The outer desktop anchor keeps `relative hidden md:block` (it is the positioning anchor for the absolute "Show all photos" button).
- **D-09 (Preserved behavior):** Count-based branching (0/1/2/3+), `imgCount > 5` "Show all photos" button on desktop AND mobile, alt pattern (first = `product.name`, rest = `"… photo {i+1}"`), and `onError` fallback all stay exactly as n84 left them.

<execution_context>
@/Users/gabrielesuardi/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/gabrielesuardi/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

@src/app/[locale]/(vetrina)/shop/[id]/page.tsx
# Current gallery structure (read before editing):
# - `GalleryImage` (lines 37-72): `fill` + `object-cover` + `unoptimized` + `priority` + `sizes` + `onError` → ImageOff fallback div.
# - Desktop block (lines 200-287): outer `relative hidden md:block`; 0-case `flex h-[500px] ... bg-muted`; 1-case `group relative h-[500px] overflow-hidden rounded-xl`; 2-case `grid grid-cols-2 gap-2` with `group relative h-[500px] overflow-hidden rounded-xl` cells; 3+ bento `grid h-[500px] grid-rows-2 gap-2` with `grid-cols-3`/`grid-cols-4` switch and `col-span-2 row-span-2` first cell; "Show all photos" button when `imgCount > 5`.
# - Mobile block (lines 290-351): `relative md:hidden` snap-x carousel, slides `group relative h-[400px] w-full shrink-0 snap-center overflow-hidden rounded-xl`.
# - Lightbox (lines 354-376): DialogContent with `grid grid-cols-2 gap-2 md:grid-cols-3` of `relative h-40 overflow-hidden rounded-lg md:h-56` cells.
# - `fullImageUrls` = useMemo over `product.imageUrls.map(getImageUrl)`; `imgCount = fullImageUrls.length`.

@node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md
# Per AGENTS.md ("This is NOT the Next.js you know"): Next 16.2.10 deprecates `priority` in favor of `preload` (doc §`priority`: "Starting with Next.js 16, the `priority` property has been deprecated"). `width`/`height` are required unless `fill` (doc §`width and height`). Non-fill images use CSS for rendered size; `w-full h-auto` preserves aspect ratio (doc "Good to know" near §`style`).

<interfaces>
From page.tsx (current → target). Executor uses these directly, no exploration needed:

Current GalleryImage (lines 37-72):
```tsx
function GalleryImage({ src, alt, className, priority }: {
  src: string; alt: string; className?: string; priority?: boolean;
}) {
  // fill + object-cover + unoptimized + sizes + onError -> ImageOff fallback div
}
```
Target signature: `{ src, alt, className, preload, fillMode }: { src: string; alt: string; className?: string; preload?: boolean; fillMode?: boolean }`.

Call sites that MUST pass `fillMode` (D-02): the 3 mobile carousel `GalleryImage` usages (lines ~300-305).
Call sites that use natural mode (default, NO `fillMode`): all desktop grid usages (1-case, 2-case, bento) and all lightbox usages.
`preload={i === 0}` mirrors the current `priority={i === 0}` exactly (first image only).

Test conventions (from page.test.tsx): vitest + @testing-library/react; `vi.mock` for `@/lib/api` (mockFetchProduct + getImageUrl passthrough), `@/context/AuthContext`, `@/context/CartContext`, `next/navigation`; render via `await act(async () => { render(<ProductDetailPage params={Promise.resolve({ id: "p1" })} />); })`. NO jest-dom setup — plain vitest matchers only (`.toBeDefined()`, `.toBeNull()`, `.toContain()`, `.not.toContain()`, `.toHaveLength()`, `.getAttribute(...)`). Desktop-only scoping: mobile carousel imgs render with `fill` (no `h-auto` in className), so `querySelectorAll('img[class*="h-auto"]')` matches only natural-mode imgs (desktop gallery + lightbox; the lightbox Dialog is closed in these tests so it is not mounted). The lightbox DialogContent only mounts when `lightboxOpen` is true — tests never open it.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Rework GalleryImage, desktop gallery, and lightbox to natural-height mode</name>
  <files>src/app/[locale]/(vetrina)/shop/[id]/page.tsx</files>
  <action>
    Rework the gallery in `src/app/[locale]/(vetrina)/shop/[id]/page.tsx` exactly as follows. Keep the fetch/state logic, buy section, Dialog structure, `slice(0, 5)` cap, alt pattern, and both "Show all photos" buttons (`imgCount > 5`) untouched.

    1. **GalleryImage (lines 37-72):** change the props to `{ src, alt, className, preload, fillMode }: { src: string; alt: string; className?: string; preload?: boolean; fillMode?: boolean }` — rename `priority` → `preload` per D-04 and add `fillMode` (default falsy = natural) per D-03.
       - Failed branch (replace the current fallback div): `cn("flex items-center justify-center bg-muted", fillMode ? "h-full w-full" : "w-full aspect-video", className)` with the same `ImageOff` icon inside (D-03 — the natural fallback occupies a sensible `aspect-video` box now that no parent `h-[500px]` exists; the fill fallback fills the fixed slide instead of collapsing).
       - Natural branch (when `!fillMode`): render `<Image src alt width={800} height={800} unoptimized preload={preload} className={cn("w-full h-auto rounded-xl object-cover", className)} onError={() => setFailed(true)} />` — NO `fill`, NO `sizes` (single-src under `unoptimized`).
       - Fill branch (when `fillMode`): keep the current `<Image fill unoptimized preload={preload} className={cn("object-cover", className)} sizes="(max-width: 768px) 100vw, 50vw" onError=... />` — byte-for-byte the current props except `priority` → `preload`.

    2. **Desktop gallery (inside `relative hidden md:block`, lines 200-287):**
       - 0-case (D-07): `flex h-[500px] items-center justify-center rounded-xl bg-muted` → `flex aspect-video w-full items-center justify-center rounded-xl bg-muted` (ImageOff icon unchanged).
       - 1-case (D-01/D-08): wrapper `group relative h-[500px] overflow-hidden rounded-xl` → `group overflow-hidden rounded-xl`; `GalleryImage` natural mode (no `fillMode`), `preload` on the first image, className unchanged (`transition duration-500 hover:scale-105 group-hover:brightness-110`).
       - 2-case (D-01/D-06/D-08): container `grid grid-cols-2 gap-2` → `grid grid-cols-2 gap-4`; each cell `group relative h-[500px] overflow-hidden rounded-xl` → `group overflow-hidden rounded-xl`; `GalleryImage` natural mode, `preload={i === 0}`, className unchanged.
       - 3+ bento (D-01/D-05/D-06/D-08): container `grid h-[500px] grid-rows-2 gap-2` → `grid grid-rows-2 gap-4` (KEEP the `imgCount === 3 ? "grid-cols-3" : "grid-cols-4"` switch via `cn`); cells keep `group overflow-hidden rounded-xl` + `col-span-2 row-span-2` (i === 0) + `row-span-2` (i === 3 && imgCount === 4) — drop only `relative`. `GalleryImage` natural mode, `preload={i === 0}`, className unchanged. Do NOT add `grid-flow-col` or explicit `col-start`/`row-start` (D-05 — auto-placement already fills the 2×N grid).

    3. **Mobile carousel (lines 290-351):** slides stay `group relative h-[400px] w-full shrink-0 snap-center overflow-hidden rounded-xl` UNCHANGED (D-02). Only change the three `GalleryImage` usages: add `fillMode` and rename `priority` → `preload` (`preload={i === 0}`). Arrows, dots, scrollCarousel, and the mobile button untouched.

    4. **Lightbox thumbnails (lines 360-372):** cell `relative h-40 overflow-hidden rounded-lg md:h-56` → `overflow-hidden rounded-xl` (D-01/D-06); `GalleryImage` natural mode (no `fillMode`, no `preload`). Grid (`grid grid-cols-2 gap-2 md:grid-cols-3`) and DialogClose untouched.

    Avoid: introducing any fixed height in the desktop gallery or lightbox (grep-verifiable: no `h-[500px]`, `h-40`, `md:h-56` outside the loading skeletons — the loading skeleton `h-[600px]` and mobile skeleton `h-[400px]` at lines 176-179 may stay, they are skeletons not gallery images); touching `sizes` on the fill branch; reordering branches; editing anything outside the gallery + GalleryImage.

    **Mid-plan note:** the 4 layout tests currently assert `h-[500px]` and will be RED after this task. That is expected — Task 2 updates them. Do not "fix" the tests here.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
    <automated>grep -v '^#' "src/app/[locale]/(vetrina)/shop/[id]/page.tsx" | grep -c "h-\[500px\]"</automated>
  </verify>
  <done>GalleryImage has the `fillMode` prop and `preload` (no `priority`); natural branch renders `width={800} height={800}` + `w-full h-auto rounded-xl object-cover` without `fill`; desktop gallery (1-case, 2-case, bento) and lightbox contain zero `h-[500px]`/`h-40`/`md:h-56` (grep gate `h-[500px]` count == 0 — note the grep counts comments, hence `grep -v '^#'`); mobile carousel still uses `fillMode` with `h-[400px]` slides; tsc clean.</done>
</task>

<task type="auto">
  <name>Task 2: Update the 4 layout tests to assert natural-height classes</name>
  <files>src/app/[locale]/(vetrina)/shop/[id]/page.test.tsx</files>
  <action>
    Rewrite the 4 layout tests in `src/app/[locale]/(vetrina)/shop/[id]/page.test.tsx` (the `it(...)` blocks at lines 83-196) so they assert the new natural-height markup (D-01/D-08) while keeping every structural assertion that still holds. Follow the existing conventions exactly (mock product shape, `await act(...)` render, plain vitest matchers — NO jest-dom). Update each test name to say "natural-height" instead of "500px". Keep the two base tests (lines 46-81) untouched.

    Scoping recipe for all 4 tests: `const section = screen.getByLabelText(/photo gallery/i);` then desktop-only images via `section.querySelectorAll<HTMLImageElement>('img[class*="h-auto"]')` — mobile carousel imgs use `fill` and never carry `h-auto`, so this never matches them; the lightbox Dialog is not mounted while closed.

    Per-test assertion spec:

    1. 1-image test (currently lines 83-109): expect exactly 1 natural-mode img. Assert on the img: `className` contains `"w-full"`, `"h-auto"`, `"rounded-xl"`, `"object-cover"`; `getAttribute("width") === "800"`; `getAttribute("height") === "800"`. Assert on `img.parentElement?.className`: contains `"rounded-xl"` and does NOT contain `"h-[500px]"`. No "Show all photos" button.

    2. 2-image test (currently lines 111-138): find the container via `section.querySelector<HTMLElement>('[class*="grid-cols-2"]')`; assert className contains `"grid-cols-2"` and NOT `"h-[500px]"`. Expect exactly 2 natural-mode imgs inside it; for each, `className` contains `"h-auto"` and `"w-full"`, and `img.parentElement?.className` does NOT contain `"h-[500px]"`. No button.

    3. 3-image bento test (currently lines 140-167): find via `[class*="grid-cols-3"]`; assert `"grid-cols-3"` AND `"grid-rows-2"` present (kept per D-05) and NOT `"h-[500px]"`. Exactly 3 imgs; `imgs[0]?.parentElement?.className` contains `"col-span-2"` and `"row-span-2"` (unchanged per D-05) and does NOT contain `"h-[500px]"`. Every img `className` contains `"h-auto"`. No button.

    4. 6-image test (currently lines 169-196): find via `[class*="grid-cols-4"]`; assert `"grid-cols-4"` present, NOT `"h-[500px]"`, exactly 5 imgs rendered (`slice(0, 5)` cap — unchanged), and the "Show all photos" button IS present (unchanged).

    Expected state machine: after Task 1, these rewritten tests are the ones that make the suite green again (the OLD versions were red against natural-height markup — they asserted `h-[500px]`). The full 6-test file must pass.
  </action>
  <verify>
    <automated>npx vitest run "src/app/[locale]/(vetrina)/shop/[id]/page.test.tsx"</automated>
    <automated>npx vitest run</automated>
    <automated>npx tsc --noEmit</automated>
    <automated>npm run lint</automated>
  </verify>
  <done>All 6 tests in page.test.tsx pass; the 4 layout tests assert natural-height classes (`w-full`, `h-auto`, `width="800"`, `height="800"`, `rounded-xl`) and the absence of `h-[500px]` on grids and wrappers; grid-structure assertions (`grid-cols-2`, `grid-cols-3`/`grid-cols-4`, `grid-rows-2`, `col-span-2 row-span-2`, 5-image cap, conditional button) still pass; full vitest suite, tsc, and lint all green.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Spring Boot API → Next.js client | `imageUrls` array crosses into the browser and drives layout branch logic (`imgCount`) and `next/image` rendering; intrinsic image dimensions are uncontrolled |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-260803-DWF-01 | Denial of Service | Natural-height images with very large intrinsic dimensions | mitigate | `w-full` bounds width to the column; height follows aspect ratio, so a bounded width yields a bounded box — no unbounded growth possible (previously the 500px box bounded it; now CSS width is the bound) |
| T-260803-DWF-02 | Denial of Service | `onError` fallback with no fixed-height parent | mitigate | Fallback div becomes `w-full aspect-video` (natural mode) / `h-full w-full` (fill mode) so layout never collapses to icon height when an image 404s |
| T-260803-DWF-03 | Denial of Service | Bento grid with many images | accept | `slice(0, 5)` cap unchanged (n84); natural-height rows add no new DOM/network cost |
| T-260803-DWF-04 | Tampering | Image URLs from `imageUrls` | accept | Existing `GalleryImage` `onError` fallback + trusted backend source, unchanged by this task |

No new package installs in this plan — package legitimacy gate (T-SC) not applicable.
</threat_model>

<verification>
- `npx vitest run "src/app/[locale]/(vetrina)/shop/[id]/page.test.tsx"` — all 6 tests pass (2 base + 4 updated layout tests)
- `npx vitest run` — full suite stays green
- `npx tsc --noEmit` — zero type errors (confirms `preload` prop is valid in next/image 16.2.10)
- `npm run lint` — no lint errors
- Grep gate: `grep -v '^#' "src/app/[locale]/(vetrina)/shop/[id]/page.tsx" | grep -c "h-\[500px\]"` → 0 (no forced heights left in the gallery; the loading skeletons' `h-[400px]`/`h-[600px]` are outside the gallery and stay)
- Manual smoke (after automation, optional): `npm run dev` → open a product with 1, 2, 3, and 6+ images → images render at full natural aspect ratio with no side cropping; bento first image spans 2×2; mobile carousel still snap-scrolls with uniform slides; lightbox thumbnails are natural height
</verification>

<success_criteria>
- Desktop gallery is count-driven (0/1/2/3+) at natural heights: 1 → full-width `w-full h-auto`; 2 → `grid-cols-2 gap-4`; 3+ → bento `grid-rows-2 gap-4` with first image `col-span-2 row-span-2`, capped at 5
- No forced heights (`h-[500px]`, `h-40 md:h-56`) remain in the desktop gallery or lightbox
- `GalleryImage` natural branch: `width={800} height={800}` + `w-full h-auto rounded-xl object-cover`, no `fill`; `onError` fallback preserved in a `w-full aspect-video` box
- Mobile carousel unchanged except `fillMode` + `preload`: uniform `h-[400px]` slides with `fill`/`object-cover` (locked D-02)
- `priority` → `preload` (Next 16 deprecation, AGENTS.md)
- "Show all photos" button still conditional on `imgCount > 5`; `slice(0, 5)` cap preserved
- 4 layout tests updated and passing; full suite, tsc, lint green
</success_criteria>

<output>
Create `.planning/quick/260803-dwf-please-fix-the-image-grid-layout-in-src-/260803-dwf-SUMMARY.md` when done
</output>
