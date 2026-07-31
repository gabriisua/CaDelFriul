---
phase: quick-260731-lfb
plan: 01
subsystem: vetrina-shop-pdp
tags: [pdp, gallery, lightbox, e-commerce, mock]
requires: []
provides: ["/shop/[id] product detail page reachable from /shop listing"]
affects: ["src/app/[locale]/(vetrina)/shop/page.tsx", "src/app/[locale]/(vetrina)/_components/ProductCard.tsx"]
tech-stack:
  added: []
  patterns:
    - "Next 16 promise-params via use(params) in client pages"
    - "controlled base-ui Dialog lightbox"
    - "native <details> accordion (zero-JS)"
    - "per-image onError fallback (e-bikes pattern)"
    - "shop-page auth-gated add-to-cart (e21770a pattern)"
    - "locale-aware next-intl Link wrapping card title only"
key-files:
  created:
    - "src/app/[locale]/(vetrina)/shop/[id]/page.tsx"
  modified:
    - "src/app/[locale]/(vetrina)/_components/ProductCard.tsx"
    - "src/app/[locale]/(vetrina)/shop/page.tsx"
decisions:
  - "Deferred useAuth/useCart/ShoppingCart/Minus/Plus imports from Task 1 to Task 2 to keep the eslint gate green (unused imports otherwise)"
  - "Lightbox DialogContent adds max-h-[85vh] overflow-y-auto so all 5 images stay reachable on small viewports"
  - "useRef imported in Task 1 for the mobile carousel scrollTo (plan's import list omitted it)"
metrics:
  duration: "~15 min"
  completed: "2026-07-31"
---

# Phase quick-260731-lfb Plan 01: Product Detail Page (PDP) Summary

Product Detail Page at `/shop/[id]` (locale-prefixed under `(vetrina)` route group) for the mock Lavender Essential Oil product — premium bento image gallery on desktop, snap carousel on mobile, "Show all photos" lightbox, buy section with clamped quantity selector and auth-gated Add to Cart, native `<details>` Product Details accordion — linked from the Shop listing card titles.

## Verification

- `npx tsc --noEmit` — pass (after every task)
- `npx eslint` on the 3 touched files — pass (after every task)
- `npm run build` — pass after Task 2 and Task 3; new dynamic route `ƒ /[locale]/shop/[id]` in the route table
- All per-task grep gates pass (use(params), product.images.map, Show all photos, toast auth gate, Math.max/Math.min bounds, group-open:rotate-180, href prop, `/shop/${product.id}`)

## Tasks & Commits

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Create the PDP route with mock data + dynamic image gallery | `027d6fb` | `src/app/[locale]/(vetrina)/shop/[id]/page.tsx` (new, 254 lines) |
| 2 | Add the product info & buy section | `6c6cdbc` | `src/app/[locale]/(vetrina)/shop/[id]/page.tsx` (+181/−2) |
| 3 | Link Shop listing cards to the PDP | `a3fdd05` | `_components/ProductCard.tsx`, `shop/page.tsx` |

## What Was Built

