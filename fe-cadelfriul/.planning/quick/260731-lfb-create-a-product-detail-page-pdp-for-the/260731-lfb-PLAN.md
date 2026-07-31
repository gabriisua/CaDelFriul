---
phase: quick-260731-lfb
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - "src/app/[locale]/(vetrina)/shop/[id]/page.tsx"
  - "src/app/[locale]/(vetrina)/shop/page.tsx"
  - "src/app/[locale]/(vetrina)/_components/ProductCard.tsx"
autonomous: true
requirements: [VETR-04]
user_setup: []

must_haves:
  truths:
    - "Guest can open a product detail page at /shop/[id] and see a premium image gallery — bento grid on desktop, swipeable snap carousel on mobile"
    - "Guest can open the 'Show all photos' lightbox to see every product image"
    - "Guest sees the product name, prominent price, well-spaced description, and feature list"
    - "Guest can select a quantity (bounded by stock) and add to cart when signed in; unauthenticated guests see a disabled 'Sign In to Buy' button"
    - "Guest can expand a Product Details accordion (Ingredients, Usage, Volume)"
    - "Guest can reach the PDP by clicking a product card on the Shop listing page"
  artifacts:
    - path: "src/app/[locale]/(vetrina)/shop/[id]/page.tsx"
      provides: "PDP — mock product data, dynamic bento image grid (desktop) + snap carousel (mobile), lightbox, quantity selector, auth-gated add-to-cart, Product Details accordion"
      contains: '"use client"'
    - path: "src/app/[locale]/(vetrina)/_components/ProductCard.tsx"
      provides: "Optional href prop rendering the card title as a locale-aware Link"
      contains: "href"
  key_links:
    - from: "src/app/[locale]/(vetrina)/shop/[id]/page.tsx"
      to: "useAuth isAuthenticated"
      via: "auth gate on Add to Cart"
      pattern: "isAuthenticated"
    - from: "src/app/[locale]/(vetrina)/shop/[id]/page.tsx"
      to: "useCart addToCart"
      via: "add-to-cart call"
      pattern: "addToCart"
    - from: "src/app/[locale]/(vetrina)/shop/page.tsx"
      to: "PDP route"
      via: "next-intl Link on product card title"
      pattern: "/shop/"
---

<objective>
Create a visually stunning Product Detail Page (PDP) at `/shop/[id]` — mock product ("Lavender Essential Oil"), dynamic bento image grid on desktop with mobile snap carousel, "Show all photos" lightbox, premium buy section with quantity selector and auth-gated Add to Cart, and a Product Details accordion — then link the existing Shop listing cards to it.

Purpose: Extends the Products showcase (VETR-04) with a detail view that converts — a design-rich product experience consistent with the luxury rustic-chic brand. Fully mock (no backend dependency), matching the 260731-dfc e-bikes page precedent.
Output: One new client page `src/app/[locale]/(vetrina)/shop/[id]/page.tsx` (URL `/shop/lavender-essential-oil` under any locale prefix) + minimal reachability changes to `shop/page.tsx` and `ProductCard.tsx`.
</objective>

<execution_context>
@/Users/gabrielesuardi/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/gabrielesuardi/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md

# Required reading BEFORE writing code (AGENTS.md mandate — "This is NOT the Next.js you know"):
@node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md
@node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md

# Reference implementations (existing codebase patterns — follow these exactly):
@src/app/[locale]/(vetrina)/shop/page.tsx
@src/app/[locale]/(vetrina)/experiences/e-bikes/page.tsx
@src/app/[locale]/(vetrina)/_components/ProductCard.tsx
@src/app/[locale]/(vetrina)/_components/Header.tsx
@src/context/CartContext.tsx
@src/context/AuthContext.tsx

<interfaces>
Key contracts the executor must use — no exploration needed.

**Next.js 16 — params in Client Components (from `page.md`, §"Reading searchParams and params in Client Components"):** `params` is a Promise; a `"use client"` page reads it with React's `use()`:
```tsx
"use client";
import { use } from "react";
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
}
```
The `[locale]` segment lives in the parent layout — the page's params contain `id` (plus `locale`, unused here). Do NOT write `params` as a plain object and do NOT make a client page `async`.

**Route location:** `src/app/[locale]/(vetrina)/shop/[id]/page.tsx` — the `(vetrina)` route group preserves the URL `/shop/{id}` (locale prefix applied by next-intl).

