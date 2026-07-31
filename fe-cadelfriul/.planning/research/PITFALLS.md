# Domain Pitfalls: Hybrid Resort Booking & E-commerce Platform

**Domain:** Hybrid Resort Booking & E-commerce (Next.js App Router + Spring Boot JWT)
**Researched:** 2026-07-08
**Overall confidence:** HIGH

## Critical Pitfalls

Mistakes that cause rewrites, revenue loss, or major security incidents.

---

### Pitfall 1: Treating a Booking Like a Cart Item

**What goes wrong:** Rooms, spa sessions, and event tickets are not shippable products, but teams often model them identically to wine bottles in the cart data structure. A room booking has date ranges, check-in/out rules, cancellation policies, and guest-count limits that have no parallel in a physical product. When the cart treats both identically, the checkout logic becomes a tangled mess of conditionals and the pricing engine breaks under edge cases.

**Why it happens:** The frontend developer sees "add item → cart → checkout → payment → confirmation" as a universal pipeline. The backend team models both product types in a single `OrderItem` table with type-discriminator columns. The differences seem manageable until date-range overlap, per-night pricing, and deposit-vs-full-payment rules collide.

**Consequences:**
- Cart subtotal miscalculations when mix-and-match booking+product orders occur
- Checkout flow dead-ends because booking requires date selection but e-commerce needs shipping address
- Cancellation/refund logic becomes impossible to reason about (cancel the room but keep the wine?)
- Future features (multi-night stays, package deals) require cart rewrite

**Prevention:**
- Design **two distinct cart data structures** from day one: `BookingCart` (items with date range, guests, rate plan) and `CommerceCart` (items with SKU, quantity, shipping method). They can share a parent `Cart` container but must not share item models.
- On the Spring Boot side, expect two separate endpoints: `/api/cart/booking` and `/api/cart/commerce` (or a type-discriminated payload).
- The checkout page must have **two parallel flows** — booking confirmation (date review, cancellation policy acceptance) and commerce checkout (shipping address, delivery method).

**Detection:**
- Code review: if a single `CartItem` interface has optional `checkIn`/`checkOut` fields alongside `sku`/`quantity`, it's already headed for trouble.
- If the cart total calculation function has a `switch(item.type)` with more than 3 cases, the abstraction is leaking.

**Phase to address:** Phase 3 (Cart & Checkout) — must be done during data modeling, not retrofitted.

**Sources:** Netgroup (2026) — "8 Hybrid Commerce Mistakes"; Context7 docs on hotel inventory management. HIGH confidence.

---

### Pitfall 2: No Race Condition Protection for Bookable Inventory

**What goes wrong:** Two guests both see "1 room available" on the same date. Both click "Book Now" within milliseconds. Both receive confirmation. The resort now has a double-booking. This is the "lost update" or "double-spending" problem — the classic concurrency nightmare of booking systems.

**Why it happens:** The frontend reads availability, displays it to the user, and the user takes 30-60 seconds filling in details. During that time, the server has no lock on the inventory. The backend checks availability at the start of the booking flow but not atomically at confirmation. Standard web app patterns (read → display → collect input → write) don't protect against concurrent writes.

**Consequences:**
- Overbooking → guest arrives to no room → PR disaster, refunds, compensation
- Trust destroyed — guests won't book again if they can't trust availability
- Legal liability in some jurisdictions (guaranteed reservation laws)

**Prevention:**
- Use **optimistic locking** with a version column on inventory (e.g., `UPDATE inventory SET available = available - 1, version = version + 1 WHERE room_id = X AND version = :last_seen AND available > 0`). If zero rows affected, the booking fails.
- Implement a **short-lived hold/temporary lock** when the user enters the booking flow: reserve inventory for 10-15 minutes with an expiration. Release on timeout or explicit cancel.
- The Spring Boot backend must use database-level transactions with `SERIALIZABLE` isolation for the booking-confirmation operation, not just `READ_COMMITTED`.
- Show a countdown timer on the frontend reflecting the hold window.

**Detection:**
- Load test: fire 50 concurrent booking requests for the same last-available room. If more than one succeeds, the protection is missing.
- Production monitoring: track `booking_confirmed / booking_attempted` ratio. A ratio above 1.0 means overbooking is happening.