- **PDP route** (`src/app/[locale]/(vetrina)/shop/[id]/page.tsx`, `"use client"`): module-level `MockProduct` (id `lavender-essential-oil`, €24.00, stock 10, 5 Unsplash images, 2–3 sentence luxury eco-resort copy, 4 features); Next 16 promise-`params` read via `use(params)`.
- **`GalleryImage` sub-component**: per-image `failed` state → `bg-muted` panel + `ImageOff` icon (e-bikes offline-safe pattern; `public/` has no placeholders); `next/image` with `fill`, `unoptimized`, `sizes="(max-width: 768px) 100vw, 50vw"`, `onError` fallback.
- **Desktop bento** (`hidden md:grid`, `md:grid-cols-[2fr_1fr]`): 600px hero (first image, `priority`) + 2×2 grid of 290px tiles (handles 1 / 2 / 3+ image layouts); every tile `group` + `transition duration-500 hover:scale-105 group-hover:brightness-110`.
- **Mobile snap carousel** (`md:hidden`): `snap-x snap-mandatory` slides (400px, `w-full shrink-0 snap-center`), scrollbar hidden via `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden`, `ChevronLeft/Right` overlay buttons cycling `mobileIndex` with `ref.scrollTo({ left: index * width, behavior: "smooth" })`, dot indicators (active `bg-accent`).
- **Lightbox**: controlled base-ui `Dialog` (`open`/`onOpenChange`), `DialogContent max-w-4xl` with `DialogTitle`, `grid grid-cols-2 md:grid-cols-3` of all 5 images, `DialogClose` with `X` top-right. Both "Show all photos" buttons (desktop grid + mobile wrapper) share `lightboxOpen` state.
- **Buy section**: "Estate Apothecary" eyebrow, Playfair `font-heading` title, prominent `text-accent` price, `leading-relaxed` description, `Check`-bullet feature list; `Separator`; quantity stepper (`rounded-full border border-border`, `-`/`+` clamped via `Math.max(1,…)`/`Math.min(product.stockQuantity,…)`, buttons disabled at bounds, `w-10` readout); low-stock note when `stockQuantity <= 5`.
- **Auth-gated Add to Cart** (exact shop-page/e21770a pattern): unauthenticated → `toast("Sign in to add items to your cart", …)` with "Sign In" action → `router.push("/login")`, button disabled + "Sign In to Buy"; authenticated → `addToCart({…, quantity})` + `toast.success`. Button label logic mirrors shop page ("Out of Stock"/"Add to Cart").
- **Product Details accordion**: three native `<details className="group">` rows (Ingredients `Droplets`, Usage `Sparkles`, Volume `Package`), `list-none` + `[&::-webkit-details-marker]:hidden` summary, `group-open:rotate-180` chevrons, zero JS.
- **Reachability**: `ProductCard` gains optional `href?: string`; when present only the `CardTitle` text becomes a locale-aware `Link` (`@/i18n/navigation`, `hover:text-accent`) — carousel buttons stay interactive siblings (no invalid interactive-inside-anchor nesting). `shop/page.tsx` passes `href={`/shop/${product.id}`}`. `products/page.tsx` unaffected (optional prop).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking issue] Deferred Task-2-only imports out of Task 1**
- **Found during:** Task 1
- **Issue:** The plan's Task 1 import list included `useAuth`, `useCart`, `ShoppingCart`, `Minus`, `Plus` — none are used until the Task 2 buy section. Importing them unused fails the `@typescript-eslint/no-unused-vars` eslint gate the plan itself mandates.
- **Fix:** Task 1 imports only symbols used by Task 1 code; `useAuth`, `useCart`, `ShoppingCart`, `Minus`, `Plus` imported in Task 2. Also imported `useRef` in Task 1 (required for the carousel `ref.scrollTo` behavior the plan specifies, though its import list omitted it) and `X` in Task 1 (required by the lightbox `DialogClose`).
- **Files modified:** `src/app/[locale]/(vetrina)/shop/[id]/page.tsx`
- **Commit:** `027d6fb`, `6c6cdbc`

**2. [Rule 3 - Blocking issue] Dropped unused `cartItems` destructure**
- **Found during:** Task 2
- **Issue:** Plan text specified `const { items: cartItems, addToCart } = useCart();` but `cartItems` is never used on the PDP (per plan's own sanity note, cart merge is CartContext's job) — an unused destructure fails the eslint gate.
- **Fix:** Destructure only `addToCart` from `useCart()`.
- **Files modified:** `src/app/[locale]/(vetrina)/shop/[id]/page.tsx`
- **Commit:** `6c6cdbc`

**3. [Rule 2 - Missing critical functionality] Lightbox scroll containment**
- **Found during:** Task 1
- **Issue:** `DialogContent` is fixed-positioned and non-scrolling; on short viewports the 5-image grid (2 rows @ 224px on desktop, 3 rows @ 160px on mobile) would overflow past the screen edges and make the bottom images unreachable — violating the "see every product image" truth.
- **Fix:** `DialogContent` className extended with `max-h-[85vh] overflow-y-auto` (kept `max-w-4xl` as specified).
- **Files modified:** `src/app/[locale]/(vetrina)/shop/[id]/page.tsx`
- **Commit:** `027d6fb`

## Auth Gates

None — no authenticated operations were required during execution.

## Known Stubs

None — the page is fully mock by design (single hardcoded `MockProduct`, mirroring the 260731-dfc e-bikes precedent); the seam for real product data is the module-level `product` object.

## Threat Flags

None — all surface (mock data, unoptimized Unsplash `<Image>`s with onError fallback, clamped quantity, auth-gated add-to-cart) matches the plan's `<threat_model>` register (T-260731-lfb-01..05, -SC). No new endpoints, auth paths, or schema changes were introduced beyond the plan.

## Self-Check: PASSED

- `[ -f "src/app/[locale]/(vetrina)/shop/[id]/page.tsx" ]` — FOUND
- `git log | grep 027d6fb` — FOUND; `6c6cdbc` — FOUND; `a3fdd05` — FOUND
- tsc + eslint (3 files) + `npm run build` — all pass
