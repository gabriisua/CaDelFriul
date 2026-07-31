---
phase: quick-260731-dfc
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: ["src/app/(vetrina)/experiences/e-bikes/page.tsx"]
autonomous: true
requirements: [VETR-03]
user_setup: []

must_haves:
  truths:
    - "Guest can browse at least 3 distinct e-bike models with image, name, description, and price per day"
    - "Guest can select one e-bike and the selected card is visually highlighted"
    - "Guest can pick start/end dates; past dates and end-before-start are rejected"
    - "Guest sees reactive day count and total price (pricePerDay x days)"
    - "Guest can submit a booking request and receives a success toast; form resets"
  artifacts:
    - path: "src/app/(vetrina)/experiences/e-bikes/page.tsx"
      provides: "E-bike rental page — mock data, selection grid, booking form, dynamic summary, mock submission"
      contains: '"use client"'
  key_links:
    - from: "src/app/(vetrina)/experiences/e-bikes/page.tsx"
      to: "sonner toast"
      via: "toast.success"
      pattern: "toast\\.success"
    - from: "src/app/(vetrina)/experiences/e-bikes/page.tsx"
      to: "mock e-bike array"
      via: "in-module constant"
      pattern: "pricePerDay"
---

<objective>
Create a customer-facing E-Bike Rentals page at `/experiences/e-bikes` with mock data, bike selection, date-based booking form, and dynamic price summary.

Purpose: Extends the Experiences showcase (VETR-03) with an interactive rental flow — guests can browse e-bikes and submit a booking request against mock data until the Phase 3 booking engine/API ships.
Output: One self-contained client page `src/app/(vetrina)/experiences/e-bikes/page.tsx` (URL `/experiences/e-bikes`).
</objective>

<execution_context>
@/Users/gabrielesuardi/.config/opencode/get-shit-done/workflows/execute-plan.md
@/Users/gabrielesuardi/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md

# Required reading BEFORE writing code (AGENTS.md mandate — "This is NOT the Next.js you know"):
@node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
@node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md

# Reference implementations (existing codebase patterns — follow these exactly):
@src/app/(vetrina)/experiences/page.tsx
@src/app/(vetrina)/rooms/page.tsx
@src/app/(vetrina)/_components/RoomCard.tsx
@src/app/(vetrina)/checkout/page.tsx

<interfaces>
Key contracts from the existing codebase the executor must use — no exploration needed:

From src/app/layout.tsx — Toaster is ALREADY mounted globally (do NOT add another):
```tsx
<Toaster position="bottom-right" richColors closeButton />
```
Page only needs: `import { toast } from "sonner";`

From src/components/ui/button.tsx — exports `Button` and `buttonVariants` (base-nova preset; NO `asChild` prop):
```tsx
<Button variant="default" size="lg" className="mt-6 w-full" disabled={...} onClick={...}>
  {isSubmitting ? "Sending request…" : "Book Now"}
</Button>
```

Theme tokens (src/app/globals.css): accent = muted gold `oklch(0.75 0.08 85)`; use `text-accent`, `border-accent`, `bg-accent/5`, `ring-accent`, `text-muted-foreground`, `bg-muted`, `font-heading` (Playfair), `font-sans` (Geist).