**Phase to address:** Phase 3 (Checkout & Payments) — the Spring Boot API must have this before the frontend connects.

**Sources:** Stack Overflow — "How to prevent race condition in online hotel booking"; Adamo Software (2026) — "Solving the Inventory Nightmare: Handling high-concurrency in Global Hotel Booking Engines"; Medium/Ann R. (2026) — "Booking System: Availability, Calendars, and Overbooking Rules". HIGH confidence.

---

### Pitfall 3: JWT Stored in localStorage / No Refresh Token Rotation

**What goes wrong:** The access token is stored in `localStorage` (or `sessionStorage`), making it readable by any JavaScript executing on the page. An XSS vulnerability — even a minor third-party script injection — leaks the token. The attacker now has persistent access to the victim's account, including booking history, personal data, and the ability to cancel reservations or place orders.

**Why it happens:** `localStorage` is the path of least resistance. It's trivial to implement (`localStorage.setItem('token', jwt)`). Tutorials often show this pattern. The team focuses on "making auth work" before "making auth secure." On the Spring Boot side, the backend team may also issue long-lived tokens (7-30 days) because refresh token rotation "seems too complex."

**Consequences:**
- Account takeover via XSS
- PCI compliance failure (if payment methods are stored)
- GDPR violation for personal data exposure
- Refresh token reuse attack: if a refresh token is stolen and not rotated, the attacker maintains access indefinitely

**Prevention:**
- Store JWTs in **HTTP-only, Secure, SameSite=Strict cookies** — not in localStorage, not in sessionStorage, not in a JavaScript-accessible variable.
- The Spring Boot backend must set the cookie via `Set-Cookie` header on the login response, not return the token in a JSON body.
- Implement **refresh token rotation**: each refresh invalidates the previous refresh token and issues a new one. This limits the window of a stolen refresh token.
- Access token TTL: 15 minutes maximum. Refresh token TTL: 7 days with sliding expiration.
- In Next.js middleware (`middleware.ts`), verify the JWT using the `jose` library (edge-compatible). Do not use `jsonwebtoken` in middleware — it depends on Node.js crypto APIs not available at the edge.