**CartContext (src/context/CartContext.tsx)** — `useCart()` exposes:
```tsx
export interface CartItem {
  productId: string; productName: string; price: number;
  quantity: number; imageUrl: string; stockQuantity?: number;
}
addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
items: CartItem[];
```

**AuthContext (src/context/AuthContext.tsx)** — `useAuth()` exposes `isAuthenticated: boolean` (also `user`).

**Auth-gated add-to-cart pattern** — copy EXACTLY from `shop/page.tsx` (e21770a): unauthenticated → `toast("Sign in to add items to your cart", { description: "Create an account to start building your order.", action: { label: "Sign In", onClick: () => router.push("/login") } })` with `useRouter` from `next/navigation`; authenticated → `addToCart({...})` then `toast.success(\`${product.name} added to cart\`)`. Button disabled + label "Sign In to Buy" when `!isAuthenticated`.

**ui/dialog (src/components/ui/dialog.tsx, @base-ui/react)** — exports: `Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger`. Controlled usage: `<Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>`. Already proven in `src/app/[locale]/dashboard/addresses/page.tsx`.

**next/image** — `next.config.ts` sets `images.unoptimized: true` globally: external Unsplash URLs render without `remotePatterns`. Existing pages still pass `unoptimized` on `<Image>` — follow that. NOTE: `public/` has NO placeholder images (ProductCard's `/placeholder-room.jpg` would 404) — use the e-bikes `onError` icon-fallback pattern instead (state flag → muted panel with centered lucide icon).

**Locale-aware links** — `import { Link } from "@/i18n/navigation"` (next-intl v4 wrapper; string hrefs accepted, locale prefix applied automatically). Plain `next/navigation` imports keep working via the proxy, but use the i18n wrapper for in-app links.

**Theme tokens (src/app/globals.css)** — accent = muted gold `oklch(0.75 0.08 85)`; use `font-heading` (Playfair 600), `text-accent`, `bg-accent`, `border-accent`, `ring-accent`, `bg-muted`, `text-muted-foreground`, `text-destructive`, `font-sans` (Geist). Page container convention: `mx-auto max-w-7xl px-4 py-16 md:px-8`.

**Icons (lucide-react, all verified present):** `ChevronDown, ChevronLeft, ChevronRight, Plus, Minus, ShoppingCart, Images, Droplets, Sparkles, Package, ImageOff, X, Check`.

**Content language:** hardcoded English — matches the newest customer-facing page (260731-dfc e-bikes). The en/it/de message files cover nav/footer only; quick mock pages stay English (precedent).
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create the PDP route with mock data + dynamic image gallery</name>
  <files>src/app/[locale]/(vetrina)/shop/[id]/page.tsx</files>

  <action>
  Per AGENTS.md, FIRST read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` (the "Reading searchParams and params in Client Components" section — params is a Promise, read via `use(params)`) and `01-app/03-api-reference/02-components/image.md` (unoptimized / fill / object-cover / sizes). Then create the file.

  1. **File header**: Line 1 MUST be `"use client";`.

  2. **Imports** (existing packages only — nothing new to install):
     - `import { use, useState } from "react";`
     - `import Image from "next/image";`
     - `import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";`
     - `import { cn } from "@/lib/utils";`
     - `import { ChevronLeft, ChevronRight, Images, ImageOff, ShoppingCart, Minus, Plus } from "lucide-react";`
     - `import { useAuth } from "@/context/AuthContext";`
     - `import { useCart } from "@/context/CartContext";`
     (sonner `toast`, `useRouter`, accordion icons `ChevronDown/Droplets/Sparkles/Package`, and `Button` arrive in Task 2 — do not import them yet.)

  3. **Mock data** — module-level (NOT inside the component):
     ```ts
     interface MockProduct {
       id: string;
       name: string;
       price: number;
       description: string;
       features: string[];
       images: string[];
       stockQuantity: number;
     }
     const product: MockProduct = { ... };
     ```
     - `id: "lavender-essential-oil"`, `name: "Lavender Essential Oil"`, `price: 24`, `stockQuantity: 10`
     - `description`: 2-3 sentence luxury eco-resort copy (small-batch steam-distilled lavender from the resort's own fields, calming/aromatherapy angle)
     - `features`: 4 strings (e.g., "100% pure steam-distilled", "Hand-harvested from our estate fields", "40ml amber glass bottle", "Cruelty-free & vegan")
     - `images`: EXACTLY 5 stable Unsplash URLs (lavender / essential-oil / aromatherapy themes, `?auto=format&fit=crop&w=1200&q=80` suffix). Use these two verified-stable IDs and three more lavender/spa-themed Unsplash photo IDs of your choosing:
       - `https://images.unsplash.com/photo-1499002238440-d264edd596ec?auto=format&fit=crop&w=1200&q=80`
       - `https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80`
       Do NOT worry about dead URLs — the per-image `onError` fallback (step 5) guarantees the page renders offline-safe.

  4. **`GalleryImage` sub-component** (module scope, same file):
     ```tsx
     function GalleryImage({ src, alt, className, priority }: {
       src: string; alt: string; className?: string; priority?: boolean;
     }) {
       const [failed, setFailed] = useState(false);
       if (failed) return (
         <div className={cn("flex items-center justify-center bg-muted", className)}>
           <ImageOff className="size-10 text-muted-foreground/30" aria-hidden />
         </div>
       );
       return (
         <Image src={src} alt={alt} fill unoptimized priority={priority}
                className={cn("object-cover", className)} sizes="(max-width: 768px) 100vw, 50vw"
                onError={() => setFailed(true)} />
       );
     }
     ```
     (Per-image state avoids an entire broken gallery; `bg-muted` panel is the e-bikes fallback pattern — `public/` has no placeholder images.)

  5. **Page component** — `export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> })`; `const { id } = use(params);` (Next 16 promise params — see required reading). Use `id` for the gallery `<section aria-label>` and page heading semantics only; content is the single mock `product` (per spec, one mock object).

  6. **Layout shell** (matches existing page conventions): outer `<div className="mx-auto max-w-7xl px-4 py-16 md:px-8">` containing `<div className="grid gap-10 lg:grid-cols-2 lg:items-start">` — LEFT column = image gallery (this task); RIGHT column = empty `<div id="product-info" />` placeholder for Task 2. The page must compile and render after this task.

  7. **Image gallery** (left column):
     - **Desktop bento (hidden md:grid):**
       - 1 image → single full-width hero `<div className="relative hidden md:block h-[600px] overflow-hidden rounded-xl">`.
       - 3+ images (our 5) → `<div className="hidden md:grid gap-2 md:grid-cols-[2fr_1fr]">` — hero `<div className="relative h-[600px] overflow-hidden rounded-xl">` (first image, `priority`) spanning the 2fr column; right side `<div className="grid grid-cols-2 gap-2">` with the remaining 4 images each `<div className="relative h-[290px] overflow-hidden rounded-xl">` (2×2, no priority). If a future images array has 2 images → hero + single right image (`grid-cols-1`).
     - **Hover effect** on every tile: `transition duration-500 hover:scale-105` on the image + `group` on the tile container (RoomCard precedent) + `group-hover:brightness-110` on the image (spec: scale OR brightness — use both, subtle).
     - **Mobile carousel (md:hidden):** `<div className="relative">` containing `<div className="flex snap-x snap-mandatory overflow-x-auto gap-2">` with each slide `<div className="relative h-[400px] w-full shrink-0 snap-center overflow-hidden rounded-xl">` (full-width slides). Hide the scrollbar with arbitrary variants: `[scrollbar-width:none] [&::-webkit-scrollbar]:hidden`. Add `ChevronLeft`/`ChevronRight` overlay buttons (absolute, `top-1/2`, `size-8 rounded-full bg-black/50 text-white`, e-bikes/ProductCard pattern) cycling `mobileIndex` state (`(i ± 1 + len) % len`) via `ref.scrollTo({ left: index * width, behavior: "smooth" })` on the scroll container, plus dot indicators (`size-2 rounded-full`, active = `bg-accent`, inactive = `bg-muted-foreground/30`).
     - **Floating "Show all photos" button** (both breakpoints): `absolute bottom-4 right-4 z-20` inside the desktop grid container AND the mobile carousel wrapper — `rounded-full bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-black/75 transition` with `<Images className="size-4 mr-1.5 inline-block" aria-hidden />` and label `Show all photos`. Click → `setLightboxOpen(true)`.
     - **Lightbox** (controlled): `<Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>` wrapping the gallery. `<DialogContent className="max-w-4xl">` with `<DialogHeader><DialogTitle className="font-heading text-xl font-semibold">{product.name}</DialogTitle></DialogHeader>` and a `<div className="grid grid-cols-2 gap-2 md:grid-cols-3">` of ALL `product.images` as `GalleryImage`s (`h-40 md:h-56`). Add `<DialogClose className="absolute right-4 top-4"><X className="size-5" /></DialogClose>` (dialog.tsx already exports `DialogClose`; `X` icon verified present).

  Avoid: touching any other file, adding new dependencies, hardcoded image counts (map over `product.images`), leaving `<Image>` without `fill` + sized container, and importing anything from Task 2 before it lands.
  </action>

  <verify>
    <automated>
      cd /Users/gabrielesuardi/Desktop/CaDelFriul/fe-cadelfriul && npx tsc --noEmit && npx eslint "src/app/[locale]/(vetrina)/shop/[id]/page.tsx"
    </automated>
  </verify>

  <done>
    - `npx tsc --noEmit` and `npx eslint` on the file pass
    - Grep gates on `src/app/[locale]/(vetrina)/shop/[id]/page.tsx` (count via `grep -v '^#'` to avoid comment false-positives):
      - `"use client"` present (line 1)
      - `const { id } = use(params);` present (Next 16 promise-params pattern)
      - `useState` present for `lightboxOpen` and `mobileIndex`
      - `product.images.map(` used for gallery rendering (not hardcoded tiles)
      - `Show all photos` label present; `Images` imported from `lucide-react`
      - `GalleryImage` function defined with `onError`
    - At `http://localhost:3000/shop/lavender-essential-oil` (dev server, en locale): desktop shows hero (2fr) + 2×2 grid with hover scale/brightness; below md a snap-scrolling carousel with chevrons + dots; "Show all photos" opens a lightbox dialog with all 5 images and closes via X
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 2: Add the product info & buy section</name>
  <files>src/app/[locale]/(vetrina)/shop/[id]/page.tsx</files>

  <action>
  Replace the `<div id="product-info" />` placeholder in the right column with the full buy section. Add to imports (same file, existing packages only): `useRouter` from `next/navigation`, `Button` from `@/components/ui/button`, `Separator` from `@/components/ui/separator`, `toast` from `sonner`, and from `lucide-react`: `ChevronDown, Droplets, Sparkles, Package, Check, ShoppingCart`. Add `const { isAuthenticated } = useAuth();`, `const { items: cartItems, addToCart } = useCart();`, `const router = useRouter();`, and `const [quantity, setQuantity] = useState(1);` to the component.

  1. **Header block:**
     - `<p className="text-sm font-medium uppercase tracking-widest text-accent">Estate Apothecary</p>` eyebrow
     - `<h1 className="mt-2 font-heading text-3xl font-semibold md:text-4xl">{product.name}</h1>`
     - Price prominently: `<p className="mt-4 text-3xl font-semibold text-accent">€{product.price.toFixed(2)}</p>`
     - Well-spaced description: `<p className="mt-5 leading-relaxed text-muted-foreground">{product.description}</p>`
     - Features list: `<ul className="mt-6 space-y-2">` mapping `product.features` to `<li className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />{feature}</li>`

  2. **Quantity selector** (buy row): `<Separator className="my-8" />` then a flex row `flex items-center gap-4`:
     - Label `<span className="text-sm text-muted-foreground">Quantity</span>`
     - Stepper: `<div className="flex items-center rounded-full border border-border">` with `-` button (`<button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} className="flex size-10 items-center justify-center rounded-l-full disabled:opacity-40"><Minus className="size-4" /></button>`), `<span className="w-10 text-center text-sm font-semibold">{quantity}</span>`, and `+` button (`Math.min(product.stockQuantity, q + 1)`, `disabled={quantity >= product.stockQuantity}`) — bounds clamped 1..`stockQuantity`, buttons disabled at bounds.
     - Out-of-stock note: `product.stockQuantity <= 5` → `<p className="text-xs text-muted-foreground">Only {product.stockQuantity} left in stock</p>` (shop page pattern).
  3. **Add to Cart button** — copy the exact auth-gating pattern from `src/app/[locale]/(vetrina)/shop/page.tsx`:
     ```ts
     const handleAddToCart = () => {
       if (!isAuthenticated) {
         toast("Sign in to add items to your cart", {
           description: "Create an account to start building your order.",
           action: { label: "Sign In", onClick: () => router.push("/login") },
         });
         return;
       }
       addToCart({
         productId: product.id,
         productName: product.name,
         price: product.price,
         imageUrl: product.images[0] ?? "",
         stockQuantity: product.stockQuantity,
         quantity,
       });
       toast.success(`${product.name} added to cart`);
     };
     ```
     Button: `<Button variant="default" size="lg" className="mt-6 w-full" onClick={handleAddToCart} disabled={!isAuthenticated || product.stockQuantity === 0}>` with label `{!isAuthenticated ? "Sign In to Buy" : product.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}` and `<ShoppingCart className="mr-2 size-4" />` icon (spec: primary/accent color = `variant="default"` button, which is the accent-styled CTA used across the app).
  4. **Product Details accordion** (native `<details>` — zero state, accessible, closed by default): `<Separator className="my-8" />` then:
     - `<h2 className="font-heading text-lg font-semibold">Product Details</h2>`
     - `<div className="mt-4 divide-y divide-border border-y border-border">` containing three `<details className="group">` rows:
       - **Ingredients** — `<summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">` with `<span className="flex items-center gap-2"><Droplets className="size-4 text-accent" aria-hidden />Ingredients</span>` and `<ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden />`. Body: `<p className="pb-4 text-sm text-muted-foreground">` — "100% pure Lavandula angustifolia essential oil. No synthetic additives, carriers, or fillers."
       - **Usage** — `Sparkles` icon. Body: "Add 3–5 drops to a diffuser, or blend with a carrier oil for a calming massage. Avoid direct contact with eyes."
       - **Volume** — `Package` icon. Body: "40 ml amber glass bottle with dropper — approximately 800 drops. Made in small batches in Friuli."
     - `text-accent` on the per-row icons; the active state needs NO JS (native details toggling per spec's "small accordion").
  5. **i18n note:** hardcoded English matches the e-bikes page precedent (mock quick pages are English; the en/it/de message dictionaries cover nav/footer only). Do not add `useTranslations`.
  6. **Sanity:** `quantity` is NOT reset by the add action (cart merge handles increments via CartContext) — do not add extra state or effects.

  Avoid: importing anything not used, wrapping the Button in a Link (keep the toast+router gating), exceeding stock bounds, and adding an accordion library — native `<details>` is the spec-compliant "small accordion or list".
  </action>

  <verify>
    <automated>
      cd /Users/gabrielesuardi/Desktop/CaDelFriul/fe-cadelfriul && npx tsc --noEmit && npx eslint "src/app/[locale]/(vetrina)/shop/[id]/page.tsx" && npm run build
    </automated>
  </verify>

  <done>
    - `npx tsc --noEmit`, `npx eslint`, and `npm run build` all pass
    - Grep gates on `src/app/[locale]/(vetrina)/shop/[id]/page.tsx`:
      - `toast("Sign in to add items to your cart"` present (exact auth-gate copy from shop page)
      - `addToCart({` present with `quantity,` passed
      - `Math.max(1` and `Math.min(product.stockQuantity` present (quantity bounds)
      - `group-open:rotate-180` present (accordion chevron)
      - imports from `lucide-react` include `ChevronDown, Droplets, Sparkles, Package, Check, ShoppingCart, Minus, Plus`
      - `use(params)` still present and unchanged
    - At `http://localhost:3000/shop/lavender-essential-oil`: title/eyebrow/€24.00 price/description/4 features render in the right column; `+`/`-` clamp between 1 and 10 (disabled at bounds); unauthenticated shows disabled "Sign In to Buy" → clicking fires the sign-in toast with a Sign In action; signed-in adds quantity to cart and shows success toast; accordion rows expand/collapse with rotating chevrons
  </done>
</task>

<task type="auto" tdd="false">
  <name>Task 3: Link Shop listing cards to the PDP</name>
  <files>src/app/[locale]/(vetrina)/_components/ProductCard.tsx, src/app/[locale]/(vetrina)/shop/page.tsx</files>

  <action>
  Make the PDP reachable from the Shop listing (reachability gate — otherwise only reachable by typing the URL).

  1. **`_components/ProductCard.tsx`** — add an OPTIONAL prop `href?: string` to the `ProductCardProps` interface. When present, wrap ONLY the `<CardTitle>` text in the locale-aware Link: `import { Link } from "@/i18n/navigation";` then
     ```tsx
     <CardTitle className="font-heading text-xl font-semibold">
       {href ? <Link href={href} className="transition-colors hover:text-accent">{name}</Link> : name}
     </CardTitle>
     ```
     Do NOT wrap the whole Card or the image area — the card already contains interactive carousel buttons (`ChevronLeft`/`ChevronRight`/dots) and nesting a link around interactive elements is invalid HTML and breaks base-ui/React event handling. Title-only link keeps the carousel untouched. `products/page.tsx` uses this component without `href` — the optional prop leaves it unchanged.
  2. **`src/app/[locale]/(vetrina)/shop/page.tsx`** — in the product map, pass `href={`/shop/${product.id}`}` to `<ProductCard>`. `Link` from `@/i18n/navigation` applies the active locale prefix automatically (string hrefs are valid per next-intl v4 types). The existing "Add to Cart" row below the card stays as-is.
  3. No other changes — do not alter the products page, ProductCard layout, or any other consumer.

  Avoid: wrapping interactive elements in the Link, touching `products/page.tsx`, and adding a "View details" button (title link is the minimal, non-conflicting surface).
  </action>

  <verify>
    <automated>
      cd /Users/gabrielesuardi/Desktop/CaDelFriul/fe-cadelfriul && npx tsc --noEmit && npx eslint "src/app/[locale]/(vetrina)/_components/ProductCard.tsx" "src/app/[locale]/(vetrina)/shop/page.tsx" && npm run build
    </automated>
  </verify>

  <done>
    - `npx tsc --noEmit`, `npx eslint`, `npm run build` all pass
    - Grep gates:
      - `ProductCard.tsx`: `href?: string` present; `hover:text-accent` present in the title Link
      - `shop/page.tsx`: `href={`/shop/${product.id}`}` present; `import { Link } from "@/i18n/navigation"` NOT required in shop/page.tsx (Link stays inside ProductCard — only ProductCard imports it)
    - At `http://localhost:3000/shop` (dev server): clicking any product card's title navigates to `/shop/{id}` (locale prefix preserved, e.g. `/it/shop/…`), the PDP renders, and the browser back button returns to the listing
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Guest browser → PDP page | All product data is client-side mock data; no server or backend API is contacted. The only external input is the placeholder image URLs rendered via `next/image` (`unoptimized`) and the user-controlled quantity. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-260731-lfb-01 | Spoofing | `params.id` (URL segment) | accept | Mock page per spec — any `[id]` renders the single mock product; no lookup, no server state, no data exfiltration surface |
| T-260731-lfb-02 | Tampering | Quantity selector | mitigate | Clamp `1..stockQuantity` via `Math.max(1, …)` / `Math.min(product.stockQuantity, …)`; stepper buttons disabled at bounds; add-to-cart passes only clamped state |
| T-260731-lfb-03 | Tampering | Add to Cart (auth bypass) | mitigate | `isAuthenticated` gate copied from shop page (e21770a): unauthenticated click → sign-in toast + `/login` redirect, button disabled with "Sign In to Buy"; CartContext owns merge/cap logic |
| T-260731-lfb-04 | Information disclosure | Unsplash placeholder URLs | mitigate | `next/image` with per-image `onError` → `bg-muted` panel + `ImageOff` icon (e-bikes pattern); `public/` contains no placeholder assets to rely on |
| T-260731-lfb-05 | Tampering | Invalid HTML nesting (Task 3) | mitigate | Link wraps ONLY the `CardTitle` text — the card's carousel buttons stay interactive siblings, not nested (invalid interactive-inside-anchor nesting avoided) |
| T-260731-lfb-SC | Tampering | npm/pip/cargo installs | accept | No package installs in this plan — all dependencies (`lucide-react`, `sonner`, shadcn `ui/*`, `next-intl`, `@base-ui/react` dialog) already present in package.json |
</threat_model>

<verification>
- `npx tsc --noEmit` — no type errors (runs after each task)
- `npx eslint` on the three touched files — no lint errors
- `npm run build` — production build succeeds (existing routes + new `/shop/[id]`)
- Grep gates per task (count via `grep -v '^#'` — no comment false-positives)
- Manual dev-server pass at `/shop/lavender-essential-oil` and `/shop` (bento grid, mobile carousel, lightbox, buy section, auth gating, accordion, listing links)
</verification>

<success_criteria>
- Guest browsing `/shop` can click any product title and land on `/shop/{id}` (locale prefix preserved) with a visually stunning PDP: bento hero grid on desktop, snap carousel on mobile, hover scale/brightness, "Show all photos" lightbox, prominent name/price/description/features, clamped quantity selector, auth-gated Add to Cart (disabled "Sign In to Buy" + sign-in toast for guests), and a working Product Details accordion.
- No new dependencies, only 3 files touched, codebase conventions followed (container, `font-heading`, `text-accent`, e-bikes image fallback, shop-page auth pattern, `(vetrina)` route group), Next 16 promise-`params` respected via `use(params)`.
</success_criteria>

<output>
Create `.planning/quick/260731-lfb-create-a-product-detail-page-pdp-for-the/260731-lfb-SUMMARY.md` when done
</output>