next.config.ts: `images.unoptimized: true` globally — external placeholder image URLs work with next/image without remotePatterns config.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="false">
  <name>Task 1: Create the E-Bike Rentals page</name>
  <files>src/app/(vetrina)/experiences/e-bikes/page.tsx</files>

  <action>
  Create a single self-contained client page. Per AGENTS.md, first read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/page.md` and `01-app/01-getting-started/05-server-and-client-components.md` (confirm: pages are Server Components by default; add `"use client"` for interactivity — this page is a client component, standard React hooks, no `params`/`searchParams` needed since the route is static).

  1. **File header**: Line 1 MUST be `"use client";`.

  2. **Imports** (exact paths, existing packages only — nothing new to install):
     - `import { useState } from "react";`
     - `import Image from "next/image";`
     - `import { Button } from "@/components/ui/button";`
     - `import { Input } from "@/components/ui/input";`
     - `import { Label } from "@/components/ui/label";`
     - `import { Separator } from "@/components/ui/separator";`
     - `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";`
     - `import { cn } from "@/lib/utils";`
     - `import { toast } from "sonner";`
     - `import { Bicycle, Calendar, Check } from "lucide-react";`

  3. **Mock data** — module-level constant `const eBikes: EBike[]` with an `interface EBike { id: string; modelName: string; description: string; pricePerDay: number; imageUrl: string; }`. Exactly 3 models:
     - `city-cruiser` — "Friuli City Cruiser" — relaxed city-style e-bike description mentioning the resort surroundings — pricePerDay 29
     - `collio-trail` — "Collio Trail E-MTB" — trail-capable e-MTB description mentioning the Collio hills — pricePerDay 49
     - `alpina-premium` — "Alpina Premium E-MTB" — premium full-suspension description — pricePerDay 69
     Each `imageUrl`: any stable e-bike photo URL (e.g., `https://images.unsplash.com/photo-…` — `images.unoptimized` is global so external URLs render without config changes).

  4. **State** (component `export default function EBikesPage()`):
     - `const [selectedBikeId, setSelectedBikeId] = useState<string | null>(null);`
     - `const [startDate, setStartDate] = useState("");`
     - `const [endDate, setEndDate] = useState("");`
     - `const [isSubmitting, setIsSubmitting] = useState(false);`

  5. **Derived values** (computed each render, not stored):
     - `const todayStr = new Date().toLocaleDateString("en-CA");` — local-timezone YYYY-MM-DD (NOT `toISOString` — that is UTC and can be off-by-one for timezones east of UTC).
     - `const datesValid = startDate !== "" && endDate !== "" && startDate >= todayStr && endDate > startDate;` — ISO `YYYY-MM-DD` strings compare chronologically. NOTE: `endDate > startDate` (strictly after) is the intended reading of "End Date cannot be before Start Date" — it guarantees ≥1 rental day so the summary price is meaningful.
     - `const numberOfDays = datesValid ? Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86_400_000) : 0;`
     - `const selectedBike = eBikes.find((b) => b.id === selectedBikeId) ?? null;`
     - `const totalPrice = selectedBike && datesValid ? selectedBike.pricePerDay * numberOfDays : 0;`

  6. **Layout** (match existing page conventions exactly):
     - Outer wrapper: `<div className="mx-auto max-w-7xl px-4 py-16 md:px-8">`
     - Hero: `<h1 className="font-heading text-3xl font-semibold md:text-4xl">Rent an E-Bike</h1>` and `<p className="mt-3 max-w-2xl text-muted-foreground">` — luxury-eco-resort copy encouraging guests to explore the resort surroundings (vineyards, Collio hills, panoramic viewpoints).
     - Content grid: `<div className="mt-10 grid gap-8 lg:grid-cols-3">`
       - Left column `lg:col-span-2`: `<h2 className="font-heading text-lg font-semibold">Choose Your E-Bike</h2>` + bike grid `<div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">`
       - Right column `lg:col-span-1`: sticky booking panel `<div className="sticky top-24 rounded-lg border border-border p-6">` (checkout page pattern).

  7. **Bike cards** — one per model. Wrap the card in `<button type="button" onClick={() => setSelectedBikeId(b.id)} aria-pressed={selectedBikeId === b.id} className={cn("text-left", ...)}>` (a real button for keyboard/screen-reader support). Card styling follows RoomCard: `Card` with `overflow-hidden border-t-2 border-accent pt-0`, image container `<div className="relative h-48 w-full bg-muted">` with `<Image src={b.imageUrl} alt={b.modelName} fill unoptimized className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />`. Selected state: `ring-2 ring-accent` + `bg-accent/5` on the card + a check badge `<span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-accent text-accent-foreground"><Check className="size-4" /></span>` rendered only when selected (spec requires the `check` icon). CardHeader: `CardTitle` with `font-heading text-lg font-semibold` (model name), `CardDescription` (description). CardContent: `<p className="text-2xl font-semibold text-accent">€{b.pricePerDay} / day</p>`. Image `onError` fallback: swap to a `bg-muted` panel with centered `<Bicycle className="size-12 text-muted-foreground/30" />` (guaranteed offline-safe; do NOT rely on a local placeholder file — none exists in `public/`).

  8. **Booking panel** (right column):
     - `<h2 className="font-heading text-lg font-semibold">Book Your Ride</h2>`
     - `<Calendar className="mb-4 size-5 text-accent" aria-hidden />` near the form heading (spec: calendar icon).
     - Two labeled fields (`<div className="mt-4 space-y-4">`): Start Date and End Date — each `<Label>` + `<Input type="date">` with `min` attributes: start `min={todayStr}`, end `min={startDate || todayStr}` (native browser guard against past dates; the JS validation below handles the disabled state).
     - Inline validation errors shown only when a date is set and invalid:
       - `startDate !== "" && startDate < todayStr` → `<p className="text-sm text-destructive">Start date cannot be in the past.</p>`
       - `endDate !== "" && endDate <= startDate` → `<p className="text-sm text-destructive">End date must be after the start date.</p>`
     - `<Separator className="my-4" />` then summary rows (checkout summary pattern, `text-sm`, `flex justify-between`): Bike → `selectedBike?.modelName` or muted "—"; Days → `datesValid ? \`${numberOfDays} ${numberOfDays === 1 ? "day" : "days"}\` : "—"`; then `<div className="border-t border-border pt-2">` Total row `text-base font-semibold` → value `text-accent`: `datesValid && selectedBike ? `€${totalPrice.toFixed(2)}` : "—"`. All "—" placeholder values use `text-muted-foreground`.
     - Button: `<Button variant="default" size="lg" className="mt-6 w-full" onClick={handleBook} disabled={!selectedBike || !datesValid || isSubmitting}>` with label `{isSubmitting ? "Sending request…" : "Book Now"}`.

  9. **Submission handler** — mock API call with setTimeout:
     ```ts
     const handleBook = () => {
       if (!selectedBike || !datesValid || isSubmitting) return;
       setIsSubmitting(true);
       window.setTimeout(() => {
         setIsSubmitting(false);
         toast.success("Booking request sent successfully!");
         setSelectedBikeId(null);
         setStartDate("");
         setEndDate("");
       }, 1200);
     };
     ```
     The `toast.success` message must be EXACTLY `"Booking request sent successfully!"` (spec requirement). Form resets after the mock submission succeeds.

  Avoid: adding any new dependency, touching any other file, adding auth gating (spec is mock-only), navigating anywhere on submit, and hardcoded totals — every displayed number must derive from `selectedBike`/`numberOfDays` state.
  </action>

  <verify>
    <automated>
      cd /Users/gabrielesuardi/Desktop/CaDelFriul/fe-cadelfriul && npx tsc --noEmit && npx eslint "src/app/(vetrina)/experiences/e-bikes/page.tsx" && npm run build
    </automated>
  </verify>

  <done>
    - `npx tsc --noEmit`, `npx eslint` on the file, and `npm run build` all pass
    - Grep gates (count via `grep -v '^#'` to avoid comment false-positives) on `src/app/(vetrina)/experiences/e-bikes/page.tsx`:
      - `"use client"` present (line 1)
      - `toast.success("Booking request sent successfully!")` present
      - `pricePerDay` present, `eBikes` array has exactly 3 entries
      - `selectedBikeId`, `startDate`, `endDate`, `isSubmitting` state present
      - imports from `lucide-react` include `Bicycle`, `Calendar`, `Check`
    - At `http://localhost:3000/experiences/e-bikes` (dev server): hero renders, 3 cards show image/name/description/€-price, clicking a card highlights it with accent ring + check badge, past dates blocked, end-before-start shows destructive error, days + total update reactively, Book Now enables only with bike + valid range, submission shows button loading then `Booking request sent successfully!` toast, form resets
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Guest browser → page | All data is client-side mock data; no server or third-party API is contacted. Only trust boundary is the browser rendering untrusted placeholder image URLs via next/image (`unoptimized`) — mitigated by `onError` fallback. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-260731-01 | Tampering | Date inputs | mitigate | `min` attribute on both `<Input type="date">` elements + JS guard `startDate >= todayStr && endDate > startDate` before enabling Book Now; all derived values computed from validated state only |
| T-260731-02 | Spoofing | Mock submit handler | accept | Client-only mock per spec — `setTimeout` placeholder for a future real API; no data leaves the browser |
| T-260731-03 | Information disclosure | Placeholder image URLs | mitigate | `next/image` with `onError` fallback to muted `Bicycle` icon panel; no user data involved |
| T-260731-SC | Tampering | npm/pip/cargo installs | accept | No package installs in this plan — all dependencies (`sonner`, `lucide-react`, shadcn ui) already present in package.json |
</threat_model>

<verification>
- `npx tsc --noEmit` — no type errors
- `npx eslint "src/app/(vetrina)/experiences/e-bikes/page.tsx"` — no lint errors
- `npm run build` — production build succeeds (existing 17 routes + new `/experiences/e-bikes`)
- Page reachable at `/experiences/e-bikes` (route group `(vetrina)` preserves the URL)
</verification>

<success_criteria>
- Guest browsing `/experiences/e-bikes` can: see 3 e-bike models with image/name/description/price, select exactly one (visually highlighted), choose a valid date range (past dates and end-before-start rejected), see days + total update reactively, and submit — receiving "Booking request sent successfully!" toast with the form reset.
- No new dependencies added, no existing files modified, codebase conventions followed (container, headings, cards, sticky summary panel, toast usage).
</success_criteria>

<output>
Create `.planning/quick/260731-dfc-create-a-new-next-js-customer-facing-pag/260731-dfc-SUMMARY.md` when done
</output>