**Detection:**
- Audit: search for `localStorage.getItem('token')` or `localStorage.setItem('token')` in the frontend codebase.
- Security review: check if the login API response returns a JSON body with `accessToken` instead of setting an HTTP-only cookie.
- Check if `middleware.ts` verifies tokens (if it doesn't, routes are unprotected at the edge).

**Phase to address:** Phase 2 (Auth & API Integration) — must be correct before any protected routes ship.

**Sources:** Authgear (2026) — "How to Add JWT Authentication to Next.js App Router"; Stackademic (2026) — "Authentication in Next.js (JWT, Cookies, Middleware)"; ZeroUtil (2026) — "JWT Authentication Mistakes That Keep Appearing in Production"; DEV/Kharonte (2026) — "Spring Boot JWT Authentication: The Complete Setup Most Tutorials Get Wrong". HIGH confidence.

---

### Pitfall 4: Cart Price Staleness During Checkout

**What goes wrong:** A user adds a wine bottle to the cart. The price is fetched and cached client-side. The user takes 10 minutes browsing. Meanwhile, the resort updates the price or a promotion ends. The user checks out at the old price. The system either honors the stale price (losing revenue) or surprises the user with a different price at payment (causing abandonment).

**Why it happens:** The frontend stores price in cart state (Redux, React Context, or cookies). The assumption is "prices don't change that fast." But in hospitality, dynamic pricing is common — rates change based on occupancy, seasonal demand, and flash promotions. The same problem applies to room rates: the nightly rate shown during search may not match the rate at booking time.

**Consequences:**
- Abandoned carts when users see a higher price at checkout
- Revenue leakage when stale lower prices are honored
- Customer complaints about "bait and switch"
- Audit/compliance issues for pricing integrity

**Prevention:**
- **Never store prices in the cart.** Only store product/room IDs, quantities, dates. Re-fetch all pricing from the server at checkout.
- Use a **Server Action in Next.js** (or a Route Handler) that calls Spring Boot's `/api/cart/validate` endpoint when the user opens the checkout page. This endpoint recalculates all prices and returns the authoritative total.
- The frontend should display "Prices updated" with a shimmer or brief loading state during recalculation.
- For bookings: re-check rate plan availability at checkout time — a discounted rate may have sold out during the user's session.

**Detection:**
- Code search: if `CartItem` has a `price` field that's set on add-to-cart and not re-fetched, it's stale.
- Test: add an item to cart, change the price in the backend, then proceed to checkout. If the old price shows, the prevention is missing.

**Phase to address:** Phase 3 (Cart & Checkout).

**Sources:** Reddit r/nextjs — "Ecommerce cart help" (discussion of storing only IDs vs prices); Viprasol (2026) — "Next.js E-Commerce: Product Catalog, Cart, Checkout". HIGH confidence.

---

### Pitfall 5: Single Checkout Flow for Both Product Types

**What goes wrong:** The checkout page assumes a single flow: collect shipping info, collect payment, confirm. But a room booking needs: guest names, check-in time preference, special requests, cancellation policy acknowledgment. A wine purchase needs: shipping address, delivery date, age verification. Forcing both through the same form creates UX friction and data-model mismatches.

**Why it happens:** "It's just a checkout page" — the simplest implementation wins early discussions. The team focuses on making it work for one product type first and plans to "add conditionals later." By the time both are needed, the checkout component is too coupled to untangle without a rewrite.

**Consequences:**
- Confusing checkout UX that asks irrelevant questions (why do I need a shipping address for a spa booking?)
- Higher abandonment rates for one or both product types
- Backend validation failures when required booking fields are missing
- Mobile UX disaster as the single form grows to 40+ fields

**Prevention:**
- Design **two visually separate checkout flows** that share a common shell (logo, progress indicator, security badges) but have distinct form sections:
  - **Booking Checkout**: Guest details, date summary, cancellation policy, add-on services, special requests
  - **Commerce Checkout**: Shipping address, delivery method, gift message, quantity confirmation
- If a mixed cart is allowed (booking + products in one order), split the checkout into **tabs or stages** — first complete booking details, then commerce details, then review and pay.
- Use Next.js route groups to serve different checkout layouts: `(checkout)/booking/` and `(checkout)/commerce/`.

**Detection:**
- UX review: count the number of conditional `if (type === 'booking')` blocks in the checkout component. More than 3-5 → redesign needed.
- Form validation: if single form validation errors mix shipping-field errors with date-range errors, the UX is already fragmented.

**Phase to address:** Phase 3 (Checkout & Payments).

**Sources:** Netgroup (2026) — "8 Hybrid Commerce Mistakes"; Stripe (2023) — "How to Design an Ecommerce Checkout Page That Converts". MEDIUM confidence (for the specific hybrid booking perspective).

---

## Moderate Pitfalls

### Pitfall 6: Next.js Route Handler Used When Server Component Would Do

**What goes wrong:** A Server Component fetches data by calling a Route Handler (`/api/products`) instead of calling the data-fetching logic directly. This adds an unnecessary network hop, increases latency, and complicates the architecture.

**Why it happens:** Developers coming from the Pages Router or traditional React SPAs are conditioned to fetch via HTTP endpoints. They don't realize that Server Components run on the server and can call databases, external APIs, or service classes directly — no HTTP tunnel needed.

**Consequences:**
- ~50ms+ extra latency per page load (the HTTP round-trip between Next.js server and itself)
- More moving parts to debug and deploy
- Route Handlers need auth middleware, CORS config, and error handling that Server Components don't

**Prevention:**
- Server Components should call external APIs or service functions directly. Route Handlers are for **external consumers** (mobile apps, third-party integrations) or **mutations** that need specific HTTP semantics.
- Create a `src/lib/api/` layer with functions like `getProducts()`, `getRoomAvailability()` that Server Components call directly. These functions internally call the Spring Boot API.
- Only use Route Handlers for: Stripe webhooks, OAuth callbacks, and endpoints consumed by external systems.

**Detection:**
- Code review: `fetch('/api/...')` inside an async Server Component is a red flag.
- Check: is the Route Handler calling the same function the Server Component could have called directly? If yes, it's a bypass.

**Phase to address:** Phase 2 (API Integration) — establish the pattern early.

**Sources:** Vercel/Lee Robinson (2024) — "Common mistakes with the Next.js App Router"; Upsun (2026) — "Avoid common mistakes with the Next.js App Router". HIGH confidence.

---

### Pitfall 7: Static Route Handlers for Dynamic Booking Data

**What goes wrong:** A Route Handler like `/api/rooms/availability` is served as a static response because the handler uses `GET` without explicitly opting out of caching. The availability data is stale for the duration of the build. Users see rooms as available that were already booked, or vice versa.

**Why it happens:** In the App Router, Route Handlers with `GET` are **cached by default**. The response is prerendered at build time and served until the next build. This is great for blog posts but catastrophic for real-time inventory.

**Consequences:**
- Stale availability data → users book rooms that are already taken
- Users see no availability when rooms are actually free
- Support tickets: "I saw it was free but when I called they said it's booked"

**Prevention:**
- Export `export const dynamic = 'force-dynamic'` in any Route Handler that serves time-sensitive data (availability, pricing, promotions).
- Alternatively, use `export const revalidate = 0` for ISR-style updating.
- For the most up-to-date data, prefer Server Components directly calling the Spring Boot API instead of going through Route Handlers (see Pitfall 6).

**Detection:**
- If `route.ts` has no `export const dynamic` or `export const revalidate`, assume it's static. Review each one.
- Test: deploy, book a room via the backend, then check if the Route Handler returns the updated availability without a rebuild.

**Phase to address:** Phase 2 (API Integration) — check all Route Handlers during development.

**Sources:** Vercel/Lee Robinson (2024) — "Common mistakes with the Next.js App Router"; DevStars (2026) — "Next.js 15 App Router in Production". HIGH confidence.

---

### Pitfall 8: No Guest Cart → Logged-In Cart Merge Strategy

**What goes wrong:** A user browses the wine shop as a guest, adds 3 bottles to cart, then logs in to complete the purchase. The cart is empty — the guest cart and the user cart are separate. The user must re-add everything. Or worse: the guest cart overwrites the user's existing saved cart.

**Why it happens:** Guest carts are stored in cookies or local state. User carts are stored in the backend database. The team builds guest cart first, then adds user cart later, and never plans the merge logic.

**Consequences:**
- Cart abandonment at the login boundary
- Lost sales when users can't recover their cart after authentication
- Customer frustration: "I had items in my cart and now they're gone"

**Prevention:**
- On the Spring Boot side, design the cart API to handle **cart merging**: when a user logs in, the frontend sends a `POST /api/cart/merge` with the guest cart ID. The backend merges it into the user's cart, deduplicating by item ID.
- The frontend should trigger the merge automatically on login (in the auth callback/handler).
- For guest carts: store cart ID in a cookie, not the full cart contents. Store cart data in the backend with a guest token (not tied to a user account). This avoids the 4KB cookie limit and prevents price tampering.

**Detection:**
- Walk through: browse as guest → add items → log in → check cart. If items are lost, the merge logic is missing.
- Code search: is there a `mergeCart` call in the login/signup flow?

**Phase to address:** Phase 3 (Cart & Checkout) — must be planned before the cart API is designed.

**Sources:** Mozello Blog (2026) — "New Booking System & eCommerce Tools"; Reddit r/nextjs — "Ecommerce cart help". MEDIUM confidence.

---

### Pitfall 9: Timezone Mismanagement in Booking Dates

**What goes wrong:** A guest books a room for July 15-17. The server stores it in UTC. The guest's confirmation shows July 14-16 due to a timezone offset. The resort's staff sees the correct dates but the guest arrives a day early or leaves a day late.

**Why it happens:** JavaScript's `Date` object is notoriously timezone-naive. The frontend sends ISO date strings, the backend stores them in UTC, and no party tracks which timezone the resort is in (Rome/Europe). Date-only fields (no time component) are accidentally shifted when midnight in Rome is still yesterday in UTC.

**Consequences:**
- Guests arriving on wrong dates
- Overbooking when date boundaries shift
- Double-booking because system thinks a room is free on a date it isn't
- Support nightmare: "Your system shows the wrong dates"

**Prevention:**
- **Store dates as dates, not timestamps.** Use `LocalDate` (Java) / date-only types, not `DateTime`. A booking spans calendar days, not instants.
- The frontend should send dates as `"2026-07-15"` (ISO 8601 date format), not `"2026-07-15T00:00:00.000Z"` (which introduces a timezone interpretation).
- Display dates in the **resort's local timezone** (Europe/Rome). The Spring Boot API should return a `timezone` field in the resort metadata so the frontend can localize.
- Use `date-fns` or `Luxon` on the frontend (not the native `Date` object) for all date math.
- Add a "This booking is in Europe/Rome timezone" indicator in the checkout flow.

**Detection:**
- Test: create a booking in a timezone that's behind or ahead of UTC. Check the confirmation email/page. If the dates don't match the selected dates, timezone handling is wrong.
- Code search: `new Date()` without timezone handling library is a red flag for date-related features.

**Phase to address:** Phase 1 (Foundation) — establish date-handling patterns in the `src/lib/` layer. Phase 3 (Booking Flow) — verify during checkout.

**Sources:** Medium/Ann R. (2026) — "Booking System: Availability, Calendars, and Overbooking Rules". MEDIUM confidence.

---

### Pitfall 10: Marketing Site Pages (Vetrina) Mixed with App Logic

**What goes wrong:** The public marketing pages (homepage, experiences gallery, about us) share state, data fetching, and rendering logic with the booking engine and dashboard. A change to the checkout flow accidentally breaks the homepage. The homepage, which should be mostly static and fast, now requires data fetches or client-side hydration.

**Why it happens:** Next.js App Router makes all routes share the same codebase. Without deliberate separation, imports and dependencies leak across boundaries. A `useQuery` hook imported for the dashboard can accidentally end up in a public page's component tree.

**Consequences:**
- Public pages become slower (need JS bundles for dashboard features)
- SEO impact: public pages that should be static and fast now have client-side dependencies
- Accidental exposure of internal routes or error states
- Broader attack surface: if marketing JS has a vulnerability, it could expose dashboard session data

**Prevention:**
- Enforce the Route Group separation already planned: `(vetrina)`, `(auth)`, `(dashboard)`.
- Never import dashboard-specific components, hooks, or utilities into `(vetrina)` pages. Use ESLint rules (import/no-restricted-paths) to enforce this.
- Keep `(vetrina)` layouts lean — they should only import shared UI components, not business logic.
- Consider using a **separate Next.js instance** for the marketing site if the tension becomes too high (at scale). For this project's size, Route Group boundaries should suffice.

**Detection:**
- `git diff` tracking: a PR that touches both `(vetrina)` and `(dashboard)` files should raise a flag.
- Build analysis: check if dashboard-only code appears in the main JS bundle.
- ESLint rule: restrict cross-route-group imports.

**Phase to address:** Phase 1 (Foundation) — set up import restriction rules before any features are built.

**Sources:** Next.js App Router docs — Route Groups pattern; CONCERNS.md (this project) — "No Application Architecture". HIGH confidence.

---

## Minor Pitfalls

### Pitfall 11: No Loading/Error Boundaries on Route Groups

**What goes wrong:** A booking search takes 3 seconds. The user sees a blank page with no loading indicator. Or the Spring Boot API returns a 503 — the user sees a generic Next.js error overlay (in dev) or a white screen (in production).

**Why it happens:** The team focuses on the happy path during development. `loading.tsx`, `error.tsx`, and `not-found.tsx` files are omitted because "we'll add them later."

**Consequences:**
- Users leave when they see a blank loading screen
- Generic error pages erode trust
- Failed bookings without clear error messaging → support calls

**Prevention:**
- Create `loading.tsx`, `error.tsx`, and `not-found.tsx` for each route group from the start.
- Use `Suspense` boundaries for granular loading states (e.g., room list loads while header is already visible).
- Error pages should offer clear next steps: "Go back to homepage" or "Try again" with appropriate contact info.

**Phase to address:** Phase 1 (Foundation) — these are structural files that should exist before any dynamic content.

**Sources:** CONCERNS.md (this project) — "No Error Handling UI". HIGH confidence.

---

### Pitfall 12: Ignoring Cart Abandonment for Booking + Commerce

**What goes wrong:** The team builds cart abandonment recovery for e-commerce (email when wine is left in cart) but doesn't handle booking abandonment. A user starts booking a room, fills in 80% of the details, then leaves. No follow-up. The room is held for 15 minutes and then released — a lost conversion with no recovery attempt.

**Why it happens:** E-commerce cart abandonment recovery is well-understood. Booking abandonment is a different pattern — users often research multiple dates across multiple days before committing. Treating both the same misses the booking-specific recovery window.

**Prevention:**
- Track booking abandonment differently from cart abandonment:
  - **Cart abandonment**: item left in cart for > 1 hour → email reminder
  - **Booking abandonment**: user started booking flow but didn't complete → email with "Your search for [dates] — rooms still available" within 24 hours
- The Spring Boot API should expose booking search history (without requiring login) via a cookie-based session token so the frontend can suggest resuming an incomplete booking.
- On the frontend, persist booking search state in URL search params where possible (`/rooms?checkIn=2026-08-01&checkOut=2026-08-05&guests=2`), so returning users can share or bookmark their search.

**Phase to address:** Phase 4 (Post-Booking & Retention).

**Sources:** Mozello Blog (2026) — "Abandoned Checkout Reminders". MEDIUM confidence.

---

### Pitfall 13: Over-Discounting / Promotion Stacking Across Product Types

**What goes wrong:** A promotion says "10% off all orders over €100." A user adds a €120 wine package + a €300 spa booking, gets 10% off the total. But the spa has a separate "no discounts on premium packages" policy. The system applies the discount incorrectly — either losing revenue or causing a checkout error.

**Why it happens:** The promotion system is shared across all product types, with no rules engine to handle per-category or per-item discount eligibility.

**Prevention:**
- Design the promotion/discount engine with **item-level eligibility rules** from the start. A discount applies to items, not orders.
- The Spring Boot API should return per-item pricing breakdown, not just the order total.
- Frontend should display per-item discounts clearly, so the user sees "Wine: €120 - €12 (10% off)" and "Spa: €300 (no discount applies)".

**Phase to address:** Phase 3 (Checkout & Payments) — include in pricing validation endpoint.

**Sources:** Netgroup (2026) — "8 Hybrid Commerce Mistakes". MEDIUM confidence.

---

### Pitfall 14: No Distinction Between Bookable "Items" and "Capacity"

**What goes wrong:** A spa treatment is modeled as "available: yes/no" when it should be "available: 4 slots remaining" for a given time. The frontend shows it as free to book, but when the user selects it, the specific time slot is fully booked. Or worse, the system shows it as unavailable when there are still open slots at different times.

**Why it happens:** Room inventory is naturally date-based and easy to model (date → number of rooms). But services like spa treatments, cooking classes, or guided tours have **capacity-based inventory** — they're available at specific times with a maximum headcount.

**Prevention:**
- Model booking inventory with an explicit **type discriminator**: `date-based` (rooms, villas) vs `capacity-based` (spa, classes, tours).
- Capacity-based items require: time slot, max capacity, current bookings. The frontend needs a **time-picker UI**, not just a date-picker.
- The API must accept `date` + `timeSlot` for capacity-based bookings, vs `checkIn` + `checkOut` for date-based bookings.

**Phase to address:** Phase 3 (Booking Engine) — include in the product data model.

**Sources:** Medium/Ann R. (2026) — "Booking System: Availability, Calendars, and Overbooking Rules". MEDIUM confidence.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| **Phase 1: Foundation** | No import boundaries between route groups | Set up ESLint `import/no-restricted-paths` immediately. Create `loading.tsx`, `error.tsx` for all route groups. Establish date-handling library (date-fns or Luxon). |
| **Phase 2: Auth & API** | JWT in localStorage / no refresh rotation | HTTP-only cookies from day one. Spring Boot must set cookies via `Set-Cookie`, not return JSON tokens. Use `jose` for middleware token verification. |
| **Phase 2: API Integration** | Route Handlers used when Server Components would work | Review each Route Handler. If it's called from a Server Component, replace with direct function call. Make Route Handlers dynamic by default. |
| **Phase 3: Cart & Checkout** | Single cart model for both product types | Two distinct cart data structures. Never store prices in cart — re-fetch at checkout. Design two checkout flows sharing only the shell. Plan guest→user cart merge. |
| **Phase 3: Booking Engine** | No race condition protection | Optimistic locking + short-lived holds. Spring Boot must use SERIALIZABLE isolation for booking confirmation. |
| **Phase 3: Booking Engine** | Timezone mismanagement | Store dates as `LocalDate` (no time component). Resort timezone = Europe/Rome. Use date-fns/Luxon, not native Date. |
| **Phase 3: Booking Engine** | Capacity-based vs date-based inventory confusion | Model inventory with type discriminator. Design time-picker UI for capacity-based items. |
| **Phase 4: Post-Booking** | No cart/booking abandonment recovery | Track booking searches. Email follow-ups for incomplete bookings, not just abandoned carts. |
| **Phase 4: Promotions** | Promotion stacking across product types | Item-level discount eligibility. Spring Boot returns per-item pricing breakdown. |
| **Phase 5: Dashboard** | Stale data on dashboard (cached from wrong cache layer) | Explicit `dynamic` or `revalidate` on dashboard pages. Dashboard data should always be fresh. |

---

## Sources

1. Netgroup (2026) — "8 Hybrid Commerce Mistakes Companies Repeat in 2026" — https://netgroup.com/blog/hybrid-commerce-mistakes/ [MEDIUM confidence — industry blog, multiple examples verified from other sources]
2. Vercel / Lee Robinson (2024) — "Common mistakes with the Next.js App Router" — https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them [HIGH confidence — official source]
3. Upsun (2026) — "Avoid common mistakes with the Next.js App Router" — https://upsun.com/blog/avoid-common-mistakes-with-next-js-app-router/ [MEDIUM confidence — verified against official Next.js docs]
4. DevStars (2026) — "Next.js 15 App Router in Production: Patterns, Pitfalls, and Performance" — https://devstarsj.github.io/2026/05/13/nextjs-15-app-router-production-patterns [MEDIUM confidence — practitioner experience aligned with multiple sources]
5. Authgear (2026) — "How to Add JWT Authentication to Next.js App Router" — https://www.authgear.com/post/nextjs-jwt-authentication [HIGH confidence — official documentation quality]
6. DEV/Kharonte (2026) — "Spring Boot JWT Authentication: The Complete Setup Most Tutorials Get Wrong" — https://dev.to/kharonte/spring-boot-jwt-authentication-the-complete-setup-most-tutorials-get-wrong-2f8d [MEDIUM confidence — practitioner expertise verified against Spring Security docs]
7. ZeroUtil (2026) — "JWT Authentication Mistakes That Keep Appearing in Production" — https://zeroutil.com/blog/jwt-authentication-mistakes [MEDIUM confidence — security-focused, consistent with OWASP JWT guidelines]
8. Adamo Software (2026) — "Solving the Inventory Nightmare: Handling high-concurrency and race conditions in Global Hotel Booking Engines" — https://adamosoftware.hashnode.dev/solving-the-inventory-nightmare-handling-high-concurrency-and-race-conditions-in-global-hotel-booking-engines [HIGH confidence — detailed technical explanation consistent with database theory]
9. Ann R. / Medium (2026) — "Booking System: Availability, Calendars, and Overbooking Rules" — https://medium.com/@annxsa/booking-system-availability-calendars-and-overbooking-rules-2fe7331c7940 [MEDIUM confidence — theoretical but well-reasoned]
10. Stack Overflow — "How to prevent race condition in online hotel booking" — https://stackoverflow.com/questions/12832570/how-to-prevent-race-condition-in-online-hotel-booking [MEDIUM confidence — community wisdom, verified by multiple answers converging on same patterns]
11. Reddit r/nextjs — "Ecommerce cart help" — https://www.reddit.com/r/nextjs/comments/166aorr/ecommerce_cart_help/ [LOW confidence — single discussion, but cart merging challenge is widely documented]
12. Mozello Blog (2026) — "New Booking System & eCommerce Tools" — https://www.mozello.com/blog/mozello-update-2026 [LOW confidence — vendor blog, but abandoned-cart recovery pattern is standard]
13. BuildBaseKit (2026) — "JWT Mistakes in Spring Boot That Break Security" — https://buildbasekit.com/blogs/jwt-mistakes-spring-boot [MEDIUM confidence — practical checklist verified against Spring Security docs]
14. DrCodes (2025) — "Fix JWT Token Refresh Failures in React-Spring Boot Apps" — https://drcodes.com/posts/fix-jwt-token-refresh-failures-in-react-spring-boot-apps [MEDIUM confidence — pattern confirmed in multiple React/Spring Boot projects]
15. CONCERNS.md (this project) — internal codebase audit — HIGH confidence
16. PROJECT.md (this project) — internal project context — HIGH confidence
